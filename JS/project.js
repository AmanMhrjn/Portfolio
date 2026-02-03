const portfolioTabs = ["All", "Web Developer", "UI/UX", "Graphic Design", "Logos"];

const portfolioProjects = [
 {
    title: "Furniture AR App Design",
    category: "UI/UX",
    image: "../images/projects/AR.png",
    link: "https://www.figma.com/design/ccMzZww6ZOKbIsNneXKEvG/AR-mbl-app?node-id=0-1&t=M6y49mCY9zDr79KN-1",
    // likes: 124
  },

  {
    title: "Work Time Tracker",
    category: "Web Developer",
    image: "../images/projects/FinanceTracker.png",
    link: "https://github.com/AmanMhrjn/Work-Time-Tracker/tree/main/finance-app",
    // likes: 221
  },

  {
    title: "AI Agent for Social Media",
    category: "Web Developer",
    image: "",
    link: "",
    // likes: 221
  },

  {
    title: "Fitrite Shoes E-commerce Website",
    category: "Web Developer",
    image: "",
    link: "",
    // likes: 221
  },

  {
    title: "Valentine's Days Website",
    category: "Web Developer",
    image: "../images/projects/Valentine.png",
    link: "../projects/ValentineDays/valentine.html",
    // likes: 221
  },

  {
    title: "PhotoBooth for Couples",
    category: "Web Developer",
    image: "../images/projects/PhotoBooth.png",
    link: "../projects/PhotoBooth/index.html",
    // likes: 221
  },

  {
    title: "Brand Logo Design",
    category: "Logos",
    type: "logo",
    image: "images/projects/logo1.png",
    // likes: 84
  }
];

const pfTabsEl = document.getElementById("pfTabs");
const pfGridEl = document.getElementById("pfGrid");
const pfLoadBtn = document.getElementById("pfLoadBtn");

const pfLightbox = document.getElementById("pfLightbox");
const pfLightboxImg = document.getElementById("pfLightboxImg");
const pfLightboxCaption = document.getElementById("pfLightboxCaption");
const pfClose = document.getElementById("pfClose");

let activeTab = "All";
let visibleCount = 6;

/* ===== helpers ===== */
function startGridTransition(){
  pfGridEl.classList.remove("is-ready");
  pfGridEl.classList.add("is-changing");
}

function endGridTransition(){
  requestAnimationFrame(() => {
    pfGridEl.classList.remove("is-changing");
    pfGridEl.classList.add("is-ready");
  });
}

/* ===== Tabs ===== */
function renderTabs(){
  pfTabsEl.innerHTML = "";
  portfolioTabs.forEach(tab => {
    const btn = document.createElement("button");
    btn.className = "pf-tab" + (tab === activeTab ? " active" : "");
    btn.textContent = tab;
    btn.onclick = () => {
      activeTab = tab;
      visibleCount = 6;
      startGridTransition();
      renderTabs();
      setTimeout(() => {
        renderCards();
        endGridTransition();
      }, 160);
    };
    pfTabsEl.appendChild(btn);
  });
}

/* ===== Filter ===== */
function getFiltered(){
  return activeTab === "All"
    ? portfolioProjects
    : portfolioProjects.filter(p => p.category === activeTab);
}

/* ===== Cards ===== */
function renderCards(){
  const items = getFiltered().slice(0, visibleCount);
  pfGridEl.innerHTML = "";

  items.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "pf-card";
    card.style.setProperty("--d", `${i * 70}ms`);

    card.innerHTML = `
      <div class="pf-img">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <div class="pf-body">
        <div class="pf-meta">
          <span class="pf-cat">${p.category}</span>
          <span class="pf-like">❤ ${p.likes}</span>
        </div>
        <div class="pf-name">${p.title}</div>
      </div>
    `;

    card.onclick = () => {
      if (p.link) {
        window.open(p.link, "_blank");
      } else {
        openLightbox(p.image, p.title, p.type);
      }
    };

    pfGridEl.appendChild(card);
  });

  pfLoadBtn.style.display =
    getFiltered().length > visibleCount ? "inline-flex" : "none";
}

/* ===== Load More ===== */
pfLoadBtn.onclick = () => {
  visibleCount += 6;
  startGridTransition();
  setTimeout(() => {
    renderCards();
    endGridTransition();
  }, 120);
};

/* ===== Lightbox ===== */
function openLightbox(img, caption, type = "image"){
  pfLightboxImg.src = img;
  pfLightboxCaption.textContent = caption;

  if(type === "logo"){
    pfLightboxImg.style.background = "#fff";
    pfLightboxImg.style.padding = "30px";
  }else{
    pfLightboxImg.style.background = "#06070a";
    pfLightboxImg.style.padding = "0";
  }

  pfLightbox.classList.add("show");
}

function closeLightbox(){
  pfLightbox.classList.remove("show");
}

pfClose.onclick = closeLightbox;
pfLightbox.onclick = e => e.target === pfLightbox && closeLightbox();

/* ===== Init ===== */
renderTabs();
renderCards();
