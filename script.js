// --- Auth-Redirect ---
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    if (!backBtn) return; // Kein Button vorhanden

    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    const referrer = document.referrer;
    const target = redirectUrl || referrer;

    if (!target) {
      backBtn.style.display = 'none';
      return;
    }

    backBtn.addEventListener('click', function() {
      window.location.href = target;
    });
  });
})();


// --- Geschützte Artikel ---
const SUPABASE_URL = 'https://ngtujvgsbymtxphwncuj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndHVqdmdzYnltdHhwaHduY3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NzE4ODAsImV4cCI6MjA3MzM0Nzg4MH0.g9Cmgrua00pJpr6T0uO5FGRIjtgU7TTnGvOw9NHVAr0';
const komments = document.querySelector(".komments");
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSession() {
  try {
    const { data, error } = await client.auth.getSession();

    if (error || !data?.session) {
      document.querySelectorAll('article[class^="lz"]').forEach(a => {
        a.innerHTML = '<div class="geschuetzt"><img src="b/schloss.png" alt="Bild eines Schlosses"><p>Um diesen Beitrag sichtigen zu können, ist ein erweiterter Lesezugriff notwendig. Logge dich ein um zu überprüfen, ob du über diesen verfügst.</p><p><u><a href="auth.html">Zum Login</a></u></p></div>';
        komments.style.display = 'none';
      });
      return null;
    }

    return data.session;
  } catch (err) {
    console.error('Fehler bei checkSession():', err);
    return null;
  }
}

async function loadProtectedArticles() {
  const session = await checkSession();
  if (!session) return;

  const user = session.user;

  try {
    const { data: userData, error: userError } = await client
      .from('users2')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (userError || !userData) {
      document.querySelectorAll('article[class^="lz"]').forEach(a =>
        a.innerHTML = '<p>Fehler [LOL] - Frage doch den mächtigen Guru (Jerry/Jeremias)[Kein Profil gefunden]</p>'
      );
      return;
    }

    const articles = document.querySelectorAll('article[class^="lz"]');
    for (const article of articles) {
      const articleClass = Array.from(article.classList).find(c => /^lz\d+$/.test(c));
      const articleID = article.id;
      const hasAccess = userData[articleClass];

      if (hasAccess === true || hasAccess === 1) {
        try {
          const { data: fileData, error: storageError } = await client.storage
            .from(articleClass)
            .download(`${articleID}.json`);
          if (storageError) throw storageError;

          const text = await fileData.text();
          const audio = document.getElementById("myAudio");
          const json = JSON.parse(text);
          article.innerHTML = `<div class="geschuetzt" id="geschuetzt-pos"><img src="b/schloss-pos.png" alt="Bild eines Schlosses"><p>Dieser Beitrag erfordert einen erweiterten Lesezugriff. Das Verbreiten des Textes ist nur über Verbreiten der URL gestattet. Es wird darum gebeten, keinen Personen ohne Zugriff Einsicht zu gewährleisten.</p><p>Der Account, mit dem du momentan eingeloggt bist, verfügt über nötigen Zugriff.</p></div>
                               <h1>${json.title}</h1>
                                <p>${json.content}</p>
                                <p class="verfasst">${json.autor} <br><span class="datum">${json.datum}</span></p>`;
          json.title = json.title.replaceAll(" ", "_");
          audio.src = 'm/' + json.title + '.mp3';
        } catch (err) {
          article.innerHTML = '<p>Fehler [LOL] - Frage doch den mächtigen Guru (Jerry/Jeremias)</p>' + '[' + error + ']';
        }
      } else {
        article.innerHTML = '<div class="geschuetzt"><img src="b/schloss-neg.png" alt="Bild eines Schlosses"><p>Dieser Beitrag erfordert einen erweiterten Lesezugriff. Der Account, mit dem du eingeloggt bist, verfügt über diesen momentan nicht. Das heißt dass du diesen Text nicht einsehen kannst.</p></div>';
        if (komments) komments.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Fehler in loadProtectedArticles():', err);
  }
}
document.addEventListener('DOMContentLoaded', loadProtectedArticles);


// --- Werkzeuge ---
document.addEventListener('DOMContentLoaded', () => {
    const triggers = document.querySelectorAll('.toggleTrigger');

    triggers.forEach(trigger => {
        const menu = trigger.nextElementSibling;

        const [defaultOpenRaw, displayTypeRaw, directionRaw] = 
            (trigger.getAttribute('data') || '').split(' ');

        const defaultOpen = defaultOpenRaw === 'true';
        const displayType = displayTypeRaw || 'flex';
        const direction = directionRaw || 'right';

        trigger.dataset.direction = direction;
        menu.dataset.direction = direction;

        const setInitialState = () => {
            if (defaultOpen) {
                menu.classList.add('active');
            } else {
                menu.classList.remove('active');
            }
            menu.dataset.expanded = defaultOpen.toString();
            trigger.classList.toggle('open', defaultOpen);
            trigger.classList.toggle('closed', !defaultOpen);
        };

        trigger.addEventListener('click', () => {
            const isExpanded = menu.dataset.expanded === 'true';
            menu.classList.toggle('active', !isExpanded);
            menu.dataset.expanded = (!isExpanded).toString();

            trigger.classList.toggle('open', !isExpanded);
            trigger.classList.toggle('closed', isExpanded);
        });

        setInitialState();
    });
});

    // Schriftgroesse
    document.addEventListener('DOMContentLoaded', () => {
        initFontToggle({
            buttonId: 'fontToggle',
            largeClass: 'font-large'
        });
    });

    function initFontToggle(config) {
        const btn = document.getElementById(config.buttonId);

        if (!btn) return console.warn('Font toggle button not found.');

        btn.addEventListener('click', () => {
            document.body.classList.toggle(config.largeClass);
        });
    }

    // Vollbild
    document.addEventListener('DOMContentLoaded', () => {
        initFullscreenToggle({
            buttonId: 'fullscreenBtn',
            iconSelector: 'img.dark-switch',
            maximizeIcon: 'b/maximize.png',
            minimizeIcon: 'b/minimize.png'
        });
    });

    function initFullscreenToggle(config) {
        const btn = document.getElementById(config.buttonId);
        if (!btn) return console.warn('Fullscreen button not found.');

        const icon = btn.querySelector(config.iconSelector);
        if (!icon) return console.warn('Fullscreen icon not found inside button.');

        function getCurrentIcon(src) {
            if (document.body.classList.contains('dark-mode')) {
                const extIndex = src.lastIndexOf(".");
                if (extIndex === -1) return src;
                const base = src.slice(0, extIndex);
                const ext = src.slice(extIndex);
                return `${base}-dark${ext}`;
            }
            return src;
        }

        function updateIcon(isFullscreen) {
            const src = isFullscreen ? config.minimizeIcon : config.maximizeIcon;
            icon.src = getCurrentIcon(src);
            icon.alt = isFullscreen ? 'Vollbildmodus beenden' : 'Vollbildmodus starten';
        }

        btn.addEventListener('click', () => {
            const elem = document.documentElement;

            if (!document.fullscreenElement) {
                elem.requestFullscreen()
                    .then(() => updateIcon(true))
                    .catch(err => alert(`Fehler beim Aktivieren des Vollbildmodus: ${err.message}`));
            } else {
                document.exitFullscreen()
                    .then(() => updateIcon(false))
                    .catch(err => alert(`Fehler beim Beenden des Vollbildmodus: ${err.message}`));
            }
        });

        document.addEventListener('fullscreenchange', () => {
            updateIcon(!!document.fullscreenElement);
        });

        const observer = new MutationObserver(() => {
            updateIcon(!!document.fullscreenElement);
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    // Audio
    function initCustomAudioPlayer(audioId, speakerId, playId, pauseId, backId) {
      const audio = document.getElementById(audioId);
      const speakerBtn = document.getElementById(speakerId);
      const playBtn = document.getElementById(playId);
      const pauseBtn = document.getElementById(pauseId);
      const backBtn = document.getElementById(backId);

      speakerBtn.addEventListener('click', () => {
        audio.play();
        pauseBtn.style.display = 'inline-block';
        backBtn.style.display = 'inline-block';
        speakerBtn.style.display = 'none';
      });

      playBtn.addEventListener('click', () => {
        audio.play();
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
      });

      pauseBtn.addEventListener('click', () => {
        audio.pause();
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'inline-block';
      });

      backBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
      });

      audio.addEventListener('ended', () => {
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'inline-block';
      });
    }

    initCustomAudioPlayer('myAudio', 'speakerBtn', 'playBtn', 'pauseBtn', 'backBtn');


// --- Externe Links ---
document.addEventListener("DOMContentLoaded", () => {
  const externLinks = document.querySelectorAll("a.extern-a");

  externLinks.forEach(link => {
    const icon = document.createElement("img");
    icon.src = "b/extern.png";
    icon.alt = "";
    icon.className = "extern-icon";

    link.appendChild(icon);
  });
});

// --- Komments + zugehöriger Login ---
document.addEventListener("DOMContentLoaded", () => {
  const supabaseUrl = 'https://ngtujvgsbymtxphwncuj.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndHVqdmdzYnltdHhwaHduY3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NzE4ODAsImV4cCI6MjA3MzM0Nzg4MH0.g9Cmgrua00pJpr6T0uO5FGRIjtgU7TTnGvOw9NHVAr0'; // gekürzt
  const client = supabase.createClient(supabaseUrl, supabaseKey);

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const commentRead = document.getElementById("commentRead");
  const commentWrite = document.getElementById("commentWrite");
  const commentText = document.getElementById("commentText");
  const anonymousCheck = document.getElementById("anonymousCheck");
  const resultDiv = document.getElementById("result");
  const sendDiv = document.getElementById("sendDiv");

  const path = window.location.pathname;
  const articleName = path.split("/").pop().replace(".html","");

  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim() + "@example.com";
    const password = document.getElementById("password").value.trim();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      resultDiv.innerText = "❌ Login fehlgeschlagen: " + error.message;
    } else {
      resultDiv.innerText = "Eingeloggt 🔐✅";
      updateUI();
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await client.auth.signOut();
    resultDiv.innerText = "Ausgeloggt 🔒✅";
    password.value = "";
    updateUI();
  });

  async function updateUI() {
    const { data } = await client.auth.getUser();
    const user = data.user;

    if (user) {
      document.getElementById("loginForm").style.display = 'none';
      logoutBtn.style.display = 'inline-block';  
      sendDiv.classList.add("active");
    } else {
      document.getElementById("loginForm").style.display = 'flex';
      logoutBtn.style.display = 'none';
      sendDiv.classList.remove("active");
    }

    loadComments();
  }

  async function loadComments() {
    const { data: comments, error } = await client
      .from("Komments")
      .select("comment, user_id, created_at")
      .eq("article", articleName)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      commentRead.innerText = "Fehler beim Laden der Kommentare.";
      return;
    }

    commentRead.innerHTML = "";
    if (!comments || comments.length === 0) {
      commentRead.innerHTML = "<p><i>- Keine Kommentare bisher -</i></p>";
      return;
    }

    for (const c of comments) {
      const nameSpan = document.createElement("span");
      nameSpan.className = "comment-name";

      if (c.user_id) {
        const { data: userData, error: userError } = await client
          .from("users2")
          .select("b_name")
          .eq("user_id", c.user_id)
          .single();
        nameSpan.textContent = userData?.b_name ? userData.b_name + ", " : "<em>Unbekannt</em>, ";
      } else {
        nameSpan.innerHTML = "<em>Anonym</em>, ";
      }

      const date = new Date(c.created_at);
      const formattedDate = date.getFullYear().toString().slice(-2) + '/' +
                            String(date.getMonth() + 1).padStart(2, '0') + '/' +
                            String(date.getDate()).padStart(2, '0');
      const dateSpan = document.createElement("span");
      dateSpan.className = "comment-date";
      dateSpan.textContent = formattedDate;

      const commentDiv = document.createElement("div");
      const p1 = document.createElement("p");
      p1.textContent = c.comment;
      const p2 = document.createElement("p");
      p2.appendChild(nameSpan);
      p2.appendChild(dateSpan);

      commentDiv.appendChild(p1);
      commentDiv.appendChild(p2);
      commentRead.appendChild(commentDiv);
    }
  }

  commentWrite.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = commentText.value.trim();
    if (!text) {
      resultDiv.innerText = "Bitte einen Kommentar eingeben!";
      return;
    }

    const { data: userData } = await client.auth.getUser();
    const userId = anonymousCheck.checked ? null : userData?.user?.id || null;

    const { error } = await client.from("Komments").insert([
      { article: articleName, comment: text, user_id: userId }
    ]);

    if (error) {
      resultDiv.innerText = "❌ Fehler: " + error.message;
    } else {
      resultDiv.innerText = "✅ Kommentar hinzugefügt!";
      commentText.value = "";
      loadComments();
    }
  });

  updateUI();
});

// --- Menü ---
const menu = document.getElementById("menu");
const center = document.getElementById("center");
const svg = document.querySelector("svg.menu");

const segments = 6;
const labels = [
  { image: "b/root-dark.png", text: "Root", size: 50, link: "/index.html" },
  { image: "b/feder-dark.png", text: "Fremde Federn", size: 50, link: "/t/fremde-federn.html" },
  { image: "b/kategorien-dark.png", text: "Kategorien", size: 50, link: "t/kategorien.html" },
  { image: "b/login-dark.png", text: "Login", size: 58, link: "auth.html" },
  { image: "p/symbol.png", text: "Symbol", size: 50, link: "https://example.com/symbol" },
  { image: "b/zufall-dark.png", text: "Einfach mal irgendwo starten", size: 50, link: "t/zufall.html" }
];

const colors = ["#6667AB", "#F18AAD", "#EA6759", "#8BC28C", "#F3C65F", "#F88F58"];
const innerRadius = 60;
const outerRadius = 150;
const hitInnerRadius = 10;
const hitOuterRadius = 150;

const innerLabelRadius = 30;
const outerLabelRadius = 90;
const hoverPush = 20;

let currentHovered = null;
let menuOpen = false;
const segmentElements = [];
const hitElements = [];
const labelElements = [];
const anglePerSegment = 360 / segments;

let animating = false;
let rafId = null;

function createSegmentPath(start, end, innerR, outerR) {
  const rad = deg => deg * Math.PI / 180;
  const x1 = Math.cos(rad(start)) * outerR;
  const y1 = Math.sin(rad(start)) * outerR;
  const x2 = Math.cos(rad(end)) * outerR;
  const y2 = Math.sin(rad(end)) * outerR;
  const x3 = Math.cos(rad(end)) * innerR;
  const y3 = Math.sin(rad(end)) * innerR;
  const x4 = Math.cos(rad(start)) * innerR;
  const y4 = Math.sin(rad(start)) * innerR;
  const largeArc = end - start > 180 ? 1 : 0;
  return `
    M${x1},${y1}
    A${outerR},${outerR} 0 ${largeArc},1 ${x2},${y2}
    L${x3},${y3}
    A${innerR},${innerR} 0 ${largeArc},0 ${x4},${y4}
    Z`;
}

for (let i = 0; i < segments; i++) {
  const startAngle = i * anglePerSegment - 90;
  const endAngle = (i + 1) * anglePerSegment - 90;
  const midAngle = (startAngle + endAngle) / 2;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", createSegmentPath(startAngle, endAngle, innerRadius, outerRadius));
  path.setAttribute("fill", colors[i % colors.length]);
  path.classList.add("segment");
  path.dataset.label = labels[i].text;
  path.dataset.link = labels[i].link;
  menu.appendChild(path);
  segmentElements.push(path);

  const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
  hit.setAttribute("d", createSegmentPath(startAngle, endAngle, hitInnerRadius, hitOuterRadius));
  hit.classList.add("hitarea");
  hit.style.pointerEvents = "none";
  hit.dataset.index = i;
  menu.appendChild(hit);
  hitElements.push(hit);

  const size = labels[i].size || 40;
  const ix = Math.cos(midAngle * Math.PI / 180) * innerLabelRadius;
  const iy = Math.sin(midAngle * Math.PI / 180) * innerLabelRadius;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "image");
  icon.setAttribute("href", labels[i].image);
  icon.setAttribute("width", size);
  icon.setAttribute("height", size);
  icon.setAttribute("x", ix - size / 2);
  icon.setAttribute("y", iy - size / 2);
  menu.appendChild(icon);

  const hx = Math.cos(midAngle * Math.PI / 180) * (outerRadius + 30);
  const hy = Math.sin(midAngle * Math.PI / 180) * (outerRadius + 30);

  const hoverGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  hoverGroup.style.display = "none";

  const hoverText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  hoverText.setAttribute("x", hx);
  hoverText.setAttribute("y", hy);
  hoverText.textContent = labels[i].text;
  hoverText.setAttribute("text-anchor", "middle");
  hoverText.setAttribute("alignment-baseline", "middle");
  hoverText.setAttribute("fill", "white");

const bboxDummy = document.createElementNS("http://www.w3.org/2000/svg", "text");
bboxDummy.textContent = labels[i].text;
bboxDummy.setAttribute("font-size", "16");
bboxDummy.setAttribute("font-family", "Lora, sans-serif");
menu.appendChild(bboxDummy);
const bbox = bboxDummy.getBBox();
menu.removeChild(bboxDummy);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("y", hy - bbox.height / 2 - 3);
const paddingLeft = 20;
const paddingRight = 30;
rect.setAttribute("x", hx - bbox.width / 2 - paddingLeft);
rect.setAttribute("width", bbox.width + paddingLeft + paddingRight);
  rect.setAttribute("height", bbox.height + 6);
  rect.setAttribute("rx", 5);
  rect.setAttribute("ry", 5);
  rect.setAttribute("fill", "white");

  hoverGroup.appendChild(rect);
  hoverGroup.appendChild(hoverText);
  menu.appendChild(hoverGroup);

  labelElements.push({
    icon,
    midAngle,
    hoverGroup,
    hoverText,
    size,
    currentRadius: innerLabelRadius,
    targetRadius: innerLabelRadius,
    hovered: false
  });
}

function startAnimationLoop() {
  if (animating) return;
  animating = true;
  function step() {
    let needAnotherFrame = false;
    labelElements.forEach(obj => {
      const rDiff = obj.targetRadius - obj.currentRadius;
      if (Math.abs(rDiff) > 0.5) {
        obj.currentRadius += rDiff * 0.2;
        needAnotherFrame = true;
      } else {
        obj.currentRadius = obj.targetRadius;
      }
      const x = Math.cos(obj.midAngle * Math.PI / 180) * obj.currentRadius;
      const y = Math.sin(obj.midAngle * Math.PI / 180) * obj.currentRadius;
      obj.icon.setAttribute("x", x - obj.size / 2);
      obj.icon.setAttribute("y", y - obj.size / 2);
    });
    if (needAnotherFrame) rafId = requestAnimationFrame(step);
    else animating = false;
  }
  rafId = requestAnimationFrame(step);
}

function recalcTargets() {
  labelElements.forEach(obj => {
    obj.targetRadius = menuOpen ? outerLabelRadius : innerLabelRadius;
    if (obj.hovered) obj.targetRadius += hoverPush;
    obj.hoverGroup.style.display = obj.hovered ? "block" : "none";
  });
  startAnimationLoop();
}

function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  segmentElements.forEach(el => el.classList.add("active"));
  hitElements.forEach(el => el.style.pointerEvents = "auto");
  recalcTargets();
}

function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  segmentElements.forEach(el => el.classList.remove("active", "hovered"));
  hitElements.forEach(el => el.style.pointerEvents = "none");
  labelElements.forEach(obj => obj.hovered = false);  
  recalcTargets();
  currentHovered = null;
}

function setIconHovered(index, isHovered) {
  const obj = labelElements[index];
  if (!obj) return;
  obj.hovered = isHovered;
  recalcTargets();
}

function handleMove(x, y) {
  if (!menuOpen) return;
  const point = menu.ownerSVGElement.createSVGPoint();
  point.x = x;
  point.y = y;
  const svgPoint = point.matrixTransform(menu.getScreenCTM().inverse());
  const dx = svgPoint.x, dy = svgPoint.y;
  const distance = Math.sqrt(dx*dx + dy*dy);

  if (distance < hitInnerRadius) {
    segmentElements.forEach((s, idx) => {
      s.classList.remove("hovered");
      setIconHovered(idx, false);
    });
    currentHovered = null;
    return;
  }

  let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
  if (angle < 0) angle += 360;
  const index = Math.floor(angle / anglePerSegment);
  const hovered = segmentElements[index];

  if (currentHovered !== hovered) {
    const oldIdx = currentHovered ? segmentElements.indexOf(currentHovered) : -1;
    if (oldIdx >= 0) {
      segmentElements[oldIdx].classList.remove("hovered");
      setIconHovered(oldIdx, false);
    }
    hovered.classList.add("hovered");
    setIconHovered(index, true);
    currentHovered = hovered;
  }
}

function handleEnd(x, y) {
  if (!menuOpen) return;
  if (currentHovered) {
    const link = currentHovered.dataset.link;
    if (link) {
      window.open(link);
    }
  }
  closeMenu();
}

svg.addEventListener("mouseenter", openMenu);
svg.addEventListener("mouseleave", closeMenu);
document.addEventListener("mousemove", e => handleMove(e.clientX, e.clientY));
document.addEventListener("mouseup", e => handleEnd(e.clientX, e.clientY));

svg.addEventListener("touchstart", e => {
  if (e.touches.length > 0) {
    openMenu();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: true });

svg.addEventListener("touchmove", e => {
  if (menuOpen && e.touches.length > 0) {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: false });

svg.addEventListener("touchend", e => {
  if (e.changedTouches.length > 0) {
    handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
  }
});


// --- Light/Darkmode ---
const bgColors = ["#FAFAF0", "#F5F7FA", "#FFF9F0", "#F0FAF5", "#F5F0FF"];

function setRandomBackgroundColor() {
  if (!document.body.classList.contains("dark-mode")) {
    const randomIndex = Math.floor(Math.random() * bgColors.length);
    document.body.style.backgroundColor = bgColors[randomIndex];
  }
}

function updateDarkSwitchImages(isDarkMode) {
  document.querySelectorAll("img.dark-switch").forEach((img) => {
    const originalSrc = img.getAttribute("data-original") || img.src;

    if (!img.hasAttribute("data-original")) {
      img.setAttribute("data-original", originalSrc);
    }

    const extIndex = originalSrc.lastIndexOf(".");
    if (extIndex === -1) return;

    const base = originalSrc.slice(0, extIndex);
    const ext = originalSrc.slice(extIndex);

    img.src = isDarkMode
      ? `${base}-dark${ext}`
      : img.getAttribute("data-original");
  });
}

function toggleDarkMode() {
  const currentBg = getComputedStyle(document.body).getPropertyValue('--bg-image');
  const isDarkMode = document.body.classList.toggle("dark-mode");

  if (!isDarkMode) {
    setRandomBackgroundColor();
  } else {
    document.body.style.backgroundColor = "";
  }

  localStorage.setItem("darkMode", isDarkMode);

  let themeColor = document.querySelector("meta[name='theme-color']");
  if (!themeColor) {
    themeColor = document.createElement("meta");
    themeColor.setAttribute("name", "theme-color");
    document.head.appendChild(themeColor);
  }
  themeColor.setAttribute("content", isDarkMode ? "#121212" : "#ffffff");

  updateDarkSwitchImages(isDarkMode);
  requestAnimationFrame(() => {
    document.body.style.setProperty('--bg-image', currentBg);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("darkModeToggle");
  const isDark = localStorage.getItem("darkMode") === "true";

  if (isDark) {
    document.body.classList.add("dark-mode");
    if (checkbox) checkbox.checked = true;
    updateDarkSwitchImages(true);
  } else {
    if (checkbox) checkbox.checked = false;
    setRandomBackgroundColor();
    updateDarkSwitchImages(false);
  }

  setTimeout(() => checkbox?.classList.add("ready"), 50);
  checkbox?.addEventListener("change", toggleDarkMode);
});
