# RF Cronometragem — como atualizar o site

## Estrutura das pastas

```
index.html                 página principal (estrutura, não tem conteúdo repetido)
obrigado.html              página mostrada depois de alguém enviar o formulário
styles.css                 todo o aspeto visual, organizado por secções
js/dados.js                >>> O ÚNICO FICHEIRO QUE PRECISA DE EDITAR <<<
js/app.js                  constrói a página a partir do dados.js
img/cartazes/              cartazes dos eventos (nome = data + evento)
img/patrocinadores/        logótipos dos parceiros
img/logo-rf-cronometragem.jpeg
resultados/<data-evento>/  PDFs de cada prova
CNAME                      domínio rfcronometragem.pt
dados/contador.json        ficheiro antigo, mantido tal como estava
```

Regra geral: **nomes sempre em minúsculas, sem espaços, sem acentos.**
É isso que evita links partidos.

---

## Adicionar um próximo evento

1. Guarde o cartaz em `img/cartazes/` com um nome no formato
   `2026-09-20-nome-do-evento.jpeg`.
2. Abra `js/dados.js` e acrescente o evento em `proximosEventos`:

```js
  proximosEventos: [
    {
      titulo: 'Nome do Evento',
      data: '2026-09-20',
      hora: '19:00',
      cartaz: 'img/cartazes/2026-09-20-nome-do-evento.jpeg'
    }
  ],
```

O contador da página inicial aponta **sozinho** para o próximo evento
desta lista que ainda não passou. Não é preciso mexer em mais nada.

## Quando a prova passar

Mude esse bloco de `proximosEventos` para `eventosRecentes`
(tirando a linha `hora`). Os eventos recentes aparecem ordenados
automaticamente, do mais recente para o mais antigo.

## Publicar resultados

1. Crie a pasta `resultados/2026-09-20-nome-do-evento/`.
2. Meta lá os PDFs com nomes claros, por exemplo:
   `mx-open-1a-manga.pdf`, `mx-open-classificacao-final.pdf`.
3. Em `js/dados.js`, acrescente no início da lista `resultados`:

```js
    {
      titulo: 'Nome do Evento — Local',
      data: '2026-09-20',
      estado: 'final',              // ou 'provisorio'
      pasta: 'resultados/2026-09-20-nome-do-evento/',
      documentos: [
        { titulo: 'MX Open — 1ª Manga',            ficheiro: 'mx-open-1a-manga.pdf' },
        { titulo: 'MX Open — Classificação Final', ficheiro: 'mx-open-classificacao-final.pdf' }
      ]
    },
```

## Mudar o cartaz do popup de entrada

Em `js/dados.js`, na secção `popup`, troque o caminho da imagem.
Para deixar de mostrar o popup, escreva `popup: null,`.

## Acrescentar um parceiro

Guarde o logótipo em `img/patrocinadores/` e acrescente uma linha em
`patrocinadores`. O carrossel repete a lista sozinho para dar a volta
sem cortes.

---

## Depois de editar

Faça upload dos ficheiros alterados para o GitHub. O site atualiza
sozinho passados alguns segundos.

Se editar `js/dados.js` e o site ficar em branco, é quase sempre uma
vírgula a mais ou a menos. Abra a página no computador, carregue em F12
e veja a mensagem no separador "Console" — ela indica a linha do erro.
