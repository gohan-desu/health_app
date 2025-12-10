const menuBtn = document.getElementById("menu-toggle");
const sideMenu = document.getElementById("side-menu");

// 背景のオーバーレイを追加
const overlay = document.createElement("div");
overlay.classList.add("overlay");
document.body.appendChild(overlay);

// 開閉処理
menuBtn.addEventListener("click", () => {
  sideMenu.classList.toggle("open");
  overlay.classList.toggle("show");
});

// 背景クリックで閉じる
overlay.addEventListener("click", () => {
  sideMenu.classList.remove("open");
  overlay.classList.remove("show");
});