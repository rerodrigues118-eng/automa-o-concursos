const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join('public', 'data', 'concursos.json');
const OUTPUT_FILE = path.join('public', 'data', 'concursos_enriched.json');

const MATERIAS_COMUNS = {
  'Administrativo': ['Português', 'Raciocínio Lógico', 'Informática', 'Direito Administrativo'],
  'Policial': ['Português', 'Direito Penal', 'Direito Processual Penal', 'Legislação Especial'],
  'Militar / Bombeiros': ['Matemática', 'Física', 'Português', 'História e Geografia do PR'],
  'Jurídico': ['Direito Constitucional', 'Direito Civil', 'Processo Civil', 'Ética'],
  'Federal': ['Direito Previdenciário', 'Contabilidade', 'Língua Inglesa'],
  'Outros': ['Português', 'Matemática', 'Conhecimentos Gerais']
};

function generateStudyMaterial() {
  try {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error("Arquivo de entrada não encontrado!");
        return;
    }

    const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    
    const enriched = data
      .filter(concurso => {
        const dateStr = concurso.data_encerramento || '';
        const yearMatch = dateStr.match(/\d{4}$/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          return year >= 2026;
        }
        return true; // Manter se não tiver ano (Ver edital) ou for "Previsto"
      })
      .map(concurso => {
        const materias = MATERIAS_COMUNS[concurso.categoria] || MATERIAS_COMUNS['Outros'];
        
        return {
          ...concurso,
          material_estudo: {
            resumo_ia: `Este concurso foca principalmente em ${materias.join(', ')}. Recomenda-se iniciar os estudos por Português e a parte de Legislação específica do órgão ${concurso.orgao}.`,
            video_links: materias.map(m => ({
              titulo: `Aula de ${m} [Grátis]`,
              url: `https://www.youtube.com/results?search_query=aula+gratis+${m.replace(/ /g, '+')}+para+concurso`
            })),
            pdf_links: [
              { titulo: "Apostila Básica (Versão Gratuita)", url: "https://www.google.com/search?q=apostila+gratis+pdf+concurso+" + concurso.orgao.replace(/ /g, '+') }
            ]
          }
        };
      });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enriched, null, 2));
    console.log(`--- Enriquecimento finalizado: ${enriched.length} concursos processados ---`);

  } catch (error) {
    console.error("Erro no enriquecimento:", error.message);
  }
}

generateStudyMaterial();
