# Diretriz: Busca Automática de Editais (Scraping)

## Objetivo
Localizar, filtrar e extrair dados de editais de concursos públicos abertos ou previstos no Paraná e Curitiba, priorizando áreas administrativas e as categorias definidas.

## Entradas (Inputs)
- URL dos portais de concursos (PCI Concursos, Diários Oficiais, Portais de Transparência).
- Filtros de localização: "Paraná", "Curitiba".
- Filtros de categoria: Nível Médio, Superior, Administrativo, Policial, Militar, Jurídico, Federal.

## Ferramentas de Execução
- `execution/scraper.js`: Script Node.js para extração de dados.
- Bibliotecas: `axios`, `cheerio`.

## Procedimento
1. **Varredura**: O script deve acessar a página de concursos da região Sul/PR.
2. **Extração**: Coletar:
   - Nome do Órgão/Concurso.
   - Link para detalhes ou edital.
   - Início e Fim das inscrições.
   - Status computado (Aberto, Encerrado, Previsto).
3. **Classificação**: Mapear o título ou descrição do concurso para uma das categorias padrão (ex: se contém "Soldado" -> Militar).
4. **Filtragem Temporária**: DESCARTE concursos com data de encerramento anterior a 2026.
5. **Armazenamento**: Salvar os resultados em `.tmp/concursos_raw.json` para processamento posterior.

## Saídas (Outputs)
- Arquivo JSON estruturado em `.tmp/concursos_raw.json`.
- Log de execução em `.tmp/scraping_log.txt`.

## Edge Cases
- **Link Quebrado**: Validar se a URL do edital retorna 200 OK.
- **Data Indeterminada**: Tratar editais sem data de encerramento explícita como "Verificar edital".
- **Duplicidade**: Não sobrescrever dados de concursos já existentes se o status não mudou.

---
*Atualizado em: 13/04/2026 - Versão Inicial*
