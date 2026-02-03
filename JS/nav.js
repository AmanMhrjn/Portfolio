/* ================================
   NAVBAR BEHAVIOR
================================ */

// mobile toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// smooth scroll
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.classList.remove("show");

    const targetId = link.getAttribute("href").substring(1);
    const targetEl = document.getElementById(targetId);

    if (targetEl) {
      window.scrollTo({
        top: targetEl.offsetTop - 64,
        behavior: "smooth"
      });
    }
  });
});

// active link on scroll
const sections = document.querySelectorAll(
  "#profile, #aboutme, #academics, #skills, #project, #contactus"
);

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 80;
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.remove("active");
    if (a.getAttribute("href") === "#" + current) {
      a.classList.add("active");
    }
  });
});
