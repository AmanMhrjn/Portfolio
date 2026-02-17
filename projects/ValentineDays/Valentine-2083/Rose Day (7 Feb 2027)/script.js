let myName = "";

window.addEventListener('load', () => {
    setTimeout(() => setPage('p-entry'), 2500);
});

function petalRain() {
    const box = document.getElementById('rain-box');
    const p = document.createElement('div');
    const items = ['🌹', '🌹', '❤️', '🌹', '💖'];
    p.className = 'petal';
    p.innerHTML = items[Math.floor(Math.random() * items.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.fontSize = (Math.random() * 20 + 15) + 'px';
    p.style.animationDuration = (Math.random() * 3 + 4) + 's';
    p.style.opacity = Math.random() * 0.6 + 0.4;
    box.appendChild(p);
    setTimeout(() => p.remove(), 7000);
}
setInterval(petalRain, 350);

function setPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
    setTimeout(() => {
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('show');
            if (id === 'p-end') win();
        }
    }, 100);
}

function checkName() {
    const input = document.getElementById('name-in');
    const err = document.getElementById('err-msg');
    const val = input.value.trim();

    if (val === "") {
        input.classList.add('error');
        err.style.opacity = "1";
        setTimeout(() => input.classList.remove('error'), 500);
        return;
    }

    myName = val;
    document.getElementById('user-nm').innerText = myName;
    document.getElementById('final-nm').innerText = myName;
    setPage('p-play');
}

let noCount = 0;
function moveNo() {
    const no = document.getElementById('no-btn');
    const yes = document.getElementById('yes-btn');
    const card = document.getElementById('game-card');
    const hint = document.getElementById('hint');

    // Fix: Change positioning to be relative to the card, not the small row
    no.style.position = 'absolute';

    const w = no.offsetWidth;
    const h = no.offsetHeight;
    const pad = 40;

    const maxX = card.clientWidth - w - pad;
    const maxY = card.clientHeight - h - pad;

    // Randomly move anywhere inside the main card
    no.style.left = Math.max(pad, Math.random() * maxX) + 'px';
    no.style.top = Math.max(pad, Math.random() * maxY) + 'px';

    noCount++;

    // Fast Yes button growth
    const scale = 1 + (noCount * 0.6);
    yes.style.transform = `scale(${scale})`;

    const list = ["Are you sure? 🥺", "Wrong button! 😉", "Try again!", "Almost! 😂", "Pick Yes! ❤️"];
    hint.innerText = list[Math.min(noCount, list.length - 1)];
}

function goFinal() { setPage('p-end'); }

function win() {
    const end = Date.now() + 5000;
    const run = setInterval(function () {
        if (Date.now() > end) return clearInterval(run);
        confetti({ particleCount: 25, spread: 60, origin: { y: 0.7 }, colors: ['#ff4d6d', '#ffffff'] });
    }, 300);

    let i = 0;
    const txt = "Our love blooms brighter than any rose.";
    const target = document.getElementById('type-out');
    target.innerHTML = "";
    function type() {
        if (i < txt.length) {
            target.innerHTML += txt.charAt(i);
            i++;
            setTimeout(type, 80);
        }
    }
    type();
}
