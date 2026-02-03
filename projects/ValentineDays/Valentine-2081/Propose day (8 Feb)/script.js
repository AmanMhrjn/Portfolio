let progress = document.getElementById("progress");
        let loadingScreen = document.getElementById("loading-screen");
        let mainContent = document.getElementById("main-content");

        let load = 0;
        let interval = setInterval(() => {
            load += 20;
            progress.style.width = load + "%";
            if (load >= 100) {
                clearInterval(interval);
                loadingScreen.style.display = "none";
                mainContent.classList.remove("hidden");
            }
        }, 500);

        function createHeart() {
            const heart = document.createElement("div");
            heart.classList.add("heart-float");
            heart.innerHTML = "❤️";
            heart.style.left = Math.random() * 100 + "vw";
            heart.style.animationDuration = (Math.random() * 3 + 2) + "s";
            document.querySelector(".floating-hearts").appendChild(heart);
            setTimeout(() => { heart.remove(); }, 5000);
        }
        setInterval(createHeart, 500);