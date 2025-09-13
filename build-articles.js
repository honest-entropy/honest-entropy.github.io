const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const outputDir = path.join(__dirname, "../articles");
const templatePath = path.join(__dirname, "../template.html");
const template = fs.readFileSync(templatePath, "utf-8");

(async () => {
  const { data, error } = await supabase.from("articles").select("*");
  if (error) throw error;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  data.forEach(article => {
    const html = template
      .replace("{{title}}", article.title)
      .replace("{{content}}", article.content);
    const filename = article.title.toLowerCase().replace(/\s+/g, "-") + ".html";
    fs.writeFileSync(path.join(outputDir, filename), html);
    console.log("Generated:", filename);
  });
})();
