 const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const stripCanvas = document.getElementById("stripCanvas");
    const sctx = stripCanvas.getContext("2d");

    const startCamBtn = document.getElementById("startCam");
    const stopCamBtn = document.getElementById("stopCam");
    const startSessionBtn = document.getElementById("startSession");

    const clearBtn = document.getElementById("clear");
    const downloadAllBtn = document.getElementById("downloadAll");
    const makeStripBtn = document.getElementById("makeStrip");
    const downloadStripBtn = document.getElementById("downloadStrip");

    const photoCountSel = document.getElementById("photoCount");
    const intervalSel = document.getElementById("interval");
    const filterSel = document.getElementById("filter");
    const templateSel = document.getElementById("template");

    const statusEl = document.getElementById("status");
    const countdownEl = document.getElementById("countdown");
    const gallery = document.getElementById("gallery");

    const stripPreview = document.getElementById("stripPreview");
    const stripImg = document.getElementById("stripImg");

    let stream = null;
    let sessionRunning = false;
    let stopRequested = false;

    // Each item: { rawDataUrl }
    let photos = [];

    let stripDataUrl = null;

    function setStatus(text) { statusEl.textContent = text; }

    function updateActionButtons() {
      const hasPhotos = photos.length > 0;
      clearBtn.disabled = !hasPhotos;
      downloadAllBtn.disabled = !hasPhotos;
      makeStripBtn.disabled = !hasPhotos;
      downloadStripBtn.disabled = !stripDataUrl;
    }

    function enableSessionControls(enabled) {
      startSessionBtn.disabled = !enabled;
    }

    function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

    async function countdown(seconds) {
      for (let s = seconds; s > 0; s--) {
        countdownEl.textContent = `Next photo in: ${s}s`;
        await sleep(1000);
        if (stopRequested) return false;
      }
      countdownEl.textContent = "";
      return true;
    }

    function getCanvasFilter(filterKey) {
      switch (filterKey) {
        case "bw": return "grayscale(1)";
        case "vintage": return "sepia(0.8) contrast(1.05) saturate(1.1)";
        case "warm": return "saturate(1.2) contrast(1.05) hue-rotate(-8deg)";
        case "cool": return "saturate(1.1) contrast(1.05) hue-rotate(10deg)";
        default: return "none";
      }
    }

    function captureRawPhoto() {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) return null;

      canvas.width = w;
      canvas.height = h;

      ctx.filter = "none";
      ctx.drawImage(video, 0, 0, w, h);

      return canvas.toDataURL("image/jpeg", 0.92);
    }

    function dataUrlToImage(dataUrl) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
      });
    }

    async function renderTemplateOnCanvas(rawDataUrl, templateKey, filterKey) {
      const img = await dataUrlToImage(rawDataUrl);
      const baseW = 900;

      const pad = 50;
      const radius = 26;
      const filterStr = getCanvasFilter(filterKey);

      function roundRect(c, x, y, w, h, r) {
        const rr = Math.min(r, w / 2, h / 2);
        c.beginPath();
        c.moveTo(x + rr, y);
        c.arcTo(x + w, y, x + w, y + h, rr);
        c.arcTo(x + w, y + h, x, y + h, rr);
        c.arcTo(x, y + h, x, y, rr);
        c.arcTo(x, y, x + w, y, rr);
        c.closePath();
      }

      if (templateKey === "polaroid") {
        const photoW = baseW;
        const photoH = Math.round(baseW * (img.height / img.width));
        const outW = photoW + pad * 2;
        const outH = photoH + pad * 3 + 140;
        const out = document.createElement("canvas");
        out.width = outW;
        out.height = outH;
        const c = out.getContext("2d");

        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, outW, outH);

        c.fillStyle = "#f2f2f2";
        c.fillRect(0, 0, outW, 16);

        const px = pad, py = pad, pw = photoW, ph = photoH;
        c.save();
        roundRect(c, px, py, pw, ph, radius);
        c.clip();
        c.filter = filterStr;
        c.drawImage(img, px, py, pw, ph);
        c.restore();

        c.filter = "none";
        c.fillStyle = "#111";
        c.font = "bold 44px Arial";
        c.fillText("PHOTO BOOTH", pad, py + ph + 95);
        c.fillStyle = "#666";
        c.font = "24px Arial";
        c.fillText(new Date().toLocaleString(), pad, py + ph + 135);

        return out.toDataURL("image/png");
      }

      const photoW = baseW;
      const photoH = Math.round(baseW * (img.height / img.width));
      const outW = photoW;
      const outH = photoH;

      const out = document.createElement("canvas");
      out.width = outW;
      out.height = outH;
      const c = out.getContext("2d");

      if (templateKey === "strip") {
        c.fillStyle = "#111";
        c.fillRect(0, 0, outW, outH);
        const inner = 18;
        c.save();
        c.filter = filterStr;
        c.drawImage(img, inner, inner, outW - inner * 2, outH - inner * 2);
        c.restore();

        c.fillStyle = "#f6f6f6";
        const holeR = 8;
        for (let y = 24; y < outH; y += 44) {
          c.beginPath(); c.arc(12, y, holeR, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(outW - 12, y, holeR, 0, Math.PI * 2); c.fill();
        }
      } else {
        c.save();
        c.filter = filterStr;
        c.drawImage(img, 0, 0, outW, outH);
        c.restore();
      }

      return out.toDataURL("image/jpeg", 0.92);
    }

    function filenameForIndex(i, templateKey) {
      const base = `photo_${String(i + 1).padStart(2, "0")}`;
      const ext = templateKey === "polaroid" ? "png" : "jpg";
      return `${base}.${ext}`;
    }

    function renderGallery() {
      gallery.innerHTML = "";
      const filterKey = filterSel.value;
      const templateKey = templateSel.value;

      // newest first look: iterate from end to start
      const order = [...photos.keys()].reverse();

      (async () => {
        for (const idx of order) {
          const p = photos[idx];
          const rendered = await renderTemplateOnCanvas(p.rawDataUrl, templateKey, filterKey);

          const card = document.createElement("div");
          card.className = "shot";

          const img = document.createElement("img");
          img.src = rendered;

          const actions = document.createElement("div");
          actions.className = "actions";

          const dl = document.createElement("a");
          dl.href = rendered;
          dl.download = filenameForIndex(idx, templateKey);
          dl.textContent = "Download";

          const rm = document.createElement("button");
          rm.className = "remove";
          rm.textContent = "Remove";
          rm.addEventListener("click", () => removePhoto(idx));

          actions.appendChild(dl);
          actions.appendChild(rm);
          card.appendChild(img);
          card.appendChild(actions);

          gallery.appendChild(card);
        }
      })();
    }

    function removePhoto(index) {
      photos.splice(index, 1);

      // If strip was generated, it is now outdated
      stripDataUrl = null;
      stripPreview.style.display = "none";
      stripImg.src = "";

      renderGallery();
      updateActionButtons();
      setStatus("Photo removed ✅");
    }

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });
        video.srcObject = stream;
        setStatus("Camera on ✅");
        startCamBtn.disabled = true;
        stopCamBtn.disabled = false;
        enableSessionControls(true);
      } catch (err) {
        console.error(err);
        setStatus("Camera permission denied or not available ❌");
      }
    }

    function stopCamera() {
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = null;
      video.srcObject = null;
      setStatus("Camera off");
      startCamBtn.disabled = false;
      stopCamBtn.disabled = true;
      enableSessionControls(false);
    }

    async function startSession() {
      if (!stream || sessionRunning) return;

      sessionRunning = true;
      stopRequested = false;

      // Strip becomes outdated
      stripDataUrl = null;
      stripPreview.style.display = "none";
      stripImg.src = "";
      updateActionButtons();

      const count = parseInt(photoCountSel.value, 10);
      const intervalSec = parseInt(intervalSel.value, 10);

      setStatus(`Session running… capturing ${count} photo(s)`);
      startSessionBtn.textContent = "Stop Session";

      startCamBtn.disabled = true;
      stopCamBtn.disabled = true;
      photoCountSel.disabled = true;
      intervalSel.disabled = true;
      filterSel.disabled = true;
      templateSel.disabled = true;

      for (let i = 1; i <= count; i++) {
        if (stopRequested) break;

        const ok = await countdown(intervalSec);
        if (!ok || stopRequested) break;

        const raw = captureRawPhoto();
        if (!raw) {
          setStatus("Waiting for camera…");
          i--;
          await sleep(300);
          continue;
        }

        photos.push({ rawDataUrl: raw });

        renderGallery();
        updateActionButtons();
        setStatus(`Captured ${i}/${count} ✅`);
      }

      sessionRunning = false;
      countdownEl.textContent = "";
      startSessionBtn.textContent = "Start Session";
      setStatus(stopRequested ? "Session stopped" : "Session completed 🎉");

      startCamBtn.disabled = true;
      stopCamBtn.disabled = false;
      photoCountSel.disabled = false;
      intervalSel.disabled = false;
      filterSel.disabled = false;
      templateSel.disabled = false;
    }

    function toggleSession() {
      if (!sessionRunning) startSession();
      else stopRequested = true;
    }

    function clearPhotos() {
      photos = [];
      gallery.innerHTML = "";
      stripDataUrl = null;
      stripPreview.style.display = "none";
      stripImg.src = "";
      updateActionButtons();
      setStatus("Cleared ✅");
    }

    async function downloadAllZip() {
      const zip = new JSZip();
      const folder = zip.folder("photobooth");

      const filterKey = filterSel.value;
      const templateKey = templateSel.value;

      for (let i = 0; i < photos.length; i++) {
        const rendered = await renderTemplateOnCanvas(photos[i].rawDataUrl, templateKey, filterKey);
        const blob = await (await fetch(rendered)).blob();
        folder.file(filenameForIndex(i, templateKey), blob);
      }

      if (stripDataUrl) {
        const stripBlob = await (await fetch(stripDataUrl)).blob();
        folder.file("photostrip.png", stripBlob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);

      const a = document.createElement("a");
      a.href = url;
      a.download = "photobooth_photos.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    }

    async function makeStripImage() {
      if (!photos.length) return;

      const filterKey = filterSel.value;
      const templateKey = templateSel.value;

      const imgs = [];
      for (const p of photos) imgs.push(await dataUrlToImage(p.rawDataUrl));

      const bg = "#ffffff";
      const ink = "#111111";
      const muted = "#666666";

      if (templateKey === "grid2x2") {
        const cols = 2;
        const cellW = 700;
        const cellH = 520;
        const gap = 26;
        const pad = 50;

        const rows = Math.ceil(imgs.length / cols);
        const outW = pad * 2 + cols * cellW + (cols - 1) * gap;
        const outH = pad * 2 + rows * cellH + (rows - 1) * gap + 120;

        stripCanvas.width = outW;
        stripCanvas.height = outH;

        sctx.filter = "none";
        sctx.fillStyle = bg;
        sctx.fillRect(0, 0, outW, outH);

        sctx.fillStyle = ink;
        sctx.font = "bold 44px Arial";
        sctx.fillText("PHOTO BOOTH", pad, 64);
        sctx.fillStyle = muted;
        sctx.font = "24px Arial";
        sctx.fillText(new Date().toLocaleString(), pad, 102);

        const startY = pad + 90;
        for (let i = 0; i < imgs.length; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = pad + c * (cellW + gap);
          const y = startY + r * (cellH + gap);

          const img = imgs[i];
          const ir = img.width / img.height;
          const cr = cellW / cellH;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (ir > cr) { sh = img.height; sw = Math.round(sh * cr); sx = Math.round((img.width - sw) / 2); }
          else { sw = img.width; sh = Math.round(sw / cr); sy = Math.round((img.height - sh) / 2); }

          sctx.fillStyle = "#f3f3f3";
          sctx.fillRect(x - 8, y - 8, cellW + 16, cellH + 16);

          sctx.save();
          sctx.filter = getCanvasFilter(filterKey);
          sctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH);
          sctx.restore();
        }

        stripDataUrl = stripCanvas.toDataURL("image/png");
      } else {
        const cellW = 650;
        const cellH = 480;
        const gap = 18;
        const pad = 46;

        const outW = cellW + pad * 2;
        const outH = pad * 2 + imgs.length * cellH + (imgs.length - 1) * gap + 140;

        stripCanvas.width = outW;
        stripCanvas.height = outH;

        if (templateKey === "strip") {
          sctx.fillStyle = "#111";
          sctx.fillRect(0, 0, outW, outH);
        } else {
          sctx.fillStyle = bg;
          sctx.fillRect(0, 0, outW, outH);
        }

        sctx.filter = "none";
        sctx.fillStyle = (templateKey === "strip") ? "#fff" : ink;
        sctx.font = "bold 44px Arial";
        sctx.fillText("PHOTO BOOTH", pad, 70);
        sctx.fillStyle = (templateKey === "strip") ? "rgba(255,255,255,.8)" : muted;
        sctx.font = "24px Arial";
        sctx.fillText(new Date().toLocaleString(), pad, 110);

        let y = pad + 110;
        for (let i = 0; i < imgs.length; i++) {
          const img = imgs[i];
          const ir = img.width / img.height;
          const cr = cellW / cellH;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (ir > cr) { sh = img.height; sw = Math.round(sh * cr); sx = Math.round((img.width - sw) / 2); }
          else { sw = img.width; sh = Math.round(sw / cr); sy = Math.round((img.height - sh) / 2); }

          if (templateKey === "strip") {
            const inner = 14;
            sctx.fillStyle = "#000";
            sctx.fillRect(pad - 18, y - 18, cellW + 36, cellH + 36);

            sctx.fillStyle = "#f6f6f6";
            for (let hy = y - 6; hy < y + cellH + 6; hy += 44) {
              sctx.beginPath(); sctx.arc(18, hy, 8, 0, Math.PI * 2); sctx.fill();
              sctx.beginPath(); sctx.arc(outW - 18, hy, 8, 0, Math.PI * 2); sctx.fill();
            }

            sctx.save();
            sctx.filter = getCanvasFilter(filterKey);
            sctx.drawImage(img, sx, sy, sw, sh, pad + inner, y + inner, cellW - inner * 2, cellH - inner * 2);
            sctx.restore();
          } else {
            sctx.save();
            sctx.filter = getCanvasFilter(filterKey);
            sctx.drawImage(img, sx, sy, sw, sh, pad, y, cellW, cellH);
            sctx.restore();
          }

          y += cellH + gap;
        }

        sctx.filter = "none";
        const footerY = outH - 54;
        sctx.fillStyle = (templateKey === "strip") ? "rgba(255,255,255,.85)" : muted;
        sctx.font = "22px Arial";
        sctx.fillText("Thank you ✨", pad, footerY);

        stripDataUrl = stripCanvas.toDataURL("image/png");
      }

      stripImg.src = stripDataUrl;
      stripPreview.style.display = "block";
      updateActionButtons();
      setStatus("Strip image generated ✅");
    }

    function downloadStrip() {
      if (!stripDataUrl) return;
      const a = document.createElement("a");
      a.href = stripDataUrl;
      a.download = "photostrip.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    // Events
    startCamBtn.addEventListener("click", startCamera);
    stopCamBtn.addEventListener("click", stopCamera);
    startSessionBtn.addEventListener("click", toggleSession);

    clearBtn.addEventListener("click", clearPhotos);
    downloadAllBtn.addEventListener("click", downloadAllZip);
    makeStripBtn.addEventListener("click", makeStripImage);
    downloadStripBtn.addEventListener("click", downloadStrip);

    // If user changes filter/template after capturing, re-render gallery + strip becomes outdated
    function invalidateStrip() {
      stripDataUrl = null;
      stripPreview.style.display = "none";
      stripImg.src = "";
      updateActionButtons();
    }

    filterSel.addEventListener("change", () => { invalidateStrip(); renderGallery(); });
    templateSel.addEventListener("change", () => { invalidateStrip(); renderGallery(); });

    updateActionButtons();