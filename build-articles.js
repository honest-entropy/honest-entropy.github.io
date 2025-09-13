const fs = require("fs");
const path = require("path");

const articlesDir = path.join(__dirname, "supabase-json"); // statt local articles/
const outDir = path.join(__dirname, "_site");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const files = fs.readdirSync(articlesDir).filter(f => f.endsWith(".json"));

files.forEach(file => {
  const raw = fs.readFileSync(path.join(articlesDir, file));
  const article = JSON.parse(raw);

  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>${article.title}</title>
</head>
<body>
<h1>${article.title}</h1>
<p>${article.content}</p>
<p><a href="../index.html">Zurück zur Startseite</a></p>
</body>
</html>
  `.trim();

  const slug = article.title.toLowerCase().replace(/\s+/g, "-");
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
});
