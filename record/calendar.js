
    // ここに記録画面専用コードを全部入れる
        // =============================
    // 📅 カレンダー＆モーダル基本設定
    // =============================
    const calendarGrid = document.getElementById("calendar-grid");
    const yearDisplay = document.getElementById("year");
    const monthDisplay = document.getElementById("month");
    const prevBtn = document.getElementById("prev-month");
    const nextBtn = document.getElementById("next-month");
    const yearList = document.getElementById("year-list");
    const monthList = document.getElementById("month-list");

    const questionModal = document.getElementById("question-modal");
    const questionForm = document.getElementById("question-form");
    const manualForm = document.getElementById("manual-form");
    const goalModal = document.getElementById("goal-result");
    const goalText = document.getElementById("goal-text");
    const startBtn = document.getElementById("start-btn");
    const editGoalBtn = document.getElementById("edit-goal-btn");
    const checklistModal = document.getElementById("checklist-modal");
    const checklistForm = document.getElementById("checklist-form");
    const dateTitle = document.getElementById("selected-date-title");
    const goalDisplay = document.getElementById("current-goal");

    // =============================
    // 📅 カレンダー初期値（←ここ修正）
    // =============================
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth() + 1;

    let selectedDate = null;

    // =============================
    // 🎯 現在の目標を表示
    // =============================
    const savedGoal = localStorage.getItem("goal");

    if (goalDisplay) {
    if (savedGoal) {
        goalDisplay.textContent = savedGoal;
    } else {
        goalDisplay.textContent = "目標はまだ設定されていません";
    }
    }

    // =============================
    // 🗓️ カレンダー生成
    // =============================
    function generateCalendar(year, month) {
    calendarGrid.innerHTML = "";
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const today = new Date();
    

    yearDisplay.textContent = `${year}`;
    monthDisplay.textContent = `${month}月`;

    for (let i = 0; i < startWeekday; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("date-cell", "empty");
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.classList.add("date-cell");
        cell.textContent = day;
        const recordKey = `${year}-${month}-${day}`;
        const recordData = JSON.parse(localStorage.getItem(recordKey));

        // ✅ 今日の日付を判定してスタイル付与
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    if (recordKey === todayKey) {
        cell.classList.add("today");
    }
        // 記録済み（中央●）
        if (recordData && recordData.completed) cell.classList.add("recorded");
        // 🌟 メモがある日 → 三角マーク
        if (recordData && recordData.memo && recordData.memo.trim() !== "") {
        cell.classList.add("has-memo");
        }

        // 日付セルクリックでモーダル表示

    // クリックイベント
        cell.addEventListener("click", () => {
        selectedDate = recordKey;
        dateTitle.textContent = `${year}年${month}月${day}日の記録`;
        const goal = localStorage.getItem("goal") || "";
        generateChecklistItems(goal);

        const data = JSON.parse(localStorage.getItem(selectedDate)) || {};
        for (const [key, value] of Object.entries(data)) {
            if (checklistForm[key]) checklistForm[key].checked = value;
        }


        // 📝 メモ復元（←これが無いと表示されない）
        const memoArea = checklistForm.querySelector("textarea[name='memo']");
        if (memoArea) {
    memoArea.value = data.memo || "";
    }

        
        checklistModal.classList.add("show");
        });
        calendarGrid.appendChild(cell);
    }
    // 📌 カレンダーを描画したあとに背景を更新
updateMonthBackground(year, month, totalDays);

    }

    // =============================
// 🎨 月の達成率で背景色を変更
// =============================
function updateMonthBackground(year, month, totalDays) {
  const container = document.body; // ← ページ全体を対象に変更

  let completedDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const key = `${year}-${month}-${day}`;
    const data = JSON.parse(localStorage.getItem(key));
    if (data && data.completed) completedDays++;
  }

  const rate = completedDays / totalDays;

  // まずは全部のクラスを削除
 container.classList.remove("rate-25", "rate-50", "rate-75", "rate-100");

if (rate === 1) {
  container.classList.add("rate-100");
} else if (rate >= 0.75) {
  container.classList.add("rate-75");
} else if (rate >= 0.5) {
  container.classList.add("rate-50");
} else if (rate >= 0.25) {
  container.classList.add("rate-25");
}

  }

    

    // =============================
    // 年・月リスト生成
    // =============================
    function setupLists() {
    // 年リスト（2020〜2030）
    for (let y = 2020; y <= 2030; y++) {
        const item = document.createElement("div");
        item.textContent = `${y}年`;
        item.addEventListener("click", () => {
        currentYear = y;
        yearList.classList.add("hidden");
        generateCalendar(currentYear, currentMonth);
        });
        yearList.appendChild(item);
    }

    // 月リスト（1〜12）
    for (let m = 1; m <= 12; m++) {
        const item = document.createElement("div");
        item.textContent = `${m}月`;
        item.addEventListener("click", () => {
        currentMonth = m;
        monthList.classList.add("hidden");
        generateCalendar(currentYear, currentMonth);
        });
        monthList.appendChild(item);
    }
    }

    // =============================
    // クリックイベント
    // =============================
    yearDisplay.addEventListener("click", () => {
    yearList.classList.toggle("hidden");
    monthList.classList.add("hidden");
    });

    monthDisplay.addEventListener("click", () => {
    monthList.classList.toggle("hidden");
    yearList.classList.add("hidden");
    });

    document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("clickable")) {
        yearList.classList.add("hidden");
        monthList.classList.add("hidden");
    }
    });

    prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    generateCalendar(currentYear, currentMonth);
    });

    nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    generateCalendar(currentYear, currentMonth);
    });




    // 初期化
    setupLists();
    generateCalendar(currentYear, currentMonth);



    function setupLists() {
    for (let y = 2020; y <= 2030; y++) {
        const item = document.createElement("div");
        item.textContent = `${y}年`;
        item.addEventListener("click", () => {
        currentYear = y;
        yearList.classList.add("hidden");
        generateCalendar(currentYear, currentMonth);
        });
        yearList.appendChild(item);
    }
    for (let m = 1; m <= 12; m++) {
        const item = document.createElement("div");
        item.textContent = `${m}月`;
        item.addEventListener("click", () => {
        currentMonth = m;
        monthList.classList.add("hidden");
        generateCalendar(currentYear, currentMonth);
        });
        monthList.appendChild(item);
    }
    }

    // =============================
    // ✅ チェックリスト項目
    // =============================
    function generateChecklistItems(goal) {
    checklistForm.innerHTML = "";
    let items = [];

    if (goal.includes("野菜")) {
        items = [
        { name: "vege", label: "🥦 野菜を1日2食に取り入れた" },
        { name: "balance", label: "🍱 主食・主菜・副菜を意識した" },
        { name: "drink", label: "💧 食事中に水を飲んだ" },
        ];
    } else if (goal.includes("間食")) {
        items = [
        { name: "snack", label: "🍫 間食をしなかった" },
        { name: "fruit", label: "🍎 間食に果物を選んだ" },
        { name: "water", label: "💧 水を飲んだ" },
        ];
    } else if (goal.includes("水") || goal.includes("水分")) {
        items = [
        { name: "water1", label: "💧 朝に1杯飲んだ" },
        { name: "water2", label: "🥗 食事ごとに1杯飲んだ" },
        { name: "water3", label: "🌙 就寝前に1杯飲んだ" },
        ];
    } else {
        items = [
        { name: "meal", label: "🍚 バランスの良い食事をした" },
        { name: "snack", label: "🍫 間食を控えた" },
        { name: "water", label: "💧 水を飲んだ" },
        ];
    }

    items.forEach(({ name, label }) => {
        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = name;
        const lbl = document.createElement("label");
        lbl.appendChild(input);
        lbl.append(` ${label}`);
        checklistForm.appendChild(lbl);
        checklistForm.appendChild(document.createElement("br"));
    });

        // 📝 メモ欄を追加
    const memoLabel = document.createElement("label");
    memoLabel.textContent = "📝 今日のメモ";
    memoLabel.style.display = "block";
    memoLabel.style.marginTop = "0.8em";

    const memoArea = document.createElement("textarea");
    memoArea.name = "memo";
    memoArea.rows = 3;
    memoArea.placeholder = "気づいたこと・感想などを書いてもOK";
    memoArea.style.width = "100%";
    memoArea.style.marginTop = "0.3em";
    memoArea.style.borderRadius = "8px";
    memoArea.style.padding = "8px";
    memoArea.style.border = "1px solid #ccc";
    memoArea.style.fontSize = "14px";

    memoLabel.appendChild(memoArea);
    checklistForm.appendChild(memoLabel);


    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "btn";
    btn.textContent = "保存";
    checklistForm.appendChild(btn);
    }

    checklistForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {};
    let completed = false;
    checklistForm.querySelectorAll("input[type='checkbox']").forEach((input) => {
        data[input.name] = input.checked;
        if (input.checked) completed = true;
    });

        // 📝 メモ保存（←ここを先に data に入れるのが大事）
    const memoValue = checklistForm.querySelector("textarea[name='memo']").value;
    data.memo = memoValue;

    data.completed = completed;
    localStorage.setItem(selectedDate, JSON.stringify(data));
    checklistModal.classList.remove("show");
    generateCalendar(currentYear, currentMonth);
    });

    // =============================
    // 🧠 初回：診断フォーム
    // =============================
    questionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q1 = e.target.q1.value;
    const q2 = e.target.q2.value;
    const q3 = e.target.q3.value;

    let goal = "";
    if (q1 === "rarely") goal = "🌿 野菜を1日2食に取り入れよう！";
    else if (q2 === "often") goal = "🍫 間食を1日1回までにしよう！";
    else if (q3 === "no") goal = "💧 毎食後に水を1杯飲もう！";
    else goal = "🥗 バランスを意識した食事を心がけよう！";

    goalText.textContent = goal;
    questionModal.classList.remove("show");
    goalModal.classList.add("show");
    localStorage.setItem("goal", goal);
    });

    // =============================
    // ✏️ 再設定：手動フォーム
    // =============================
    manualForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const customGoal = document.getElementById("custom-goal").value.trim();
    const selectedPreset = manualForm.dataset.selectedGoal;
    const goal = customGoal || selectedPreset || "🥗 バランスを意識した食事を心がけよう！";
    localStorage.setItem("goal", goal);
    goalText.textContent = goal;
    questionModal.classList.remove("show");
    goalModal.classList.add("show");
    });

    // 🎯 プリセット選択ボタン
    document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const parentForm = btn.closest("form");
        parentForm.dataset.selectedGoal = btn.dataset.goal;
    });
    });

    // =============================
    // 🔁 モード切り替え
    // =============================
    if (!localStorage.getItem("hasVisited")) {
    questionModal.classList.add("show");
    questionForm.classList.remove("hidden");
    manualForm.classList.add("hidden");
    }

    editGoalBtn.addEventListener("click", () => {
    questionForm.classList.add("hidden");
    manualForm.classList.remove("hidden");
    questionModal.classList.add("show");
    });

    startBtn.addEventListener("click", () => {
    localStorage.setItem("hasVisited", "true");
    goalModal.classList.remove("show");
    generateCalendar(currentYear, currentMonth);
    const goal = localStorage.getItem("goal");
    goalDisplay.textContent = goal;
    });

    setupLists();
    generateCalendar(currentYear, currentMonth);

    // =============================
    // ❌ 閉じるボタン（再設定モーダル）
    // =============================
    const closeGoalModalBtn = document.getElementById("close-goal-modal");
    if (closeGoalModalBtn) {
    closeGoalModalBtn.addEventListener("click", () => {
        questionModal.classList.remove("show");
    });
    }

    // 🌫️ 「目標再設定」ポップアップ外クリックで閉じる
    questionModal.addEventListener("click", (e) => {
    // 背景（モーダル全体）をクリックしたときだけ閉じる
    if (e.target === questionModal) {
        questionModal.classList.remove("show");
    }

    
    });


  // ❌ 記録モーダル閉じるボタン
const closeChecklistModalBtn = document.getElementById("close-checklist-modal");

if (closeChecklistModalBtn) {
  closeChecklistModalBtn.addEventListener("click", () => {
    checklistModal.classList.remove("show");
  });
}

// モーダル内クリックは閉じない
const checklistContent = document.querySelector("#checklist-modal .modal-content");
if (checklistContent) {
  checklistContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// モーダル背景クリックで閉じる
checklistModal.addEventListener("click", (e) => {
  if (e.target === checklistModal) {
    checklistModal.classList.remove("show");
  }
});


    // 🌫️ モーダル外クリックで閉じる
    checklistModal.addEventListener("click", (e) => {
    // モーダルの外側（背景部分）をクリックしたときのみ閉じる
    if (e.target === checklistModal) {
        checklistModal.classList.remove("show");
    }
    });

 
