/* ==========================================================================
   RF CRONOMETRAGEM — FICHEIRO DE DADOS DO SITE
   --------------------------------------------------------------------------
   ESTE É O ÚNICO FICHEIRO QUE PRECISA DE EDITAR PARA ATUALIZAR O SITE.
   Não é preciso mexer no index.html.

   Regras simples:
     • As datas escrevem-se sempre no formato  'AAAA-MM-DD'  (ano-mês-dia).
     • O site ordena tudo sozinho, do mais recente para o mais antigo.
     • O contador da página inicial aponta automaticamente para o primeiro
       evento da lista "proximosEventos" que ainda não passou.
     • Guarde as vírgulas e as chavetas exatamente como estão nos exemplos.
   ========================================================================== */

const DADOS = {

  /* ------------------------------------------------------------------
     1) POPUP DE ENTRADA
     Cartaz que aparece quando alguém abre o site.
     Para deixar de mostrar o popup, escreva:   popup: null,
     ------------------------------------------------------------------ */
  popup: {
    imagem: 'img/cartazes/2026-08-29-stock-car-moto4-horario.jpeg',
    alt: 'Horário do Stock Car & Moto 4 — 29 de agosto'
  },

  /* ------------------------------------------------------------------
     2) PRÓXIMOS EVENTOS
     O primeiro evento futuro desta lista alimenta também o contador.
     'hora' é opcional (assume 09:00 se não for indicada).
     ------------------------------------------------------------------ */
  proximosEventos: [
    {
      titulo: 'Stock Car & Moto 4',
      data: '2026-08-29',
      hora: '19:00',
      cartaz: 'img/cartazes/2026-08-29-stock-car-moto4-cinfaes.jpeg'
    }
  ],

  /* ------------------------------------------------------------------
     3) EVENTOS RECENTES (portefólio)
     Quando uma prova passa, mude-a de "proximosEventos" para aqui.
     ------------------------------------------------------------------ */
  eventosRecentes: [
    {
      titulo: 'Motocross Alquerubim',
      data: '2026-08-16',
      cartaz: 'img/cartazes/2026-08-16-motocross-alquerubim.jpeg'
    },
    {
      titulo: 'Super Enduro Vassal',
      data: '2026-08-15',
      cartaz: 'img/cartazes/2026-08-15-super-enduro-vassal.jpeg'
    },
    {
      titulo: 'Stock Car Moimenta',
      data: '2026-08-02',
      cartaz: 'img/cartazes/2026-08-02-stock-car-moimenta.jpeg'
    },
    {
      titulo: 'Super Enduro Cabeceiras de Basto',
      data: '2026-08-01',
      cartaz: 'img/cartazes/2026-08-01-super-enduro-cabeceiras-de-basto.jpeg'
    },
    {
      titulo: 'Troféu Norte — Parada do Pinhão',
      data: '2026-07-25',
      cartaz: 'img/cartazes/2026-07-25-trofeu-norte-parada-do-pinhao.jpeg'
    },
    {
      titulo: 'Motocross Noturno Maureles',
      data: '2026-07-25',
      cartaz: 'img/cartazes/2026-07-25-motocross-noturno-maureles.jpeg'
    }
  ],

  /* ------------------------------------------------------------------
     4) RESULTADOS OFICIAIS
     'pasta'  → pasta dentro de /resultados/ onde estão os PDFs
     'estado' → 'final' (verde) ou 'provisorio' (amarelo)
     Cada documento: { titulo: 'o que se lê no site', ficheiro: 'nome.pdf' }
     ------------------------------------------------------------------ */
  resultados: [
    {
      titulo: 'Troféu Norte 2026 — Parada do Pinhão',
      data: '2026-07-25',
      estado: 'final',
      pasta: 'resultados/2026-07-25-trofeu-norte-parada-do-pinhao/',
      documentos: [
        { titulo: 'MX Open — Treinos Livres',            ficheiro: 'mx-open-treinos-livres.pdf' },
        { titulo: 'MX Open — Treinos Cronometrados',     ficheiro: 'mx-open-treinos-cronometrados.pdf' },
        { titulo: 'MX Open — 1ª Manga',                  ficheiro: 'mx-open-1a-manga.pdf' },
        { titulo: 'MX Open — 2ª Manga',                  ficheiro: 'mx-open-2a-manga.pdf' },
        { titulo: 'MX Open — Classificação Final',       ficheiro: 'mx-open-classificacao-final.pdf' },
        { titulo: 'MX 2T Livres + Hobby — Treinos Cronometrados', ficheiro: 'mx-2t-hobby-treinos-cronometrados.pdf' },
        { titulo: 'MX 2T Livres + Hobby — 1ª Manga',     ficheiro: 'mx-2t-hobby-1a-manga.pdf' },
        { titulo: 'MX 2T Livres + Hobby — 2ª Manga',     ficheiro: 'mx-2t-hobby-2a-manga.pdf' },
        { titulo: 'MX 2T Livres + Hobby — Classificação Final', ficheiro: 'mx-2t-hobby-classificacao-final.pdf' },
        { titulo: 'Quadcross — Treinos Cronometrados',   ficheiro: 'qx-treinos-cronometrados.pdf' },
        { titulo: 'Quadcross — 1ª Manga',                ficheiro: 'qx-1a-manga.pdf' },
        { titulo: 'Quadcross — 2ª Manga',                ficheiro: 'qx-2a-manga.pdf' },
        { titulo: 'Quadcross — Classificação Final',     ficheiro: 'qx-classificacao-final.pdf' }
      ]
    },
    {
      titulo: '1ª Resistência Scrambler Cross — Vilela',
      data: '2026-06-28',
      estado: 'final',
      pasta: 'resultados/2026-06-28-resistencia-scrambler-cross-vilela/',
      documentos: [
        { titulo: 'Resistência 2 Horas — Treinos Sprint',      ficheiro: 'resistencia-2h-treinos-sprint.pdf' },
        { titulo: 'Resistência 2 Horas — Classificação Final', ficheiro: 'resistencia-2h-classificacao-final.pdf' },
        { titulo: 'Moto 4 — Classificação Final',              ficheiro: 'moto4-classificacao-final.pdf' }
      ]
    },
    {
      titulo: 'Motocross Noturno — Maureles',
      data: '2026-06-27',
      estado: 'final',
      pasta: 'resultados/2026-06-27-motocross-noturno-maureles/',
      documentos: [
        { titulo: 'MX Pro',                              ficheiro: 'mx-pro.pdf' },
        { titulo: 'MX Hobby',                            ficheiro: 'mx-hobby.pdf' },
        { titulo: 'MX 50cc Livres',                      ficheiro: 'mx-50cc-livres.pdf' },
        { titulo: 'MX 50cc com Radiador',                ficheiro: 'mx-50cc-com-radiador.pdf' },
        { titulo: 'MX 50cc Clássicas sem Radiador',      ficheiro: 'mx-50cc-classicas-sem-radiador.pdf' }
      ]
    },
    {
      titulo: 'Gincana de Tratores — Duas Igrejas',
      data: '2026-06-21',
      estado: 'final',
      pasta: 'resultados/2026-06-21-gincana-de-tratores/',
      documentos: [
        { titulo: 'Classificação Final', ficheiro: 'classificacao-final.pdf' }
      ]
    },
    {
      titulo: 'VIII Penafiel Racing Fest',
      data: '2026-06-13',
      estado: 'final',
      pasta: 'resultados/2026-06-13-racing-fest-penafiel/',
      documentos: [
        { titulo: 'Super Enduro — Elite',                ficheiro: 'super-enduro-elite.pdf' },
        { titulo: 'Super Enduro — Open',                 ficheiro: 'super-enduro-open.pdf' },
        { titulo: 'Super Enduro — Hobby',                ficheiro: 'super-enduro-hobby.pdf' },
        { titulo: 'Velocidade — 85cc',                   ficheiro: 'velocidade-85cc.pdf' },
        { titulo: 'Velocidade — 50cc Racing',            ficheiro: 'velocidade-50cc-racing.pdf' },
        { titulo: 'Velocidade — 50cc Clássicas',         ficheiro: 'velocidade-50cc-classicas.pdf' }
      ]
    },
    {
      titulo: 'Convívio Resistência 2 Horas — Alto da Pegadinha',
      data: '2026-05-24',
      estado: 'final',
      pasta: 'resultados/2026-05-24-convivio-resistencia-alto-pegadinha/',
      documentos: [
        { titulo: 'Resistência 2 Horas — Classificação Final', ficheiro: 'resistencia-2h-classificacao-final.pdf' }
      ]
    },
    {
      titulo: 'Troféu Norte 2026 — Pico de Regalados',
      data: '2026-04-26',
      estado: 'final',
      pasta: 'resultados/2026-04-26-trofeu-norte-pico-de-regalados/',
      documentos: [
        { titulo: 'MX Open — Treinos Livres',            ficheiro: 'mx-open-treinos-livres.pdf' },
        { titulo: 'MX Open — Treinos Cronometrados',     ficheiro: 'mx-open-treinos-cronometrados.pdf' },
        { titulo: 'MX Open — 1ª Manga',                  ficheiro: 'mx-open-1a-manga.pdf' },
        { titulo: 'MX Open — 2ª Manga',                  ficheiro: 'mx-open-2a-manga.pdf' },
        { titulo: 'MX Open — Classificação Final',       ficheiro: 'mx-open-classificacao-final.pdf' },
        { titulo: 'MX 2T Livres + Hobby — Treinos Cronometrados', ficheiro: 'mx-2t-hobby-treinos-cronometrados.pdf' },
        { titulo: 'MX 2T Livres + Hobby — 1ª Manga',     ficheiro: 'mx-2t-hobby-1a-manga.pdf' },
        { titulo: 'MX 2T Livres + Hobby — 2ª Manga',     ficheiro: 'mx-2t-hobby-2a-manga.pdf' },
        { titulo: 'MX 2T Livres + Hobby — Classificação Final', ficheiro: 'mx-2t-hobby-classificacao-final.pdf' },
        { titulo: 'Quadcross — Treinos Livres',          ficheiro: 'qx-treinos-livres.pdf' },
        { titulo: 'Quadcross — Treinos Cronometrados',   ficheiro: 'qx-treinos-cronometrados.pdf' },
        { titulo: 'Quadcross — 1ª Manga',                ficheiro: 'qx-1a-manga.pdf' },
        { titulo: 'Quadcross — 2ª Manga',                ficheiro: 'qx-2a-manga.pdf' },
        { titulo: 'Quadcross — Classificação Final',     ficheiro: 'qx-classificacao-final.pdf' }
      ]
    }
  ],

  /* ------------------------------------------------------------------
     5) PARCEIROS / PATROCINADORES
     Aparecem no carrossel. O nome é usado no texto alternativo da imagem.
     ------------------------------------------------------------------ */
  patrocinadores: [
    { nome: 'Fortuna Garage',        logo: 'img/patrocinadores/fortuna-garage.jpeg' },
    { nome: 'Casa das Bifanas — Valongo', logo: 'img/patrocinadores/casa-das-bifanas-valongo.jpeg' },
    { nome: 'Adega de Favaios',      logo: 'img/patrocinadores/adega-de-favaios.jpeg' },
    { nome: 'HMB Cars',              logo: 'img/patrocinadores/hmb-cars.jpeg' },
    { nome: 'Steel Ferreiro Serralharia', logo: 'img/patrocinadores/steel-ferreiro.jpeg' },
    { nome: 'Empipev',               logo: 'img/patrocinadores/empipev.jpeg' },
    { nome: 'Cutandrill Soluções',   logo: 'img/patrocinadores/cutandrill.jpeg' },
    { nome: 'Futuro Alternativo — Construção Civil', logo: 'img/patrocinadores/futuro-alternativo.jpeg' },
    { nome: 'MDL — Mundo da Loucura', logo: 'img/patrocinadores/mdl-mundo-da-loucura.jpeg' },
    { nome: 'Flor do Baldio — Adega Regional', logo: 'img/patrocinadores/flor-do-baldio.jpeg' },
    { nome: 'Universo F&R',          logo: 'img/patrocinadores/universo-fr.jpeg' },
    { nome: 'Pit Shop',              logo: 'img/patrocinadores/pit-shop.jpeg' },
    { nome: 'Taberna O Vilarelho',   logo: 'img/patrocinadores/taberna-o-vilarelho.jpeg' }
  ],

  /* ------------------------------------------------------------------
     6) CONTACTOS
     ------------------------------------------------------------------ */
  contactos: {
    telefone: '+351 935 603 040',
    localizacao: 'Porto, Portugal',
    emailFormulario: 'meduardofcabral@gmail.com'
  }
};
