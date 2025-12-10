/* /app/vegemikuji/vege_mikuji.js */

// ===== 設定 =====
const VEGGIES = [
  { key: "0", name: "ブロッコリー", img: "images/vege_1.png" },
  { key: "1", name: "トマト",       img: "images/vege_2.png" },
  { key: "2", name: "にんじん",     img: "images/vege_3.png" },
  { key: "3", name: "ピーマン",     img: "images/vege_4.png" },
  { key: "4", name: "ほうれん草",   img: "images/vege_5.png" }
];

const MESSAGES = [
  "今日のラッキー野菜は ◯◯！ 食べると一日シャキッと元気になれるかも？",
  "◯◯を食べれば、運気も栄養もモリモリアップ！",
  "本日の守護野菜は ◯◯。ランチに入れてパワーチャージ！",
  "◯◯を食べると、人間関係がスムーズに！？ 今日のラッキーベジ！",
  "運気回復のカギは ◯◯！ 苦手でも一口チャレンジだ！",
  "ベジの神様が告げる今日の答えは… ◯◯。きっと体も喜ぶはず！",
  "◯◯が『食べてくれ〜！』って呼んでます。応えてあげて！",
  "今日のラッキー野菜は ◯◯くん。あなたを元気にしてくれるよ！",
  "◯◯姫からの贈り物。ビタミンチャージしてハッピーに過ごそう！"
];

// ===== ユーティリティ =====
const $  = (s) => document.querySelector(s);
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ローカル日付で "YYYY-MM-DD" を作成（UTCずれ対策）
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// localStorage 安全ラッパ（プライベートモード対策）
function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch {}
}

// ===== 本体 =====
document.addEventListener("DOMContentLoaded", () => {
  const textEl = $("#veggie-text");
  const imgEl  = $("#veggie-img");
  if (!textEl || !imgEl) {
    console.error("[vegemikuji] 必要な要素が見つかりません (#veggie-text / #veggie-img)");
    return;
  }

  const todayKey = getTodayKey();
  const STORAGE_KEY = "vegeMikujiVeggieV2";

  // 日替わりの野菜を取得 or 抽選
  let saved = safeGet(STORAGE_KEY);
  let luckyVeggie;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.date === todayKey && parsed?.veggie) {
        luckyVeggie = parsed.veggie;
      }
    } catch {/* 破損時は再抽選 */}
  }
  if (!luckyVeggie) {
    luckyVeggie = rnd(VEGGIES);
    safeSet(STORAGE_KEY, JSON.stringify({ date: todayKey, veggie: luckyVeggie }));
  }

  // 毎回ランダムなメッセージ（野菜名は太字に）
  const msg = rnd(MESSAGES).replace(/◯◯/g, `<strong>${luckyVeggie.name}</strong>`);

  // 表示
  textEl.innerHTML = msg;
  imgEl.src = luckyVeggie.img;
  imgEl.alt = luckyVeggie.name;

  // 画像クリックでレシピへ（Enter/Spaceも可）
  function goRecipe() {
    location.href = `recipe.html?veg=${encodeURIComponent(luckyVeggie.key)}`;
  }
  imgEl.style.cursor = "pointer";
  imgEl.tabIndex = 0; // キーボードフォーカス可
  imgEl.addEventListener("click", goRecipe);
  imgEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goRecipe();
    }
  });

  // 画像エラー時のフォールバック
  imgEl.onerror = () => {
    console.warn("[vegemikuji] 画像が見つかりません:", imgEl.src);
    textEl.innerHTML = `${luckyVeggie.name} の画像が見つかりませんでした。<br>画像のパスやファイル名を確認してください。`;
  };

  // デバッグログ
  console.log("[vegemikuji] today:", todayKey, "veggie:", luckyVeggie.name, "img:", luckyVeggie.img);
});
