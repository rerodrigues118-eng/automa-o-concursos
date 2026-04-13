const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const SCRAPE_URL = 'https://www.pciconcursos.com.br/concursos/sul/pr/';
const OUTPUT_FILE = path.join('.tmp', 'concursos_raw.json');

async function scrapeConcursos() {
  try {
    console.log('--- Iniciando busca de concursos no Paraná ---');
    const response = await fetch(SCRAPE_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.text();
    const $ = cheerio.load(data);
    const concursos = [];

    $('.ca').each((i, el) => {
      const orgao = $(el).find('a').text().trim();
      const link = $(el).find('a').attr('href');
      const info = $(el).text().replace(orgao, '').trim();
      
      // Extrair datas - formato comum nas strings do PCI
      // Ex: "Inscrições de 01/04 a 30/04/2026 - Salário até R$ 5.000,00"
      const dateMatch = info.match(/(\d{2}\/\d{2})\s+a\s+(\d{2}\/\d{2}\/\d{4})/);
      const abertura = dateMatch ? dateMatch[1] : 'N/A';
      const encerramento = dateMatch ? dateMatch[2] : 'N/A';

      // Categorização Básica baseada em Keywords
      let categoria = 'Outros';
      const lowOrgao = orgao.toLowerCase();
      const lowInfo = info.toLowerCase();

      if (lowOrgao.includes('prefeitura') || lowOrgao.includes('câmara')) categoria = 'Administrativo';
      if (lowOrgao.includes('polícia') || lowOrgao.includes('civil') || lowOrgao.includes('pm')) categoria = 'Policial';
      if (lowOrgao.includes('bombeiro') || lowOrgao.includes('militar')) categoria = 'Militar / Bombeiros';
      if (lowOrgao.includes('tribunal') || lowOrgao.includes('tj') || lowOrgao.includes('oab') || lowOrgao.includes('juiz')) categoria = 'Jurídico';
      if (lowOrgao.includes('inss') || lowOrgao.includes('receita') || lowOrgao.includes('ufpr')) categoria = 'Federal';
      
      // Níveis
      let nivel = 'Médio / Superior';
      if (lowInfo.includes('superior')) nivel = 'Nível Superior';
      else if (lowInfo.includes('médio')) nivel = 'Nível Médio';

      if (orgao) {
        concursos.push({
          id: Buffer.from(orgao + link).toString('base64'),
          orgao,
          link,
          categoria,
          nivel,
          data_abertura: abertura,
          data_encerramento: encerramento,
          status: encerramento !== 'N/A' ? 'Inscrições abertas' : 'Previsto',
          localizacao: orgao.includes('Curitiba') ? 'Curitiba' : 'Paraná'
        });
      }
    });

    // Filtro de prioridade administrativa como pedido
    concursos.sort((a, b) => {
        if (a.categoria === 'Administrativo' && b.categoria !== 'Administrativo') return -1;
        if (a.categoria !== 'Administrativo' && b.categoria === 'Administrativo') return 1;
        return 0;
    });

    if (!fs.existsSync('.tmp')) {
      fs.mkdirSync('.tmp');
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(concursos, null, 2));
    console.log(`--- Busca finalizada: ${concursos.length} concursos encontrados ---`);
    console.log(`Salvo em: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Erro ao realizar o scraping:', error.message);
  }
}

scrapeConcursos();
