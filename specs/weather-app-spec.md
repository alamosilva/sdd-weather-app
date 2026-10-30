# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação web pública, priorizada para consultas rápidas antes de sair, que permite pesquisar uma cidade, ver o clima atual e a previsão diária de cinco datas e alternar temperaturas entre Celsius e Fahrenheit. A interface e os textos serão em português do Brasil (pt-BR), com uso responsivo em dispositivos móveis e desktop.
O produto usará Open-Meteo como fonte meteorológica, sem exigir autenticação nem persistência de dados em servidor. A previsão cobre hoje e os quatro dias seguintes no fuso local da cidade selecionada. Os requisitos de atualidade, metas operacionais e uso do provedor estão definidos nesta especificação.

## Functional Requirements

- **FR-01 — Buscar e selecionar uma cidade:** o usuário deve poder pesquisar pelo nome de uma cidade e selecionar uma localização correspondente. A busca remove espaços no início e no fim, preserva todos os caracteres internos como texto e codifica o valor como parâmetro da requisição. Resultados exibem cidade, região administrativa e país quando disponíveis; quando esses metadados não distinguirem localidades homônimas, exibem também coordenadas arredondadas a quatro casas decimais.
- **FR-02 — Consultar clima atual:** após selecionar uma cidade, o sistema deve exibir nome da cidade, temperatura do ar atual e descrição da condição em pt-BR. A condição deve ser traduzida a partir do código meteorológico retornado pelo provedor; código desconhecido ou campo ausente deve ser indicado como indisponível, sem ocultar outros campos válidos. O horário de referência fornecido pelo provedor deve ser exibido no fuso local da cidade quando disponível.
- **FR-03 — Consultar previsão de cinco dias:** para a cidade selecionada, o sistema deve exibir cinco datas locais: hoje e os quatro dias seguintes. Cada data mostra condição do tempo e temperaturas mínima e máxima. Se um campo ou dia estiver ausente, o espaço da data permanece visível e o dado ausente é indicado como indisponível, sem estimativa ou preenchimento inventado.
- **FR-04 — Alternar unidade de temperatura:** o usuário deve poder alternar temperaturas exibidas entre Celsius e Fahrenheit. A unidade inicial deve ser Celsius. A conversão deve ser consistente em clima atual e previsão.
- **FR-05 — Usar sem autenticação:** o usuário deve conseguir pesquisar cidades e consultar clima e previsão sem criar conta ou entrar no sistema. O serviço não deve depender de dados persistidos em servidor.
- **FR-06 — Informar estados da consulta:** durante geocodificação e carregamento meteorológico, o sistema deve indicar progresso. Para busca sem resultados ou falha/timeout em qualquer serviço, deve explicar o estado e permitir nova tentativa mantendo o termo pesquisado ou a cidade selecionada.

## User Stories

- **US-01 (FR-01, FR-02):** Como Marina, quero consultar rapidamente o clima da cidade onde estou antes de sair.
- **US-02 (FR-02):** Como Marina, quero ver o clima atual da cidade selecionada para decidir como me preparar antes de sair.
- **US-03 (FR-03):** Como Rafael, quero consultar a previsão de hoje e dos quatro dias seguintes no destino para planejar minha viagem.
- **US-04 (FR-04):** Como Joana, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-05 (FR-05):** Como Rafael, quero consultar o clima sem criar uma conta para obter rapidamente a previsão do destino.
- **US-06 (FR-06):** Como Joana, quero saber quando os dados estão carregando, indisponíveis ou não foram encontrados para decidir se tento novamente.

## Acceptance Criteria

- **AC-01.1 (FR-01):** **Given** um nome de cidade não vazio após remover espaços externos; **When** o usuário submete a busca e a geocodificação retorna correspondências; **Then** cada localização válida é apresentada como opção selecionável.
- **AC-01.2 (FR-01):** **Given** um resultado de geocodificação com metadados regionais; **When** a opção é exibida; **Then** mostra o nome da cidade e, quando fornecidos, região administrativa e país.
- **AC-01.3 (FR-01):** **Given** duas localidades com o mesmo nome que não possam ser distinguidas pelos metadados regionais disponíveis; **When** os resultados são exibidos; **Then** cada opção inclui latitude e longitude arredondadas a quatro casas decimais.
- **AC-01.4 (FR-01):** **Given** resultados de geocodificação exibidos; **When** o usuário seleciona uma localização; **Then** as consultas meteorológicas usam exatamente as coordenadas dessa localização.
- **AC-01.5 (FR-01):** **Given** uma busca submetida sem correspondências; **When** a resposta vazia é recebida; **Then** a interface informa que nenhuma cidade foi encontrada e permite editar e submeter outra busca.
- **AC-01.6 (FR-01):** **Given** um campo vazio ou contendo apenas espaços; **When** o usuário tenta submeter; **Then** nenhuma requisição de geocodificação é enviada.
- **AC-01.7 (FR-01):** **Given** um nome de cidade com acentos, espaços internos, hífen, apóstrofo ou pontuação; **When** o usuário submete a busca; **Then** o texto interno é preservado e codificado como parâmetro, sem ser interpretado como parte da URL.
- **AC-01.8 (FR-01, FR-06):** **Given** uma busca de cidade cuja geocodificação falha por rede, timeout, limite ou indisponibilidade; **When** o erro é processado; **Then** a interface informa a falha, preserva o texto pesquisado e disponibiliza “Tentar novamente”.
- **AC-02.1 (FR-02):** **Given** uma cidade selecionada e dados atuais com referência de até três horas; **When** o clima é carregado; **Then** a interface exibe o nome da cidade, temperatura do ar, condição em pt-BR e horário de referência local quando fornecido pelo provedor.
- **AC-02.2 (FR-02):** **Given** uma localização selecionada; **When** dados meteorológicos são exibidos; **Then** correspondem às coordenadas selecionadas.
- **AC-02.3 (FR-02):** **Given** um código WMO; **When** a condição é exibida; **Then** o mapeamento pt-BR é: 0 “Céu limpo”; 1 “Predominantemente limpo”; 2 “Parcialmente nublado”; 3 “Nublado”; 45/48 “Nevoeiro”; 51/53/55 “Chuvisco”; 56/57 “Chuvisco congelante”; 61/63/65 “Chuva”; 66/67 “Chuva congelante”; 71/73/75 “Neve”; 77 “Grãos de neve”; 80/81/82 “Pancadas de chuva”; 85/86 “Pancadas de neve”; 95 “Tempestade”; 96/99 “Tempestade com granizo”; código desconhecido é exibido como “Condição indisponível”.
- **AC-02.4 (FR-02):** **Given** uma resposta atual sem temperatura ou sem código de condição; **When** os dados são exibidos; **Then** apenas o campo ausente é indicado como indisponível e os demais campos válidos continuam visíveis.
- **AC-02.5 (FR-02):** **Given** dados atuais com horário de referência anterior a três horas ou sem horário de referência; **When** a resposta é exibida; **Then** temperatura e condição não são apresentadas como atuais, a interface informa que os dados estão desatualizados ou não podem ser verificados e oferece nova tentativa; a previsão válida continua disponível.
- **AC-03.1 (FR-03):** **Given** uma cidade selecionada e fuso informado na resposta meteorológica; **When** a previsão é carregada; **Then** são exibidas cinco datas locais, de hoje até hoje mais quatro dias, em ordem cronológica.
- **AC-03.2 (FR-03):** **Given** dados válidos para uma data; **When** a previsão é exibida; **Then** essa data mostra condição, mínima e máxima.
- **AC-03.3 (FR-03):** **Given** um ou mais campos ou dias ausentes na resposta; **When** a previsão é exibida; **Then** os cinco espaços de data permanecem, cada valor ausente é identificado como indisponível e nenhum valor é estimado ou copiado de outro dia.
- **AC-03.4 (FR-03):** **Given** a resposta meteorológica sem fuso horário; **When** o app tenta montar a previsão; **Then** não usa o fuso do dispositivo como substituto, informa que não foi possível determinar as datas locais e permite tentar novamente.
- **AC-04.1 (FR-04):** **Given** uma página recém-carregada; **When** temperaturas são exibidas; **Then** todos os valores são identificados em Celsius.
- **AC-04.2 (FR-04):** **Given** temperaturas exibidas em Celsius; **When** o usuário seleciona Fahrenheit; **Then** clima atual e previsão passam a exibir °F sem nova consulta ao provedor.
- **AC-04.3 (FR-04):** **Given** temperaturas exibidas em Fahrenheit; **When** o usuário seleciona Celsius; **Then** clima atual e previsão voltam a exibir °C sem nova consulta ao provedor.
- **AC-04.4 (FR-04):** **Given** qualquer temperatura em °C; **When** exibida em °F; **Then** a conversão usa °F = (°C × 9/5) + 32 e arredonda ao inteiro mais próximo, com empates afastados de zero.
- **AC-04.5 (FR-04):** **Given** qualquer temperatura em °F; **When** exibida em °C; **Then** a conversão usa °C = (°F − 32) × 5/9 e arredonda ao inteiro mais próximo, com empates afastados de zero.
- **AC-04.6 (FR-04):** **Given** o usuário alterna unidades e recarrega a página; **When** as temperaturas são exibidas novamente; **Then** a unidade volta a Celsius; a preferência não é persistida localmente nem no servidor.
- **AC-05.1 (FR-05):** **Given** um visitante sem conta; **When** conclui busca, seleção e consulta; **Then** completa o fluxo sem autenticação.
- **AC-05.2 (FR-05):** **Given** uma sessão de navegador nova; **When** o visitante consulta uma cidade; **Then** a consulta não depende de perfil, histórico ou preferência armazenados no servidor.
- **AC-05.3 (FR-05):** **Given** a primeira busca da sessão; **When** a interface é exibida antes do envio; **Then** informa que o texto pesquisado será enviado ao serviço de geocodificação e que as coordenadas selecionadas serão enviadas ao serviço meteorológico do Open-Meteo; o app não solicita geolocalização do dispositivo.
- **AC-06.1 (FR-06):** **Given** uma busca ou consulta meteorológica pendente; **When** a requisição aguarda resposta; **Then** a interface expõe um indicador de carregamento com papel acessível de status.
- **AC-06.2 (FR-06):** **Given** uma busca sem resultados; **When** a resposta vazia é processada; **Then** o estado sem resultados é exposto e uma nova busca permanece disponível.
- **AC-06.3 (FR-06):** **Given** uma requisição de geocodificação ou meteorológica que falha por rede, timeout, limite ou indisponibilidade do provedor; **When** o erro é processado; **Then** a interface informa a falha e apresenta “Tentar novamente”, habilitado após o fim do carregamento.
- **AC-06.4 (FR-06):** **Given** o botão “Tentar novamente”; **When** o usuário o ativa; **Then** o app repete a operação que falhou, mantém a busca/cidade correspondente e remove o erro somente após sucesso.
- **AC-06.5 (FR-06):** **Given** uma consulta meteorológica para uma nova seleção que falha; **When** o erro é exibido; **Then** os dados meteorológicos da seleção anterior ficam ocultos e não são apresentados como atuais ou desatualizados.
- **AC-06.6 (FR-06):** **Given** uma consulta anterior ainda pendente e uma nova cidade selecionada; **When** a resposta anterior chega depois da resposta da seleção nova; **Then** a resposta anterior é ignorada e não altera cidade nem dados exibidos.
- **AC-06.7 (FR-06):** **Given** uma requisição de geocodificação ou meteorológica sem resposta; **When** 15 segundos se passam desde seu envio; **Then** ela é encerrada como timeout, a resposta tardia é descartada e o estado de erro com opção de nova tentativa é exibido.
- **AC-07.1 (NFR-07):** **Given** cada navegador e plataforma suportados; **When** os testes de fumaça são executados nas duas versões estáveis mais recentes de cada alvo; **Then** busca, seleção, consulta, troca de unidade e estados de erro funcionam sem falha bloqueadora.
- **AC-08.1 (NFR-02):** **Given** os fluxos principais; **When** são avaliados por teclado, auditoria automatizada e leitores de tela NVDA/Firefox e VoiceOver/Safari; **Then** cada controle tem nome acessível e foco visível, estados de carregamento/erro são anunciados e o relatório manual verifica cada critério WCAG 2.2 AA aplicável, sem falhas conhecidas não corrigidas.
- **AC-09.1 (NFR-01):** **Given** viewports de 320 px, 768 px e 1440 px, com zoom de até 200%; **When** os fluxos principais são percorridos; **Then** não há rolagem horizontal nem conteúdo ou controle inacessível por sobreposição ou corte.
- **AC-10.1 (NFR-03):** **Given** 100 execuções completas sob o perfil de rede definido em NFR-03; **When** o tempo entre submissão e renderização é calculado; **Then** o percentil 95 é de no máximo 3 segundos.
- **AC-10.2 (NFR-04):** **Given** as verificações sintéticas do mês; **When** é calculada a disponibilidade incluindo falhas do provedor e manutenção programada; **Then** pelo menos 99,5% das verificações completam busca e consulta meteorológica.
- **AC-11.1 (NFR-09):** **Given** os termos, limites, cobertura e requisitos de atribuição do Open-Meteo validados para o uso previsto; **When** a aplicação é preparada para lançamento; **Then** o uso está em conformidade com esses requisitos e toda atribuição obrigatória aparece visivelmente na interface.

## Non-Functional Requirements

- **NFR-01 — Responsividade:** os fluxos principais devem funcionar em larguras de 320 px a 1440 px sem rolagem horizontal, validadas nos extremos e em pelo menos uma largura intermediária.
- **NFR-02 — Acessibilidade:** os fluxos principais devem atender WCAG 2.2 nível AA. A validação inclui auditoria automatizada, navegação completa por teclado e verificação manual com NVDA/Firefox e VoiceOver/Safari. Contraste mínimo: texto normal 4,5:1; texto grande e componentes de interface não textuais 3:1.
- **NFR-03 — Performance:** exibir os dados meteorológicos em até 3 segundos no percentil 95, medidos desde a submissão da busca até a renderização dos dados. A medição usa Chromium estável, perfil de rede fixo de 10 Mbps de download, 5 Mbps de upload e 100 ms de latência, em 100 execuções completas; inclui latência dos provedores.
- **NFR-04 — Disponibilidade:** disponibilidade mensal mínima de 99,5%, medida por verificações sintéticas a cada cinco minutos que completam busca e consulta meteorológica. Falhas do Open-Meteo contam como indisponibilidade para o usuário; manutenção programada também entra no cálculo.
- **NFR-05 — Atualidade dos dados:** a temperatura e a condição atuais só podem ser apresentadas como atuais se o horário de referência fornecido pelo provedor tiver no máximo três horas no momento da exibição. Se o horário estiver ausente ou exceder esse limite, os dados não podem ser apresentados como atuais. Uma consulta com falha nunca deve deixar dados anteriores visíveis como atuais.
- **NFR-06 — Idioma e localização:** textos e descrições meteorológicas devem estar em pt-BR; datas usam formato dd/MM e horários formato 24 horas, ambos no fuso local da cidade selecionada.
- **NFR-07 — Compatibilidade:** suportar as duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari em desktop, Safari em iOS e Chrome em Android. Validar o fluxo principal em ao menos uma versão de cada navegador/plataforma suportado na data da entrega.
- **NFR-08 — Privacidade:** o app não exige autenticação, não persiste dados em servidor e não solicita geolocalização do dispositivo. A interface deve informar que o termo pesquisado é enviado ao serviço de geocodificação e as coordenadas selecionadas ao serviço meteorológico do Open-Meteo.
- **NFR-09 — Uso do provedor:** o app deve cumprir os termos, limites, cobertura e requisitos de atribuição do Open-Meteo já validados para o uso previsto; toda atribuição obrigatória deve estar visível na interface.

## Rastreabilidade

| User Story | Acceptance Criteria | NFRs relevantes |
| --- | --- | --- |
| US-01 — Pesquisar uma cidade e consultar seu clima antes de sair | AC-01.1–AC-01.8; AC-02.1–AC-02.5; AC-06.1, AC-06.3–AC-06.7 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07, NFR-08, NFR-09 |
| US-02 — Ver o clima atual da cidade selecionada | AC-02.1–AC-02.5; AC-06.3–AC-06.7 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07, NFR-08, NFR-09 |
| US-03 — Consultar a previsão de cinco dias | AC-03.1–AC-03.4; AC-06.1, AC-06.3–AC-06.7 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06, NFR-07, NFR-08, NFR-09 |
| US-04 — Alternar Celsius e Fahrenheit | AC-04.1–AC-04.6 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06, NFR-07 |
| US-05 — Usar o app sem autenticação | AC-05.1–AC-05.3 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-06, NFR-07, NFR-08, NFR-09 |
| US-06 — Entender carregamento, indisponibilidade e ausência de resultados | AC-01.5, AC-01.6, AC-01.8; AC-02.4, AC-02.5; AC-03.3, AC-03.4; AC-06.1–AC-06.7 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07, NFR-08, NFR-09 |

NFR-01, NFR-02, NFR-03, NFR-04 e NFR-07 são transversais aos fluxos principais; NFR-05 aplica-se à atualidade do clima atual.

## Edge Cases

- Busca: entrada vazia, caracteres acentuados ou pontuação válida; nenhuma correspondência e localidades homônimas.
- Provedor: falha, limite, timeout após 15 segundos, dados parciais ou ausência de fuso.
- Dados: temperaturas negativas/extremas, conversão e arredondamento; troca de data, fuso ou horário de verão.
- Concorrência e interface: nova seleção durante consulta pendente; larguras de 320–1440 px, zoom de 200% e uso por teclado/leitor de tela.

## Assumptions

- As APIs de geocoding e forecast da Open-Meteo podem ser chamadas diretamente pelo navegador, sem chave de API.
- O app é publicado como conteúdo estático no GitHub Pages; não há processamento de busca nem persistência de dados meteorológicos no servidor.
- O provedor retorna coordenadas e timezone quando disponíveis; campos ausentes ou respostas inválidas são tratados conforme os critérios de aceite.

## Risks

- **Dependência do Open-Meteo:** indisponibilidade, limite de uso, cobertura ou termos incompatíveis podem impedir a consulta. **Mitigação:** validar termos, cobertura, limites e atribuição antes do lançamento; tratar falhas e monitorar erros.
- **Ambiguidade geográfica:** cidades homônimas ou geocodificação insuficiente podem retornar a localização errada. **Mitigação:** apresentar contexto regional nos resultados e exigir seleção explícita.
- **Arredondamento:** valores inteiros podem ocultar pequenas diferenças entre temperaturas. **Mitigação:** manter o valor original e arredondar somente na apresentação.
- **Interpretação de datas:** fuso local, horário de verão ou fuso ausente pode deslocar a previsão. **Mitigação:** usar o fuso retornado pelo provedor e não substituir pelo fuso do dispositivo.
- **Atualidade:** os dados do provedor podem ter horário de referência antigo. **Mitigação:** exibir o horário de referência e aprovar idade máxima antes do lançamento.
- **Cobertura dos dados:** campos ou horários podem não estar disponíveis para uma localização. **Mitigação:** indicar dados ausentes e validar cobertura antes do lançamento.
- **Metas operacionais:** os alvos propostos podem não ser aprovados ou atingidos. **Mitigação:** aprovar os métodos e metas antes do compromisso de produção e monitorar os indicadores definidos.
- **Acessibilidade e dispositivos:** variações de navegador, leitor de tela ou viewport podem afetar os fluxos. **Mitigação:** executar os testes definidos nos critérios de aceite antes da entrega.

## Out of Scope

- Contas, autenticação e perfis de usuário.
- Persistência de dados meteorológicos ou de usuário em servidor.
- Aplicativos nativos para iOS ou Android.
- Previsão horária, mapas meteorológicos, alertas severos e notificações.
- Favoritos, histórico de cidades ou sincronização entre dispositivos.
- Geolocalização automática do dispositivo, até que seu uso e consentimento sejam definidos.
- Idiomas de interface além de pt-BR.
