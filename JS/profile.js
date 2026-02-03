// ===== Typing Text Animation =====
const roles = ["Frontend Developer", "UI/UX Designer", "Graphic Designer", "Video Editor"];
const typingEl = document.querySelector(".typing-text");

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const currentRole = roles[roleIndex];

  if (!isDeleting) {
    charIndex++;
    typingEl.textContent = currentRole.substring(0, charIndex);

    if (charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(typeLoop, 1100); // pause at end
      return;
    }
  } else {
    charIndex--;
    typingEl.textContent = currentRole.substring(0, charIndex);

    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  const speed = isDeleting ? 55 : 85;
  setTimeout(typeLoop, speed);
}

if (typingEl) typeLoop();
