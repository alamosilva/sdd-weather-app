# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa deseja uma aplicação de previsão do tempo para que usuários consultem condições meteorológicas de cidades. O produto deve apresentar o clima atual, oferecer uma previsão para cinco dias, permitir alternância entre Celsius e Fahrenheit e funcionar em dispositivos móveis. As decisões já tomadas estão registradas abaixo; público-alvo, plataformas suportadas e detalhes de interação ainda precisam ser definidos.

## Personas (hipóteses)

As personas abaixo são hipóteses iniciais derivadas do briefing e precisam ser validadas com usuários reais.

- **Marina — usuária no deslocamento:** consulta rapidamente o clima antes de sair. Usa principalmente o celular. Sucesso para ela: encontrar o clima da cidade desejada e entendê-lo em até 30 segundos.
- **Rafael — planejador de viagem:** consulta as condições atuais e a previsão para os próximos dias no destino. Pesquisa principalmente no desktop e pode voltar ao celular durante a viagem. Sucesso para ele: obter a previsão correta para o destino e os cinco dias sem confundir cidade ou datas.
- **Joana — profissional que trabalha ao ar livre:** verifica as condições do dia e dos próximos dias para planejar atividades externas. Usa principalmente o celular e pode preferir alternar a unidade de temperatura. Sucesso para ela: consultar rapidamente temperatura e previsão em uma unidade compreensível, inclusive em tela pequena.

## Decisões

- **Fonte de dados — Open-Meteo, sem API key.** Justificativa: permite consultar dados meteorológicos sem exigir uma chave de API. Resolve a escolha inicial do provedor; limites de uso, cobertura e termos ainda devem ser verificados.
- **Período da previsão — hoje + quatro dias.** Justificativa: define a janela de cinco dias solicitada sem adotar um período móvel de 120 horas. Resolve a interpretação da duração; fuso horário e informações exibidas por dia continuam em aberto.
- **Unidade padrão — Celsius (°C).** Justificativa: estabelece uma apresentação inicial consistente com o idioma da interface. Resolve a escolha da unidade inicial; persistência da preferência após alternar para Fahrenheit não foi decidida.
- **Sem autenticação e sem persistência de servidor.** Justificativa: mantém o escopo sem contas de usuário nem armazenamento de dados em servidor. Resolve se haverá login ou dados persistidos no backend; armazenamento local no dispositivo não está definido.
- **Idioma da interface — português do Brasil (pt-BR).** Justificativa: define o idioma inicial dos textos e controles. Resolve a escolha do idioma da UI; formatação de datas, horários e unidades ainda deve seguir critérios a definir.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade para consultar suas informações meteorológicas.
- **RF-02 — Consultar clima atual:** exibir as condições atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão do tempo para os cinco dias seguintes da cidade selecionada.
- **RF-04 — Alternar unidade:** permitir alternar a exibição de temperatura entre Celsius (°C) e Fahrenheit (°F).

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve permitir o uso das funções principais em dispositivos móveis e se adaptar a larguras de tela de 320 px a 1440 px, sem rolagem horizontal. A faixa e os dispositivos suportados são propostas a validar.
- **RNF-02 — Usabilidade:** busca, clima atual, previsão e unidade de temperatura devem ser compreensíveis e operáveis. Critérios de avaliação e sucesso ainda precisam ser definidos.
- **RNF-03 — Acessibilidade:** os fluxos principais devem atender ao nível AA da WCAG 2.2, incluindo operação por teclado, nomes acessíveis para controles e contraste adequado. O critério e a forma de validação devem ser confirmados.
- **RNF-04 — Performance:** busca e apresentação do clima atual e da previsão devem concluir em até 3 segundos no percentil 95, sob condições de rede acordadas. Esse limite é uma proposta a validar e deve considerar a latência do provedor externo.
- **RNF-05 — Disponibilidade:** a meta inicial é disponibilidade mensal de 99,5% para a aplicação. A meta, as janelas de manutenção e a medição de indisponibilidade do provedor externo devem ser acordadas; falhas do provedor devem ser comunicadas ao usuário.
- **RNF-06 — Atualidade dos dados:** as informações meteorológicas devem refletir dados fornecidos por uma fonte atualizada. A idade máxima aceitável e a indicação do horário da última atualização ainda precisam ser definidas.
- **RNF-07 — Compatibilidade:** navegadores e versões de sistemas operacionais suportados ainda precisam ser acordados.

## Riscos

- **Disponibilidade e qualidade da fonte de dados:** falhas, limites de uso ou dados incompletos do provedor podem impedir ou prejudicar a consulta.
- **Ambiguidade na busca:** cidades homônimas ou grafias diferentes podem levar o usuário a selecionar a localização incorreta.
- **Fuso horário da previsão:** sem uma regra explícita, os limites de cada dia podem não corresponder à data local da cidade consultada.
- **Diferenças de unidade e localização:** conversões, fuso horário e convenções locais podem produzir resultados confusos se não forem tratados de forma consistente.
- **Experiência móvel:** telas pequenas e conectividade variável podem dificultar a leitura ou a conclusão da consulta.

## Perguntas em Aberto

- Quais são os limites, a cobertura e os termos de uso do Open-Meteo para o uso previsto?
- A busca deve aceitar apenas nomes de cidades ou também estados, países, CEPs e localização atual do dispositivo?
- Como apresentar resultados quando houver cidades com o mesmo nome?
- Quais informações devem aparecer em cada dia da previsão, e qual fuso horário define os dias?
- A preferência de unidade deve persistir entre visitas? Se sim, pode ser armazenada localmente no dispositivo?
- Com que frequência os dados devem ser atualizados? Deve haver atualização automática ou ação manual?
- Qual idade máxima dos dados é aceitável para clima atual e previsão, e o horário da última atualização deve ser mostrado?
- As metas propostas de responsividade (320 px a 1440 px), performance (3 segundos no percentil 95) e disponibilidade (99,5% ao mês) são adequadas? Quais condições e critérios de medição serão usados?
- A formatação de datas e horários deve seguir o pt-BR ou o fuso/localidade da cidade consultada?
- Há necessidade de armazenar localmente cidades recentes ou preferências, considerando que não haverá persistência no servidor?
- Quais dispositivos e navegadores devem ser oficialmente suportados, e como será validada a conformidade com WCAG 2.2 AA?
- Como a aplicação deve informar ausência de resultados, falhas de rede e indisponibilidade do provedor?

## Suposições

- A busca é feita pelo nome de uma cidade e a consulta de clima e previsão ocorre após a seleção de uma cidade.
- Clima atual e previsão pertencem à mesma cidade selecionada.
- Celsius e Fahrenheit alteram a unidade apresentada para o usuário; o comportamento de persistência da preferência ainda não está definido.
- “Usar em dispositivos móveis” implica uma interface responsiva, sem exigir neste momento um aplicativo nativo.
- Os dados meteorológicos serão consultados no Open-Meteo; limites, cobertura e termos de uso serão verificados antes da implementação.