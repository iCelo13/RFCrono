# Painel de administração — instalação

Cinco passos, cerca de 15 minutos. Tudo gratuito.

---

## Passo 1 — Pôr a pasta no site

Copie a pasta `admin/` para a raiz do repositório do site, ao lado do
`index.html`. Depois de publicar, o painel fica em:

```
https://rfcronometragem.pt/admin/
```

A página tem `noindex`, por isso não aparece no Google. Quem lá chegar sem
chave de acesso não consegue fazer nada.

---

## Passo 2 — Indicar o repositório

Abra `admin/config.js` e altere **uma** linha:

```js
repositorio: 'UTILIZADOR/REPOSITORIO',
```

Escreva o seu nome de utilizador do GitHub e o nome do repositório do site.
Se o endereço do repositório for `github.com/marcelo/rfcrono`, escreve-se:

```js
repositorio: 'marcelo/rfcrono',
```

Se o ramo publicado não for o `main` (por exemplo, `gh-pages`), altere
também a linha `ramo`.

---

## Passo 3 — Criar a chave de acesso

No GitHub, com a sua conta:

1. Canto superior direito → **Settings**
2. Menu da esquerda, ao fundo → **Developer settings**
3. **Personal access tokens** → **Fine-grained tokens**
4. **Generate new token**

Preencha assim:

| Campo | O que escolher |
|---|---|
| Token name | `Painel RF Cronometragem` |
| Expiration | O prazo que quiser. Para projetos pessoais é possível escolher sem validade — se puser prazo, tem de gerar outra chave quando expirar |
| Repository access | **Only select repositories** → escolher o repositório do site |
| Permissions → Repository permissions → **Contents** | **Read and write** |

Deixe tudo o resto como está. Carregue em **Generate token** e **copie a
chave** — o GitHub só a mostra uma vez.

A chave começa por `github_pat_`.

---

## Passo 4 — Testar

Abra `https://rfcronometragem.pt/admin/`, cole a chave e carregue em Entrar.

Faça uma alteração pequena para confirmar — por exemplo, acrescente uma
prova de teste e depois remova-a. Cada operação demora uns segundos, e o
site fica atualizado um a dois minutos depois.

---

## Passo 5 — Deixar pronto no computador do cliente

No computador dele, uma vez:

1. Abrir `rfcronometragem.pt/admin/`
2. Colar a chave e entrar — fica guardada nesse computador e nesse browser
3. Criar um atalho no ambiente de trabalho ou nos favoritos

A partir daí ele abre o painel e já está dentro. Só volta a precisar da
chave se limpar os dados do browser, mudar de computador, ou se carregar
no botão "Sair".

---

## Segurança

- A chave só dá acesso **a este repositório** e só ao conteúdo dos
  ficheiros. Não dá acesso à sua conta, nem a outros repositórios, nem a
  apagar o repositório.
- Se a chave se perder: GitHub → Settings → Developer settings →
  Fine-grained tokens → **Revoke**. A antiga deixa de funcionar de imediato;
  gera-se outra e cola-se no painel.
- Nada se perde definitivamente: cada alteração feita pelo painel fica no
  histórico do GitHub e pode ser revertida.

## Custos

Zero. GitHub Pages e a API do GitHub são gratuitos nesta utilização — cada
publicação usa meia dúzia de pedidos, muito abaixo dos limites da conta
gratuita.
