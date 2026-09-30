# Weather App Task Backlog

As tarefas abaixo consomem [weather-app-plan.md](../plans/weather-app-plan.md).
Cada tarefa mantém uma responsabilidade principal e pode ser implementada e
validada isoladamente.

## Priority and Size

`P0` identifica o mínimo necessário para cumprir os requisitos funcionais e
entregar uma jornada utilizável. `P1` identifica qualidade, compatibilidade e
hardening necessários antes da conclusão. `P2` fica reservado para melhorias
fora do escopo atual; nenhuma tarefa desta entrega é P2. `S`, `M` e `G` são
estimativas relativas de esforço e risco, não horas fixas.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 — Contratos de domínio | P0 | M |
| T-02 — Normalização meteorológica | P0 | M |
| T-03 — Temperatura e WMO | P0 | S |
| T-04 — Formatação de datas | P0 | S |
| T-05 — Service de geocoding | P0 | M |
| T-06 — Service de forecast | P0 | M |
| T-07 — Estado base do `useWeather` | P0 | M |
| T-08 — Busca e seleção no hook | P0 | M |
| T-09 — Forecast e concorrência no hook | P0 | M |
| T-10 — Formulário de busca | P0 | S |
| T-11 — Seleção de resultados | P0 | S |
| T-12 — Status de loading e erro | P0 | S |
| T-13 — Estado inicial e vazio | P0 | S |
| T-14 — Clima atual | P0 | S |
| T-15 — Lista de previsão | P0 | M |
| T-16 — Controle de unidade | P0 | S |
| T-17 — Composição do `App` | P0 | M |
| T-18 — Tema e responsividade | P1 | M |
| T-19 — Teste de conversão | P0 | S |
| T-20 — Teste do service de geocoding | P0 | M |
| T-21 — Teste do service de forecast | P0 | M |
| T-22 — Teste de busca e seleção | P0 | M |
| T-23 — Teste de loading, erro e vazio | P0 | M |
| T-24 — Teste de clima e previsão | P0 | M |
| T-25 — Teste de unidade | P0 | S |
| T-26 — E2E principal e mobile | P0 | M |
| T-27 — E2E de falhas | P1 | M |
| T-28 — E2E de compatibilidade | P1 | M |
| T-29 — Validação de entrega | P0 | S |

## Vertical Delivery Slices

As fatias abaixo entregam valor observável em ordem. Uma tarefa pode aparecer
em uma fatia de implementação e ser validada novamente por uma fatia posterior.

1. **Busca visível:** T-01, T-05, T-07, T-08, T-10, T-11, T-13 e T-17.
  Entrega a tela inicial, busca explícita, resultados, seleção de cidade e
  estados vazio/loading, ainda sem previsão detalhada.
2. **Clima atual funcional:** T-02, T-03, T-06, T-09, T-12 e T-14.
  Após selecionar uma cidade, exibe temperatura atual e condição WMO com
  loading, erro, retry e proteção contra respostas antigas.
3. **Previsão e unidade:** T-04, T-15 e T-16.
  Completa a jornada principal com cinco dias, datas locais e alternância C/F
  sem novo request.
4. **Qualidade da jornada:** T-19, T-20, T-21, T-22, T-23, T-24, T-25 e T-26.
  Fixa as regras com Vitest e valida o fluxo principal em desktop e mobile.
5. **Hardening e entrega:** T-18, T-27, T-28 e T-29.
  Fecha responsividade, erros concorrentes, compatibilidade, acessibilidade e
  os gates de lint, build, testes e validação SDD.

## Functional Requirements Traceability

| Requisito funcional | Tarefas relacionadas | Cobertura principal |
| --- | --- | --- |
| RF-01 — Buscar uma cidade | T-05, T-08, T-10, T-20, T-22, T-26 | Service, orquestração, UI, teste de service, teste de componente e E2E |
| RF-02 — Selecionar uma cidade | T-05, T-08, T-11, T-20, T-22, T-26 | Dados, seleção automática/múltipla, UI e jornadas |
| RF-03 — Exibir o clima atual | T-02, T-03, T-06, T-14, T-21, T-24, T-26 | Normalização, WMO, forecast, UI e testes |
| RF-04 — Exibir a previsão de cinco dias | T-02, T-04, T-06, T-09, T-15, T-21, T-24, T-26 | Datas, forecast, estado, UI e testes |
| RF-05 — Alterar a unidade de temperatura | T-03, T-07, T-14, T-16, T-19, T-25, T-26 | Conversão, estado, apresentação, teste unitário, componente e E2E |
| RF-06 — Exibir estado de carregamento | T-07, T-09, T-12, T-23, T-27 | Estado, feedback, testes de componente e E2E |
| RF-07 — Tratar erros | T-05, T-06, T-08, T-09, T-12, T-13, T-20, T-21, T-23, T-27 | Erros de busca/forecast, retry, UI e testes |
| RF-08 — Exibir estado inicial vazio | T-07, T-13, T-23, T-26 | Estado inicial, UI e testes |
| RF-09 — Atualizar a interface dinamicamente | T-09, T-14, T-15, T-17, T-26, T-27 | Concorrência, composição, UI e E2E |

Todos os requisitos funcionais RF-01 a RF-09 possuem pelo menos uma tarefa de
implementação e uma tarefa de teste. Não há requisito funcional sem tarefa
correspondente.

## Foundation

### T-01 — Criar os contratos de domínio

- **Descrição:** Definir os tipos compartilhados para cidade, clima, previsão,
  unidade, erros e estados da aplicação.
- **Tipo:** Data
- **Spec:** RF-03, RF-04, RF-05, RNF-05, RNF-07
- **Dependências:** nenhuma
- **Arquivos prováveis:** `src/types/weather.ts`
- **Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay`,
  `WeatherData`, `Unit` e `WeatherError` estão exportados; campos ausentes são
  opcionais; o estado aceita somente `idle | loading | success | error | empty`;
  `pnpm exec tsc --noEmit` passa em modo strict.

### T-02 — Normalizar respostas meteorológicas

- **Descrição:** Converter respostas de forecast em dados de domínio validados,
  preservando campos parciais e as cinco datas.
- **Tipo:** Data
- **Spec:** RF-03, RF-04, RNF-05, casos de resposta parcial/malformada
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/normalizers.ts`,
  `tests/unit/normalizers.test.ts`
- **Critérios de aceite:** `NaN`, `Infinity` e strings numéricas são rejeitados;
  os arrays são alinhados pelo mesmo índice; cinco itens de data são retornados;
  campo ausente permanece `undefined`; resposta com menos de cinco datas retorna
  `invalid-response`.

### T-03 — Implementar funções puras de temperatura e WMO

- **Descrição:** Criar conversão de unidade, arredondamento e mapeamento das
  condições meteorológicas.
- **Tipo:** Data
- **Spec:** RF-03, RF-05, RNF-07, RNF-09
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/weather.ts`
- **Critérios de aceite:** `20 C` resulta em `68 F`; o arredondamento é inteiro;
  WMO `0` retorna `Céu limpo`; cada código listado no plano tem rótulo; código
  desconhecido retorna `Condição não disponível`.

### T-04 — Implementar formatação de datas

- **Descrição:** Formatar datas locais da Open-Meteo em pt-BR sem deslocá-las
  para o fuso do dispositivo.
- **Tipo:** Data
- **Spec:** RF-04, RNF-09
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/date.ts`, `tests/unit/date.test.ts`
- **Critérios de aceite:** `2026-09-30` permanece no dia 30 em qualquer fuso do
  dispositivo; a saída usa localidade `pt-BR`; uma data inválida retorna erro
  de validação em vez de uma data presumida.

## API Integration

### T-05 — Implementar serviço de geocodificação

- **Descrição:** Encapsular a busca de cidades com URL codificada, limite de
  resultados e classificação de vazio ou falha.
- **Tipo:** Data
- **Spec:** RF-01, RF-02, RF-07, RNF-10
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/geocoding.ts`
- **Critérios de aceite:** a URL contém `count=5`, `language=pt` e o termo
  codificado; `São José dos Campos` é recuperado sem alteração semântica;
  `results: []` retorna `empty`; HTTP não OK e timeout retornam erro distinto;
  coordenadas não finitas são rejeitadas; timeout ocorre em 10 segundos.

### T-06 — Implementar serviço de previsão

- **Descrição:** Encapsular a consulta forecast Celsius de cinco dias no fuso
  automático da cidade.
- **Tipo:** Data
- **Spec:** RF-03, RF-04, RF-07, RNF-09
- **Dependências:** T-01, T-02
- **Arquivos prováveis:** `src/services/forecast.ts`
- **Critérios de aceite:** a URL contém `temperature_unit=celsius`,
  `timezone=auto`, `forecast_days=5`, `current` e `daily`; resposta válida
  produz cinco `ForecastDay`; HTTP não OK, JSON inválido, timeout e abort
  retornam `WeatherError` sem lançar exceção para o componente.

## Application State

### T-07 — Criar o estado base do hook useWeather

- **Descrição:** Criar o hook no topo da aplicação com unidade, busca, cidade,
  dados, erro e estados públicos.
- **Tipo:** Data
- **Spec:** RF-05, RF-06, RF-08, RNF-04
- **Dependências:** T-01
- **Arquivos prováveis:** `src/hooks/useWeather.ts`,
  `tests/unit/useWeather.test.ts`
- **Critérios de aceite:** após montar, o estado é `idle` e `unit` é `celsius`;
  o hook expõe somente os cinco estados definidos; recarregar a página volta a
  Celsius; o termo e a unidade permanecem disponíveis durante a sessão.

### T-08 — Orquestrar busca e seleção no useWeather

- **Descrição:** Conectar o envio da busca ao geocoding e controlar seleção
  automática, seleção múltipla e estado vazio.
- **Tipo:** Data
- **Spec:** RF-01, RF-02, RF-07
- **Dependências:** T-05, T-07
- **Arquivos prováveis:** `src/hooks/useWeather.ts`,
  `tests/unit/useWeather-search.test.ts`
- **Critérios de aceite:** termo vazio não chama geocoding; um resultado chama
  seleção automaticamente; dois resultados mantêm `empty` falso e aguardam
  clique/teclado; `results: []` define `empty`; erro mantém o termo e retry
  repete somente a geocodificação.

### T-09 — Orquestrar forecast e concorrência no useWeather

- **Descrição:** Buscar o clima após seleção, limpar dados antigos e proteger o
  estado contra respostas fora de ordem.
- **Tipo:** Data
- **Spec:** RF-04, RF-06, RF-07, RF-09
- **Dependências:** T-06, T-07, T-08
- **Arquivos prováveis:** `src/hooks/useWeather.ts`,
  `tests/unit/useWeather-weather.test.ts`
- **Critérios de aceite:** nova seleção limpa `WeatherData` antes de `loading`;
  resposta válida define `success`; retry chama forecast com as mesmas
  coordenadas; o request anterior é abortado e sua resposta é ignorada por
  `requestId`; erro mantém a cidade ativa.

## Search UI

### T-10 — Implementar o formulário de busca

- **Descrição:** Criar o campo e o botão de busca com submissão explícita e
  suporte a Enter.
- **Tipo:** UI
- **Spec:** RF-01, RNF-03, RNF-04
- **Dependências:** T-07, T-08
- **Arquivos prováveis:** `src/components/CitySearch.tsx`
- **Critérios de aceite:** digitar não chama callback; submeter `" Lisboa "`
  envia `"Lisboa"`; vazio mostra erro sem callback; acentos e hífens chegam
  intactos; o campo tem label associado, foco visível e Enter funcional.

### T-11 — Implementar seleção de resultados

- **Descrição:** Exibir opções de cidade e encaminhar a escolha ao hook sem
  selecionar silenciosamente entre resultados ambíguos.
- **Tipo:** UI
- **Spec:** RF-02, RNF-03, RNF-04
- **Dependências:** T-08, T-10
- **Arquivos prováveis:** `src/components/CityResults.tsx`
- **Critérios de aceite:** cada opção mostra `name`, `admin1` quando presente e
  `country`; nenhum item é selecionado automaticamente quando há vários;
  Tab/Enter permite selecionar uma opção sem mouse.

## Feedback UI

### T-12 — Implementar status de loading e erro

- **Descrição:** Apresentar carregamento e mensagens de erro com anúncios e
  ações de retry.
- **Tipo:** UI
- **Spec:** RF-06, RF-07, RNF-04
- **Dependências:** T-07, T-09
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`
- **Critérios de aceite:** loading aparece com `role="status"` e desaparece ao
  concluir; erro aparece com `role="alert"`; busca, API e timeout têm mensagens
  distintas em pt-BR; cada retry chama somente sua operação.

### T-13 — Implementar estado inicial e vazio

- **Descrição:** Criar as orientações para iniciar uma busca e para ausência de
  localidades.
- **Tipo:** UI
- **Spec:** RF-07, RF-08, RNF-04
- **Dependências:** T-07, T-08
- **Arquivos prováveis:** `src/components/EmptyState.tsx`
- **Critérios de aceite:** `idle` mostra orientação de busca; `empty` mostra
  "Nenhuma cidade encontrada"; sem `selectedCity`, clima atual e previsão não
  são renderizados.

## Weather UI

### T-14 — Implementar clima atual

- **Descrição:** Renderizar nome da cidade, temperatura atual e condição WMO
  com fallbacks de dados ausentes.
- **Tipo:** UI
- **Spec:** RF-03, RF-09, RNF-05, RNF-09
- **Dependências:** T-03, T-09, T-12
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Critérios de aceite:** com `20 C` e unidade Fahrenheit exibe `68 °F`;
  temperatura ausente exibe `Temperatura indisponível`; WMO desconhecido exibe
  `Condição não disponível`; cidade exibida coincide com `WeatherData.city`.

### T-15 — Implementar lista de previsão

- **Descrição:** Renderizar os cinco dias, mínimas, máximas, datas e condições
  com fallbacks independentes.
- **Tipo:** UI
- **Spec:** RF-04, RF-09, RNF-02, RNF-09
- **Dependências:** T-03, T-04, T-09, T-12
- **Arquivos prováveis:** `src/components/ForecastList.tsx`
- **Critérios de aceite:** renderiza exatamente cinco dias; mínima ausente exibe
  `Indisponível` sem ocultar máxima; datas usam o valor local recebido; trocar
  unidade atualiza os valores sem recarregar ou chamar API.

### T-16 — Implementar controle de unidade

- **Descrição:** Adicionar o controle Celsius/Fahrenheit e derivar valores de
  apresentação a partir do Celsius armazenado.
- **Tipo:** UI
- **Spec:** RF-05, RNF-03, RNF-04
- **Dependências:** T-03, T-14, T-15
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`
- **Critérios de aceite:** o controle inicia em Celsius; selecionar Fahrenheit
  converte todas as temperaturas com arredondamento inteiro; `WeatherData` não
  muda e o mock de API não recebe nova chamada; o controle funciona por teclado.

## Composition

### T-17 — Compor App e passar props

- **Descrição:** Montar `App.tsx`, instanciar `useWeather` e passar estado e
  callbacks para os componentes.
- **Tipo:** UI
- **Spec:** RF-08, RF-09, RNF-07
- **Dependências:** T-10, T-11, T-12, T-13, T-14, T-15, T-16
- **Arquivos prováveis:** `src/App.tsx`
- **Critérios de aceite:** somente `App.tsx` instancia `useWeather`; nenhum
  component importa `services`; trocar cidade e unidade não recarrega a página;
  uma mudança de estado do hook atualiza os componentes via props.

### T-18 — Aplicar tema e responsividade

- **Descrição:** Ajustar layout Tailwind para o tema existente e os viewports
  exigidos.
- **Tipo:** UI
- **Spec:** RNF-02, RNF-04, RNF-09
- **Dependências:** T-17
- **Arquivos prováveis:** `src/index.css`, componentes de layout
- **Critérios de aceite:** `document.documentElement.scrollWidth` não excede
  `window.innerWidth` em 320, 768 e 1280 px; foco permanece visível; busca,
  seleção e unidade são utilizáveis em cada viewport.

## Tests

### T-19 — Testar conversão de unidade

- **Descrição:** Testar a função pura de conversão Celsius/Fahrenheit e seu
  arredondamento, sem React ou rede.
- **Tipo:** Test
- **Spec:** RF-05, RNF-07, RNF-09
- **Dependências:** T-03
- **Arquivos prováveis:** `tests/unit/weather.test.ts`
- **Critérios de aceite:** `20 C` retorna `20` em Celsius e `68` em Fahrenheit;
  `10 C` retorna `50 F`; resultados são inteiros; valores ausentes não viram
  zero.

### T-20 — Testar service de geocoding com mock de fetch

- **Descrição:** Verificar o cliente de geocoding isolado da rede real.
- **Tipo:** Test
- **Spec:** RF-01, RF-02, RF-07, RNF-10
- **Dependências:** T-05
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`
- **Critérios de aceite:** o mock verifica `count=5`, `language=pt`, termo
  codificado e timeout; `results: []`, HTTP não OK e resposta inválida produzem
  os resultados/erros definidos sem chamada externa.

### T-21 — Testar service de forecast com mock de fetch

- **Descrição:** Verificar o cliente de previsão e o mapeamento da resposta
  Open-Meteo sem rede real.
- **Tipo:** Test
- **Spec:** RF-03, RF-04, RF-07, RNF-09
- **Dependências:** T-02, T-06
- **Arquivos prováveis:** `tests/unit/forecast.test.ts`
- **Critérios de aceite:** o mock verifica `temperature_unit=celsius`,
  `timezone=auto` e `forecast_days=5`; resposta válida gera cinco dias;
  HTTP, JSON inválido, timeout e abort produzem `WeatherError`.

### T-22 — Testar formulário e seleção de cidade

- **Descrição:** Cobrir busca explícita, validação e seleção de resultados com
  Testing Library.
- **Tipo:** Test
- **Spec:** RF-01, RF-02, RNF-03, RNF-04
- **Dependências:** T-10, T-11
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`,
  `tests/components/CityResults.test.tsx`
- **Critérios de aceite:** os testes falham se a busca ocorrer durante
  digitação; verificam label, Enter, termo com acento, seleção única e seleção
  múltipla; nenhuma chamada de rede real é feita.

### T-23 — Testar estados de loading, erro e vazio

- **Descrição:** Cobrir os estados de feedback e recuperação com Testing
  Library.
- **Tipo:** Test
- **Spec:** RF-06, RF-07, RF-08, RNF-04
- **Dependências:** T-12, T-13
- **Arquivos prováveis:** `tests/components/StatusMessage.test.tsx`,
  `tests/components/EmptyState.test.tsx`
- **Critérios de aceite:** encontra `role="status"` no loading e
  `role="alert"` no erro; valida mensagens pt-BR, retry de busca, retry de
  forecast, `idle` e `empty`.

### T-24 — Testar clima atual e lista de previsão

- **Descrição:** Cobrir as apresentações meteorológicas com dados completos e
  parciais em estado controlado.
- **Tipo:** Test
- **Spec:** RF-03, RF-04, RNF-05, RNF-09
- **Dependências:** T-14, T-15
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`,
  `tests/components/ForecastList.test.tsx`
- **Critérios de aceite:** `20 C` exibe `20 °C`; temperatura ausente exibe
  `Temperatura indisponível`; cinco datas são renderizadas; mínima ausente usa
  `Indisponível`; WMO desconhecido usa fallback.

### T-25 — Testar controle de unidade no componente

- **Descrição:** Cobrir a interação Celsius/Fahrenheit isolada da camada de
  rede.
- **Tipo:** Test
- **Spec:** RF-05, RNF-03, RNF-04
- **Dependências:** T-16
- **Arquivos prováveis:** `tests/components/UnitToggle.test.tsx`
- **Critérios de aceite:** o estado inicial é Celsius; selecionar Fahrenheit
  exibe `68 °F` para `20 C`; o controle tem nome acessível, responde ao teclado
  e não invoca o mock de API.

### T-26 — Cobrir jornada E2E principal e viewport mobile

- **Descrição:** Validar a jornada feliz em desktop e mobile com APIs
  interceptadas.
- **Tipo:** Test
- **Spec:** RF-01 a RF-05, RF-08, RF-09, RNF-02
- **Dependências:** T-18, T-22, T-23, T-24, T-25
- **Arquivos prováveis:** `tests/e2e/weather-success.spec.ts`,
  configuração Playwright
- **Critérios de aceite:** intercepta geocoding e forecast; valida busca,
  seleção, cinco dias, troca para Fahrenheit sem nova rota e troca de cidade;
  executa a jornada em pelo menos 320 px e 1280 px sem rolagem horizontal.

### T-27 — Cobrir falhas E2E

- **Descrição:** Validar recuperação de erros e concorrência com APIs
  interceptadas.
- **Tipo:** Test
- **Spec:** RF-06, RF-07, RF-09, RNF-01, RNF-04
- **Dependências:** T-26
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`,
  configuração Playwright
- **Critérios de aceite:** fixtures provocam vazio, falha de rede, HTTP não OK,
  timeout, retry e resposta fora de ordem; verifica `role="status"`,
  `role="alert"` e loading em até 100 ms; respostas antigas não alteram a UI.

### T-28 — Cobrir responsividade e compatibilidade E2E

- **Descrição:** Validar os viewports restantes, teclado, acessibilidade visual
  e projetos de navegador exigidos.
- **Tipo:** Test
- **Spec:** RNF-02, RNF-04, RNF-08
- **Dependências:** T-18, T-27
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`,
  configuração Playwright
- **Critérios de aceite:** cada viewport 320/768/1280 px não possui rolagem
  horizontal e mantém controles acessíveis; foco e roles são verificáveis; os
  projetos Chromium, Firefox e WebKit executam; projetos móveis executam quando
  disponíveis.

## Delivery

### T-29 — Executar validações de entrega

- **Descrição:** Executar qualidade, build, testes e validação dos artefatos
  SDD antes da entrega.
- **Tipo:** Infra
- **Spec:** Completion Criteria
- **Dependências:** T-28
- **Arquivos prováveis:** `.github/workflows/validate-spec.yml`
- **Critérios de aceite:** `pnpm lint`, `pnpm build` e `pnpm test` terminam com
  código zero; o workflow encontra os nove títulos da spec, `Out of Scope`,
  `plans/weather-app-plan.md` e `tasks/weather-app-tasks.md`.