/* ==========================================================================
   RF CRONOMETRAGEM — LÓGICA DO SITE
   --------------------------------------------------------------------------
   Este ficheiro constrói a página a partir do js/dados.js e trata de:
     1. Utilitários (datas, texto seguro)
     2. Próximos eventos e eventos recentes
     3. Resultados oficiais (lista + janelas com os PDFs)
     4. Parceiros
     5. Contador da próxima prova
     6. Ampliar cartazes (lightbox)
     7. Popup de entrada, menu e rodapé
   Normalmente não precisa de mexer aqui — para atualizar o site edite
   apenas o ficheiro js/dados.js.
   ========================================================================== */

(function () {
  'use strict';

  /* =========================================================
     1. UTILITÁRIOS
     ========================================================= */

  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  /** '2026-08-29' -> '29-08-2026' */
  function dataCurta(iso) {
    const [a, m, d] = String(iso).split('-');
    return `${d}-${m}-${a}`;
  }

  /** '2026-08-29' -> '29 de Agosto de 2026' */
  function dataLonga(iso) {
    const [a, m, d] = String(iso).split('-');
    return `${Number(d)} de ${MESES[Number(m) - 1]} de ${a}`;
  }

  /** '2026-08-29' + '19:00' -> objeto Date (hora local) */
  function paraData(iso, hora) {
    const [a, m, d] = String(iso).split('-').map(Number);
    const [h, min] = String(hora || '09:00').split(':').map(Number);
    return new Date(a, m - 1, d, h || 0, min || 0, 0);
  }

  /** Ordena uma lista de objetos pela propriedade 'data', do mais recente para o mais antigo */
  function maisRecentePrimeiro(lista) {
    return lista.slice().sort((x, y) => String(y.data).localeCompare(String(x.data)));
  }

  /** Escapa texto antes de o injetar em HTML */
  function txt(valor) {
    return String(valor == null ? '' : valor)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Cria um identificador seguro para URL a partir de um texto */
  function slug(valor) {
    return String(valor)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** Bloqueia/desbloqueia o scroll da página (usado por popups e janelas) */
  function trancarScroll(trancar) {
    document.body.classList.toggle('no-scroll', trancar);
  }

  const $ = (sel) => document.querySelector(sel);


  /* =========================================================
     2. GALERIAS DE EVENTOS
     ========================================================= */

  function cartaoEvento(evento) {
    return `
      <figure class="gallery__item">
        <img src="${txt(evento.cartaz)}" alt="Cartaz — ${txt(evento.titulo)}" loading="lazy" decoding="async" />
        <figcaption>
          <span class="evento-titulo">${txt(evento.titulo)}</span>
          <span class="evento-data">${txt(dataCurta(evento.data))}</span>
        </figcaption>
      </figure>`;
  }

  function construirGalerias() {
    const proximos = $('#galeriaProximos');
    const recentes = $('#galeriaRecentes');

    const listaProximos = (DADOS.proximosEventos || [])
      .slice()
      .sort((x, y) => String(x.data).localeCompare(String(y.data)));

    if (proximos) {
      proximos.innerHTML = listaProximos.length
        ? listaProximos.map(cartaoEvento).join('')
        : '<p class="section__lead">Sem provas agendadas de momento. Volte em breve.</p>';
    }

    if (recentes) {
      recentes.innerHTML = maisRecentePrimeiro(DADOS.eventosRecentes || [])
        .map(cartaoEvento).join('');
    }
  }


  /* =========================================================
     3. RESULTADOS OFICIAIS
     ========================================================= */

  const ESTADOS = {
    final:      { classe: 'status-final',       texto: 'Resultados Finais' },
    provisorio: { classe: 'status-provisional',  texto: 'Resultados Provisórios' }
  };

  function construirResultados() {
    const lista = $('#listaResultados');
    const caixas = $('#janelasResultados');
    if (!lista || !caixas) return;

    const eventos = maisRecentePrimeiro(DADOS.resultados || []);

    lista.innerHTML = eventos.map((ev) => {
      const estado = ESTADOS[ev.estado] || ESTADOS.final;
      const id = 'resultados-' + slug(ev.titulo + '-' + ev.data);
      return `
        <article class="result-item">
          <div class="result-info">
            <h3 class="result-title">${txt(ev.titulo)}</h3>
            <p class="result-meta">
              Data: ${txt(dataLonga(ev.data))} |
              <span class="result-status ${estado.classe}">${estado.texto}</span>
              <span class="result-count">${ev.documentos.length} documento${ev.documentos.length === 1 ? '' : 's'}</span>
            </p>
          </div>
          <button type="button" class="btn btn--secondary" data-abrir="${id}">Ver PDFs</button>
        </article>`;
    }).join('');

    caixas.innerHTML = eventos.map((ev) => {
      const id = 'resultados-' + slug(ev.titulo + '-' + ev.data);
      const links = ev.documentos.map((doc) => `
              <a href="${txt(ev.pasta + doc.ficheiro)}" target="_blank" rel="noopener" class="folder-link">
                <span>${txt(doc.titulo)}</span>
                <span class="folder-link__arrow">&rarr;</span>
              </a>`).join('');
      return `
        <div id="${id}" class="folder-modal" role="dialog" aria-modal="true" aria-label="Documentos — ${txt(ev.titulo)}">
          <div class="folder-modal__overlay" data-fechar></div>
          <div class="folder-modal__content">
            <div class="folder-modal__header">
              <div>
                <span class="folder-modal__eyebrow">Documentos de Resultados</span>
                <h3 class="folder-modal__title">${txt(ev.titulo)}</h3>
              </div>
              <button type="button" class="folder-modal__close" aria-label="Fechar" data-fechar>&times;</button>
            </div>
            <div class="folder-modal__body">${links}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function abrirJanela(id) {
    const janela = document.getElementById(id);
    if (!janela) return;
    janela.classList.add('is-open');
    trancarScroll(true);
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  function fecharJanelas() {
    document.querySelectorAll('.folder-modal.is-open')
      .forEach((j) => j.classList.remove('is-open'));
    trancarScroll(false);
    if (history.replaceState) history.replaceState(null, '', '#resultados');
  }

  function ligarJanelas() {
    document.addEventListener('click', (e) => {
      const botao = e.target.closest('[data-abrir]');
      if (botao) { abrirJanela(botao.getAttribute('data-abrir')); return; }
      if (e.target.closest('[data-fechar]')) fecharJanelas();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.querySelector('.folder-modal.is-open')) fecharJanelas();
    });

    // Permite partilhar o link direto de uma janela de resultados
    function abrirPeloEndereco() {
      const hash = location.hash.slice(1);
      if (hash.indexOf('resultados-') === 0) abrirJanela(hash);
    }
    window.addEventListener('hashchange', abrirPeloEndereco);
    abrirPeloEndereco();
  }


  /* =========================================================
     4. PARCEIROS
     ========================================================= */

  function construirPatrocinadores() {
    const faixa = $('#faixaPatrocinadores');
    if (!faixa) return;
    const logos = (DADOS.patrocinadores || []).map((p) =>
      `<img src="${txt(p.logo)}" alt="${txt(p.nome)}" decoding="async" />`).join('');
    // A sequência é repetida para o carrossel dar a volta sem cortes
    faixa.innerHTML = logos + logos;
  }


  /* =========================================================
     5. CONTADOR DA PRÓXIMA PROVA
     ========================================================= */

  function iniciarContador() {
    const nomeEl = $('#eventName');
    const dataEl = $('#eventDate');
    const dias = $('#countdownDays');
    const horas = $('#countdownHours');
    const minutos = $('#countdownMinutes');
    const segundos = $('#countdownSeconds');
    const estado = $('#countdownStatus');
    const relogio = $('#countdownTimer');
    if (!nomeEl || !dias) return;

    const agora = Date.now();
    const proxima = (DADOS.proximosEventos || [])
      .map((ev) => ({ ev, quando: paraData(ev.data, ev.hora) }))
      .filter((item) => item.quando.getTime() > agora)
      .sort((x, y) => x.quando - y.quando)[0];

    if (!proxima) {
      nomeEl.textContent = 'Sem provas agendadas';
      dataEl.textContent = 'Contacte-nos para agendar a sua prova';
      if (relogio) relogio.style.display = 'none';
      estado.textContent = '';
      return;
    }

    const alvo = proxima.quando.getTime();
    nomeEl.textContent = proxima.ev.titulo;
    dataEl.textContent = proxima.quando.toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    function atualizar() {
      const falta = alvo - Date.now();

      if (falta < 0) {
        clearInterval(intervalo);
        dias.textContent = '0';
        horas.textContent = '00';
        minutos.textContent = '00';
        segundos.textContent = '00';
        estado.textContent = 'A DECORRER';
        estado.style.color = 'var(--accent)';
        return;
      }

      dias.textContent = Math.floor(falta / 86400000);
      horas.textContent = String(Math.floor((falta % 86400000) / 3600000)).padStart(2, '0');
      minutos.textContent = String(Math.floor((falta % 3600000) / 60000)).padStart(2, '0');
      segundos.textContent = String(Math.floor((falta % 60000) / 1000)).padStart(2, '0');
      estado.textContent = 'FALTAM';
      estado.style.color = 'var(--accent-600)';
    }

    const intervalo = setInterval(atualizar, 1000);
    atualizar();
  }


  /* =========================================================
     6. AMPLIAR CARTAZES (LIGHTBOX)
     ========================================================= */

  function iniciarLightbox() {
    const caixa = $('#lightbox');
    if (!caixa) return;

    const imagem = caixa.querySelector('.lightbox__img');
    const titulo = caixa.querySelector('.lightbox__title');
    const data = caixa.querySelector('.lightbox__date');
    const anterior = caixa.querySelector('.lightbox__nav--prev');
    const seguinte = caixa.querySelector('.lightbox__nav--next');
    const fechar = caixa.querySelector('.lightbox__close');

    let grupo = [];
    let indice = 0;
    let focoAnterior = null;

    function mostrar(i) {
      if (!grupo.length) return;
      indice = (i + grupo.length) % grupo.length;
      const figura = grupo[indice];
      const img = figura.querySelector('img');
      const nome = figura.querySelector('.evento-titulo');
      const quando = figura.querySelector('.evento-data');

      imagem.src = img.getAttribute('src');
      imagem.alt = img.getAttribute('alt') || 'Cartaz do evento';
      titulo.textContent = nome ? nome.textContent.trim() : '';
      data.textContent = quando ? quando.textContent.trim() : '';

      const varios = grupo.length > 1;
      anterior.hidden = !varios;
      seguinte.hidden = !varios;
    }

    function abrir(figura) {
      const galeria = figura.closest('.gallery');
      grupo = galeria ? Array.from(galeria.querySelectorAll('.gallery__item')) : [figura];
      focoAnterior = document.activeElement;
      mostrar(grupo.indexOf(figura));
      caixa.classList.add('is-open');
      trancarScroll(true);
      fechar.focus();
    }

    function fecharCaixa() {
      caixa.classList.remove('is-open');
      trancarScroll(false);
      imagem.removeAttribute('src');
      if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
    }

    // Os cartazes são criados por JS, por isso ouvimos os cliques no documento
    document.addEventListener('click', (e) => {
      const figura = e.target.closest('.gallery__item');
      if (figura) abrir(figura);
    });

    document.addEventListener('keydown', (e) => {
      const figura = e.target.closest && e.target.closest('.gallery__item');
      if (figura && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrir(figura); return; }
      if (!caixa.classList.contains('is-open')) return;
      if (e.key === 'Escape') fecharCaixa();
      else if (e.key === 'ArrowLeft') mostrar(indice - 1);
      else if (e.key === 'ArrowRight') mostrar(indice + 1);
    });

    fechar.addEventListener('click', fecharCaixa);
    anterior.addEventListener('click', () => mostrar(indice - 1));
    seguinte.addEventListener('click', () => mostrar(indice + 1));
    caixa.addEventListener('click', (e) => { if (e.target === caixa) fecharCaixa(); });

    // Deslizar o dedo no telemóvel
    let inicioX = null;
    caixa.addEventListener('touchstart', (e) => { inicioX = e.changedTouches[0].clientX; }, { passive: true });
    caixa.addEventListener('touchend', (e) => {
      if (inicioX === null) return;
      const delta = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(delta) > 50) mostrar(indice + (delta < 0 ? 1 : -1));
      inicioX = null;
    }, { passive: true });
  }


  /* =========================================================
     7. POPUP DE ENTRADA, MENU E RODAPÉ
     ========================================================= */

  function iniciarPopup() {
    const caixa = $('#popupCartaz');
    const imagem = $('#popupCartazImg');
    if (!caixa || !imagem) return;

    if (!DADOS.popup || !DADOS.popup.imagem) { caixa.remove(); return; }

    imagem.src = DADOS.popup.imagem;
    imagem.alt = DADOS.popup.alt || 'Cartaz do próximo evento';
    caixa.hidden = false;

    // Fechar com a tecla Escape
    document.addEventListener('keydown', (e) => {
      const check = $('#fechar-popup-cartaz');
      if (e.key === 'Escape' && check && !check.checked) check.checked = true;
    });
  }

  function iniciarMenu() {
    const toggle = $('#nav-toggle');
    document.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => { if (toggle) toggle.checked = false; });
    });
  }

  function iniciarRodape() {
    const ano = $('#year');
    if (ano) ano.textContent = new Date().getFullYear();

    const tel = $('#contactoTelefone');
    const local = $('#contactoLocal');
    const form = $('#formContacto');
    const contactos = DADOS.contactos || {};
    if (tel && contactos.telefone) {
      tel.textContent = contactos.telefone;
      tel.href = 'tel:' + contactos.telefone.replace(/\s/g, '');
    }
    if (local && contactos.localizacao) local.textContent = contactos.localizacao;
    if (form && contactos.emailFormulario) {
      form.action = 'https://formsubmit.co/' + contactos.emailFormulario;
    }
  }


  /* =========================================================
     ARRANQUE
     ========================================================= */

  function arrancar() {
    if (typeof DADOS === 'undefined') {
      console.error('js/dados.js não foi carregado.');
      return;
    }
    construirGalerias();
    construirResultados();
    construirPatrocinadores();
    ligarJanelas();
    iniciarContador();
    iniciarLightbox();
    iniciarPopup();
    iniciarMenu();
    iniciarRodape();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arrancar);
  } else {
    arrancar();
  }
})();
