# Tarefas — Weather App

Backlog derivado de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md) e da spec. As dependências apontam para tarefas deste arquivo; cada item limita-se a uma camada e, em geral, a até dois arquivos principais.

As tarefas foram agrupadas na ordem de execução. Os IDs são identificadores estáveis para dependências e rastreabilidade; a ordem é definida pelas entregas, não pela ordem numérica dos IDs.

## Entrega 0 — Fundação

### T-01 — Preparar a entrada React
- **Descrição:** conectar o ponto de entrada Vite à raiz React da aplicação.
- **Critérios de aceite:** `pnpm build` termina com código 0; ao abrir a aplicação, há exatamente um landmark `main` e o console não registra erro de runtime.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/components/App.tsx`.
- **Tipo:** Infra.

### T-02 — Aplicar tema global e responsividade base
- **Descrição:** configurar estilos globais Tailwind e o tema dark glassmorphism do projeto.
- **Critérios de aceite:** o estilo raiz define `color-scheme: dark`; a superfície glass usa fundo translúcido e `backdrop-filter`; em 320, 768 e 1440 px, `scrollWidth` não excede `clientWidth`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/index.css`, `tailwind.config.js`.
- **Tipo:** UI.

## Entrega 1 — Tipos e funções puras

### T-03 — Definir tipos compartilhados de domínio
- **Descrição:** declarar `TemperatureUnit`, `CityLocation`, `CurrentConditions`, `ForecastDay` e `WeatherSnapshot` conforme o plano.
- **Critérios de aceite:** os cinco tipos exportados têm os campos e nulabilidade descritos em Data Model; `pnpm build` termina com código 0 em TypeScript strict.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

### T-04 — Implementar conversão de temperatura
- **Descrição:** criar funções puras para conversão Celsius/Fahrenheit e arredondamento da apresentação.
- **Critérios de aceite:** 0 °C resulta em 32 °F, 100 °C em 212 °F e −40 °C em −40 °F; ambas as conversões arredondam empates afastando-os de zero; a função não importa nem chama APIs de rede.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.

### T-05 — Mapear códigos meteorológicos WMO
- **Descrição:** converter códigos WMO para descrições pt-BR usadas pela interface.
- **Critérios de aceite:** todos os códigos de AC-02.3 têm tradução; códigos desconhecidos produzem “Condição indisponível”.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/weatherCode.ts`.
- **Tipo:** Data.

### T-06 — Implementar datas locais e atualidade
- **Descrição:** formatar datas pelo timezone IANA e calcular se o clima atual pode ser apresentado como atual.
- **Critérios de aceite:** a data formatada corresponde ao timezone IANA recebido, independentemente do timezone do dispositivo; timestamp entre 0 e 3 horas é atual; ausente, futuro ou acima de 3 horas é desatualizado/não verificável; timezone ausente retorna resultado de erro explícito.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/localDate.ts`, `src/lib/freshness.ts`.
- **Tipo:** Data.


## Entrega 2 — Normalização e services

### Normalização pura

### T-10 — Mapear respostas da Open-Meteo
- **Descrição:** normalizar geocoding e forecast para tipos de domínio, isolando os formatos externos.
- **Critérios de aceite:** fixtures confirmam `results[].id/name/admin1/country/latitude/longitude` mapeados a `CityLocation`; `current.time/temperature_2m/weather_code` e cada índice de `daily` são mapeados aos tipos correspondentes; campos numéricos ausentes viram `null` e nenhuma temperatura é estimada.
- **Dependências:** T-03, T-05, T-06.
- **Arquivos prováveis:** `src/lib/openMeteoMapper.ts`.
- **Tipo:** Data.

### T-12 — Implementar serviço de geocoding
- **Descrição:** consultar a API de geocoding com `fetch` e query segura.
- **Critérios de aceite:** o mock de `fetch` recebe `https://geocoding-api.open-meteo.com/v1/search` com `name`, `count=10`, `language=pt` e `format=json`; query vazia não chama `fetch`; 15 s, falha de rede, 429/5xx e JSON inválido produzem códigos de erro normalizados.
- **Dependências:** T-03, T-10.
- **Arquivos prováveis:** `src/services/openMeteoClient.ts`.
- **Tipo:** Data.

### Services HTTP

### T-13 — Implementar serviço de forecast
- **Descrição:** obter clima atual e previsão para as coordenadas selecionadas.
- **Critérios de aceite:** o mock de `fetch` recebe `latitude`/`longitude` selecionadas, `current=temperature_2m,weather_code`, `daily=weather_code,temperature_2m_min,temperature_2m_max`, `forecast_days=5`, `timezone=auto`, `temperature_unit=celsius` e `timeformat=unixtime`; timeout de 15 s e falhas HTTP/rede retornam erros normalizados.
- **Dependências:** T-10, T-12.
- **Arquivos prováveis:** `src/services/openMeteoClient.ts`.
- **Tipo:** Data.

## Entrega 3 — Hook

### T-15 — Implementar o hook de estado
- **Descrição:** coordenar busca, seleção, consulta, retry, unidade e concorrência usando estado local.
- **Critérios de aceite:** busca e clima têm status independentes; query vazia gera zero chamadas; resultado de geocoding vazio produz `empty`; falha produz `error` e retry repete a mesma operação/contexto; selecionar cidade chama forecast com suas coordenadas; resposta antiga não altera a seleção atual; mudar unidade não chama serviços.
- **Dependências:** T-03, T-04, T-06, T-12, T-13.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data.

## Entrega 4 — Componentes

### T-17 — Criar formulário de busca e resultados
- **Descrição:** implementar input e lista selecionável com desambiguação geográfica.
- **Critérios de aceite:** input vazio não submete; cada resultado renderiza nome e metadados disponíveis; homônimos sem metadados distintos renderizam latitude/longitude com quatro casas decimais; opção pode receber foco e ser selecionada por teclado.
- **Dependências:** T-02, T-15.
- **Arquivos prováveis:** `src/components/CitySearchForm.tsx`, `src/components/LocationResults.tsx`.
- **Tipo:** UI.

### T-19 — Criar visualizações meteorológicas
- **Descrição:** apresentar clima atual e previsão diária usando dados normalizados.
- **Critérios de aceite:** clima atual renderiza cidade, temperatura em unidade selecionada, descrição e horário quando fornecido; previsão renderiza exatamente cinco datas em ordem; cada valor `null` tem placeholder; dado atual vencido ou sem timestamp não recebe rótulo “atual”.
- **Dependências:** T-03, T-15.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`.
- **Tipo:** UI.

### T-21 — Criar controle de unidade
- **Descrição:** permitir alternar entre Celsius e Fahrenheit na apresentação.
- **Critérios de aceite:** controle inicia em Celsius; ao selecionar Fahrenheit, valores atuais e diários usam conversão e sufixo °F sem nova chamada; ao selecionar Celsius, retornam a °C; reload restaura Celsius.
- **Dependências:** T-04, T-15.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`.
- **Tipo:** UI.

### T-22 — Criar indicador de estados da consulta
- **Descrição:** apresentar loading, erro, vazio e ação de retry de forma acessível.
- **Critérios de aceite:** loading usa papel acessível `status`; erro é anunciado e mostra botão “Tentar novamente” habilitado após encerrar loading; vazio mostra mensagem e deixa busca editável; sucesso apresenta os dados sem mensagem de erro.
- **Dependências:** T-15.
- **Arquivos prováveis:** `src/components/RequestStatus.tsx`.
- **Tipo:** UI.

### T-24 — Exibir aviso de privacidade e atribuição
- **Descrição:** informar o envio de consulta aos provedores e exibir créditos exigidos.
- **Critérios de aceite:** no render inicial, antes de qualquer submit, estão visíveis avisos de que o termo vai ao geocoding e as coordenadas ao forecast; se a configuração de atribuição exigir crédito, o texto aprovado do provedor está visível.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/components/ProviderNotice.tsx`.
- **Tipo:** UI.

## Entrega 5 — Integração da UI

### T-26 — Compor a página do app
- **Descrição:** conectar hook, formulário, resultados, visualizações, controles e aviso do provedor.
- **Critérios de aceite:** ao renderizar `App`, existem um formulário de busca, aviso do provedor e controles de unidade; após selecionar cidade, existem regiões de clima atual e forecast; o componente não contém `fetch` nem duplicação da lógica do hook.
- **Dependências:** T-15, T-17, T-19, T-21, T-22, T-24.
- **Arquivos prováveis:** `src/components/App.tsx`.
- **Tipo:** UI.

## Entrega 6 — Testes

### T-07 — Testar conversão de temperatura
- **Descrição:** criar testes unitários Vitest exclusivos para conversões Celsius/Fahrenheit.
- **Critérios de aceite:** `temperature.test.ts` verifica 0 °C → 32 °F, 100 °C → 212 °F, −40 °C → −40 °F, os dois sentidos de conversão, valores negativos e empates afastados de zero; a suíte passa com `pnpm test`.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Tipo:** Test.

### T-08 — Testar mapeamento WMO
- **Descrição:** validar as descrições meteorológicas com Vitest.
- **Critérios de aceite:** cada código WMO documentado tem resultado esperado e código desconhecido retorna indisponível.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/lib/weatherCode.test.ts`.
- **Tipo:** Test.

### T-09 — Testar datas locais e atualidade
- **Descrição:** cobrir timezone, fronteiras de data e limite de frescor.
- **Critérios de aceite:** testes incluem timezone IANA, mudança de horário, timezone ausente, timestamp ausente/futuro e idades imediatamente abaixo, iguais e acima de três horas.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/lib/localDate.test.ts`, `tests/unit/lib/freshness.test.ts`.
- **Tipo:** Test.

### T-11 — Testar mapeamento das respostas
- **Descrição:** verificar payloads válidos e incompletos dos dois endpoints.
- **Critérios de aceite:** Vitest verifica ID numérico convertido para string, metadados opcionais ausentes, `results` vazio, código WMO desconhecido, timestamp e array diário curto; cada saída esperada é comparada campo a campo.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/unit/lib/openMeteoMapper.test.ts`.
- **Tipo:** Test.

### T-14 — Testar serviços HTTP
- **Descrição:** criar testes dedicados para os services de geocoding e forecast usando `fetch` mockado.
- **Critérios de aceite:** `openMeteoClient.test.ts` verifica URLs, parâmetros e coordenadas dos dois endpoints; cobre sucesso, lista vazia no geocoding, rede rejeitada, timeout, JSON inválido, HTTP 429 e HTTP 5xx; nenhuma chamada real é feita.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `tests/unit/services/openMeteoClient.test.ts`.
- **Tipo:** Test.

### T-16 — Testar transições do hook
- **Descrição:** testar reducer/hook com serviços simulados.
- **Critérios de aceite:** testes Vitest verificam cada um dos cinco status, número de chamadas de serviço, retry com a mesma query/cidade, resposta antiga ignorada e unidade alterada sem incremento nas chamadas.
- **Dependências:** T-15.
- **Arquivos prováveis:** `tests/integration/useWeatherApp.test.tsx`.
- **Tipo:** Test.

### T-18 — Testar busca e seleção
- **Descrição:** testar os componentes de busca/resultados com Testing Library e `user-event` em loading, erro, vazio e sucesso.
- **Critérios de aceite:** loading expõe status acessível; erro mostra mensagem e retry; vazio informa ausência de cidades e mantém a busca editável; sucesso mostra opções com metadados/coordenadas corretos e permite seleção por teclado; input só com espaços não dispara serviço; todas as chamadas são mockadas.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/integration/components/citySearch.test.tsx`.
- **Tipo:** Test.

### T-20 — Testar visualizações meteorológicas
- **Descrição:** testar estados de sucesso e dados parciais dos componentes de clima.
- **Critérios de aceite:** testes verificam todos os campos atuais, exatamente cinco datas cronológicas no timezone informado, placeholders para cada campo ausente e aviso para dado atual vencido; não há chamadas reais à rede.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/integration/components/weatherDisplay.test.tsx`.
- **Tipo:** Test.

### T-23 — Testar controles de unidade e status
- **Descrição:** testar os componentes de unidade e status, incluindo explicitamente os estados loading, erro, vazio e sucesso.
- **Critérios de aceite:** `controls.test.tsx` verifica unidade inicial, valores e labels °C/°F, zero requests extras e reset após reload; `RequestStatus` anuncia loading, apresenta erro/retry, apresenta mensagem vazia e não exibe erro no sucesso; retry dispara exatamente uma ação.
- **Dependências:** T-21, T-22.
- **Arquivos prováveis:** `tests/integration/components/controls.test.tsx`.
- **Tipo:** Test.

### T-25 — Testar aviso do provedor
- **Descrição:** validar aviso e atribuição configurável.
- **Critérios de aceite:** Testing Library encontra ambos os avisos antes do submit; com atribuição ativada, encontra o crédito configurado; com atribuição desativada, o crédito condicional não é renderizado.
- **Dependências:** T-24.
- **Arquivos prováveis:** `tests/integration/components/ProviderNotice.test.tsx`.
- **Tipo:** Test.


### T-27 — Testar o fluxo E2E principal
- **Descrição:** validar busca, seleção, consulta e troca de unidade com fixtures determinísticas em desktop e viewport mobile.
- **Critérios de aceite:** Playwright executa a mesma jornada em 1440 px e 320 px; em cada viewport submete a cidade, seleciona resultado, confirma coordenadas idênticas no request forecast, verifica clima e exatamente cinco datas, alterna °C/°F sem novo request e confirma `scrollWidth <= clientWidth`.
- **Dependências:** T-18, T-20, T-23, T-25, T-26.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-28 — Testar falhas e estados vazios em E2E
- **Descrição:** validar caminhos de erro, vazio e concorrência no navegador.
- **Critérios de aceite:** Playwright confirma mensagem de “nenhuma cidade” para lista vazia; falha de API apresenta erro e retry que recupera; timeout após 15 s oferece retry; payload parcial mostra placeholders; resposta da cidade anterior não substitui a seleção nova.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

## Entrega 7 — Hardening

### T-29 — Validar viewports e matriz de navegadores
- **Descrição:** percorrer fluxo principal nos tamanhos responsivos e navegadores definidos na spec.
- **Critérios de aceite:** em 320, 768 e 1440 px com zoom até 200%, `scrollWidth <= clientWidth` e nenhum controle está cortado; uma matriz registra execução smoke nas duas versões estáveis mais recentes de cada alvo NFR-07, incluindo verificações manuais de Safari/iOS e Chrome/Android.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test.

### T-30 — Automatizar auditoria de acessibilidade
- **Descrição:** verificar violações automatizáveis WCAG 2.2 AA nos fluxos principais.
- **Critérios de aceite:** teste automatizado executa nas telas de busca, resultados, clima, erro e retry; relatório não contém violações axe `critical` ou `serious` sem issue/justificativa registrada.
- **Dependências:** T-26.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`, `package.json` (dependência de teste, se necessária).
- **Tipo:** Test.

### T-31 — Registrar validação manual de acessibilidade
- **Descrição:** documentar teclado e leitores de tela exigidos pela spec.
- **Critérios de aceite:** checklist preenchido registra resultado, versão e evidência para teclado, foco visível, anúncio de estados, NVDA/Firefox e VoiceOver/Safari; cada falha tem issue vinculada e não resolvida bloqueia o aceite; nenhum item obrigatório fica sem resultado.
- **Dependências:** T-26.
- **Arquivos prováveis:** `docs/accessibility-checklist.md`.
- **Tipo:** Test.

### T-32 — Automatizar gates de qualidade do projeto
- **Descrição:** executar lint, build, testes unitários e E2E no pipeline do repositório.
- **Critérios de aceite:** workflow executa os quatro comandos listados em jobs; cada comando é obrigatório e qualquer exit code diferente de zero falha o workflow.
- **Dependências:** T-27, T-28, T-29, T-30.
- **Arquivos prováveis:** `.github/workflows/ci.yml`.
- **Tipo:** Infra.

### T-33 — Medir performance do fluxo
- **Descrição:** executar benchmark de 100 jornadas completas no perfil de rede definido pela spec.
- **Critérios de aceite:** relatório contém 100 durações completas no Chromium, sem mocks das APIs externas, sob 10 Mbps down, 5 Mbps up e 100 ms; calcula p95 de submit à renderização e o teste passa somente se p95 ≤ 3 s.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/performance/weather-app.spec.ts`.
- **Tipo:** Test.

### T-34 — Configurar verificação sintética de disponibilidade
- **Descrição:** executar periodicamente uma consulta completa contra a aplicação publicada usando URL configurável.
- **Critérios de aceite:** workflow agenda execução a cada cinco minutos e aceita `WEATHER_APP_URL` por configuração; cada execução registra sucesso apenas após busca e consulta meteorológica completarem, e registra falha nos demais casos.
- **Dependências:** T-27, T-32.
- **Arquivos prováveis:** `tests/e2e/availability.spec.ts`, `.github/workflows/availability.yml`.
- **Tipo:** Infra.

### T-35 — Documentar leitura das métricas operacionais
- **Descrição:** registrar como acompanhar p95, disponibilidade mensal e falhas do provedor.
- **Critérios de aceite:** runbook define cálculo mensal `checks bem-sucedidos / checks agendados`, inclui indisponibilidade do provedor e manutenção programada e compara o resultado com 99,5%; inclui instrução para identificar a janela e fonte do relatório.
- **Dependências:** T-33, T-34.
- **Arquivos prováveis:** `docs/operations-checklist.md`.
- **Tipo:** Infra.

## Rastreabilidade

| Tarefa | Requisitos da spec ou referência de origem |
| --- | --- |
| T-01 | Plano: Tech Stack e Project Structure; instruções do projeto: React/Vite |
| T-02 | NFR-01; `.github/copilot-instructions.md`: Tailwind e tema dark glassmorphism |
| T-03 | FR-01–FR-04; AC-02.4; AC-03.3; AC-05.2 |
| T-04 | AC-04.4–AC-04.5 |
| T-05 | AC-02.3 |
| T-06 | AC-02.1, AC-02.5, AC-03.1, AC-03.4; NFR-05, NFR-06 |
| T-07 | AC-04.4–AC-04.5 |
| T-08 | AC-02.3 |
| T-09 | AC-02.1, AC-02.5, AC-03.1, AC-03.4; NFR-05, NFR-06 |
| T-10 | AC-01.1–AC-01.5; AC-02.1–AC-02.4; AC-03.1–AC-03.3 |
| T-11 | AC-01.3, AC-01.5; AC-02.4; AC-03.3 |
| T-12 | AC-01.1, AC-01.5–AC-01.8; AC-06.3, AC-06.7 |
| T-13 | AC-01.4; AC-02.1–AC-02.5; AC-03.1–AC-03.4; AC-06.3, AC-06.7 |
| T-14 | AC-01.5, AC-01.8; AC-02.4; AC-03.3; AC-06.3, AC-06.7 |
| T-15 | AC-01.6, AC-01.8; AC-04.2, AC-04.3; AC-06.3–AC-06.7 |
| T-16 | AC-01.6, AC-01.8; AC-04.2, AC-04.3; AC-06.3–AC-06.7 |
| T-17 | AC-01.1–AC-01.7; NFR-02 |
| T-18 | AC-01.1–AC-01.8; AC-06.1–AC-06.4; NFR-02 |
| T-19 | AC-02.1–AC-02.5; AC-03.1–AC-03.4 |
| T-20 | AC-02.1–AC-02.5; AC-03.1–AC-03.4 |
| T-21 | AC-04.1–AC-04.6 |
| T-22 | AC-01.5–AC-01.8; AC-02.5; AC-03.4; AC-06.1–AC-06.7 |
| T-23 | AC-04.1–AC-04.6; AC-06.1–AC-06.4 |
| T-24 | AC-05.3; AC-11.1; NFR-08, NFR-09 |
| T-25 | AC-05.3; AC-11.1; NFR-08, NFR-09 |
| T-26 | FR-01–FR-06; US-01–US-06; NFR-01, NFR-06, NFR-08 |
| T-27 | US-01–US-05; AC-01.4, AC-02.2, AC-03.1, AC-03.2, AC-04.1–AC-04.3, AC-05.1, AC-09.1; NFR-01 |
| T-28 | AC-01.5, AC-01.8; AC-02.4, AC-02.5; AC-03.3, AC-03.4; AC-06.1–AC-06.7 |
| T-29 | AC-07.1, AC-09.1; NFR-01, NFR-07 |
| T-30 | AC-08.1; NFR-02 |
| T-31 | AC-08.1; NFR-02 |
| T-32 | `.github/copilot-instructions.md`: checklist de lint, build e testes; plano: Testing Strategy |
| T-33 | AC-10.1; NFR-03 |
| T-34 | AC-10.2; NFR-04 |
| T-35 | AC-10.1, AC-10.2; NFR-03, NFR-04 |

## Rastreabilidade FR → Tarefas

| Requisito funcional | Tarefas de implementação | Tarefas de teste | Cobertura |
| --- | --- | --- | --- |
| FR-01 — Buscar e selecionar uma cidade | T-10, T-12, T-15, T-17, T-26 | T-11, T-14, T-18, T-27, T-28 | Coberto |
| FR-02 — Consultar clima atual | T-05, T-06, T-10, T-13, T-15, T-19, T-26 | T-08, T-09, T-11, T-14, T-16, T-20, T-27, T-28 | Coberto |
| FR-03 — Consultar previsão de cinco dias | T-06, T-10, T-13, T-15, T-19, T-26 | T-09, T-11, T-14, T-20, T-27, T-28 | Coberto |
| FR-04 — Alternar unidade de temperatura | T-04, T-15, T-21, T-26 | T-07, T-16, T-23, T-27 | Coberto |
| FR-05 — Usar sem autenticação | T-01, T-24, T-26 | T-25, T-27 | Parcial: os testes verificam o aviso de privacidade e o fluxo visitante, mas nenhum critério verifica explicitamente ausência de autenticação e de persistência no servidor. |
| FR-06 — Informar estados da consulta | T-12, T-13, T-15, T-22, T-26 | T-14, T-16, T-18, T-23, T-28 | Coberto |

**Lacuna:** acrescentar à FR-05 uma verificação explícita de que o fluxo completo funciona sem login e não depende de perfil, histórico ou preferências armazenados no servidor. T-01, T-24 e T-26 não garantem esse comportamento por seus critérios atuais.

## Prioridade e tamanho

Prioridade indica ordem e risco: **P0** é necessário para demonstrar o fluxo funcional do MVP; **P1** é gate de qualidade/produção e continua obrigatório antes do lançamento público; **P2** é suporte operacional posterior à coleta das métricas, sem remover os gates definidos pela spec. Tamanho relativo: **P** é uma mudança/teste focalizado; **M** envolve casos ou arquivos relacionados; **G** cruza camadas, matriz de ambientes ou operação externa.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | M |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | P |
| T-06 | P0 | M |
| T-07 | P0 | P |
| T-08 | P0 | P |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | P |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | M |
| T-15 | P0 | G |
| T-16 | P0 | M |
| T-17 | P0 | M |
| T-18 | P0 | M |
| T-19 | P0 | M |
| T-20 | P0 | M |
| T-21 | P0 | P |
| T-22 | P0 | P |
| T-23 | P0 | M |
| T-24 | P0 | P |
| T-25 | P0 | P |
| T-26 | P0 | G |
| T-27 | P0 | G |
| T-28 | P0 | G |
| T-29 | P1 | G |
| T-30 | P1 | M |
| T-31 | P1 | M |
| T-32 | P1 | M |
| T-33 | P1 | G |
| T-34 | P1 | G |
| T-35 | P2 | P |

## Sequência de fatias verticais

| Fatia | Tarefas na ordem de execução | Resultado visível/verificável |
| --- | --- | --- |
| 0. Shell | T-01 → T-02 | Aplicação abre com tema base e layout responsivo, ainda sem dados meteorológicos. |
| 1. Clima consultável | T-03 → T-04/T-05/T-06 → T-10 → T-12/T-13 → T-15 → T-17/T-19/T-21/T-22/T-24 → T-26 | Usuário pesquisa e seleciona uma cidade, vê clima atual e cinco dias, troca unidade e recebe estados de busca; é a primeira fatia com valor de produto completo. |
| 2. Cobertura funcional | T-07/T-08/T-09/T-11/T-14/T-16/T-18/T-20/T-23/T-25/T-27/T-28 | Testes unitários, de serviço, hook, componentes e E2E verificam sucesso, vazio, erros, dados parciais, retry e concorrência. |
| 3. Pronto para produção | T-29 → T-30/T-31 → T-32 → T-33/T-34 | Compatibilidade, responsividade, acessibilidade, CI, performance e disponibilidade são verificados contra os gates da spec. |
| 4. Operação | T-35 | Runbook permite interpretar p95, disponibilidade mensal e falhas do provedor após haver dados de monitoramento. |

**Nota de sequenciamento:** a primeira fatia funcional depende hoje de T-15 e T-26, que coordenam o fluxo completo de clima e previsão. Para publicar uma fatia menor de busca/geocoding antes disso, seria necessário dividir esses contratos em etapas de busca e forecast; esse backlog mantém a dependência atual para não duplicar estado ou composição.