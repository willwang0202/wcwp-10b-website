/* ================================================
   WCWP 10B — Show Budget Game Logic
   Full interactive version with all enhancements
   ================================================ */

(function () {
    "use strict";

    // -------- DATA --------
    var TIERS = {
        working: { label: "Working Class Artist", budget: 500 },
        successful: { label: "Successful Artist", budget: 3000 },
        trustfund: { label: "Trust Fund Figure", budget: 10000 },
    };

    var CATEGORIES = [
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

    var RANDOM_EVENTS = [
        {
            text: "Your amp blew a fuse mid-soundcheck",
            cost: { working: 120, successful: 80, trustfund: 0 },
            hours: { working: [2, 3], successful: [1, 2], trustfund: [0, 0] },
            emoji: "⚡",
            flavor: {
                working: "You're scrambling to find a replacement at a pawn shop across town.",
                successful: "You call a buddy who has a spare — costs you a favor and some cash.",
                trustfund: "Your tech swaps in a backup from the gear trailer. You barely notice."
            }
        },
        {
            text: "The venue double‑booked your slot",
            cost: { working: 0, successful: 0, trustfund: 200 },
            hours: { working: [3, 5], successful: [2, 3], trustfund: [0, 1] },
            emoji: "😱",
            flavor: {
                working: "You spend hours begging the other band to swap. They take your merch table too.",
                successful: "Your connections help sort it out, but it eats your whole afternoon.",
                trustfund: "Your manager makes a call. The other band gets moved — and compensated."
            }
        },
        {
            text: "Your drummer's car broke down on the way",
            cost: { working: 80, successful: 40, trustfund: 0 },
            hours: { working: [2, 3], successful: [1, 2], trustfund: [0, 0] },
            emoji: "🚗",
            flavor: {
                working: "You drive 45 minutes each way to pick them up. Gas money gone.",
                successful: "You split an Uber with the band fund. Stressful but handled.",
                trustfund: "You send an Uber Black. Problem solved in 20 minutes."
            }
        },
        {
            text: "A string snaps during your last song",
            cost: { working: 25, successful: 15, trustfund: 0 },
            hours: { working: [0, 1], successful: [0, 0], trustfund: [0, 0] },
            emoji: "🎸",
            flavor: {
                working: "You finish the set on 5 strings. The crowd doesn't notice — you do.",
                successful: "You swap guitars between songs. Smooth enough.",
                trustfund: "Your guitar tech had three backups. Seamless."
            }
        },
        {
            text: "Sound system keeps feeding back",
            cost: { working: 0, successful: 0, trustfund: 0 },
            hours: { working: [1, 2], successful: [0, 1], trustfund: [0, 0] },
            emoji: "🔊",
            flavor: {
                working: "You spend an hour wrestling with the PA. Your ears are ringing.",
                successful: "The freelance sound tech sorts it out after a rough start.",
                trustfund: "Your engineer resolved it before you walked on stage."
            }
        },
        {
            text: "Rain flooded the loading dock",
            cost: { working: 0, successful: 0, trustfund: 0 },
            hours: { working: [2, 3], successful: [1, 2], trustfund: [0, 0] },
            emoji: "🌧️",
            flavor: {
                working: "You're carrying amps through puddles in your only good shoes.",
                successful: "You improvise with a tarp. Gear stays dry, mostly.",
                trustfund: "Your road crew handled everything. You walked in dry."
            }
        },
        {
            text: "The promoter shorted you on the door split",
            cost: { working: 100, successful: 50, trustfund: 0 },
            hours: { working: [0, 0], successful: [0, 0], trustfund: [0, 0] },
            emoji: "💸",
            flavor: {
                working: "You lost $100 you were counting on for groceries this week. No recourse.",
                successful: "Frustrating, but you can absorb it. You won't work with them again.",
                trustfund: "Your lawyer sends a strongly worded email. You get paid in full."
            }
        },
        {
            text: "Your merch got damaged before the show",
            cost: { working: 60, successful: 30, trustfund: 0 },
            hours: { working: [1, 2], successful: [0, 1], trustfund: [0, 0] },
            emoji: "👕",
            flavor: {
                working: "Water‑stained shirts you spent all week screen‑printing. That's money gone.",
                successful: "Some shirts are ruined, but you have extras in storage.",
                trustfund: "Insurance covers the replacement cost. New batch overnighted."
            }
        },
        {
            text: "A local blog wants a last‑minute interview",
            cost: { working: 0, successful: 0, trustfund: 0 },
            hours: { working: [1, 2], successful: [1, 1], trustfund: [0, 0] },
            emoji: "📰",
            flavor: {
                working: "Great exposure, but it eats into your soundcheck time.",
                successful: "You squeeze it in between setup. Good press is always worth it.",
                trustfund: "Your PR team handles it. You show up for 5 minutes."
            }
        },
        {
            text: "Your phone dies and you lose the setlist",
            cost: { working: 0, successful: 0, trustfund: 0 },
            hours: { working: [0, 1], successful: [0, 0], trustfund: [0, 0] },
            emoji: "📱",
            flavor: {
                working: "You wing it and forget the bridge on song three. The crowd vibes anyway.",
                successful: "You had a backup on your iPad. Close call.",
                trustfund: "Your stage manager has printed copies for the whole crew. Obviously."
            }
        }
    ];

    var CONSEQUENCES = [
        { threshold: 25, text: "You're eating ramen for the rest of the week", emoji: "🍜" },
        { threshold: 75, text: "You're skipping the dentist appointment — again", emoji: "🦷" },
        { threshold: 100, text: "You're borrowing money from a friend who's also broke", emoji: "🤝" },
        { threshold: 150, text: "Rent is going to be late this month", emoji: "🏠" },
        { threshold: 200, text: "You're putting this on a credit card at 24% APR", emoji: "💳" },
        { threshold: 300, text: "You're working double shifts all next week to cover this", emoji: "😴" },
        { threshold: 400, text: "You're choosing between new strings and groceries next month", emoji: "🎸" },
        { threshold: 500, text: "You're seriously considering selling your backup guitar", emoji: "💔" },
    ];

    // -------- STATE --------
    var state = {
        tier: null,
        budget: 0,
        selections: {},
        events: [],
        eventCostImpact: 0,
        eventHoursImpact: 0,
        audienceScore: 0,
    };

    // -------- DOM SHORTCUTS --------
    var $ = function (sel) { return document.querySelector(sel); };
    var $$ = function (sel) { return document.querySelectorAll(sel); };

    var screens = {
        landing: $("#screen-landing"),
        tier: $("#screen-tier"),
        budget: $("#screen-budget"),
        events: $("#screen-events"),
        results: $("#screen-results"),
    };

    // -------- NAVIGATION --------
    function showScreen(name) {
        Object.values(screens).forEach(function (s) { s.classList.remove("active"); });
        screens[name].classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // -------- RENDER: Category Cards --------
    function renderCategories() {
        var container = $("#categories-container");
        container.innerHTML = "";

        CATEGORIES.forEach(function (cat, ci) {
            var card = document.createElement("div");
            card.className = "category-card fade-in-up delay-" + (ci + 1);
            card.dataset.catId = cat.id;

            var hoursRange = cat.options.map(function (o) { return o.hours; });
            var minH = Math.min.apply(null, hoursRange.map(function (h) { return h[0]; }));
            var maxH = Math.max.apply(null, hoursRange.map(function (h) { return h[1]; }));

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

        // Visual feedback flash
        btn.classList.add("just-selected");
        setTimeout(function () { btn.classList.remove("just-selected"); }, 400);

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
            // Shake the budget header
            var header = $(".budget-header");
            header.classList.add("shake");
            setTimeout(function () { header.classList.remove("shake"); }, 600);
        } else {
            bar.classList.remove("over");
        }

        // Pulse warning when approaching 80%
        if (pct >= 80 && pct < 100) {
            bar.classList.add("warning");
        } else {
            bar.classList.remove("warning");
        }

        $("#budget-numbers").textContent = "$" + spent.toLocaleString() + " / $" + state.budget.toLocaleString();
    }

    // -------- RANDOM EVENTS --------
    function triggerRandomEvents() {
        var shuffled = RANDOM_EVENTS.slice().sort(function () { return 0.5 - Math.random(); });
        var count = Math.random() < 0.4 ? 1 : 2;
        state.events = shuffled.slice(0, count);

        state.eventCostImpact = 0;
        state.eventHoursImpact = 0;

        var tier = state.tier;
        var listEl = $("#events-list");
        listEl.innerHTML = "";

        state.events.forEach(function (evt, i) {
            var cost = evt.cost[tier];
            var hours = evt.hours[tier];
            var avgHrs = Math.round((hours[0] + hours[1]) / 2);

            state.eventCostImpact += cost;
            state.eventHoursImpact += avgHrs;

            var card = document.createElement("div");
            card.className = "event-card fade-in-up delay-" + (i + 1);

            var impactHTML = "";
            if (cost > 0) impactHTML += '<span class="event-impact negative">+$' + cost + ' cost</span>';
            if (avgHrs > 0) impactHTML += '<span class="event-impact negative">+' + avgHrs + ' hrs</span>';
            if (cost === 0 && avgHrs === 0) impactHTML += '<span class="event-impact positive">No impact — must be nice.</span>';

            card.innerHTML =
                '<div class="event-emoji-big">' + evt.emoji + '</div>' +
                '<div class="event-body">' +
                '<h3 class="event-title">' + evt.text + '</h3>' +
                '<p class="event-flavor">' + evt.flavor[tier] + '</p>' +
                '<div class="event-impacts">' + impactHTML + '</div>' +
                '</div>';

            listEl.appendChild(card);
        });

        // Show impact summary
        var impactEl = $("#events-impact");
        var summaryParts = [];
        if (state.eventCostImpact > 0) {
            summaryParts.push("added <strong>$" + state.eventCostImpact + "</strong> to your costs");
        }
        if (state.eventHoursImpact > 0) {
            summaryParts.push("ate <strong>" + state.eventHoursImpact + " more hours</strong> of your time");
        }
        var summaryText = summaryParts.length > 0
            ? "These curveballs " + summaryParts.join(" and ") + "."
            : "Somehow, you dodged every bullet. Lucky.";

        impactEl.innerHTML = '<p>' + summaryText + '</p>';
        showScreen("events");
    }

    // -------- AUDIENCE REACTION --------
    function calculateAudienceReaction() {
        // Working class artists get an authenticity base bonus
        var base = state.tier === "working" ? 55 : state.tier === "successful" ? 45 : 28;

        // DIY choices boost authenticity
        Object.values(state.selections).forEach(function (sel) {
            if (sel.level === "low") base += 8;
            else if (sel.level === "mid") base += 5;
            else base += 2; // Overproduced can feel corporate
        });

        // Random factor ±12
        base += Math.floor(Math.random() * 25) - 12;

        return Math.max(15, Math.min(100, base));
    }

    function renderAudienceReaction() {
        var score = state.audienceScore;
        var el = $("#results-audience");

        var emoji, label, desc;
        if (score >= 85) {
            emoji = "🤯"; label = "Legendary Night";
            desc = "The crowd is losing their minds. People are crying. Someone just threw their shoe on stage. This is what it's all about.";
        } else if (score >= 70) {
            emoji = "🔥"; label = "Electric";
            desc = "The energy is incredible. Everyone's singing along. Phones are out — but for videos, not scrolling. Real connection.";
        } else if (score >= 50) {
            emoji = "👏"; label = "Solid Show";
            desc = "People are vibing. It's a good show. Not legendary, but the bartender says you can come back. That's something.";
        } else if (score >= 30) {
            emoji = "😐"; label = "Polite Applause";
            desc = "The crowd claps. Politely. Your mom says it was great. The sound was fine. The magic just wasn't there tonight.";
        } else {
            emoji = "🦗"; label = "Empty Room Energy";
            desc = "It's you, the bartender, and someone who thought this was a different bar. Still, you played your heart out.";
        }

        el.innerHTML =
            '<div class="audience-card">' +
            '<h3>Crowd Reaction</h3>' +
            '<div class="audience-meter-row">' +
            '<span class="audience-emoji">' + emoji + '</span>' +
            '<div class="audience-meter-wrap">' +
            '<div class="audience-meter-bar">' +
            '<div class="audience-meter-fill" style="width:0%"></div>' +
            '</div>' +
            '<div class="audience-meter-labels">' +
            '<span>🦗 Dead</span>' +
            '<span>🤯 Legendary</span>' +
            '</div>' +
            '</div>' +
            '<span class="audience-score">' + score + '<small>/100</small></span>' +
            '</div>' +
            '<p class="audience-label">' + label + '</p>' +
            '<p class="audience-desc">' + desc + '</p>' +
            '</div>';

        // Animate the meter fill after a brief delay
        setTimeout(function () {
            var fill = el.querySelector(".audience-meter-fill");
            if (fill) fill.style.width = score + "%";
        }, 300);
    }

    // -------- CONSEQUENCES / DEBT TRACKER --------
    function renderConsequences(overAmount) {
        var el = $("#results-consequences");
        if (overAmount <= 0 || state.tier !== "working") {
            el.innerHTML = "";
            return;
        }

        var triggered = CONSEQUENCES.filter(function (c) { return overAmount >= c.threshold; });

        if (triggered.length === 0) {
            el.innerHTML = "";
            return;
        }

        var html = '<div class="consequences-card">' +
            '<h3>💳 The Real Cost</h3>' +
            '<p class="consequences-intro">Going <strong>$' + overAmount.toLocaleString() + '</strong> over budget as a Working Class Artist means:</p>' +
            '<ul class="consequences-list">';

        triggered.forEach(function (c) {
            html += '<li class="consequence-item"><span class="consequence-emoji">' + c.emoji + '</span><span>' + c.text + '</span></li>';
        });

        html += '</ul>' +
            '<p class="consequences-outro">The music industry doesn\'t hand out safety nets. You just played without one.</p>' +
            '</div>';

        el.innerHTML = html;
    }

    // -------- SIDE-BY-SIDE COMPARISON --------
    function renderComparison(spent) {
        var compEl = $("#results-comparison");
        var rows = "";

        Object.keys(TIERS).forEach(function (tierKey) {
            var t = TIERS[tierKey];
            var isCurrentTier = tierKey === state.tier;
            var diff = t.budget - spent;
            var pctUsed = Math.min((spent / t.budget) * 100, 100);

            var statusClass, statusText;
            if (diff >= 0) {
                statusClass = "green";
                statusText = "+$" + diff.toLocaleString() + " left";
            } else {
                statusClass = "red";
                statusText = "-$" + Math.abs(diff).toLocaleString() + " over";
            }

            rows += '<div class="comparison-row' + (isCurrentTier ? ' current' : '') + '">' +
                '<div class="comparison-info">' +
                '<span class="comparison-tier-name">' + t.label + '</span>' +
                '<span class="comparison-budget">$' + t.budget.toLocaleString() + ' budget</span>' +
                '</div>' +
                '<div class="comparison-visual">' +
                '<div class="comparison-bar-bg">' +
                '<div class="comparison-bar-fill" style="width:' + pctUsed + '%"></div>' +
                '</div>' +
                '<span class="comparison-status ' + statusClass + '">' + statusText + '</span>' +
                '</div>' +
                (isCurrentTier ? '<span class="comparison-you">← You</span>' : '') +
                '</div>';
        });

        compEl.innerHTML =
            '<h3>Same Show, Different Reality</h3>' +
            '<p class="comparison-intro">Your choices totaled <strong>$' + spent.toLocaleString() + '</strong>. Here\'s how each artist handles that bill:</p>' +
            '<div class="comparison-grid">' + rows + '</div>';
    }

    // -------- TIME VS MONEY CHART --------
    function renderTimeVsMoney(spent, avgHours) {
        var chartEl = $("#results-chart");

        // Approximate what other tiers would experience
        var data = [];
        var tierKeys = ["working", "successful", "trustfund"];
        var tierLabels = ["Working Class", "Successful", "Trust Fund"];
        var hourMultipliers = { working: 1.6, successful: 1.0, trustfund: 0.4 };

        tierKeys.forEach(function (tk, i) {
            var isMe = tk === state.tier;
            var hrs = isMe ? avgHours : Math.round(avgHours * hourMultipliers[tk] / hourMultipliers[state.tier]);
            hrs = Math.max(8, hrs);
            data.push({
                tier: tierLabels[i],
                hours: isMe ? avgHours : hrs,
                budget: TIERS[tk].budget,
                isCurrent: isMe
            });
        });

        var maxHours = Math.max.apply(null, data.map(function (d) { return d.hours; }));

        var html = '<h3>Time vs. Money</h3>' +
            '<p class="chart-intro">The same quality show costs different things — not just dollars, but <strong>life hours</strong>.</p>' +
            '<div class="chart-grid">';

        data.forEach(function (d) {
            var hPct = Math.min((d.hours / (maxHours + 5)) * 100, 95);
            var mPct = Math.min((d.budget / 10000) * 100, 100);

            html += '<div class="chart-row' + (d.isCurrent ? ' current' : '') + '">' +
                '<div class="chart-label">' + d.tier +
                (d.isCurrent ? ' <span class="chart-you">(You)</span>' : '') +
                '</div>' +
                '<div class="chart-bars">' +
                '<div class="chart-bar-row">' +
                '<span class="chart-bar-icon">⏱</span>' +
                '<div class="chart-bar-track">' +
                '<div class="chart-bar hours-bar" style="width:' + hPct + '%"></div>' +
                '</div>' +
                '<span class="chart-bar-val">' + d.hours + ' hrs</span>' +
                '</div>' +
                '<div class="chart-bar-row">' +
                '<span class="chart-bar-icon">💰</span>' +
                '<div class="chart-bar-track">' +
                '<div class="chart-bar money-bar" style="width:' + mPct + '%"></div>' +
                '</div>' +
                '<span class="chart-bar-val">$' + d.budget.toLocaleString() + '</span>' +
                '</div>' +
                '</div>' +
                '</div>';
        });

        html += '</div>';
        chartEl.innerHTML = html;
    }

    // -------- DAY IN THE LIFE TIMELINE --------
    function renderTimeline() {
        var tier = state.tier;
        var activities = [];

        if (tier === "working") {
            activities = [
                { time: "6:00 AM", text: "Alarm goes off. Day job in 30 minutes.", icon: "⏰" },
                { time: "7:00 AM", text: "Clock in at work. 8 hours to go.", icon: "💼" },
                { time: "3:30 PM", text: "Rush out. Pick up gear from the storage unit across town.", icon: "🏃" },
            ];
            if (state.selections.promo && state.selections.promo.level === "low") {
                activities.push({ time: "4:15 PM", text: "Staple flyers to every telephone pole on the way.", icon: "📋" });
            }
            activities.push(
                { time: "5:00 PM", text: "Load gear into a borrowed car. Two trips.", icon: "🚗" },
                { time: "6:00 PM", text: "Arrive at venue. Haul everything inside yourself.", icon: "🏟️" },
                { time: "7:00 PM", text: "Soundcheck. You're also the sound engineer tonight.", icon: "🎛️" },
                { time: "8:30 PM", text: "Doors open. You're selling merch until showtime.", icon: "👕" },
                { time: "9:30 PM", text: "You play your heart out. 45 minutes of pure energy.", icon: "🎸" },
                { time: "10:30 PM", text: "Load out. Break down everything. Alone.", icon: "📦" },
                { time: "11:30 PM", text: "Drive gear back to storage. Grab gas station food.", icon: "🌙" },
                { time: "12:30 AM", text: "Collapse into bed. Work starts again in 6 hours.", icon: "😴" }
            );
        } else if (tier === "successful") {
            activities = [
                { time: "10:00 AM", text: "Wake up. Check socials — the ad campaign is running.", icon: "📱" },
                { time: "11:30 AM", text: "Call with the sound tech about tonight's setup.", icon: "🎛️" },
                { time: "1:00 PM", text: "Quick rehearsal at the practice space.", icon: "🎸" },
                { time: "3:00 PM", text: "Gear transport handled by the van service.", icon: "🚐" },
                { time: "4:30 PM", text: "Arrive at venue. Sound tech starts setting up.", icon: "🏟️" },
                { time: "5:30 PM", text: "Soundcheck. You focus only on your performance.", icon: "🎤" },
                { time: "7:00 PM", text: "Dinner break. Actually eat a real meal.", icon: "🍽️" },
                { time: "8:30 PM", text: "Doors open. A friend handles merch.", icon: "👕" },
                { time: "9:30 PM", text: "Full set. 60 minutes of earned stage time.", icon: "🎸" },
                { time: "11:00 PM", text: "Load out with the band. Quick and practiced.", icon: "📦" },
                { time: "12:00 AM", text: "Home by midnight. Not bad.", icon: "🏠" }
            ];
        } else {
            activities = [
                { time: "12:00 PM", text: "Wake up naturally. Check in with your manager.", icon: "📱" },
                { time: "1:00 PM", text: "Brunch. PR team sent over the talking points.", icon: "🥂" },
                { time: "3:00 PM", text: "Quick press interview via video call from the couch.", icon: "📰" },
                { time: "5:00 PM", text: "Driver takes you to the venue.", icon: "🚘" },
                { time: "5:30 PM", text: "Arrive. Crew has everything set up already.", icon: "🏟️" },
                { time: "6:00 PM", text: "Quick soundcheck. Your engineer handles the rest.", icon: "🎛️" },
                { time: "7:00 PM", text: "Green room. Catered dinner with the band.", icon: "🍽️" },
                { time: "8:30 PM", text: "Quick meet‑and‑greet. Photos handled.", icon: "📸" },
                { time: "9:00 PM", text: "The show. Full production — lights, sound, visuals.", icon: "✨" },
                { time: "10:30 PM", text: "Set ends. Your crew breaks everything down.", icon: "📦" },
                { time: "11:00 PM", text: "Driver takes you home. You post a story on the ride.", icon: "🏠" }
            ];
        }

        var timelineEl = $("#results-timeline");
        var html = '<h3>A Day in Your Life</h3>' +
            '<p class="timeline-intro">Here\'s what show day looked like as a <strong>' + TIERS[tier].label + '</strong>:</p>' +
            '<div class="timeline">';

        activities.forEach(function (a, i) {
            html += '<div class="timeline-item fade-in-up delay-' + Math.min(i % 5 + 1, 5) + '">' +
                '<div class="timeline-dot"></div>' +
                '<div class="timeline-marker">' +
                '<span class="timeline-icon">' + a.icon + '</span>' +
                '</div>' +
                '<div class="timeline-content">' +
                '<span class="timeline-time">' + a.time + '</span>' +
                '<p class="timeline-text">' + a.text + '</p>' +
                '</div>' +
                '</div>';
        });

        html += '</div>';
        timelineEl.innerHTML = html;
    }

    // -------- CONFETTI --------
    function launchConfetti() {
        var emojis = ["🎸", "🎵", "🎶", "🎤", "🔥", "✨", "🎉", "💥"];
        var container = document.createElement("div");
        container.className = "confetti-container";
        document.body.appendChild(container);

        for (var i = 0; i < 30; i++) {
            var particle = document.createElement("span");
            particle.className = "confetti-particle";
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.left = Math.random() * 100 + "%";
            particle.style.animationDelay = (Math.random() * 2) + "s";
            particle.style.animationDuration = (2 + Math.random() * 3) + "s";
            container.appendChild(particle);
        }

        setTimeout(function () { container.remove(); }, 6000);
    }

    // -------- SHARE RESULTS --------
    function shareResults(spent, remaining, avgHours) {
        var tierLabel = TIERS[state.tier].label;
        var shareText = "🎸 I put on a show as a " + tierLabel + "!\n" +
            "💰 Budget: $" + state.budget.toLocaleString() + "\n" +
            "💸 Spent: $" + spent.toLocaleString() + "\n" +
            "⏱ Time: ~" + avgHours + " hours\n" +
            "👏 Crowd Reaction: " + state.audienceScore + "/100\n\n" +
            "Think you could do better? Try the Show Budget Game!";

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(function () {
                var btn = $("#btn-share");
                btn.textContent = "Copied to clipboard! 📋";
                btn.classList.add("copied");
                setTimeout(function () {
                    btn.textContent = "Share Results 📤";
                    btn.classList.remove("copied");
                }, 2500);
            });
        } else {
            // Fallback
            window.prompt("Copy this text to share:", shareText);
        }
    }

    // -------- RESULTS --------
    function showResults() {
        var baseCost = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
        var spent = baseCost + state.eventCostImpact;
        var remaining = state.budget - spent;

        var minHours = 0;
        var maxHours = 0;
        Object.values(state.selections).forEach(function (o) {
            minHours += o.hours[0];
            maxHours += o.hours[1];
        });
        minHours += state.eventHoursImpact;
        maxHours += state.eventHoursImpact;
        var avgHours = Math.round((minHours + maxHours) / 2);

        var overBudget = spent > state.budget;
        var underHalf = spent <= state.budget * 0.5;
        var outcomeEmoji, outcomeTitle, outcomeText;

        if (overBudget) {
            outcomeEmoji = "💸";
            outcomeTitle = "Over Budget!";
            outcomeText = "You spent <strong>$" + spent.toLocaleString() + "</strong> — that's <strong>$" + Math.abs(remaining).toLocaleString() + "</strong> over your <strong>$" + state.budget.toLocaleString() + "</strong> budget. The show might be incredible, but the bill is going to hurt. Sometimes the art costs more than you have.";
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

        // Audience reaction
        state.audienceScore = calculateAudienceReaction();
        renderAudienceReaction();

        // Consequences (only for working class over budget)
        renderConsequences(overBudget ? Math.abs(remaining) : 0);

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

        // Add event costs to breakdown
        if (state.eventCostImpact > 0 || state.eventHoursImpact > 0) {
            rows += "<tr class='event-row'>" +
                "<td>⚡ Random Events</td>" +
                "<td>Life happened</td>" +
                "<td>" + (state.eventCostImpact > 0 ? "+$" + state.eventCostImpact.toLocaleString() : "—") + "</td>" +
                "<td>" + (state.eventHoursImpact > 0 ? "+" + state.eventHoursImpact + " hrs" : "—") + "</td>" +
                "</tr>";
        }

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

        // Time vs Money chart
        renderTimeVsMoney(spent, avgHours);

        // Side-by-side comparison
        renderComparison(spent);

        // Day in the Life timeline
        renderTimeline();

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
        launchConfetti();
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
            state.events = [];
            state.eventCostImpact = 0;
            state.eventHoursImpact = 0;

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

    // See results → goes to random events first
    $("#btn-see-results").addEventListener("click", function () {
        triggerRandomEvents();
    });

    // Continue from events to results
    $("#btn-continue-results").addEventListener("click", function () {
        showResults();
    });

    // Share
    $("#btn-share").addEventListener("click", function () {
        var baseCost = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
        var spent = baseCost + state.eventCostImpact;
        var remaining = state.budget - spent;
        var minH = 0, maxH = 0;
        Object.values(state.selections).forEach(function (o) { minH += o.hours[0]; maxH += o.hours[1]; });
        var avgH = Math.round((minH + maxH) / 2) + state.eventHoursImpact;
        shareResults(spent, remaining, avgH);
    });

    // Replay
    $("#btn-replay").addEventListener("click", function () {
        state.tier = null;
        state.budget = 0;
        state.selections = {};
        state.events = [];
        state.eventCostImpact = 0;
        state.eventHoursImpact = 0;
        state.audienceScore = 0;
        $$(".tier-card").forEach(function (c) { c.classList.remove("selected"); });
        showScreen("landing");
    });
})();
