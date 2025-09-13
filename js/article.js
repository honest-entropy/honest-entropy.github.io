import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('SUPABASE_URL', 'SUPABASE_ANON_KEY');

async function loadArticle() {
  // Slug aus der URL holen
  const slug = window.location.pathname.split('/').pop();

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article) {
    document.getElementById('article-title').innerText = 'Artikel nicht gefunden';
    document.getElementById('article-content').innerText = '';
    return;
  }

  document.getElementById('title').innerText = article.title;
  document.getElementById('article-title').innerText = article.title;
  document.getElementById('article-content').innerHTML = article.content;
}

loadArticle();
