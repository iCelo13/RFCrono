/* ==========================================================================
   PAINEL DE ADMINISTRAÇÃO — CONFIGURAÇÃO
   --------------------------------------------------------------------------
   Só há UMA linha obrigatória para preencher: "repositorio".
   Escreva o nome de utilizador do GitHub e o nome do repositório do site,
   separados por uma barra. Exemplo:  'marcelocabral/rfcrono'
   ========================================================================== */

const CONFIG = {

  /* <<<<<<<<<<<<<<<<  ALTERE ESTA LINHA  >>>>>>>>>>>>>>>>> */
  repositorio: 'UTILIZADOR/REPOSITORIO',

  /* O ramo onde o site está publicado. Normalmente 'main'. */
  ramo: 'main',

  /* Endereço público do site (usado nos botões "Ver o site"). */
  enderecoDoSite: 'https://rfcronometragem.pt',

  /* Caminhos dentro do repositório — não é preciso mexer. */
  ficheiroDados: 'js/dados.js',
  pastaCartazes: 'img/cartazes',
  pastaPatrocinadores: 'img/patrocinadores',
  pastaResultados: 'resultados',

  /* As fotos são encolhidas antes de irem para o site, para as páginas
     abrirem depressa. 1400 px de largura é mais do que suficiente. */
  larguraMaximaImagem: 1400,
  qualidadeImagem: 0.82
};
