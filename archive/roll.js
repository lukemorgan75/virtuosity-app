const canvas = document.getElementById("roll");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const themes = {
    classic: {
      headerTop: "#1a1714",
      headerBot: "#000",
      word: "#c9a227",
      ruler: "#6e1f29",
      ivory: "#f2ede0",
      ebony: "#121212",
      rowW: "#66615a",
      rowB: "#292624",
      play: "#f8f0de",
      btn: "#d7c59a"
    },
    studio: {
      headerTop: "#14181d",
      headerBot: "#0b0d10",
      word: "#73e6f2",
      ruler: "#1a3d44",
      ivory: "#c7d1db",
      ebony: "#0d1014",
      rowW: "#2a3138",
      rowB: "#171b21",
      play: "#59f2ff",
      btn: "#8ad7e0"
    },
    blanco: {
      headerTop: "#ffffff",
      headerBot: "#dcdfe6",
      word: "#767d8a",
      ruler: "#c2c6ce",
      ivory: "#ffffff",
      ebony: "#1a1c21",
      rowW: "#fafafa",
      rowB: "#d6d8de",
      play: "#616878",
      btn: "#383c44"
    }
  };

  let themeName = "classic";
  let t0 = performance.now();
  const phrase = buildPhrase();

  const pills = document.querySelectorAll(".theme-pills button");
  pills.forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme, true));
  });

  let auto = 0;
  function cycle() {
    const order = ["classic", "studio", "blanco"];
    auto = (auto + 1) % order.length;
    setTheme(order[auto], false);
  }
  setInterval(cycle, 7000);

  function setTheme(name, manual) {
    if (!themes[name]) return;
    themeName = name;
    pills.forEach((b) => b.classList.toggle("on", b.dataset.theme === name));
    if (manual) t0 = performance.now();
  }

  function buildPhrase() {
    const events = [];
    const add = (start, dur, note, vel) => events.push({ start, dur, note, vel });
    const melody = [72, 74, 76, 77, 79, 81, 83, 84, 83, 81, 79, 76, 72];
    melody.forEach((n, i) => add(0.35 + i * 0.28, 0.34, n, 70 + (i % 5) * 8));
    [60, 64, 67, 72].forEach((n, i) => add(0.2 + i * 0.06, 3.4, n, 48 + i * 6));
    [55, 59, 62, 67].forEach((n, i) => add(2.2 + i * 0.05, 2.6, n, 52));
    add(4.6, 1.8, 84, 110);
    add(4.7, 1.6, 79, 90);
    add(4.85, 1.4, 76, 80);
    add(5.0, 1.2, 72, 70);
    return events;
  }

  function velColor(v) {
    const stops = [
      [1, [116, 64, 179]],
      [20, [64, 108, 179]],
      [40, [64, 179, 179]],
      [64, [64, 179, 96]],
      [90, [179, 179, 65]],
      [110, [179, 106, 64]],
      [127, [248, 49, 49]]
    ];
    const x = Math.max(1, Math.min(127, v));
    for (let i = 1; i < stops.length; i++) {
      if (x <= stops[i][0]) {
        const [x1, c1] = stops[i - 1];
        const [x2, c2] = stops[i];
        const t = (x - x1) / (x2 - x1);
        const m = c1.map((a, k) => Math.round(a + (c2[k] - a) * t));
        return `rgb(${m[0]},${m[1]},${m[2]})`;
      }
    }
    return "rgb(248,49,49)";
  }

  function isWhite(n) {
    return [0, 2, 4, 5, 7, 9, 11].includes(n % 12);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const loopLen = 8.2;
  const pps = 92;
  const low = 53;
  const high = 88;
  const keys = high - low + 1;

  function draw(now) {
    const pal = themes[themeName];
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    const header = Math.max(34, h * 0.12);
    const ruler = 10;
    const kb = Math.max(28, w * 0.09);
    const time = ((now - t0) / 1000) % loopLen;
    const rollH = h - header - ruler;
    const rowH = rollH / keys;

    ctx.clearRect(0, 0, w, h);
    const hg = ctx.createLinearGradient(0, 0, 0, header);
    hg.addColorStop(0, pal.headerTop);
    hg.addColorStop(1, pal.headerBot);
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, w, header);
    ctx.fillStyle = pal.word;
    ctx.font = `600 ${Math.max(13, header * 0.32)}px "Cormorant Garamond", serif`;
    ctx.fillText("Virtuosity", 14, header * 0.62);
    ctx.fillStyle = pal.btn;
    roundRect(ctx, w * 0.42, header * 0.28, 52, header * 0.44, 6);
    ctx.fill();
    ctx.fillStyle = pal.ruler;
    ctx.fillRect(0, header, w, ruler);

    for (let i = 0; i < keys; i++) {
      const note = high - i;
      const y = header + ruler + i * rowH;
      ctx.fillStyle = isWhite(note) ? pal.rowW : pal.rowB;
      ctx.fillRect(kb, y, w - kb, rowH + 0.5);
    }

    const playX = kb + Math.min(w * 0.62, time * pps);
    const visibleStart = Math.max(0, time - (playX - kb) / pps);

    for (const n of phrase) {
      const end = n.start + n.dur;
      if (end < visibleStart) continue;
      const x = kb + (n.start - visibleStart) * pps;
      const ww = Math.max(3, n.dur * pps);
      const row = high - n.note;
      if (row < 0 || row >= keys) continue;
      const y = header + ruler + row * rowH + 0.8;
      ctx.fillStyle = velColor(n.vel);
      roundRect(ctx, x, y, ww, Math.max(2, rowH - 1.6), 2);
      ctx.fill();
    }

    for (let i = 0; i < keys; i++) {
      const note = high - i;
      const y = header + ruler + i * rowH;
      const held = phrase.some((n) => n.note === note && time >= n.start && time < n.start + n.dur);
      ctx.fillStyle = held ? velColor(88) : isWhite(note) ? pal.ivory : pal.ebony;
      ctx.fillRect(0, y, kb, rowH + 0.4);
      if (isWhite(note)) {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, y + rowH - 0.6, kb, 0.6);
      }
    }

    ctx.fillStyle = pal.play;
    ctx.fillRect(playX - 0.8, header, 1.6, h - header);
    requestAnimationFrame(draw);
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  requestAnimationFrame(draw);
}
