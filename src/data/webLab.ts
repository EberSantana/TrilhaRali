/**
 * Ateliê Web do CTF (Construção de Sites 1): o site "Café Sertão" que o aluno inspeciona (index.html + estilo.css)
 * e o modelo inicial do editor. O gabarito das missões é conferido por webMissions.test.ts a partir destes textos.
 */
export const SITE_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Café Sertão</title>
  <link rel="stylesheet" href="estilo.css">
  <style>
    .promo { color: #c0392b; }
  </style>
</head>
<body>
  <header id="topo">
    <h1>Café Sertão</h1>
    <nav class="menu">
      <ul>
        <li><a href="#cardapio">Cardápio</a></li>
        <li><a href="#precos">Preços</a></li>
        <li><a href="#contato">Contato</a></li>
        <li><a href="https://www.ifs.edu.br" target="_blank" title="Site do IFS">IFS</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section id="cardapio">
      <h2>Cardápio do dia</h2>
      <ol>
        <li>Cuscuz com ovo</li>
        <li>Tapioca de queijo</li>
        <li>Bolo de milho</li>
      </ol>
      <figure>
        <img src="img/cafe.jpg" alt="Xícara de café coado" width="300">
        <figcaption>Nosso café coado na hora</figcaption>
      </figure>
      <dl>
        <dt>Coado</dt>
        <dd>Café passado no filtro de pano.</dd>
        <dt>Expresso</dt>
        <dd>Café forte extraído sob pressão.</dd>
      </dl>
      <p class="promo destaque">Promoção: <strong>pão de queijo grátis</strong> às sextas!</p>
    </section>

    <section id="precos">
      <table>
        <caption>Tabela de preços</caption>
        <thead>
          <tr><th>Produto</th><th>Preço (R$)</th></tr>
        </thead>
        <tbody>
          <tr><td>Café coado</td><td>4</td></tr>
          <tr><td>Cuscuz com ovo</td><td>9</td></tr>
          <tr><td>Tapioca de queijo</td><td>7</td></tr>
          <tr><td>Bolo de milho</td><td>5</td></tr>
        </tbody>
        <tfoot>
          <tr><td>Combo do dia</td><td>20</td></tr>
        </tfoot>
      </table>
    </section>

    <article class="card">
      <h2>Nossa história</h2>
      <p style="font-style: italic;">Fundado em 2010 por uma família de agricultores.</p>
      <audio controls>
        <source src="midia/forro.mp3" type="audio/mpeg">
      </audio>
      <video controls width="320">
        <source src="midia/preparo.mp4" type="video/mp4">
      </video>
    </article>

    <aside class="dica">Dica: peça o café sem açúcar!</aside>

    <section id="contato">
      <form action="/enviar" method="post">
        <fieldset>
          <legend>Fale conosco</legend>
          <label for="nome">Nome</label>
          <input type="text" id="nome" name="nome" required>
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email">
          <label for="assunto">Assunto</label>
          <select id="assunto" name="assunto">
            <option>Elogio</option>
            <option>Reclamação</option>
            <option>Encomenda</option>
          </select>
          <label for="msg">Mensagem</label>
          <textarea id="msg" name="msg" rows="4"></textarea>
          <button type="submit">Enviar</button>
        </fieldset>
      </form>
      <iframe src="mapa.html" title="Mapa do café" width="300" height="200"></iframe>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 Café Sertão · Tobias Barreto/SE</p>
  </footer>
</body>
</html>
`;

export const SITE_CSS = `* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333333;
  background-color: #fdf6ec;
  margin: 0;
}

header {
  background-image: linear-gradient(to right, #6f4e37, #a0522d);
  color: white;
  padding: 20px;
  position: sticky;
  top: 0;
  z-index: 10;
}

h1 {
  font-size: 2rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0;
}

.menu ul {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  list-style: none;
  padding: 0;
}

.menu a {
  color: #ffd700;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.menu a:hover {
  color: white;
  text-decoration: underline;
}

main {
  width: 90%;
  max-width: 960px;
  margin: 0 auto;
}

h2, h3 {
  color: #6f4e37;
}

#cardapio ol li {
  font-style: italic;
}

.destaque {
  font-weight: bold;
  text-align: center;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #cccccc;
  padding: 8px;
}

th {
  background-color: #6f4e37;
  color: white;
}

.card {
  width: 300px;
  padding: 20px;
  border: 5px solid #6f4e37;
  margin: 24px 0;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  float: left;
}

.dica {
  float: right;
  width: 40%;
  opacity: 0.8;
  background-color: #ffe4b5;
  padding: 1em;
}

#contato {
  clear: both;
}

fieldset {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 2px dashed #a0522d;
}

button {
  background-color: #2e7d32;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
}

footer {
  text-align: center;
  font-size: 0.875rem;
  overflow: hidden;
  height: 60px;
}
`;

export const EDITOR_HTML_INICIAL = `<h1>Meu primeiro site</h1>
<p class="intro">Edite o HTML e o CSS e veja o resultado ao lado.</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<div class="caixa">Eu sou uma caixa</div>
`;

export const EDITOR_CSS_INICIAL = `body {
  font-family: Arial, sans-serif;
}

.intro {
  color: #2e7d32;
}

.caixa {
  width: 200px;
  padding: 10px;
  border: 5px solid #333;
}
`;

/**
 * Monta o documento da pré-visualização: o <link> para estilo.css vira um <style> com o CSS do aluno.
 * Fragmentos (sem <html>) ganham um esqueleto mínimo.
 */
export function montarDocumento(html: string, css: string): string {
  const estilo = `<style>\n${css}\n</style>`;
  // Na pré-visualização, um <iframe> mostra só o endereço que carregaria (não abre outra página dentro do Ateliê).
  html = html.replace(/<iframe\b([^>]*?)\ssrc=(["'])([^"']*)\2/gi, (_m, antes: string, _q: string, url: string) => {
    const aviso = `<p style='font:13px sans-serif;color:#555;padding:8px;margin:0'>iframe: ${url.replace(/[<>&'"]/g, '')}</p>`;
    return `<iframe${antes} data-src="${url.replace(/"/g, '')}" srcdoc="${aviso}"`;
  });
  if (/<link[^>]+href=["']?estilo\.css["']?[^>]*>/i.test(html)) return html.replace(/<link[^>]+href=["']?estilo\.css["']?[^>]*>/i, estilo);
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${estilo}\n</head>`);
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">${estilo}</head><body>${html}</body></html>`;
}
