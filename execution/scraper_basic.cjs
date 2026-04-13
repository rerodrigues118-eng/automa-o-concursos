const fs = require('fs');
const path = require('path');

const URLS = [
  { url: 'https://www.pciconcursos.com.br/concursos/pr/curitiba/', defaultUf: 'PR', priority: true, isCuritiba: true },
  { url: 'https://www.pciconcursos.com.br/concursos/nacional/', defaultUf: 'BR', priority: true, isCuritiba: false },
  { url: 'https://www.pciconcursos.com.br/concursos/sul/', defaultUf: 'PR', priority: false, isCuritiba: false }
];

const OUTPUT_FILE = path.join('.tmp', 'concursos_raw.json');

function extractCity(title) {
  // Padroes comuns: "Prefeitura de Cidade", "Câmara de Cidade", "Órgão em Cidade"
  const match = title.match(/(?:Prefeitura|Câmara|Serviço|Consórcio|Instituto|Universidade|Hospital|Câmara municipal)\s+(?:de|do|da|em|de|das|dos)\s+([A-Z][a-zà-ú]+(?:\s+[A-Z][a-zà-ú]+)*)/i);
  if (match) {
    const city = match[1].trim();
    if (['Educação', 'Saúde', 'Justiça', 'Estado', 'Brasil', 'Paraná', 'Santa', 'Rio'].includes(city)) return 'Várias';
    return city;
  }
  return 'Várias';
}

async function scrapeConcursos() {
  try {
    const allConcursos = [];
    const seenIds = new Set();
    
    for (const site of URLS) {
      console.log(`--- Buscando em: ${site.url} ---`);
      const response = await fetch(site.url);
      if (!response.ok) continue;
      const html = await response.text();
      
      // Iremos capturar o bloco que contém a linha inteira (ca ou ea)
      // Usando regex mais permissiva para classes ca, ea, na
      const regex = /<div class="(?:ca|ea|na)">([\s\S]*?)<\/div>\s*<div class="cc">([\s\S]*?)<\/div>/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        const caContent = match[1];
        const ccContent = match[2];

        const orgaoMatch = caContent.match(/<a[^>]*>(.*?)<\/a>/);
        const linkMatch = caContent.match(/href="(.*?)"/);
        
        if (orgaoMatch && linkMatch) {
          const orgao = orgaoMatch[1].trim();
          const link = linkMatch[1];
          const id = Buffer.from(orgao + link).toString('base64');
          
          if (seenIds.has(id)) continue;
          seenIds.add(id);

          let uf = site.defaultUf;
          const ufMatch = ccContent.match(/>([A-Z]{2})</);
          if (ufMatch) uf = ufMatch[1];
          
          let cidade = site.isCuritiba ? 'Curitiba' : extractCity(orgao);
          
          // Se o orgao ja contem Curitiba, forçar Curitiba
          if (orgao.toLowerCase().includes('curitiba')) {
              cidade = 'Curitiba';
          }

          let categoria = 'Outros';
          if (orgao.toLowerCase().includes('prefeitura')) categoria = 'Administrativo';
          if (orgao.toLowerCase().includes('polícia') || orgao.toLowerCase().includes('segurança')) categoria = 'Policial';
          if (orgao.toLowerCase().includes('federal') || site.priority) categoria = 'Federal';

          allConcursos.push({
            id,
            orgao,
            link: link.startsWith('http') ? link : `https://www.pciconcursos.com.br${link}`,
            categoria,
            uf,
            cidade,
            prioridade: site.priority || uf === 'BR',
            is_curitiba: site.isCuritiba || cidade === 'Curitiba',
            nivel: 'Médio / Superior',
            data_abertura: 'Ver edital',
            data_encerramento: 'Ver edital',
            status: 'Inscrições abertas',
            localizacao: uf === 'BR' ? 'Brasil' : `${cidade} - ${uf}`
          });
        }
      }
    }

    if (!fs.existsSync('.tmp')) fs.mkdirSync('.tmp');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allConcursos, null, 2));
    console.log(`--- Scraping finalizado: ${allConcursos.length} editais capturados ---`);
  } catch (error) {
    console.error('Erro no Scraper:', error.message);
  }
}

scrapeConcursos();
