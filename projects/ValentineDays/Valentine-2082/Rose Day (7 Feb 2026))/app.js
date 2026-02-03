onload = () => {
    const c = setTimeout(() => {
      document.body.classList.remove("not-loaded");
      clearTimeout(c);
    }, 1000);
  };


window.addEventListener("load", () => {

    const message = `HAPPY ROSE DAY ❤️

To my beautiful girl, wishing you a Happy Rose Day.
May you glow like flowers every day with your lovely face.

With lots of love to you 🌹💖`;

    const typingEl = document.getElementById("typingText");
    const popup = document.getElementById("glassMessage");

    function typeEffect(text, i = 0) {
        if (i < text.length) {
            typingEl.innerHTML += text.charAt(i);
            setTimeout(() => typeEffect(text, i + 1), 35);
        }
    }

    // show after 10 seconds
    setTimeout(() => {
        popup.classList.add("show");
        typeEffect(message);
    }, 10000);

});