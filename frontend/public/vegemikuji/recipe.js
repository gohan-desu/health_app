// ベースデータ（vege_mikuji.js の veggies とキーを揃える）
const VEGGIES = {
  "0": { name:"ブロッコリー", img:"images/vege_1.png" },
  "1": { name:"トマト",       img:"images/vege_2.png" },
  "2": { name:"にんじん",     img:"images/vege_3.png" },
  "3": { name:"ピーマン",     img:"images/vege_4.png" },
  "4": { name:"ほうれん草",   img:"images/vege_5.png" }
};

// 野菜ごとの“かんたんレシピ”例
const RECIPES = {
  "0": [
    { title:"レンチン温サラダ", steps:["小房に分けて水で軽く濡らす","ラップして600W 1分半〜2分","塩・オリーブ油で和える"] },
    { title:"ツナマヨ和え", steps:["下ゆで or レンチン","ツナ＋マヨ＋醤油少々で和える","黒胡椒を少し"] },
    { title:"ペペロン炒め", steps:["薄切りにんにく＋唐辛子を油で温める","ブロッコリーを投入","塩で仕上げ"] }
  ],
  "1": [
    { title:"カプレーゼ風", steps:["トマトを輪切り","モッツァレラ（なければ豆腐）を重ねる","塩・オリーブ油・バジル"] },
    { title:"卵トマ炒め", steps:["卵を炒り卵にして取り出す","トマトを炒める","卵を戻し塩こしょう"] },
    { title:"トマト冷奴", steps:["角切りトマト＋大葉","冷奴にのせる","醤油 or ポン酢"] }
  ],
  "2": [
    { title:"にんじんナムル", steps:["千切り→レンチン1分","ごま油・塩・白ごま","にんにく少々"] },
    { title:"きんぴら風バター", steps:["細切り→油で炒める","醤油・みりん少し","最後にバター"] },
    { title:"ツナ人参サラダ", steps:["千切り→塩もみ","ツナ＋マヨ＋レモン汁","黒胡椒"] }
  ],
  "3": [
    { title:"塩昆布ピーマン", steps:["細切りピーマンをレンチン1分","塩昆布で和える","ごま油少々"] },
    { title:"ピーマン丸ごと焼き", steps:["丸ごと焼いて皮に焼き目","醤油か塩で","鰹節トッピング"] },
    { title:"ツナピーマン炒め", steps:["細切りピーマン＋ツナ","炒めて塩こしょう","仕上げにレモン"] }
  ],
    "4": [
    { title:"ほうれん草ナムル", steps:["下ゆでして水気を絞る","ごま油・塩・白ごま","にんにく少々"] },
    { title:"ベーコンソテー", steps:["ベーコンを炒める","ほうれん草投入","塩こしょう"] },
    { title:"玉子とじスープ", steps:["だし＋醤油少しを沸かす","ほうれん草を入れる","溶き卵を回し入れる"] }
  ]
};

function $(s){ return document.querySelector(s); }
function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

document.addEventListener("DOMContentLoaded", () => {
  const key = getParam("veg");
  const veg = VEGGIES[key] || VEGGIES["0"]; // フォールバック

  // ヘッダー
  $("#veg-img").src = veg.img;
  $("#veg-img").alt = veg.name;
  $("#veg-title").textContent = `${veg.name}の かんたんレシピ`;
  $("#veg-note").textContent = "3ステップで作れる手軽なメニューです。";

  // レシピ描画
  const list = RECIPES[key] || [];
  const holder = $("#recipe-list");
  holder.innerHTML = list.map(r => {
    const steps = r.steps.map(s => `<li>${s}</li>`).join("");
    return `<div class="card">
      <h3>${r.title}</h3>
      <ol>${steps}</ol>
    </div>`;
  }).join("");

  // もしレシピが無い野菜でも空にならないように
  if (!list.length) {
    holder.innerHTML = `<p class="card">準備中です。おすすめレシピがあればぜひ教えてください！</p>`;
  }
});
