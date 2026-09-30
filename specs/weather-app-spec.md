# Weather App Specification

## Overview

O Aplicativo de Previsão do Tempo é uma aplicação web para consultar as condições climáticas por cidade. O usuário pode pesquisar e selecionar uma cidade, visualizar o clima atual e consultar a previsão de cinco dias, alternando entre Celsius e Fahrenheit.

A aplicação deve priorizar rapidez, legibilidade e usabilidade em dispositivos móveis, mantendo a funcionalidade em computadores. A interface será em pt-BR e seguirá o tema escuro com glassmorphism definido pelo projeto. A fonte de dados é Open-Meteo, sem chave de API. A busca é global por nome de cidade; Celsius é a unidade inicial e a previsão diária cobre hoje e os quatro dias seguintes, no fuso horário local da cidade selecionada. O produto atende uma cidade ativa por vez e não armazena consultas localmente nem no servidor.

## Functional Requirements

### RF-01 — Buscar uma cidade
O sistema deve permitir que o usuário pesquise globalmente uma cidade pelo nome, enviando a consulta somente após ação explícita por botão ou tecla Enter. Espaços no início e no fim devem ser removidos; acentos, espaços internos, apóstrofos e hífens devem ser preservados e enviados corretamente à geocodificação. Campo vazio não deve gerar solicitação.

### RF-02 — Selecionar uma cidade
O sistema deve usar automaticamente o único resultado da busca. Quando houver mais de um resultado, deve exibir as opções e exigir que o usuário selecione a cidade desejada. Cada opção deve mostrar o nome da cidade, a região/estado quando disponível e o país. A localidade selecionada será o contexto dos dados meteorológicos.

### RF-03 — Exibir o clima atual
Para a cidade selecionada, o sistema deve exibir temperatura atual em Celsius internamente e descrição da condição climática em pt-BR. Os códigos meteorológicos WMO fornecidos por Open-Meteo devem ser mapeados para rótulos em português. Código desconhecido deve ser apresentado como “Condição não disponível”; temperatura ausente ou inválida, como “Temperatura indisponível”. A falta de um campo não deve ocultar outros dados válidos.

### RF-04 — Exibir a previsão de cinco dias
Para a cidade selecionada, o sistema deve exibir a previsão diária de hoje até os quatro dias seguintes, considerando a data local da cidade selecionada. Cada dia deve incluir data, temperatura mínima, temperatura máxima e condição climática em pt-BR.

### RF-05 — Alterar a unidade de temperatura
O usuário deve poder alternar todas as temperaturas exibidas entre Celsius e Fahrenheit. Celsius é o padrão a cada nova sessão de página. A conversão usa Fahrenheit = Celsius × 9/5 + 32 e arredonda ao inteiro mais próximo. A troca afeta clima atual e previsão, apenas na apresentação, sem nova solicitação à API. A escolha da unidade não é persistida após recarregar ou fechar a página.

### RF-06 — Exibir estado de carregamento
O sistema deve indicar cada busca por cidade e solicitação meteorológica em andamento. O estado deve ser anunciado a tecnologias assistivas como status e removido quando a solicitação terminar, falhar ou expirar.

### RF-07 — Tratar erros
O sistema deve diferenciar busca sem resultados, falha de geocodificação, falha meteorológica e timeout. Mensagens devem estar em pt-BR e ser anunciadas como alerta. Falha de geocodificação deve preservar o termo pesquisado e oferecer nova tentativa; falha meteorológica deve preservar a cidade ativa e oferecer “Tentar novamente” para essa cidade. Ao selecionar uma nova cidade, os dados da cidade anterior devem ser removidos enquanto os novos dados carregam. Respostas de solicitações antigas devem ser ignoradas.

### RF-08 — Exibir estado inicial vazio
Antes de uma cidade ser selecionada, o sistema deve exibir um estado inicial que oriente o usuário a pesquisar e não deve mostrar dados meteorológicos sem uma cidade como contexto.

### RF-09 — Atualizar a interface dinamicamente
O sistema deve atualizar os dados meteorológicos exibidos quando a cidade selecionada mudar e atualizar as temperaturas quando a unidade mudar, sem recarregar a página inteira. Durante a consulta de outra cidade, não deve apresentar os dados da cidade anterior como se pertencessem à seleção atual.

## User Stories

### Como Maria, profissional em trânsito, quero buscar uma cidade rapidamente para decidir como me preparar para sair.
- Relacionada a: RF-01

### Como Maria, profissional em trânsito, quero selecionar a cidade correta entre os resultados para consultar as condições da localidade onde estou.
- Relacionada a: RF-02

### Como João, planejador de rotina, quero ver o clima atual da cidade selecionada para escolher roupas e organizar meu dia.
- Relacionada a: RF-03

### Como João, planejador de rotina, quero consultar a previsão de cinco dias para planejar deslocamentos e atividades da semana.
- Relacionada a: RF-04

### Como Maria, profissional em trânsito, quero alternar entre Celsius e Fahrenheit para entender a temperatura na unidade que me é mais familiar.
- Relacionada a: RF-05

### Como Ana, viajante e pesquisadora de destinos, quero ver um indicador de carregamento durante a consulta para saber que meu pedido está sendo processado.
- Relacionada a: RF-06

### Como João, planejador de rotina, quero receber uma mensagem clara quando a busca ou a consulta falhar para saber se devo corrigir a pesquisa ou tentar novamente.
- Relacionada a: RF-07

### Como Ana, viajante e pesquisadora de destinos, quero ver uma tela inicial que indique a necessidade de escolher uma cidade para saber como iniciar a consulta.
- Relacionada a: RF-08

### Como Ana, viajante e pesquisadora de destinos, quero que os dados acompanhem a cidade e a unidade selecionadas para comparar as condições dos destinos corretamente.
- Relacionada a: RF-09

## Acceptance Criteria

Os cenários usam a estrutura Dado que / Quando / Então. Cada um está identificado com o requisito funcional que verifica.

### RF-01 — Buscar uma cidade

**Cenário: pesquisar um nome de cidade**
- **Dado que** o campo de busca contém “Lisboa”
- **Quando** o usuário envia a busca
- **Então** o sistema solicita localidades correspondentes ao termo “Lisboa”

**Cenário: tentar pesquisar sem informar uma cidade**
- **Dado que** o campo de busca está vazio ou contém apenas espaços
- **Quando** o usuário tenta enviar a busca
- **Então** o sistema não solicita localidades e informa que é necessário preencher o campo

**Cenário: pesquisar cidade com caracteres especiais**
- **Dado que** o campo contém “São José dos Campos”
- **Quando** o usuário envia a busca
- **Então** o sistema envia esse nome corretamente codificado à geocodificação, preservando acentos e espaços

**Cenário: pesquisar somente após ação explícita**
- **Dado que** o usuário está digitando um nome de cidade
- **Quando** ainda não envia o formulário pelo botão ou pela tecla Enter
- **Então** o sistema não envia solicitação de geocodificação

### RF-02 — Selecionar uma cidade

**Cenário: escolher entre localidades com o mesmo nome**
- **Dado que** a busca retorna duas ou mais localidades correspondentes
- **Quando** o usuário seleciona uma delas
- **Então** o sistema identifica a localidade escolhida como cidade ativa, mostra sua cidade, região/estado quando disponível e país, e usa suas coordenadas na consulta meteorológica

**Cenário: busca retorna uma única localidade**
- **Dado que** a busca retorna exatamente uma localidade
- **Quando** os resultados são recebidos
- **Então** o sistema seleciona essa localidade automaticamente e inicia sua consulta meteorológica

### RF-03 — Exibir o clima atual

**Cenário: apresentar clima atual recebido com sucesso**
- **Dado que** uma cidade está selecionada e a resposta contém temperatura atual e condição climática
- **Quando** a consulta meteorológica termina com sucesso
- **Então** a tela exibe a temperatura e a descrição correspondentes à cidade ativa

**Cenário: mapear um código meteorológico conhecido**
- **Dado que** a resposta contém o código WMO 0 e temperatura válida
- **Quando** o clima atual é apresentado
- **Então** a condição é exibida como “Céu limpo” e a temperatura é apresentada em pt-BR

**Cenário: receber código meteorológico desconhecido**
- **Dado que** a resposta contém uma temperatura válida e um código meteorológico não reconhecido
- **Quando** o clima atual é apresentado
- **Então** a tela exibe a temperatura e o texto “Condição não disponível” em português

**Cenário: resposta atual sem temperatura**
- **Dado que** a resposta não contém uma temperatura atual válida
- **Quando** o clima atual é apresentado
- **Então** a tela exibe “Temperatura indisponível” e não substitui o valor ausente por zero ou por um valor presumido

### RF-04 — Exibir a previsão de cinco dias

**Cenário: apresentar a previsão diária completa**
- **Dado que** uma cidade está selecionada e a resposta contém previsão para hoje e os quatro dias seguintes
- **Quando** a consulta meteorológica termina com sucesso
- **Então** a tela exibe exatamente cinco datas consecutivas no fuso horário da cidade, cada uma com temperaturas mínima e máxima e condição climática correspondentes

**Cenário: resposta parcial da previsão**
- **Dado que** a resposta contém cinco datas, mas não contém uma temperatura mínima para um dos dias
- **Quando** a previsão é apresentada
- **Então** a tela mantém os cinco dias, exibe “Indisponível” para a mínima ausente e apresenta normalmente os demais valores válidos

**Cenário: fuso horário da cidade selecionada**
- **Dado que** a cidade selecionada está em um fuso horário diferente do dispositivo
- **Quando** a previsão diária é exibida
- **Então** as cinco datas são calculadas a partir da data local da cidade, de hoje até quatro dias depois

### RF-05 — Alterar a unidade de temperatura

**Cenário: alternar de Celsius para Fahrenheit**
- **Dado que** o clima atual está em 20 °C e um dia da previsão tem mínima de 10 °C e máxima de 25 °C
- **Quando** o usuário seleciona Fahrenheit
- **Então** o clima atual é exibido como 68 °F, a mínima e a máxima desse dia como 50 °F e 77 °F, todas as temperaturas são arredondadas ao inteiro mais próximo e nenhuma nova solicitação à API é enviada

**Cenário: iniciar na unidade padrão**
- **Dado que** a aplicação foi aberta pela primeira vez
- **Quando** uma consulta meteorológica válida é exibida
- **Então** as temperaturas são apresentadas em Celsius

### RF-06 — Exibir estado de carregamento

**Cenário: manter o indicador enquanto a solicitação está pendente**
- **Dado que** uma busca ou consulta meteorológica foi iniciada e sua resposta ainda não chegou
- **Quando** a solicitação permanece pendente
- **Então** a interface exibe um indicador de carregamento até a solicitação terminar

**Cenário: remover o indicador quando a solicitação termina**
- **Dado que** a interface exibe um indicador para uma solicitação em andamento
- **Quando** a solicitação termina com sucesso ou erro
- **Então** o indicador de carregamento deixa de ser exibido

### RF-07 — Tratar erros

**Cenário: busca sem localidades correspondentes**
- **Dado que** a busca foi concluída sem localidades correspondentes
- **Quando** o sistema recebe a resposta vazia
- **Então** a interface informa que nenhuma cidade foi encontrada e permite iniciar outra busca

**Cenário: falha na consulta meteorológica**
- **Dado que** uma cidade está selecionada
- **Quando** a solicitação meteorológica falha por erro da API ou de conexão
- **Então** a interface informa que os dados não puderam ser carregados, mantém a cidade selecionada e oferece a ação “Tentar novamente”

**Cenário: falha na geocodificação**
- **Dado que** o usuário enviou uma busca válida
- **Quando** a solicitação de geocodificação falha por erro da API ou da conexão
- **Então** a interface informa que a busca não pôde ser concluída, preserva o termo digitado e oferece nova tentativa

**Cenário: solicitação excede o tempo limite**
- **Dado que** uma solicitação de geocodificação ou meteorológica está pendente
- **Quando** dez segundos se passam sem resposta
- **Então** o sistema interrompe a solicitação, remove o indicador de carregamento, informa que a consulta expirou e permite tentar novamente

**Cenário: tentar novamente uma consulta meteorológica**
- **Dado que** a consulta meteorológica da cidade ativa falhou
- **Quando** o usuário aciona “Tentar novamente”
- **Então** o sistema solicita novamente os dados para as mesmas coordenadas sem repetir a geocodificação

### RF-08 — Exibir estado inicial vazio

**Cenário: abrir a aplicação sem cidade selecionada**
- **Dado que** nenhuma cidade foi selecionada nesta sessão
- **Quando** a aplicação é aberta
- **Então** a interface orienta o usuário a pesquisar uma cidade e não exibe dados meteorológicos

### RF-09 — Atualizar a interface dinamicamente

**Cenário: mudar a cidade selecionada**
- **Dado que** os dados meteorológicos de uma cidade estão visíveis
- **Quando** o usuário seleciona outra cidade
- **Então** o nome da nova cidade é exibido, os dados anteriores são removidos e o clima atual e a previsão são atualizados sem recarregar a página

**Cenário: respostas chegam fora de ordem**
- **Dado que** uma consulta para uma cidade anterior ainda está pendente quando uma consulta mais recente é iniciada
- **Quando** a resposta da consulta anterior chega depois da resposta mais recente
- **Então** a interface mantém os dados da seleção mais recente e ignora a resposta anterior

**Cenário: mudar somente a unidade**
- **Dado que** os dados meteorológicos de uma cidade estão visíveis
- **Quando** o usuário altera a unidade de temperatura
- **Então** todas as temperaturas visíveis são atualizadas sem recarregar a página nem enviar uma nova busca por cidade

## Traceability Matrix

A matriz usa `US` para User Story, `AC` para os cenários de aceite agrupados
por requisito funcional e `RNF` para requisitos não funcionais. Cada história
deve resultar em tarefas de implementação e testes que cubram as referências
indicadas.

| User Story | Requisito funcional | Acceptance Criteria relacionados | Requisitos não funcionais relevantes |
| --- | --- | --- | --- |
| US-01 — Maria busca uma cidade rapidamente | RF-01 | Pesquisar um nome de cidade; campo vazio; caracteres especiais; envio somente por ação explícita | RNF-01, RNF-03, RNF-04, RNF-09, RNF-10 |
| US-02 — Maria seleciona a cidade correta | RF-02 | Múltiplas localidades; localidade única selecionada automaticamente | RNF-02, RNF-03, RNF-04, RNF-09 |
| US-03 — João consulta o clima atual | RF-03 | Clima atual recebido; código WMO conhecido; código desconhecido; temperatura ausente | RNF-01, RNF-04, RNF-05, RNF-07, RNF-09 |
| US-04 — João consulta a previsão de cinco dias | RF-04 | Previsão completa; resposta parcial; fuso horário da cidade | RNF-01, RNF-02, RNF-04, RNF-05, RNF-07, RNF-09 |
| US-05 — Maria alterna a unidade de temperatura | RF-05 | Celsius para Fahrenheit; unidade inicial; conversão sem nova solicitação | RNF-01, RNF-03, RNF-04, RNF-07, RNF-09 |
| US-06 — Ana acompanha o carregamento | RF-06 | Indicador durante solicitação pendente; remoção ao concluir ou falhar | RNF-01, RNF-04, RNF-05 |
| US-07 — João entende e recupera falhas | RF-07 | Sem resultados; falha meteorológica; falha de geocodificação; timeout; retry meteorológico | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07 |
| US-08 — Ana entende como iniciar a consulta | RF-08 | Abertura sem cidade selecionada | RNF-02, RNF-03, RNF-04, RNF-09 |
| US-09 — Ana mantém cidade e unidade coerentes | RF-09 | Mudança de cidade; respostas fora de ordem; mudança somente da unidade | RNF-01, RNF-02, RNF-04, RNF-05, RNF-07, RNF-09 |

Os critérios de aceite também cobrem os principais casos de borda: entrada
vazia, caracteres especiais, respostas parciais, timeout, falhas de rede,
cidades homônimas, concorrência e ausência de conexão. O RNF-08 deve ser
verificado transversalmente nas jornadas principais, e não apenas por uma User
Story isolada.

## Non-Functional Requirements

### RNF-01 — Desempenho
A interface deve exibir o estado de carregamento em até 100 ms após o início da solicitação. Após receber uma resposta válida, deve apresentar os dados em até 500 ms. Cada solicitação de geocodificação ou previsão deve expirar após 10 segundos. Os tempos de interface devem ser verificados com respostas controladas por testes automatizados.

### RNF-02 — Adaptação a diferentes telas
A interface deve funcionar nas larguras de 320 px, 768 px e 1280 px, sem rolagem horizontal nem controles essenciais cortados. Esses tamanhos devem ser cobertos por testes de interface responsiva.

### RNF-03 — Usabilidade
A busca, seleção de cidade e troca de unidade devem ser compreensíveis e executáveis por teclado ou toque. A busca é submetida explicitamente; resultados ambíguos sempre exigem seleção do usuário.

### RNF-04 — Acessibilidade
A interface deve atender às diretrizes WCAG 2.2 nível AA. Controles devem ter nomes acessíveis, foco visível e navegação por teclado; estados de carregamento devem ser anunciados como status e erros como alertas por tecnologias assistivas.

### RNF-05 — Confiabilidade
Falhas de rede, API ou dados devem ser tratadas sem interromper a interface. Respostas inválidas não devem gerar exceção visível, valores presumidos ou dados de outra cidade; erros devem oferecer recuperação quando aplicável.

### RNF-06 — Disponibilidade
Quando a fonte externa estiver disponível, a aplicação deve permitir as consultas previstas; quando não estiver, deve degradar de forma controlada.

### RNF-07 — Manutenibilidade
A solução deve manter a consulta externa isolada da apresentação, validar e normalizar respostas antes de exibi-las e permitir testar as regras de conversão, mapeamento climático e estados sem depender da disponibilidade da API.

### RNF-08 — Compatibilidade
A aplicação deve permitir as jornadas principais nas duas versões estáveis mais recentes de Chrome, Firefox, Safari e Edge, além do Safari atual no iOS e Chrome atual no Android.

### RNF-09 — Idioma e localidade
Textos, mensagens de erro e descrições meteorológicas devem estar em pt-BR. Datas devem usar o fuso horário da cidade selecionada; temperaturas devem exibir unidade e arredondamento definidos em RF-05.

### RNF-10 — Segurança
A aplicação não deve expor credenciais nem armazenar consultas ou dados pessoais. A integração não exige chave secreta no cliente; o texto da busca deve ser enviado como dado codificado e nunca interpretado como marcação ou código.

## Edge Cases

| Caso | Comportamento esperado |
| --- | --- |
| Cidade inexistente ou geocodificação sem resultados | Tratar uma lista vazia como resultado válido sem correspondências, não como falha técnica. Informar que a cidade não foi encontrada, manter o termo para edição e não consultar a previsão. |
| Campo de busca vazio | Remover espaços externos. Se não restar texto, não enviar solicitação de geocodificação, informar que o nome é obrigatório e manter a busca disponível. |
| Caracteres especiais no nome | Preservar acentos, espaços internos, apóstrofos e hífens, codificar o termo no pedido e exibi-lo como texto, nunca como marcação ou código executável. |
| Falha da geocodificação | Preservar o termo enviado, informar que a busca não pôde ser concluída e oferecer nova tentativa. Não apresentar a falha como “cidade não encontrada”. |
| Falha da API meteorológica ou da conexão | Encerrar o carregamento, manter a cidade ativa, informar que os dados não puderam ser consultados e oferecer “Tentar novamente”. Não mostrar dados de outra cidade nem valores presumidos. |
| Timeout | Após 10 segundos sem resposta, abortar a solicitação, remover o carregamento e apresentar o erro com opção de tentar novamente. |
| Resposta parcial ou malformada | Exibir somente campos validados. Usar “Temperatura indisponível” para temperatura atual ausente, “Indisponível” para máxima ou mínima ausente e “Condição não disponível” para código desconhecido. Nunca substituir ausência por zero ou valor presumido. |
| Cidades homônimas | Mostrar cidade, região/estado quando disponível e país; exigir escolha explícita quando houver mais de um resultado. |
| Nova busca enquanto outra está em andamento | Identificar a busca mais recente como ativa, remover dados da cidade anterior e ignorar qualquer resposta antiga recebida depois. |
| Troca de unidade durante o carregamento | Manter a unidade escolhida durante a sessão e apresentar os dados nessa unidade ao concluir, sem nova solicitação à API. |
| Abertura sem cidade selecionada | Exibir o estado inicial vazio, orientar a busca e não mostrar dados meteorológicos sem contexto de cidade. |
| Uso sem conexão | Informar que a consulta exige conexão; não exibir dados em cache nem sugerir suporte offline. |

## Assumptions

- Open-Meteo fornece geocodificação e previsão sem chave de API; a busca é global e feita pelo nome da cidade.
- A previsão contém temperatura mínima, máxima e condição para hoje e os quatro dias seguintes, segundo o fuso local da cidade.
- A unidade é Celsius no início de cada sessão de página; a escolha Fahrenheit não é persistida.
- Uma busca válida só é enviada por botão ou tecla Enter. Um resultado é selecionado automaticamente; múltiplos resultados exigem escolha.
- Há uma única cidade ativa por vez. Não há autenticação, armazenamento local ou no servidor, cache persistente nem uso offline.
- A aplicação consulta dados mediante ação do usuário e não atualiza a previsão automaticamente.
- Interface e mensagens seguem pt-BR e o tema escuro com glassmorphism adotado pelo projeto.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade ou lentidão da API externa | Alta | Alto | Exibir carregamento e erro controlados; validar o comportamento sem resposta |
| Busca ambígua por nome de cidade | Alta | Alto | Exibir correspondências para seleção, sem escolher silenciosamente uma localidade |
| Resposta meteorológica incompleta ou incompatível | Média | Médio | Validar e normalizar os dados antes da apresentação |
| Conversão incorreta de temperatura | Média | Alto | Aplicar uma regra consistente e verificar valores nas duas unidades |
| Experiência inadequada em telas pequenas | Média | Alto | Priorizar mobile e verificar legibilidade e controles em telas estreitas |
| Requisições redundantes ou limite de uso da API | Média | Médio | Evitar chamadas desnecessárias; não usar cache nesta versão |
| Falha de conectividade | Média | Médio | Comunicar a falha e manter a interface em estado utilizável |

## Out of Scope

- Autenticação de usuários.
- Persistência de dados no servidor.
- Lista persistente de cidades favoritas.
- Previsão horária detalhada.
- Notificações ou alertas meteorológicos.
- Geolocalização obrigatória ou automática como requisito da consulta.
- Atualização automática ou periódica em tempo real; a consulta ocorre após uma ação do usuário.
- Ícones meteorológicos, imagens ou mapas interativos.
- Histórico de buscas, favoritos ou lista de cidades salvas.
- Cache temporário ou persistente, inclusive durante a mesma sessão.
- Personalização de tema, além do tema definido pelo projeto.
- Internacionalização ou mensagens em idiomas diferentes de pt-BR.
- Compartilhamento de consultas ou sincronização entre dispositivos.

## Open Questions

Não há decisões bloqueadoras para o escopo definido. Persistência local, consulta offline, múltiplas cidades simultâneas e atualização automática são melhorias futuras fora do escopo atual.

## Completion Criteria

A especificação estará atendida quando:
- todos os requisitos funcionais forem implementados;
- todos os cenários de aceite estiverem cobertos por testes automatizados;
- os testes responsivos cobrirem as larguras definidas em RNF-02;
- as verificações de acessibilidade cobrirem os critérios WCAG 2.2 nível AA aplicáveis;
- os testes de compatibilidade cobrirem os navegadores definidos em RNF-08;
- os estados inicial, de carregamento e de erro estiverem definidos e forem coerentes;
- cidade e unidade selecionadas atualizarem os dados exibidos conforme os critérios;
- as jornadas principais forem verificadas por testes;
- a interface permanecer utilizável em dispositivos móveis e desktop.
