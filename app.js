const year = document.getElementById("y");
if (year) year.textContent = String(new Date().getFullYear());

const screens = document.querySelectorAll(".ipad-screen video");

function playScreens() {
  screens.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    const pending = video.play();
    if (pending) pending.catch(() => {});
  });
}

playScreens();
screens.forEach((video) => {
  video.addEventListener("ended", playScreens);
});
document.addEventListener("pointerdown", playScreens, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) playScreens();
});

const heroCopy = document.querySelector(".hero-copy");
const heroAfter = document.querySelector(".hero-after");
const heroWrap = document.querySelector(".hero > .wrap");
const abToggle = document.querySelector(".ab-toggle");

if (heroCopy && heroAfter && heroWrap && abToggle) {
function setLayout(which) {
  const b = which === "b";
  if (b) heroCopy.appendChild(heroAfter);
  else heroWrap.appendChild(heroAfter);
  document.body.classList.toggle("ab-b", b);
  abToggle.setAttribute("aria-pressed", String(b));
  try { sessionStorage.setItem("virtuosity-ab", which); } catch (error) {}
}

abToggle.addEventListener("click", () => {
  setLayout(document.body.classList.contains("ab-b") ? "a" : "b");
});

try {
  if (sessionStorage.getItem("virtuosity-ab") === "b") setLayout("b");
} catch (error) {}
}

const wordSlot = document.querySelector(".word-slot");
if (wordSlot) {
  const words = Array.from(wordSlot.querySelectorAll(".word"));
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hold = [900, 900, 900, 900, 900, 900, 1400];
  const stagger = 26;
  const spell = 110;
  let index = Math.max(0, words.findIndex((word) => word.classList.contains("is-on")));
  let timer = 0;

  words.forEach((word) => {
    const text = word.textContent;
    word.textContent = "";
    Array.from(text).forEach((ch) => {
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = ch;
      word.appendChild(letter);
    });
  });

  function show(next) {
    const prev = (next + words.length - 1) % words.length;
    words.forEach((word, n) => {
      word.classList.toggle("is-on", n === next);
      word.classList.toggle("is-out", n === prev);
      if (n === next) word.classList.remove("is-leaving");
    });
    index = next;
  }

  function clearSpell(word) {
    word.querySelectorAll(".letter").forEach((letter) => {
      letter.style.animation = "none";
    });
  }

  function playSpell(word, reverse) {
    const letters = Array.from(word.querySelectorAll(".letter"));
    letters.forEach((letter) => {
      letter.style.animation = "none";
    });
    void word.offsetWidth;
    const count = letters.length;
    word.classList.toggle("is-leaving", !!reverse);
    letters.forEach((letter, i) => {
      const order = reverse ? count - 1 - i : i;
      const name = reverse ? "letter-unspell" : "letter-spell";
      letter.style.animation = name + " " + spell + "ms " + (reverse ? "ease-in" : "ease-out") + " " + (order * stagger) + "ms both";
    });
    return Math.max(0, count - 1) * stagger + spell;
  }

  function stop() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function tick() {
    stop();
    if (motion.matches || document.hidden) return;
    playSpell(words[index], false);
    timer = window.setTimeout(() => {
      if (motion.matches || document.hidden) return;
      const exit = playSpell(words[index], true);
      timer = window.setTimeout(() => {
        show((index + 1) % words.length);
        tick();
      }, exit);
    }, hold[index]);
  }

  function settle() {
    stop();
    if (motion.matches) {
      words.forEach((word) => {
        word.classList.remove("is-out", "is-leaving");
        clearSpell(word);
      });
      const umbrella = words.findIndex((word) => word.classList.contains("is-umbrella"));
      show(umbrella >= 0 ? umbrella : words.length - 1);
      return;
    }
    if (!words.some((word) => word.classList.contains("is-on"))) show(0);
    tick();
  }

  if (motion.addEventListener) motion.addEventListener("change", settle);
  document.addEventListener("visibilitychange", settle);
  settle();
}
