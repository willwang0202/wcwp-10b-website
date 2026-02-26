/* ================================================
   WCWP 10B — Show Budget Game Logic
   ================================================ */

(function () {
    "use strict";

    // -------- DATA --------
    const TIERS = {
        working: { label: "Working Class Artist", budget: 500 },
        successful: { label: "Successful Artist", budget: 3000 },
        trustfund: { label: "Trust Fund Figure", budget: 10000 },
    };

    const CATEGORIES = [
        {
            id: "venue",
            name: "Venue",
            emoji: "🏟️",
            options: [
                { level: "low", label: "DIY / Che Cafe", cost: 150, hours: [8, 10], desc: "Warehouse vibes. You're hauling gear, setting up the PA, and cleaning up after." },
                { level: "mid", label: "Belly Up / Music Box", cost: 850, hours: [5, 7], desc: "Real stage, real sound. They handle most logistics." },
                { level: "high", label: "The Conrad / The Shell", cost: 1800, hours: [2, 5], desc: "Premium venue with full production. Just show up and play." },
            ],
        },
        {
            id: "gear",
            name: "Gear",
            emoji: "🎛️",
            options: [
                { level: "low", label: "DIY String Change/Repair", cost: 15, hours: [4, 5], desc: "YouTube tutorials and elbow grease. Hope nothing breaks mid-set." },
                { level: "mid", label: "Pro Setup / Backup Guitar", cost: 250, hours: [3, 4], desc: "Professionally set up instrument, plus a reliable backup." },
                { level: "high", label: "Vintage Amp / Boutique Pedals", cost: 1500, hours: [1, 3], desc: "Tone-chasing heaven. Your rig is flawless." },
            ],
        },
        {
            id: "general",
            name: "General Expenses",
            emoji: "🚗",
            options: [
                { level: "low", label: "Gas / Parking / Load-in", cost: 40, hours: [5, 6], desc: "Public transit and hauling your own gear. Physical labor included." },
                { level: "mid", label: "Van Service / Insurance", cost: 200, hours: [4, 5], desc: "Reliable ride with coverage. One less thing to stress about." },
                { level: "high", label: "White-Glove Transport", cost: 400, hours: [2, 4], desc: "Door-to-door equipment transport. You ride in comfort." },
            ],
        },
        {
            id: "promo",
            name: "Promotion",
            emoji: "📣",
            options: [
                { level: "low", label: "B&W Street Flyers", cost: 60, hours: [15, 20], desc: "Photocopied flyers and manual DM outreach. Grassroots hustle." },
                { level: "mid", label: "Targeted Social Ads", cost: 350, hours: [8, 12], desc: "Instagram & TikTok ads reaching the right audience." },
                { level: "high", label: "Professional PR Agency", cost: 1000, hours: [5, 8], desc: "Full press kit, blog placements, playlist pitching." },
            ],
        },
        {
            id: "staff",
            name: "Staff / Manager",
            emoji: "🤝",
            options: [
                { level: "low", label: "Pizza & Beer for Friends", cost: 40, hours: [6, 8], desc: "Your homies help out. Coordination is an adventure." },
                { level: "mid", label: "Freelance Sound Tech", cost: 250, hours: [5, 6], desc: "A pro behind the board and one less headache." },
                { level: "high", label: "Full Agency / Road Crew", cost: 500, hours: [2, 5], desc: "Manager, sound, lights, merch — all handled." },
            ],
        },
    ];

    // -------- STATE --------
    const state = {
        tier: null,
        budget: 0,
        selections: {},
    };

    // -------- DOM SHORTCUTS --------
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const screens = {
        landing: $("#screen-landing"),
        tier: $("#screen-tier"),
        budget: $("#screen-budget"),
        results: $("#screen-results"),
    };

    // -------- NAVIGATION --------
    function showScreen(name) {
        Object.values(screens).forEach((s) => s.classList.remove("active"));
        screens[name].classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // -------- RENDER: Category Cards --------
    function renderCategories() {
        const container = $("#categories-container");
        container.innerHTML = "";

        CATEGORIES.forEach((cat, ci) => {
            const card = document.createElement("div");
            card.className = "category-card fade-in-up delay-" + (ci + 1);
            card.dataset.catId = cat.id;

            const hoursRange = cat.options.map((o) => o.hours);
            const minH = Math.min(...hoursRange.map((h) => h[0]));
            const maxH = Math.max(...hoursRange.map((h) => h[1]));

            card.innerHTML =
                '<div class="category-header">' +
                '<span class="category-emoji">' + cat.emoji + '</span>' +
                '<span class="category-name">' + cat.name + '</span>' +
                '<span class="category-hours-badge">' + minH + '–' + maxH + ' hrs total range</span>' +
                '</div>' +
                '<div class="option-grid">' +
                cat.options.map(function (opt) {
                    var tierLabel = opt.level === "low" ? "Low Cost" : opt.level === "mid" ? "Medium Cost" : "High Cost";
                    return '<button class="option-btn" data-cat="' + cat.id + '" data-level="' + opt.level + '">' +
                        '<div class="option-tier-label">' + tierLabel + '</div>' +
                        '<div class="option-cost">$' + opt.cost.toLocaleString() + '</div>' +
                        '<div class="option-desc">' + opt.desc + '</div>' +
                        '<div class="option-hours">⏱ ' + opt.hours[0] + '–' + opt.hours[1] + ' hrs</div>' +
                        '</button>';
                }).join("") +
                '</div>';

            container.appendChild(card);
        });

        // Attach option click handlers
        container.querySelectorAll(".option-btn").forEach(function (btn) {
            btn.addEventListener("click", function () { handleOptionSelect(btn); });
        });
    }

    // -------- OPTION SELECT --------
    function handleOptionSelect(btn) {
        var catId = btn.dataset.cat;
        var level = btn.dataset.level;

        var cat = CATEGORIES.find(function (c) { return c.id === catId; });
        var opt = cat.options.find(function (o) { return o.level === level; });

        state.selections[catId] = opt;

        var card = btn.closest(".category-card");
        card.querySelectorAll(".option-btn").forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        card.classList.add("completed");

        updateBudgetBar();

        var allSelected = CATEGORIES.every(function (c) { return state.selections[c.id]; });
        $("#btn-see-results").disabled = !allSelected;
    }

    // -------- BUDGET BAR --------
    function updateBudgetBar() {
        var spent = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
        var pct = Math.min((spent / state.budget) * 100, 100);
        var bar = $("#budget-bar");
        bar.style.width = pct + "%";

        if (spent > state.budget) {
            bar.classList.add("over");
        } else {
            bar.classList.remove("over");
        }

        $("#budget-numbers").textContent = "$" + spent.toLocaleString() + " / $" + state.budget.toLocaleString();
    }

    // -------- RESULTS --------
    function showResults() {
        var spent = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
        var remaining = state.budget - spent;

        var minHours = 0;
        var maxHours = 0;
        Object.values(state.selections).forEach(function (o) {
            minHours += o.hours[0];
            maxHours += o.hours[1];
        });
        var avgHours = Math.round((minHours + maxHours) / 2);

        var overBudget = spent > state.budget;
        var underHalf = spent <= state.budget * 0.5;
        var outcomeEmoji, outcomeTitle, outcomeText;

        if (overBudget) {
            outcomeEmoji = "💸";
            outcomeTitle = "Over Budget!";
            outcomeText = "You spent <strong>$" + spent.toLocaleString() + "</strong> — that's <strong>$" + Math.abs(remaining).toLocaleString() + "</strong> over your <strong>$" + state.budget.toLocaleString() + "</strong> budget. The show might be incredible, but the credit card bill is going to hurt. Sometimes the art costs more than you have.";
        } else if (underHalf) {
            outcomeEmoji = "🔥";
            outcomeTitle = "Scrappy Legend";
            outcomeText = "You only spent <strong>$" + spent.toLocaleString() + "</strong> out of <strong>$" + state.budget.toLocaleString() + "</strong>. That's pure hustle. You put in around <strong>" + avgHours + " hours</strong> of sweat equity, but you proved that heart beats money. The crowd doesn't care about your budget — they care about your energy.";
        } else {
            outcomeEmoji = "🎶";
            outcomeTitle = "Show Time!";
            outcomeText = "You spent <strong>$" + spent.toLocaleString() + "</strong> of your <strong>$" + state.budget.toLocaleString() + "</strong> budget with <strong>$" + remaining.toLocaleString() + "</strong> left over. Around <strong>" + avgHours + " hours</strong> of your time went into making this happen. A balanced approach — smart spending and solid effort. The show goes on!";
        }

        $("#results-outcome").innerHTML =
            '<span class="emoji-big">' + outcomeEmoji + '</span>' +
            '<h2>' + outcomeTitle + '</h2>' +
            '<p>' + outcomeText + '</p>';

        $("#results-spent").textContent = "$" + spent.toLocaleString();
        $("#results-spent").className = "results-card-value " + (overBudget ? "red" : "green");

        $("#results-budget").textContent = "$" + state.budget.toLocaleString();

        $("#results-remaining").textContent = (remaining >= 0 ? "+" : "-") + "$" + Math.abs(remaining).toLocaleString();
        $("#results-remaining").className = "results-card-value " + (remaining >= 0 ? "green" : "red");

        $("#results-hours").textContent = "~" + avgHours + " hrs";
        $("#results-hours").className = "results-card-value yellow";

        // Breakdown table
        var rows = "";
        CATEGORIES.forEach(function (cat) {
            var sel = state.selections[cat.id];
            rows += "<tr>" +
                "<td>" + cat.emoji + " " + cat.name + "</td>" +
                "<td>" + sel.label + "</td>" +
                "<td>$" + sel.cost.toLocaleString() + "</td>" +
                "<td>" + sel.hours[0] + "–" + sel.hours[1] + " hrs</td>" +
                "</tr>";
        });
        rows += "<tr>" +
            '<td colspan="2"><strong>Total</strong></td>' +
            "<td><strong>$" + spent.toLocaleString() + "</strong></td>" +
            "<td><strong>" + minHours + "–" + maxHours + " hrs</strong></td>" +
            "</tr>";

        $("#results-breakdown").innerHTML =
            "<h3>Breakdown</h3>" +
            '<table class="breakdown-table">' +
            "<thead><tr><th>Category</th><th>Choice</th><th>Cost</th><th>Time</th></tr></thead>" +
            "<tbody>" + rows + "</tbody>" +
            "</table>";

        // Narrative section
        var tierKey = state.tier;
        var narrative = "";
        if (tierKey === "working") {
            if (overBudget) {
                narrative = "As a <strong>Working Class Artist</strong>, every dollar is earned through hours of labor. Going over budget means dipping into rent money, skipping meals, or borrowing from friends. The music industry doesn't hand out safety nets — you just played without one. But maybe the show was worth it?";
            } else {
                narrative = "As a <strong>Working Class Artist</strong>, you stretched every dollar and put in the hours. That's the reality: when you can't buy convenience, you trade time instead. The DIY path is exhausting, but it builds something money can't — authenticity and grit.";
            }
        } else if (tierKey === "successful") {
            if (overBudget) {
                narrative = "Even a <strong>Successful Artist</strong> can overspend. $3,000 sounds like a lot until the costs stack up. This is the trap of the middle — enough money to dream big, not quite enough to pull it off without consequences.";
            } else {
                narrative = "As a <strong>Successful Artist</strong>, you had room to breathe. You could afford quality where it mattered and save where it didn't. This is the sweet spot — but staying here means making smart choices consistently.";
            }
        } else {
            if (overBudget) {
                narrative = "Even with a <strong>$10,000 Trust Fund</strong>, you managed to overshoot. That's impressive — and revealing. When money feels unlimited, spending becomes unconscious. But hey, the show probably looked amazing.";
            } else {
                narrative = "With a <strong>$10,000 Trust Fund</strong>, budget was never the challenge. The real question: did you appreciate what each dollar bought, or was it just easy? The working class artist next door put on a show too — with $500 and twice the hours.";
            }
        }

        $("#results-narrative").innerHTML = narrative;
        showScreen("results");
    }

    // -------- EVENT LISTENERS --------

    // Start button
    $("#btn-start").addEventListener("click", function () { showScreen("tier"); });

    // Tier selection
    $$(".tier-card").forEach(function (card) {
        card.addEventListener("click", function () {
            var tierKey = card.dataset.tier;
            state.tier = tierKey;
            state.budget = TIERS[tierKey].budget;
            state.selections = {};

            $$(".tier-card").forEach(function (c) { c.classList.remove("selected"); });
            card.classList.add("selected");

            $("#budget-tier-label").textContent = TIERS[tierKey].label;
            updateBudgetBar();
            renderCategories();
            $("#btn-see-results").disabled = true;

            setTimeout(function () { showScreen("budget"); }, 300);
        });
    });

    // Back to tier
    $("#btn-back-tier").addEventListener("click", function () { showScreen("tier"); });

    // See results
    $("#btn-see-results").addEventListener("click", showResults);

    // Replay
    $("#btn-replay").addEventListener("click", function () {
        state.tier = null;
        state.budget = 0;
        state.selections = {};
        $$(".tier-card").forEach(function (c) { c.classList.remove("selected"); });
        showScreen("landing");
    });
})();
