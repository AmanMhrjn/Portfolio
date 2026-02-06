onload = () => {
    const c = setTimeout(() => {
      document.body.classList.remove("not-loaded");
      clearTimeout(c);
    }, 1000);
  };


window.addEventListener("load", () => {

    const message = ` 🌹
    This rose is for the most special girl in my life 🌹
    
    You came into my world and turned 
    everything into happiness and peace.
    
    I’m so lucky to call you mine🫶. 
    
    Happy Rose Day🌹, 
    CutiePie Baby😘❤️`;

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