## Contexto

O repositório atual está estruturado como um treinamento de desenvolvimento orientado por especificação (SDD), descrito em `README.md`, `AGENTS.md` e `copilot-instructions.md`. A ideia central é construir um app de previsão do tempo seguindo o fluxo:

Brief → Spec → Plan → Tasks → Code → Test → Review → Ship

A estrutura observada hoje inclui:
- documentação de workshop e módulos em `workshop`
- artefatos de especificação e planejamento em `specs` e `plans`
- backlog de tarefas em `tasks`
- configuração do projeto em `package.json`
- arquivos de suporte de CI/agents em `.github`
- sem implementação funcional completa visível na estrutura atual, o que sugere que o repositório está em fase de scaffold/treinamento, e não em versão final pronta para produção

Em termos de produto, o briefing aponta para uma aplicação web de previsão do tempo com foco em:
- busca de cidades
- clima atual
- previsão de 5 dias
- alternância entre Celsius e Fahrenheit
- uso em mobile

---

## Requisitos Funcionais

1. Busca de cidades
- O usuário deve conseguir pesquisar uma cidade pelo nome.
- O sistema deve localizar cidades com base no termo informado.
- Quando houver mais de um resultado, o sistema deve apresentar as opções relevantes para escolha.

2. Seleção de cidade
- O usuário deve poder escolher uma cidade dentre os resultados retornados.
- A cidade selecionada deve se tornar o contexto principal para os dados meteorológicos exibidos.

3. Exibição do clima atual
- O sistema deve mostrar o clima atual da cidade selecionada.
- Devem ser exibidos, no mínimo, a temperatura atual e a descrição do clima.
- Informações complementares, como sensação térmica, umidade ou vento, podem ser exibidas conforme disponibilidade da API.

4. Exibição da previsão de 5 dias
- O sistema deve mostrar a previsão para os próximos 5 dias.
- Cada dia deve apresentar no mínimo a temperatura e a condição climática esperada.

5. Alternância de unidade de temperatura
- O usuário deve poder alternar entre Celsius e Fahrenheit.
- A conversão deve ser aplicada aos valores exibidos de clima atual e previsão.

6. Estados da aplicação
- O sistema deve exibir estado de carregamento durante a busca e carregamento de dados.
- O sistema deve exibir mensagem de erro quando a busca for inválida, a cidade não for encontrada ou a API falhar.
- O sistema deve exibir um estado inicial vazio quando ainda não houver consulta realizada.

7. Atualização dinâmica da interface
- A interface deve atualizar os dados conforme a cidade selecionada e a unidade de temperatura ativa.
- A troca de unidade não deve exigir uma nova busca por cidade.

---

## Requisitos Não-Funcionais

1. Performance
- A aplicação deve responder rapidamente à busca e ao carregamento dos dados.
- A interface deve manter boa experiência mesmo em redes lentas.

2. Responsividade
- A interface deve funcionar corretamente em dispositivos móveis.
- O layout deve ser adaptado para telas pequenas, sem comprometer legibilidade e navegação.

3. Usabilidade
- A interação com busca, seleção e troca de unidade deve ser simples e intuitiva.
- A organização da informação deve facilitar a leitura do clima atual e da previsão.

4. Acessibilidade
- Os controles da interface devem possuir labels, foco visível e navegação adequada.
- A aplicação deve apresentar textos e elementos compreensíveis para usuários com tecnologias assistivas.

5. Confiabilidade
- A aplicação deve tratar falhas de rede e de API sem quebrar a interface.
- Os erros devem ser comunicados ao usuário de forma clara e útil.

6. Disponibilidade
- A aplicação deve se manter funcional sempre que a API de clima estiver disponível.
- Em cenários de indisponibilidade, a experiência deve degradar de forma controlada.

7. Manutenibilidade
- O código deve estar organizado em componentes, hooks, serviços e utilidades.
- A estrutura deve facilitar testes, evolução e manutenção futura.

8. Compatibilidade
- A aplicação deve funcionar em navegadores modernos.
- A experiência deve ser consistente em desktop e dispositivos móveis.

9. Internacionalização e localidade
- A interface deve considerar idioma e formato de data/temperatura adequados ao contexto do usuário.
- A apresentação da informação deve ser coerente com a localidade de uso.

10. Segurança
- A aplicação deve evitar expor credenciais ou dados sensíveis.
- O uso da API deve seguir práticas seguras e mínimas de exposição de dados.

11. Consistência funcional
- Os valores apresentados devem refletir corretamente a unidade atual e os dados recebidos da API.
- A conversão de temperatura deve ser consistente em toda a interface.

---

## Riscos

| Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- |
| Dependência de API externa e indisponibilidade | Alta | Alto | Validar a API antes da implementação, tratar falhas com estados de erro claros e manter fallback de UX. |
| Rate limiting ou limite de requisições da API | Média | Médio | Limitar chamadas redundantes, usar cache simples e evitar consultas desnecessárias. |
| Busca ambígua por cidade | Alta | Alto | Permitir busca com estado/país quando possível e apresentar resultados múltiplos para seleção do usuário. |
| Cidade não encontrada ou nome incompleto | Média | Médio | Exibir mensagem clara de "cidade não encontrada" e sugerir refinamento da busca. |
| Inconsistência na conversão Celsius/Fahrenheit | Média | Alto | Centralizar a conversão em uma utilidade única e aplicá-la consistentemente em toda a interface. |
| Dados incompletos ou campos nulos na resposta da API | Média | Médio | Validar a estrutura da resposta antes de renderizar e tratar campos ausentes com fallback. |
| Experiência ruim em dispositivos móveis | Média | Alto | Construir a UI mobile-first, testar em pequenos tamanhos de tela e priorizar legibilidade/ação. |
| Falhas de conectividade e offline | Média | Médio | Exibir estado de conexão indisponível, evitar crash na interface e permitir fallback elegante. |
| Variação de resposta da API por região ou versão | Média | Médio | Normalizar os dados no serviço antes de enviar para a UI e adicionar testes de contrato. |
| UX confusa em cenários de erro | Média | Médio | Definir mensagens padronizadas e estados de erro consistentes para busca, rede e dados vazios. |
| Produto com escopo mal definido | Alta | Médio | Validar o briefing com o cliente, documentar regras de negócio e fechar decisões antes da implementação. |
| Curva de aprendizado do SDD e foco no processo em vez do produto | Média | Médio | Manter o objetivo do produto visível e priorizar requisitos de negócio e entrega funcional. |
| Acessibilidade insuficiente | Média | Alto | Validar labels, contraste, foco visual e navegação por teclado desde o início do desenvolvimento. |
| Performance ruim em redes lentas | Média | Médio | Reduzir carregamento desnecessário, otimizar consulta e manter renderização leve. |
| Manutenção complicada da base de código | Média | Médio | Seguir arquitetura por componentes, hooks e serviços com testes e separação de responsabilidades. |

---

## Perguntas em Aberto (Open Questions)

1. Qual é o uso principal da aplicação: consulta rápida de clima, acompanhamento diário ou uso frequente em rotina?
   - Impacto: define a prioridade de UX, frequência de uso e nível de detalhamento da interface.

2. A busca deve aceitar apenas nome da cidade ou também deve suportar cidade + estado + país?
   - Impacto: influencia diretamente a qualidade da busca e a redução de ambiguidades em cidades com nomes repetidos.

3. Quando a aplicação abrir, qual deve ser o comportamento padrão: mostrar uma cidade predefinida, a geolocalização do usuário ou um estado vazio?
   - Impacto: afeta a percepção inicial da aplicação e a experiência de quem entra sem realizar nenhuma ação.

4. A previsão de 5 dias deve mostrar apenas temperatura máxima e mínima, ou também outras métricas como chuva, vento e humidade?
   - Impacto: define o nível de utilidade e detalhamento da tela de previsão.

5. A aplicação precisa considerar geolocalização automática do usuário para sugerir a cidade atual?
   - Impacto: muda a experiência do usuário e pode exigir permissões e tratamento de localização.

6. Qual regra deve determinar qual cidade selecionar quando a busca retorna múltiplos resultados?
   - Impacto: sem essa regra, o sistema pode escolher a cidade errada e comprometer a confiança do usuário.

7. A última cidade pesquisada deve ser salva e restaurada na próxima visita?
   - Impacto: influencia o comportamento recorrente da aplicação e o valor percebido em uso contínuo.

8. A aplicação precisa ter suporte a cache para reduzir chamadas de rede e melhorar performance em uso recorrente?
   - Impacto: sem cache, pode haver latência, consumo de rede e risco de limitação da API.

9. O sistema deve funcionar sem internet após a última consulta, ou é aceitável depender completamente da API em tempo real?
   - Impacto: define se a aplicação terá comportamento offline e como lidar com ausência de conectividade.

10. Qual é o comportamento esperado quando a API falha, retorna dados incompletos ou não encontra a cidade?
   - Impacto: sem definição, o usuário pode receber mensagens confusas e a aplicação pode parecer instável.

11. Qual é o escopo de unidades e formatos: apenas °C/°F, ou também outras localizações, idiomas e formatação de data?
   - Impacto: define a necessidade de internacionalização e a consistência da experiência em diferentes mercados.

12. A aplicação deve ser otimizada prioritariamente para mobile, desktop ou ambos?
   - Impacto: muda a estratégia de layout, espaçamento, interações e hierarquia de conteúdo.

13. Existe um design visual obrigatório, como dark mode, glassmorphism, branding da empresa ou estética mínima?
   - Impacto: sem isso, o produto pode ser implementado com direções visuais inconsistentes.

14. Qual é o nível mínimo de cobertura de testes exigido para essa aplicação?
   - Impacto: sem esse critério, a qualidade pode variar muito entre builds e mudanças futuras.

15. A aplicação precisa exibir dados em tempo real e atualizar automaticamente, ou a consulta manual é suficiente?
   - Impacto: define se há necessidade de polling, refresh automático e consumo contínuo de API.

16. Há algum requisito de acessibilidade formal, como WCAG, contraste mínimo, suporte a teclado e leitura por screen reader?
   - Impacto: sem esse critério, a app pode ficar pouco inclusiva e apresentar risco de conformidade.

17. A aplicação precisa ser pública para qualquer usuário, ou deve ter algum contexto de uso interno, limitado ou institucional?
   - Impacto: muda a expectativa de volume de uso, desempenho, suporte e regras de confiabilidade.

18. Quais erros e casos limite devem ser considerados como critério de aceite da aplicação?
   - Impacto: sem lista explícita, a equipe pode entregar uma solução que falha em cenários reais de uso.

19. A aplicação deve permitir múltiplas cidades salvas ou apenas uma cidade por vez?
   - Impacto: influencia a arquitetura de estado e a experiência para usuários que acompanham várias localidades.

20. A empresa exige que a aplicação seja entregue como demonstração de treinamento, ou como um MVP pronto para produto real?
   - Impacto: muda a profundidade da implementação, cobertura de testes, observabilidade e cuidado com qualidade de produção.

---

## Personas

### 1. Maria, a profissional em trânsito
- Objetivo principal: verificar rapidamente o clima da cidade em que está trabalhando ou viajando antes de sair de casa ou do escritório.
- Contexto de uso: mobile, em movimento, com foco em resposta rápida e sem muitos cliques.
- Métrica de sucesso: conseguir localizar a cidade e consultar o clima atual e a previsão de 5 dias em menos de 10 segundos.

### 2. João, o planejador de rotina
- Objetivo principal: acompanhar a previsão da sua cidade para planejar deslocamentos, roupas e atividades do dia.
- Contexto de uso: mobile e desktop, uso recorrente durante a semana, com foco em legibilidade e clareza.
- Métrica de sucesso: entender rapidamente se o dia será quente, frio, chuvoso ou seco, sem esforço cognitivo extra.

### 3. Ana, a viajante e pesquisadora de destinos
- Objetivo principal: comparar o clima de diferentes cidades antes de planejar uma viagem ou definir um destino.
- Contexto de uso: desktop em grande parte, com uso também em mobile quando está em deslocamento.
- Métrica de sucesso: comparar cidades com rapidez e identificar diferenças importantes na temperatura e na previsão de 5 dias sem confusão.

---

## Decisões

1. Fonte de dados: Open-Meteo (sem API key)
   - Justificativa: reduz complexidade de integração e elimina dependência de credenciais, alinhando com o objetivo do projeto de demonstrar desenvolvimento funcional e ágil sem custo de autenticação.
   - Resolve: fecha a incerteza sobre provedor externo e elimina dúvidas relacionadas à autenticação e configuração da API.

2. "5 dias" = hoje + 4 dias
   - Justificativa: oferece uma janela de previsão prática e consistente para uso diário, sem exigir granularidade horária que aumentaria complexidade de interface e processamento.
   - Resolve: define o escopo temporal da previsão e remove ambiguidade sobre o que significa “5 dias”.

3. Unidade padrão: Celsius
   - Justificativa: Celsius é a convenção mais natural para a maioria dos usuários no contexto brasileiro e para a API escolhida, além de manter a aplicação simples no uso inicial.
   - Resolve: define a unidade base do sistema e elimina a dúvida sobre a convenção de temperatura padrão.

4. Sem autenticação e sem persistência de servidor
   - Justificativa: o app é uma consulta pública de clima e não requer identidade do usuário, armazenamento centralizado ou backend próprio.
   - Resolve: fecha a questão de autenticação, persistência e complexidade de infraestrutura.

5. Idioma da UI: pt-BR
   - Justificativa: o projeto e a documentação estão em português e o contexto de uso é brasileiro, o que melhora clareza e acessibilidade para o usuário final.
   - Resolve: define a linguagem da interface e elimina dúvidas sobre textos, labels, mensagens e experiência local.

---

## Suposições (Assumptions)

1. A API de clima usada será Open-Meteo ou equivalente, sem autenticação obrigatória.
2. A aplicação será uma SPA em React + TypeScript com frontend responsivo.
3. O foco principal é o usuário final em mobile, mas a interface também precisa funcionar em desktop.
4. A unidade interna será Celsius e a conversão para Fahrenheit será feita na apresentação.
5. A previsão de 5 dias será diária, não por hora.
6. A cidade pesquisada será escolhida por nome, com a possibilidade de múltiplos resultados.
7. O projeto seguirá o padrão de separação em componentes, hooks, serviços e utilitários.
8. A experiência deve incluir tratamento explícito para carregamento, erro e vazio.
9. A aplicação não exigirá autenticação de usuário no escopo atual.
10. O objetivo principal é demonstrar SDD e boas práticas, além de entregar uma funcionalidade útil.