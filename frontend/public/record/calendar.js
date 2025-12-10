
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

    let dbTasks = [];

    async function loadTasksFromDB(){
        try {
            const res = await fetch('/api/tasks', {
                method: 'GET',
                credentials: 'include'
            });
            if(!res.ok){
                console.warn('Failed to load tasks from DB');
                dbTasks = [];
                return;
            }
            const data = await res.json();
            const tasks = data.tasks || [];
            dbTasks = tasks.map(t => ({
                    ...t,
                    dateKey: t.dateKey && t.dateKey.length === 10
                        ? t.dateKey
                        : null
            }));

        } catch(err){
            console.warn('Error loading tasks from DB', err);
            dbTasks = [];
        }
    }

    // =============================
    // 🎯 現在の目標を表示
    // =============================
    const savedGoal = localStorage.getItem("goal");
    const savedDifficulty = localStorage.getItem("difficulty");
    if (goalDisplay) {
    if (savedGoal) {
        goalDisplay.textContent = `${savedGoal}（難易度：${savedDifficulty ?? "標準"}）`;
    } else {
        goalDisplay.textContent = "目標はまだ設定されていません";
    }
    }

    // =============================
    // 🗓️ カレンダー生成
    // =============================
    async function generateCalendar(year, month) {
        calendarGrid.innerHTML = "";
        await loadTasksFromDB();

        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const startWeekday = firstDay.getDay();
        const totalDays = lastDay.getDate();
    
        yearDisplay.textContent = `${year}`;
        monthDisplay.textContent = `${month}月`;

        for (let i = 0; i < startWeekday; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.classList.add("date-cell", "empty");
            calendarGrid.appendChild(emptyCell);
        }

    //今日の日付を判定してスタイル付与
        const t = new Date();
        const todayKey = [
            t.getFullYear(),
            String(t.getMonth() + 1).padStart(2, '0'),
            String(t.getDate()).padStart(2, '0')
        ].join('-');

        //日付セル生成
        for (let day = 1; day <= totalDays; day++){
            const cell = document.createElement("div");
            cell.classList.add("date-cell");
            cell.textContent = day;

            const dateKey = [
                year,
                String(month).padStart(2, '0'),
                String(day).padStart(2, '0')
            ].join('-');

        if (dateKey === todayKey) {
            cell.classList.add("today");
        }

        //DB上のタスク検索
        const tasksForDay = dbTasks.filter(t => t.dateKey === dateKey);
        const task = tasksForDay.length > 0 ? tasksForDay[tasksForDay.length -1] : null;

        // 記録済み・メモあり判定
        if(task){

            try{
                const desc = JSON.parse(task.description || '{}');

                //記録済み
                if(desc.completed){
                    cell.classList.add("recorded");
                }

                //メモあり
                if(desc.memo && desc.memo.trim() !== ""){
                    cell.classList.add("has-memo");
                }

            } catch(e){
                console.warn('Invalid JSON', e);
            }
        }

        //クリックイベント
        cell.addEventListener("click", () => {
            selectedDate = dateKey;
            openChecklistModalForData(dateKey);
        });

        calendarGrid.appendChild(cell);
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

        item.addEventListener("click", async() => {
            currentYear = y;
            yearList.classList.add("hidden");
            await generateCalendar(currentYear, currentMonth);
        });
        yearList.appendChild(item);
    }

    // 月リスト（1〜12）
    for (let m = 1; m <= 12; m++) {
        const item = document.createElement("div");
        item.textContent = `${m}月`;

        item.addEventListener("click", async() => {
        currentMonth = m;
        monthList.classList.add("hidden");
        await generateCalendar(currentYear, currentMonth);
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

    prevBtn.addEventListener("click", async () => {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    await generateCalendar(currentYear, currentMonth);
    });

    nextBtn.addEventListener("click", async () => {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    await generateCalendar(currentYear, currentMonth);
    });


    // 初期化
    (async () => {
        setupLists();
        await generateCalendar(currentYear, currentMonth);
    })();

    // =============================
    // ✅ チェックリスト項目
    // =============================
    function generateChecklistItems(goal) {
    checklistForm.innerHTML = "";
    let items = [];

    if (goal.includes("野菜")) {
        items = [
        { name: "vege", label: "野菜を1日2食に取り入れた" },
        { name: "balance", label: "主食・主菜・副菜を意識した" },
        { name: "drink", label: "食事中に水を飲んだ" },
        ];
    } else if (goal.includes("間食")) {
        items = [
        { name: "snack", label: "間食をしなかった" },
        { name: "fruit", label: "果物を選んだ" },
        { name: "water", label: "水を飲んだ" },
        ];
    } else if (goal.includes("水") || goal.includes("水分")) {
        items = [
        { name: "water1", label: "朝に1杯飲んだ" },
        { name: "water2", label: "食事ごとに1杯飲んだ" },
        { name: "water3", label: "就寝前に1杯飲んだ" },
        ];
    } else {
        items = [
        { name: "meal", label: "バランスの良い食事をした" },
        { name: "snack", label: "間食を控えた" },
        { name: "water", label: "水を飲んだ" },
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

    //メモ欄を追加
    const memoLabel = document.createElement("label");
    memoLabel.textContent = "今日のメモ";
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


//指定日付のモーダルをDBから開く
    async function openChecklistModalForData(dateKey) {
        dateTitle.textContent = `${dateKey} の記録`;
        const goal = localStorage.getItem("goal") || "";
        generateChecklistItems(goal);

        try {
            const res = await fetch(`/api/tasks/by-date/${dateKey}`, {
            credentials: 'include'
            });
            if (res.ok) {
                const task = await res.json();

                if (task) {

                    try {
                        const data = JSON.parse(task.description || '{}');

                        //チェック復元
                        checklistForm.querySelectorAll("input[type='checkbox']").forEach(input => {
                            input.checked = false;
                        });

                        //DBに保存されているチェック状態を反映
                        for (const key in data){
                            const checkbox = checklistForm.querySelector(`input[name="${key}"]`);
                            if (checkbox) {
                                checkbox.checked = data[key] === true;
                            }
                        }

                        //メモ復元
                        const memoArea = checklistForm.querySelector("textarea[name='memo']");
                        if (memoArea) {
                            memoArea.value = data.memo || "";
                        }

                } catch (e) {
                    console.warn('Invalid JSON in task.description for this date', e);
                }
            }
        }
    } catch (err) {
        console.warn('Failed to load task by date', err);
    }
    checklistModal.classList.add("show");
}

//チェックリスト保存
    checklistForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if(!selectedDate) return;
        const data = {};
        let completed = false;

        checklistForm.querySelectorAll("input[type='checkbox']").forEach((input) => {
            data[input.name] = input.checked;
            if (input.checked) completed = true;
        });

        //メモ保存（←ここを先に data に入れるのが大事）
        const memoValue = checklistForm.querySelector("textarea[name='memo']").value;
        data.memo = memoValue;
        data.completed = completed;
        
        //サーバー（api/tasks）に保存
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    description: JSON.stringify(data),
                    deadline: selectedDate
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                console.warn('Server save failed', errorData);
            } else { }
            } catch (err) {
            console.warn('Server save error', err);
        }

        checklistModal.classList.remove("show");
        await generateCalendar(currentYear, currentMonth);
    });


    // =============================
    // 🧠 初回：診断フォーム
    // =============================
    questionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q1 = e.target.q1.value;
    const q2 = e.target.q2.value;
    const q3 = e.target.q3.value;
    const difficulty = e.target.difficulty?.value || "標準";

    let goal = "";
    if (q1 === "rarely") goal = "野菜を1日2食に取り入れよう！";
    else if (q2 === "often") goal = "間食を1日1回までにしよう！";
    else if (q3 === "no") goal = "毎食後に水を1杯飲もう！";
    else goal = "バランスを意識した食事を心がけよう！";

    goalText.textContent = `${goal}\n（難易度：${difficulty}）`;
    questionModal.classList.remove("show");
    goalModal.classList.add("show");
    localStorage.setItem("goal", goal);
    localStorage.setItem("difficulty", difficulty);
    });

    // =============================
    // ✏️ 再設定：手動フォーム
    // =============================
    manualForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const customGoal = document.getElementById("custom-goal").value.trim();
        const selectedPreset = manualForm.dataset.selectedGoal;
        const difficulty = e.target.difficulty?.value || "標準";
        const goal = customGoal || selectedPreset || "🥗 バランスを意識した食事を心がけよう！";
        localStorage.setItem("goal", goal);
        localStorage.setItem("difficulty", difficulty);
        goalText.textContent = `${goal}\n（難易度：${difficulty}）`;
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

    startBtn.addEventListener("click", async () => {
        localStorage.setItem("hasVisited", "true");
        goalModal.classList.remove("show");
        await generateCalendar(currentYear, currentMonth);
        const goal = localStorage.getItem("goal");
        const diff = localStorage.getItem("difficulty");
        goalDisplay.textContent = `${goal}（難易度：${diff ?? "標準"}）`;
    });

    // =============================
    // ❌ 閉じるボタン（再設定モーダル）
    // =============================
    const closeGoalModalBtn = document.getElementById("close-goal-modal");
    if (closeGoalModalBtn) {
        closeGoalModalBtn.addEventListener("click", () => {
            questionModal.classList.remove("show");
        });
    }

    //「目標再設定」ポップアップ外クリックで閉じる
    questionModal.addEventListener("click", (e) => {
    // 背景（モーダル全体）をクリックしたときだけ閉じる
        if (e.target === questionModal) {
            questionModal.classList.remove("show");
        }
    });


    //記録モーダル閉じるボタン
    const closeChecklistModalBtn = document.getElementById("close-checklist-modal");

    if (closeChecklistModalBtn) {
        closeChecklistModalBtn.addEventListener("click", () => {
        checklistModal.classList.remove("show");
    });
    }

    //モーダル外クリックで閉じる
    checklistModal.addEventListener("click", (e) => {
    // モーダルの外側（背景部分）をクリックしたときのみ閉じる
    if (e.target === checklistModal) {
        checklistModal.classList.remove("show");
    }
    });