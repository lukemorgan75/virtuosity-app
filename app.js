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
