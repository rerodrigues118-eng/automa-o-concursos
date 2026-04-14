const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join('public', 'data', 'concursos.json');
const OUTPUT_FILE = path.join('public', 'data', 'concursos_enriched.json');

const HEURISTICAS = {
  'Administrativo': {
    materias: ['Português', 'Raciocínio Lógico', 'Informática', 'Direito Administrativo'],
    salario: 'R$ 2.500 a R$ 5.500',
    carga_horaria: '40h semanais',
    funcao: 'Rotinas administrativas, atendimento ao público, elaboração de documentos e gestão de arquivos.',
    carreira: 'Progressão por tempo de serviço e qualificações (cursos e pós-graduação).'
  },
  'Policial': {
    materias: ['Português', 'Direito Penal', 'Direito Processual Penal', 'Legislação Especial'],
    salario: 'R$ 5.000 a R$ 12.000',
    carga_horaria: 'Regime de Escala (Ex: 24x72h) ou 40h',
    funcao: 'Preservação da ordem, patrulhamento, investigações e cumprimento de mandados.',
    carreira: 'Promoções por antiguidade e merecimento (Soldado a Sargento / Investigador a Inspetor).'
  },
  'Militar / Bombeiros': {
    materias: ['Matemática', 'Física', 'Português', 'Direito'],
    salario: 'R$ 4.500 a R$ 9.000',
    carga_horaria: 'Regime de Escala (24x48h ou 24x72h)',
    funcao: 'Defesa civil, resgates, combate a incêndios e manutenção da ordem.',
    carreira: 'Hierarquia militar rígida com promoções por tempo e cursos de formação.'
  },
  'Jurídico': {
    materias: ['Direito Constitucional', 'Direito Civil', 'Processo Civil', 'Ética'],
    salario: 'R$ 8.000 a R$ 33.000',
    carga_horaria: '30h a 40h semanais',
    funcao: 'Análise de processos, elaboração de peças jurídicas, assessoramento de magistrados.',
    carreira: 'Planos estruturados com progressão anual e adicionais de qualificação.'
  },
  'Federal': {
    materias: ['Direito Constitucional', 'Direito Administrativo', 'Língua Estrangeira', 'Específicas'],
    salario: 'R$ 7.000 a R$ 22.000',
    carga_horaria: '40h semanais',
    funcao: 'Auditoria, fiscalização, regulação ou gestão em âmbito nacional.',
    carreira: 'Classes e Padrões (A, B, C, Especial) com evolução por avaliação de desempenho.'
  },
  'Outros': {
    materias: ['Português', 'Matemática', 'Conhecimentos Gerais', 'Informática'],
    salario: 'R$ 2.000 a R$ 4.000',
    carga_horaria: '40h semanais',
    funcao: 'Atividades operacionais ou de suporte no órgão correspondente.',
    carreira: 'Evolução salarial conforme o estatuto do servidor local.'
  }
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
        return true; 
      })
      .map(concurso => {
        const info = HEURISTICAS[concurso.categoria] || HEURISTICAS['Outros'];
        const materias = info.materias;
        const orgSearch = concurso.orgao.replace(/ /g, '+');
        
        return {
          ...concurso,
          detalhes_cargo: {
            salario_medio: info.salario,
            carga_horaria: info.carga_horaria,
            funcao: info.funcao,
            plano_carreira: info.carreira,
            descricao_geral: `Oportunidade na área ${concurso.categoria} focada no órgão ${concurso.orgao}.`
          },
          material_estudo: {
            resumo_ia: `Para este concurso focado em ${concurso.categoria}, é essencial dominar ${materias.join(', ')}. Sugerimos um ciclo de estudos de 3 meses focado na base teórica antes de aprofundar na legislação do órgão.`,
            video_links: materias.map(m => ({
              titulo: `Aula: ${m} [Videoaula Destaque]`,
              url: `https://www.youtube.com/results?search_query=aula+gratis+${m.replace(/ /g, '+')}+para+concurso`
            })),
            pdf_links: [
              { titulo: "Apostila Base Teórica (PDF Gratuito)", url: `https://www.google.com/search?q=apostila+gratis+pdf+concurso+${orgSearch}` },
              { titulo: "Edital Esquematizado", url: `https://www.google.com/search?q=edital+esquematizado+${orgSearch}` }
            ],
            provas_anteriores: [
              { titulo: "Buscador de Provas (PCI)", url: `https://www.pciconcursos.com.br/provas/${orgSearch}` },
              { titulo: "Banco de Questões Comentadas", url: `https://www.qconcursos.com/questoes-de-concursos/instituicoes` }
            ],
            plano_estudos_semanal: [
              { dia: 'Segunda', conteudo: `Início: ${materias[0] || 'Português'} (Teoria + 15 questões práticas)` },
              { dia: 'Terça', conteudo: `Foco: ${materias[1] || 'Raciocínio Lógico'} (Teoria + Flashcards)` },
              { dia: 'Quarta', conteudo: `Aprofundamento: ${materias[2] || 'Específicas'} (Leitura de PDF grifado)` },
              { dia: 'Quinta', conteudo: `Legislação: ${materias[3] || 'Conhecimentos do Órgão'} (Lei seca e mapas mentais)` },
              { dia: 'Sexta', conteudo: `Revisão Geral e Construção do Resumo Semanal` },
              { dia: 'Sábado', conteudo: `Simulado Prático (Manhã) e Correção de Erros (Tarde)` },
              { dia: 'Domingo', conteudo: `Descanso ativo e Planejamento da próxima semana` }
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
