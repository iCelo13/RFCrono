/* ==========================================================================
   PAINEL DE ADMINISTRAÇÃO — LIGAÇÃO AO GITHUB
   --------------------------------------------------------------------------
   O site está alojado no GitHub Pages: os ficheiros do site são simplesmente
   ficheiros num repositório do GitHub. Este ficheiro sabe fazer três coisas:

     1. verificar se a chave de acesso é válida
     2. ler um ficheiro do repositório
     3. gravar vários ficheiros de uma só vez (uma única alteração)

   O ponto 3 usa a API "Git Data" do GitHub, que permite juntar todas as
   alterações — o cartaz novo + o ficheiro de dados, por exemplo — numa só
   gravação. Assim o site só é reconstruído uma vez.
   ========================================================================== */

const GitHub = (function () {
  'use strict';

  const BASE = 'https://api.github.com';
  let chave = null;

  function definirChave(valor) { chave = valor; }

  /* ----------------------------------------------------------------
     Chamada genérica à API do GitHub
     ---------------------------------------------------------------- */
  async function pedir(caminho, opcoes = {}) {
    const resposta = await fetch(BASE + caminho, {
      ...opcoes,
      headers: {
        'Authorization': 'Bearer ' + chave,
        'Accept': opcoes.aceitar || 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opcoes.headers || {})
      }
    });

    if (!resposta.ok) {
      const erro = new Error('Erro ' + resposta.status);
      erro.estado = resposta.status;
      try { erro.detalhe = (await resposta.json()).message; } catch (e) { /* sem corpo */ }
      throw erro;
    }

    if (opcoes.aceitar === 'application/vnd.github.raw') return resposta.text();
    if (resposta.status === 204) return null;
    return resposta.json();
  }

  /* ----------------------------------------------------------------
     Verifica se a chave dá acesso ao repositório
     ---------------------------------------------------------------- */
  async function verificarAcesso() {
    const repo = await pedir('/repos/' + CONFIG.repositorio);
    if (!repo.permissions || !repo.permissions.push) {
      const erro = new Error('sem permissão de escrita');
      erro.estado = 403;
      throw erro;
    }
    return repo;
  }

  /* ----------------------------------------------------------------
     Lê um ficheiro de texto do repositório
     ---------------------------------------------------------------- */
  function lerTexto(caminho) {
    const url = '/repos/' + CONFIG.repositorio + '/contents/' + codificarCaminho(caminho)
              + '?ref=' + encodeURIComponent(CONFIG.ramo)
              + '&t=' + Date.now();               // evita respostas em cache
    return pedir(url, { aceitar: 'application/vnd.github.raw' });
  }

  /* ----------------------------------------------------------------
     Grava vários ficheiros numa só alteração

     ficheiros = [
       { caminho: 'js/dados.js', texto: '...' },
       { caminho: 'img/cartazes/x.jpg', base64: '...' },
       { caminho: 'img/antigo.jpg', apagar: true }
     ]
     ---------------------------------------------------------------- */
  async function guardarFicheiros(mensagem, ficheiros, aoProgredir) {
    const repo = '/repos/' + CONFIG.repositorio;
    const passos = ficheiros.length + 4;
    let passo = 0;
    const avancar = (texto) => { passo++; if (aoProgredir) aoProgredir(passo, passos, texto); };

    // 1. Onde está a versão atual do site
    const referencia = await pedir(repo + '/git/ref/heads/' + encodeURIComponent(CONFIG.ramo));
    const commitAtual = referencia.object.sha;
    const commitInfo = await pedir(repo + '/git/commits/' + commitAtual);
    avancar('A preparar');

    // 2. Enviar o conteúdo de cada ficheiro novo
    const entradas = [];
    for (const ficheiro of ficheiros) {
      if (ficheiro.apagar) {
        entradas.push({ path: ficheiro.caminho, mode: '100644', type: 'blob', sha: null });
        avancar('A remover ' + nomeCurto(ficheiro.caminho));
        continue;
      }

      const corpo = ficheiro.base64 != null
        ? { content: ficheiro.base64, encoding: 'base64' }
        : { content: ficheiro.texto, encoding: 'utf-8' };

      const blob = await pedir(repo + '/git/blobs', {
        method: 'POST',
        body: JSON.stringify(corpo)
      });

      entradas.push({ path: ficheiro.caminho, mode: '100644', type: 'blob', sha: blob.sha });
      avancar('A enviar ' + nomeCurto(ficheiro.caminho));
    }

    // 3. Montar a nova árvore de ficheiros
    const arvore = await pedir(repo + '/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: commitInfo.tree.sha, tree: entradas })
    });
    avancar('A guardar');

    // 4. Criar a alteração e apontar o site para ela
    const commit = await pedir(repo + '/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message: mensagem, tree: arvore.sha, parents: [commitAtual] })
    });

    await pedir(repo + '/git/refs/heads/' + encodeURIComponent(CONFIG.ramo), {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha })
    });
    avancar('Concluído');

    return commit;
  }

  /* ----------------------------------------------------------------
     Auxiliares
     ---------------------------------------------------------------- */
  function codificarCaminho(caminho) {
    return caminho.split('/').map(encodeURIComponent).join('/');
  }

  function nomeCurto(caminho) {
    const nome = caminho.split('/').pop();
    return nome.length > 28 ? nome.slice(0, 26) + '…' : nome;
  }

  /** Traduz os erros da API para linguagem normal */
  function explicarErro(erro) {
    if (!navigator.onLine) return 'Parece que está sem ligação à internet. Verifique a ligação e tente outra vez.';
    switch (erro.estado) {
      case 401: return 'A chave de acesso já não é válida. Peça uma chave nova a quem trata do site.';
      case 403: return 'Esta chave não tem autorização para alterar o site. Peça uma chave nova a quem trata do site.';
      case 404: return 'Não encontrei o site no GitHub. Confirme o nome do repositório no ficheiro admin/config.js.';
      case 409:
      case 422: return 'O site foi alterado entretanto por outra pessoa. Feche o painel, volte a abrir e repita a operação.';
      default:  return 'Não foi possível gravar (' + (erro.detalhe || erro.message) + '). Tente novamente dentro de um minuto.';
    }
  }

  return { definirChave, verificarAcesso, lerTexto, guardarFicheiros, explicarErro };
})();
