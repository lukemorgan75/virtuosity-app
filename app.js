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
