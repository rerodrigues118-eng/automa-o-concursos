# Diretriz: Geração de Material de Estudo (IA + Web Search)

## Objetivo
Para cada concurso identificado no scraping, gerar um resumo de matérias e buscar links de apoio (vídeos e PDFs) para auxiliar o usuário no estudo inicial.

## Entradas (Inputs)
- Arquivo `.tmp/concursos_raw.json`.
- Matérias comuns de editais (Português, Matemática, Direito, etc.).
- Nome do Órgão e Nível do Concurso.

## Ferramentas de Execução
- `execution/study_gen.py`: Script Python (se disponível) ou `execution/study_gen.js`: Script Node para busca e síntese.
- IA via `search_web` localmente ou simulação de geração de resumo.

## Procedimento
1. **Identificação de Matérias**: 
   - Se Nível Médio: Assumir Português, Matemática, Noções de Informática.
   - Se Policial: Português, RLM, Direito Penal, Direito Constitucional.
   - Se Administrativo: Português, Matemática, Ética no Serviço Público, Noções de Adm.
2. **Busca Web**:
   - Buscar no YouTube: "Aulas [Matéria] para concurso [Órgão]".
   - Buscar PDFs: "Apostila grátis [Órgão] [Nível] arquivo:pdf".
3. **Síntese de IA**: Gerar um resumo de 3-5 parágrafos sobre as matérias mais cobradas para aquele tipo de prova.
4. **Enriquecimento**: Atualizar o JSON em `.tmp/concursos_enriched.json` com os novos links e o resumo.

## Saídas (Outputs)
- Arquivo JSON atualizado em `.tmp/concursos_enriched.json`.

## Aprendizados (Date-stamp: 2026-04-13)
- Inicialmente previsto o uso de links dinâmicos no front, mas o pré-processamento via script de execução garante maior performance e consistência visual.
