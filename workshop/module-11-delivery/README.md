# Delivery (GitHub Pages)

## Objetivo

Entrar na fase de **Shipping**: publicar o app e o site do workshop no **GitHub
Pages** via GitHub Actions, fechando o ciclo SDD de ponta a ponta.

```text
Thinking → Planning → Decomposing → Building → Testing → Reviewing → Shipping
                                                                     ▲ você está aqui
```

---

## Por que isso importa

Software só gera valor quando chega ao usuário. Automatizar o deploy garante
entregas **repetíveis e seguras**. Aqui você publica de verdade — e entende como
o `base` do Vite muda em produção.

---

## Entrada

- App aprovado no PR (Modules 05–09)
- Workflow [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml)
- `vite.config.ts` com `base` configurável via `VITE_BASE`
- Testes E2E Playwright com mocks locais de geocoding e previsão

## Saída

- GitHub Pages habilitado (Source: GitHub Actions)
- Site do workshop publicado na raiz
- App publicado em `/<repo>/app/`
- URL pública funcionando

## Testar o app publicado com Playwright

Após o deploy, configure `PLAYWRIGHT_BASE_URL` com a URL do app, incluindo
`/<repo>/app/`, e execute:

```bash
PLAYWRIGHT_BASE_URL="https://<user>.github.io/<repo>/app/" pnpm test:e2e
```

Quando `PLAYWRIGHT_BASE_URL` estiver definida, o Playwright não inicia o Vite
local. Sem ela, os testes continuam usando `http://localhost:5173`. As rotas de
geocoding e previsão são interceptadas pelo teste, então nenhuma chamada real à
API é feita.
