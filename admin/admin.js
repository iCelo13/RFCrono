/* ==========================================================================
   PAINEL DE ADMINISTRAÇÃO — LÓGICA DOS ECRÃS
   --------------------------------------------------------------------------
   Como funciona, em três frases:
     1. Ao entrar, o painel lê o ficheiro js/dados.js que está no GitHub.
     2. O utilizador preenche um formulário; o painel altera esse conteúdo
        em memória e prepara as imagens/PDFs que forem precisos.
     3. Ao carregar em publicar, tudo vai junto numa única gravação para o
        GitHub, e o GitHub Pages reconstrói o site sozinho.
   ========================================================================== */

(function () {
  'use strict';

  const CHAVE_GUARDADA = 'rfcrono.chave';

  const CABECALHO_DADOS =
    '/* Ficheiro de dados do site rfcronometragem.pt\n' +
    '   Gerado pelo painel de administracao. Pode ser editado a mao,\n' +
    '   mas mantenha sempre o formato: const DADOS = ... ;\n' +
    '   Notas escritas aqui desaparecem quando o painel voltar a gravar. */\n\n';

  const estado = { dados: null };

  const $ = (id) => document.getElementById(id);


  /* =========================================================
     UTILITÁRIOS
     ========================================================= */

  function slug(valor) {
    return String(valor)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  function dataCurta(iso) {
    const [a, m, d] = String(iso).split('-');
    return `${d}-${m}-${a}`;
  }

  function hoje() {
    const d = new Date();
    return [d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')].join('-');
  }

  function mostrarErro(id, mensagem) {
    const caixa = $(id);
    if (!caixa) return;
    caixa.textContent = mensagem;
    caixa.hidden = !mensagem;
    if (mensagem) caixa.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function limparErros() {
    document.querySelectorAll('.aviso--erro').forEach((c) => { c.hidden = true; });
  }

  /* ---- transformar o ficheiro de dados em objeto e vice-versa ---- */

  function interpretarDados(texto) {
    const inicio = texto.indexOf('{');
    const fim = texto.lastIndexOf('}');
    if (inicio < 0 || fim < 0) throw new Error('O ficheiro de dados não tem o formato esperado.');
    return (new Function('return (' + texto.slice(inicio, fim + 1) + ');'))();
  }

  function escreverDados(dados) {
    return CABECALHO_DADOS + 'const DADOS = ' + JSON.stringify(dados, null, 2) + ';\n';
  }

  /* ---- ficheiros ---- */

  /** Lê um ficheiro (PDF, por exemplo) e devolve-o em base64 */
  function lerBase64(ficheiro) {
    return new Promise((resolver, rejeitar) => {
      const leitor = new FileReader();
      leitor.onload = () => resolver(String(leitor.result).split(',')[1]);
      leitor.onerror = () => rejeitar(new Error('Não consegui ler o ficheiro ' + ficheiro.name));
      leitor.readAsDataURL(ficheiro);
    });
  }

  /** Encolhe uma imagem antes de a enviar, para o site abrir depressa */
  function encolherImagem(ficheiro) {
    return new Promise((resolver, rejeitar) => {
      const url = URL.createObjectURL(ficheiro);
      const imagem = new Image();

      imagem.onload = () => {
        const escala = Math.min(1, CONFIG.larguraMaximaImagem / imagem.width);
        const tela = document.createElement('canvas');
        tela.width = Math.round(imagem.width * escala);
        tela.height = Math.round(imagem.height * escala);

        const pincel = tela.getContext('2d');
        pincel.fillStyle = '#ffffff';
        pincel.fillRect(0, 0, tela.width, tela.height);
        pincel.drawImage(imagem, 0, 0, tela.width, tela.height);

        URL.revokeObjectURL(url);
        const dataUrl = tela.toDataURL('image/jpeg', CONFIG.qualidadeImagem);
        resolver({ base64: dataUrl.split(',')[1], dataUrl: dataUrl });
      };

      imagem.onerror = () => {
        URL.revokeObjectURL(url);
        rejeitar(new Error('Esse ficheiro não parece ser uma imagem.'));
      };

      imagem.src = url;
    });
  }


  /* =========================================================
     PROGRESSO E GRAVAÇÃO
     ========================================================= */

  function mostrarProgresso(titulo) {
    $('progressoTitulo').textContent = titulo;
    $('progressoBarra').style.width = '0%';
    $('progressoTexto').textContent = 'A preparar';
    $('progresso').classList.add('ativo');
  }

  function esconderProgresso() {
    $('progresso').classList.remove('ativo');
  }

  function atualizarProgresso(passo, total, texto) {
    $('progressoBarra').style.width = Math.round((passo / total) * 100) + '%';
    $('progressoTexto').textContent = texto;
  }

  /** Vai buscar a versão mais recente do ficheiro de dados ao GitHub */
  async function carregarDados() {
    const texto = await GitHub.lerTexto(CONFIG.ficheiroDados);
    estado.dados = interpretarDados(texto);
    return estado.dados;
  }

  /**
   * Aplica uma alteração ao site.
   * @param {string} mensagem  descrição da alteração
   * @param {function} alterar recebe os dados frescos e devolve ficheiros extra
   */
  async function publicar(mensagem, alterar, idErro, textoSucesso) {
    limparErros();
    mostrarProgresso('A publicar no site…');
    try {
      const dados = await carregarDados();          // lê sempre a versão mais recente
      const extras = (await alterar(dados)) || [];

      const ficheiros = extras.concat([
        { caminho: CONFIG.ficheiroDados, texto: escreverDados(dados) }
      ]);

      await GitHub.guardarFicheiros(mensagem, ficheiros, atualizarProgresso);
      esconderProgresso();
      irPara('ecra-sucesso');
      if (textoSucesso) $('sucessoTexto').textContent = textoSucesso;
      await carregarDados();
      desenharTudo();
    } catch (erro) {
      esconderProgresso();
      mostrarErro(idErro, erro.estado ? GitHub.explicarErro(erro) : erro.message);
    }
  }


  /* =========================================================
     NAVEGAÇÃO
     ========================================================= */

  function irPara(ecra) {
    document.querySelectorAll('.ecra').forEach((s) => s.classList.toggle('ativo', s.id === ecra));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    limparErros();
  }

  document.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-ir]');
    if (botao) irPara(botao.getAttribute('data-ir'));
  });


  /* =========================================================
     ENTRADA
     ========================================================= */

  async function entrar(chave) {
    GitHub.definirChave(chave);
    await GitHub.verificarAcesso();
    localStorage.setItem(CHAVE_GUARDADA, chave);
    await carregarDados();
    desenharTudo();
    $('acoesTopo').hidden = false;
    irPara('ecra-menu');
  }

  $('btnEntrar').addEventListener('click', async () => {
    const chave = $('campoChave').value.trim();
    if (!chave) { mostrarErro('erroEntrada', 'Escreva a chave de acesso.'); return; }

    $('btnEntrar').disabled = true;
    $('btnEntrar').textContent = 'A entrar…';
    try {
      await entrar(chave);
    } catch (erro) {
      mostrarErro('erroEntrada', erro.estado ? GitHub.explicarErro(erro) : erro.message);
    } finally {
      $('btnEntrar').disabled = false;
      $('btnEntrar').textContent = 'Entrar';
    }
  });

  $('campoChave').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('btnEntrar').click();
  });

  $('btnSair').addEventListener('click', () => {
    if (!confirm('Quer mesmo sair? Terá de escrever a chave outra vez.')) return;
    localStorage.removeItem(CHAVE_GUARDADA);
    location.reload();
  });

  $('btnVerSite').addEventListener('click', () => window.open(CONFIG.enderecoDoSite, '_blank'));
  $('btnAbrirSite').addEventListener('click', () => window.open(CONFIG.enderecoDoSite, '_blank'));


  /* =========================================================
     ECRÃ: ANUNCIAR UMA PROVA NOVA
     ========================================================= */

  let cartazProva = null;

  $('provaCartaz').addEventListener('change', async (e) => {
    const ficheiro = e.target.files[0];
    if (!ficheiro) return;
    try {
      cartazProva = await encolherImagem(ficheiro);
      $('provaPre').src = cartazProva.dataUrl;
      $('provaPre').hidden = false;
      $('provaNomeFicheiro').textContent = 'Imagem escolhida: ' + ficheiro.name;
    } catch (erro) {
      mostrarErro('erroNovaProva', erro.message);
    }
  });

  $('btnPublicarProva').addEventListener('click', () => {
    const titulo = $('provaTitulo').value.trim();
    const data = $('provaData').value;
    const hora = $('provaHora').value || '09:00';

    if (!titulo) return mostrarErro('erroNovaProva', 'Falta escrever o nome da prova.');
    if (!data)   return mostrarErro('erroNovaProva', 'Falta escolher o dia da prova.');
    if (!cartazProva) return mostrarErro('erroNovaProva', 'Falta escolher a imagem do cartaz.');

    const caminho = CONFIG.pastaCartazes + '/' + data + '-' + slug(titulo) + '.jpg';

    publicar('Nova prova: ' + titulo, (dados) => {
      dados.proximosEventos = dados.proximosEventos || [];
      dados.proximosEventos.push({ titulo, data, hora, cartaz: caminho });
      return [{ caminho, base64: cartazProva.base64 }];
    }, 'erroNovaProva', 'A prova "' + titulo + '" fica visível no site dentro de um a dois minutos.')
      .then(() => {
        $('provaTitulo').value = '';
        $('provaData').value = '';
        $('provaHora').value = '09:00';
        $('provaCartaz').value = '';
        $('provaPre').hidden = true;
        $('provaNomeFicheiro').textContent = 'Nenhuma imagem escolhida';
        cartazProva = null;
      });
  });


  /* =========================================================
     ECRÃ: PUBLICAR RESULTADOS
     ========================================================= */

  let documentosEscolhidos = [];

  function nomeBonito(nomeFicheiro) {
    return nomeFicheiro
      .replace(/\.pdf$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
  }

  $('resultadoProva').addEventListener('change', () => {
    const escolha = $('resultadoProva').value;
    $('resultadoNovaProva').hidden = escolha !== '__nova__';

    // Avisa quantos documentos a prova já tem, para não duplicar
    const nota = $('resultadoJaTem');
    const prova = (estado.dados.resultados || []).find((r) => r.pasta === escolha);
    if (prova) {
      nota.textContent = 'Esta prova já tem ' + prova.documentos.length +
        (prova.documentos.length === 1 ? ' documento publicado.' : ' documentos publicados.') +
        ' Os que enviar agora juntam-se a esses.';
      nota.hidden = false;
    } else {
      nota.hidden = true;
    }
  });

  $('resultadoFicheiros').addEventListener('change', async (e) => {
    const ficheiros = Array.from(e.target.files);
    documentosEscolhidos = [];

    for (const ficheiro of ficheiros) {
      documentosEscolhidos.push({
        ficheiro,
        nomeSite: nomeBonito(ficheiro.name),
        nomeGuardado: slug(ficheiro.name.replace(/\.pdf$/i, '')) + '.pdf'
      });
    }

    $('resultadoContagem').textContent = ficheiros.length
      ? ficheiros.length + (ficheiros.length === 1 ? ' documento escolhido' : ' documentos escolhidos')
      : 'Nenhum documento escolhido';

    desenharDocumentos();
  });

  function desenharDocumentos() {
    const caixa = $('resultadoLista');
    if (!documentosEscolhidos.length) { caixa.innerHTML = ''; return; }

    caixa.innerHTML = '<h2>3. Nome de cada documento no site</h2>' +
      documentosEscolhidos.map((doc, i) => `
        <div class="documento">
          <input type="text" data-doc="${i}" value="${doc.nomeSite.replace(/"/g, '&quot;')}" />
          <button type="button" class="botao botao--claro botao--pequeno" data-remover-doc="${i}">Retirar</button>
          <span class="ficheiro">${doc.ficheiro.name}</span>
        </div>`).join('');

    caixa.querySelectorAll('[data-doc]').forEach((campo) => {
      campo.addEventListener('input', () => {
        documentosEscolhidos[Number(campo.getAttribute('data-doc'))].nomeSite = campo.value;
      });
    });

    caixa.querySelectorAll('[data-remover-doc]').forEach((botao) => {
      botao.addEventListener('click', () => {
        documentosEscolhidos.splice(Number(botao.getAttribute('data-remover-doc')), 1);
        $('resultadoContagem').textContent = documentosEscolhidos.length
          ? documentosEscolhidos.length + ' documento(s) escolhido(s)'
          : 'Nenhum documento escolhido';
        desenharDocumentos();
      });
    });
  }

  $('btnPublicarResultados').addEventListener('click', async () => {
    const escolha = $('resultadoProva').value;
    if (!escolha) return mostrarErro('erroResultados', 'Escolha primeiro a prova.');
    if (!documentosEscolhidos.length) return mostrarErro('erroResultados', 'Escolha pelo menos um documento PDF.');

    let titulo, data;
    if (escolha === '__nova__') {
      titulo = $('resultadoTitulo').value.trim();
      data = $('resultadoData').value;
      if (!titulo) return mostrarErro('erroResultados', 'Falta escrever o nome da prova.');
      if (!data)   return mostrarErro('erroResultados', 'Falta escolher o dia da prova.');
    }

    mostrarProgresso('A preparar os documentos…');
    let porEnviar;
    try {
      porEnviar = [];
      for (const doc of documentosEscolhidos) {
        porEnviar.push({ doc, base64: await lerBase64(doc.ficheiro) });
      }
    } catch (erro) {
      esconderProgresso();
      return mostrarErro('erroResultados', erro.message);
    }
    esconderProgresso();

    const nomeParaMensagem = titulo ||
      ((estado.dados.resultados || []).find((r) => r.pasta === escolha) || {}).titulo || escolha;

    publicar('Resultados: ' + nomeParaMensagem, (dados) => {
      dados.resultados = dados.resultados || [];

      let prova;
      if (escolha === '__nova__') {
        prova = {
          titulo: titulo,
          data: data,
          estado: 'final',
          pasta: CONFIG.pastaResultados + '/' + data + '-' + slug(titulo) + '/',
          documentos: []
        };
        dados.resultados.push(prova);
      } else {
        prova = dados.resultados.find((r) => r.pasta === escolha);
        if (!prova) throw new Error('Já não encontro essa prova. Volte atrás e tente outra vez.');
      }

      const ficheiros = [];
      for (const item of porEnviar) {
        const nome = item.doc.nomeGuardado;
        ficheiros.push({ caminho: prova.pasta + nome, base64: item.base64 });

        const existente = prova.documentos.find((d) => d.ficheiro === nome);
        if (existente) existente.titulo = item.doc.nomeSite;
        else prova.documentos.push({ titulo: item.doc.nomeSite, ficheiro: nome });
      }
      return ficheiros;
    }, 'erroResultados', 'Os resultados ficam visíveis no site dentro de um a dois minutos.')
      .then(() => {
        documentosEscolhidos = [];
        $('resultadoFicheiros').value = '';
        $('resultadoContagem').textContent = 'Nenhum documento escolhido';
        $('resultadoLista').innerHTML = '';
        $('resultadoTitulo').value = '';
        $('resultadoData').value = '';
        $('resultadoProva').value = '';
        $('resultadoNovaProva').hidden = true;
      });
  });


  /* =========================================================
     ECRÃ: PROVAS JÁ REALIZADAS
     ========================================================= */

  function cartaoProva(evento, indice, tipo) {
    return `
      <div class="item">
        <img src="../${evento.cartaz}" alt="" onerror="this.style.visibility='hidden'" />
        <div class="info">
          <b>${evento.titulo}</b>
          <small>${dataCurta(evento.data)}</small>
        </div>
        <div class="acoes">
          ${tipo === 'proximo'
            ? `<button type="button" class="botao botao--claro botao--pequeno" data-realizada="${indice}">Já se realizou</button>`
            : ''}
          <button type="button" class="botao botao--perigo botao--pequeno" data-apagar="${tipo}:${indice}">Remover</button>
        </div>
      </div>`;
  }

  function desenharProvas() {
    if (!estado.dados) return;

    const proximos = estado.dados.proximosEventos || [];
    const recentes = estado.dados.eventosRecentes || [];

    $('listaProximos').innerHTML = proximos.length
      ? proximos.map((e, i) => cartaoProva(e, i, 'proximo')).join('')
      : '<p class="subtitulo">Não há provas anunciadas neste momento.</p>';

    $('listaRecentes').innerHTML = recentes.length
      ? recentes.slice(0, 12).map((e, i) => cartaoProva(e, i, 'recente')).join('')
      : '<p class="subtitulo">Ainda não há provas no portefólio.</p>';

    $('listaProximos').querySelectorAll('[data-realizada]').forEach((botao) => {
      botao.addEventListener('click', () => {
        const i = Number(botao.getAttribute('data-realizada'));
        const evento = proximos[i];
        if (!confirm('Passar "' + evento.titulo + '" para os Eventos Recentes?')) return;

        publicar('Prova realizada: ' + evento.titulo, (dados) => {
          const alvo = (dados.proximosEventos || []).findIndex((e) => e.cartaz === evento.cartaz);
          if (alvo < 0) throw new Error('Essa prova já não está nos próximos eventos.');
          const movido = dados.proximosEventos.splice(alvo, 1)[0];
          delete movido.hora;
          dados.eventosRecentes = dados.eventosRecentes || [];
          dados.eventosRecentes.unshift(movido);
        }, 'erroProvas', 'A prova passou para o Portefólio do site.');
      });
    });

    document.querySelectorAll('[data-apagar]').forEach((botao) => {
      botao.addEventListener('click', () => {
        const [tipo, indice] = botao.getAttribute('data-apagar').split(':');
        const lista = tipo === 'proximo' ? proximos : recentes;
        const evento = lista[Number(indice)];
        if (!confirm('Remover "' + evento.titulo + '" do site?\n\nO cartaz continua guardado — só deixa de aparecer na página.')) return;

        publicar('Remover prova: ' + evento.titulo, (dados) => {
          const chave = tipo === 'proximo' ? 'proximosEventos' : 'eventosRecentes';
          dados[chave] = (dados[chave] || []).filter((e) => e.cartaz !== evento.cartaz);
        }, 'erroProvas', 'A prova deixou de aparecer no site.');
      });
    });
  }


  /* =========================================================
     ECRÃ: CARTAZ DE ENTRADA (POPUP)
     ========================================================= */

  let cartazPopup = null;

  function desenharPopup() {
    if (!estado.dados) return;
    const popup = estado.dados.popup;

    if (popup && popup.imagem) {
      $('popupAtual').src = '../' + popup.imagem;
      $('popupAtual').hidden = false;
      $('popupEstado').textContent = 'Este cartaz aparece a quem abre o site.';
    } else {
      $('popupAtual').hidden = true;
      $('popupEstado').textContent = 'O popup está desligado — não aparece nenhum cartaz à entrada.';
    }
  }

  $('popupFicheiro').addEventListener('change', async (e) => {
    const ficheiro = e.target.files[0];
    if (!ficheiro) return;
    try {
      cartazPopup = await encolherImagem(ficheiro);
      cartazPopup.nomeOriginal = ficheiro.name.replace(/\.[^.]+$/, '');
      $('popupPre').src = cartazPopup.dataUrl;
      $('popupPre').hidden = false;
      $('popupNomeFicheiro').textContent = 'Imagem escolhida: ' + ficheiro.name;
    } catch (erro) {
      mostrarErro('erroPopup', erro.message);
    }
  });

  $('btnGuardarPopup').addEventListener('click', () => {
    if (!cartazPopup) return mostrarErro('erroPopup', 'Escolha primeiro a imagem nova.');

    const caminho = CONFIG.pastaCartazes + '/' + hoje() + '-' + (slug(cartazPopup.nomeOriginal) || 'cartaz-entrada') + '.jpg';

    publicar('Novo cartaz de entrada', (dados) => {
      dados.popup = { imagem: caminho, alt: 'Cartaz do próximo evento' };
      return [{ caminho, base64: cartazPopup.base64 }];
    }, 'erroPopup', 'O cartaz de entrada foi trocado.')
      .then(() => {
        cartazPopup = null;
        $('popupFicheiro').value = '';
        $('popupPre').hidden = true;
        $('popupNomeFicheiro').textContent = 'Nenhuma imagem escolhida';
      });
  });

  $('btnDesligarPopup').addEventListener('click', () => {
    if (!confirm('Desligar o popup? Deixa de aparecer o cartaz à entrada do site.')) return;
    publicar('Desligar popup de entrada', (dados) => { dados.popup = null; },
      'erroPopup', 'O popup deixou de aparecer.');
  });


  /* =========================================================
     ECRÃ: PARCEIROS
     ========================================================= */

  let logotipoParceiro = null;

  $('parceiroFicheiro').addEventListener('change', async (e) => {
    const ficheiro = e.target.files[0];
    if (!ficheiro) return;
    try {
      logotipoParceiro = await encolherImagem(ficheiro);
      $('parceiroPre').src = logotipoParceiro.dataUrl;
      $('parceiroPre').hidden = false;
      $('parceiroNomeFicheiro').textContent = 'Imagem escolhida: ' + ficheiro.name;
    } catch (erro) {
      mostrarErro('erroParceiros', erro.message);
    }
  });

  $('btnAdicionarParceiro').addEventListener('click', () => {
    const nome = $('parceiroNome').value.trim();
    if (!nome) return mostrarErro('erroParceiros', 'Falta escrever o nome do parceiro.');
    if (!logotipoParceiro) return mostrarErro('erroParceiros', 'Falta escolher o logótipo.');

    const caminho = CONFIG.pastaPatrocinadores + '/' + slug(nome) + '.jpg';

    publicar('Novo parceiro: ' + nome, (dados) => {
      dados.patrocinadores = dados.patrocinadores || [];
      const existente = dados.patrocinadores.find((p) => p.logo === caminho);
      if (existente) existente.nome = nome;
      else dados.patrocinadores.push({ nome, logo: caminho });
      return [{ caminho, base64: logotipoParceiro.base64 }];
    }, 'erroParceiros', 'O parceiro "' + nome + '" já aparece na faixa do site.')
      .then(() => {
        logotipoParceiro = null;
        $('parceiroNome').value = '';
        $('parceiroFicheiro').value = '';
        $('parceiroPre').hidden = true;
        $('parceiroNomeFicheiro').textContent = 'Nenhuma imagem escolhida';
      });
  });

  function desenharParceiros() {
    if (!estado.dados) return;
    const lista = estado.dados.patrocinadores || [];

    $('listaParceiros').innerHTML = lista.length
      ? lista.map((p, i) => `
        <div class="item">
          <img src="../${p.logo}" alt="" style="height:52px;width:92px;object-fit:contain;background:#fff" onerror="this.style.visibility='hidden'" />
          <div class="info"><b>${p.nome}</b></div>
          <div class="acoes">
            <button type="button" class="botao botao--perigo botao--pequeno" data-parceiro="${i}">Remover</button>
          </div>
        </div>`).join('')
      : '<p class="subtitulo">Ainda não há parceiros.</p>';

    $('listaParceiros').querySelectorAll('[data-parceiro]').forEach((botao) => {
      botao.addEventListener('click', () => {
        const parceiro = lista[Number(botao.getAttribute('data-parceiro'))];
        if (!confirm('Remover "' + parceiro.nome + '" da faixa de parceiros?')) return;
        publicar('Remover parceiro: ' + parceiro.nome, (dados) => {
          dados.patrocinadores = (dados.patrocinadores || []).filter((p) => p.logo !== parceiro.logo);
        }, 'erroParceiros', 'O parceiro deixou de aparecer no site.');
      });
    });
  }


  /* =========================================================
     DESENHAR TUDO O QUE DEPENDE DOS DADOS
     ========================================================= */

  function desenharSelectResultados() {
    const select = $('resultadoProva');
    const provas = (estado.dados.resultados || [])
      .slice()
      .sort((a, b) => String(b.data).localeCompare(String(a.data)));

    select.innerHTML = '<option value="">— escolher —</option>'
      + '<option value="__nova__">➕ Prova nova (ainda não está na lista)</option>'
      + provas.map((p) => `<option value="${p.pasta}">${p.titulo} — ${dataCurta(p.data)}</option>`).join('');
  }

  function desenharTudo() {
    if (!estado.dados) return;
    desenharSelectResultados();
    desenharProvas();
    desenharPopup();
    desenharParceiros();
  }


  /* =========================================================
     ARRANQUE
     ========================================================= */

  (async function arrancar() {
    if (CONFIG.repositorio.indexOf('UTILIZADOR') === 0) {
      mostrarErro('erroEntrada', 'Falta indicar o repositório no ficheiro admin/config.js.');
      return;
    }

    const guardada = localStorage.getItem(CHAVE_GUARDADA);
    if (!guardada) return;

    try {
      await entrar(guardada);
    } catch (erro) {
      localStorage.removeItem(CHAVE_GUARDADA);
      mostrarErro('erroEntrada', GitHub.explicarErro(erro));
    }
  })();

})();
