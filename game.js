/* ================================================
   StageFinder — V3  •  Venue-Booking Platform
   Game logic adapted for new layout
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
                { level: "low", label: "Che Cafe Collective", cost: 150, hours: [8, 10], desc: "DIY all-ages space in La Jolla. You haul gear, set up the PA, run the door, and clean up after. Pure grassroots.", img: "assets/Che Cafe.jpeg", cap: 150 },
                { level: "mid", label: "Belly Up Tavern", cost: 850, hours: [5, 7], desc: "Legendary room in Solana Beach. Real stage, real sound system. They handle most logistics — you just bring the music.", img: "assets/Belly Up Tavern.jpg", cap: 600 },
                { level: "mid-high", label: "House of Blues San Diego", cost: 1200, hours: [3, 5], desc: "Downtown SD institution. Professional production, dedicated sound and lighting crew. A big step up in exposure.", img: "assets/House of Blues.jpg", cap: 1100 },
                { level: "high", label: "The Conrad / La Jolla Music Society", cost: 1800, hours: [2, 4], desc: "Premium concert hall in La Jolla. Full production, catered green room, 1,400 seats. Just show up and play.", img: "assets/The Conrad.jpeg", cap: 1400 },
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
        tier: "working",
        budget: 500,
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
        booking: $("#screen-booking"),
    };

    // Dynamic screen registry
    var dynamicScreens = {};

    // -------- NAVIGATION --------
    var staticInfoScreens = ["for-artists", "tension"];

    function showScreen(name) {
        // Hide all static screens
        $("#screen-landing").classList.remove("active");
        $("#screen-booking").classList.remove("active");
        staticInfoScreens.forEach(function (s) {
            var el = $("#screen-" + s);
            if (el) el.classList.remove("active");
        });
        // Hide any dynamic screens
        Object.values(dynamicScreens).forEach(function (s) { s.classList.remove("active"); });

        if (name === "landing") {
            $("#screen-landing").classList.add("active");
        } else if (name === "booking") {
            $("#screen-booking").classList.add("active");
        } else if (staticInfoScreens.indexOf(name) !== -1) {
            var el = $("#screen-" + name);
            if (el) el.classList.add("active");
        } else if (dynamicScreens[name]) {
            dynamicScreens[name].classList.add("active");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // -------- SIDEBAR UPDATE --------
    function updateSidebar() {
        var spent = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
        var remaining = state.budget - spent;
        var pct = Math.min((spent / state.budget) * 100, 100);

        $("#sidebar-total-budget").textContent = "$" + state.budget.toLocaleString();
        $("#sidebar-spent").textContent = "$" + spent.toLocaleString();
        $("#sidebar-remaining").textContent = (remaining >= 0 ? "" : "-") + "$" + Math.abs(remaining).toLocaleString();
        $("#sidebar-pct").textContent = Math.round(pct) + "%";

        var remainEl = $("#sidebar-remaining");
        remainEl.className = "sidebar-val remaining " + (remaining >= 0 ? "green" : "red");

        var bar = $("#sidebar-bar");
        bar.style.width = pct + "%";

        if (spent > state.budget) {
            bar.classList.add("over");
            bar.classList.remove("warning");
            var card = $(".sidebar-card");
            card.classList.add("shake");
            setTimeout(function () { card.classList.remove("shake"); }, 600);
        } else if (pct >= 80) {
            bar.classList.add("warning");
            bar.classList.remove("over");
        } else {
            bar.classList.remove("over", "warning");
        }

        // Update selections summary
        var selEl = $("#sidebar-selections");
        selEl.innerHTML = "";
        CATEGORIES.forEach(function (cat) {
            var sel = state.selections[cat.id];
            if (sel) {
                var div = document.createElement("div");
                div.className = "sidebar-sel-item";
                div.innerHTML = '<span>' + cat.emoji + ' ' + cat.name + '</span><span class="sel-cost">$' + sel.cost.toLocaleString() + '</span>';
                selEl.appendChild(div);
            }
        });

        var allSelected = CATEGORIES.every(function (c) { return state.selections[c.id]; });
        $("#btn-see-results").disabled = !allSelected;
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
                '<span class="category-hours-badge">' + minH + '–' + maxH + ' hrs</span>' +
                '</div>' +
                '<div class="option-grid' + (cat.id === "venue" ? " venue-option-grid" : "") + '">' +
                cat.options.map(function (opt) {
                    var tierLabel = opt.level === "low" ? "Budget" : opt.level === "mid" ? "Standard" : opt.level === "mid-high" ? "Mid-Range" : "Premium";
                    var venueExtra = "";
                    if (cat.id === "venue" && opt.img) {
                        venueExtra = '<div class="option-venue-img"><img src="' + opt.img + '" alt="' + opt.label + '"><span class="option-venue-cap">' + opt.cap.toLocaleString() + ' cap</span></div>';
                    }
                    return '<button class="option-btn' + (cat.id === "venue" ? " venue-option-btn" : "") + '" data-cat="' + cat.id + '" data-level="' + opt.level + '">' +
                        venueExtra +
                        '<div class="option-tier-label">' + tierLabel + '</div>' +
                        '<div class="option-label">' + opt.label + '</div>' +
                        '<div class="option-cost">$' + opt.cost.toLocaleString() + '</div>' +
                        '<div class="option-desc">' + opt.desc + '</div>' +
                        '<div class="option-hours">⏱ ' + opt.hours[0] + '–' + opt.hours[1] + ' hrs</div>' +
                        '</button>';
                }).join("") +
                '</div>';

            container.appendChild(card);
        });

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

        btn.classList.add("just-selected");
        setTimeout(function () { btn.classList.remove("just-selected"); }, 350);

        updateSidebar();
    }

    // -------- DYNAMIC SCREEN BUILDERS --------
    function createBookingConfirmationScreen() {
        if (dynamicScreens.confirmation) { dynamicScreens.confirmation.remove(); }

        var spent = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
        var remaining = state.budget - spent;
        var overBudget = spent > state.budget;

        var rowsHTML = "";
        CATEGORIES.forEach(function (cat) {
            var sel = state.selections[cat.id];
            var tierLabel = sel.level === "low" ? "Budget" : sel.level === "mid" ? "Standard" : "Premium";
            rowsHTML +=
                '<div class="conf-row">' +
                '<span class="conf-row-cat">' + cat.emoji + ' ' + cat.name + '</span>' +
                '<span class="conf-row-choice">' + tierLabel + ' &mdash; ' + sel.desc.split('.')[0] + '</span>' +
                '<span class="conf-row-cost">$' + sel.cost.toLocaleString() + '</span>' +
                '</div>';
        });

        var sec = document.createElement("section");
        sec.id = "screen-confirmation";
        sec.className = "screen";
        sec.innerHTML =
            '<div class="noise-overlay"></div>' +
            '<div class="container conf-container">' +
            '<div class="conf-header">' +
            '<span class="conf-badge">&#128203; BOOKING SUMMARY</span>' +
            '<h2 class="conf-title">Your Booking Is Set</h2>' +
            '<p class="conf-subtitle">Here\'s what you\'ve committed to as a <strong>' + TIERS[state.tier].label + '</strong>. Get ready &mdash; show night is about to start.</p>' +
            '</div>' +
            '<div class="conf-receipt">' +
            '<div class="conf-rows">' + rowsHTML + '</div>' +
            '<div class="conf-divider"></div>' +
            '<div class="conf-totals">' +
            '<div class="conf-total-row"><span>Budget</span><span class="conf-total-val">$' + state.budget.toLocaleString() + '</span></div>' +
            '<div class="conf-total-row"><span>Total Committed</span><span class="conf-total-val ' + (overBudget ? 'red' : '') + '">$' + spent.toLocaleString() + '</span></div>' +
            '<div class="conf-total-row conf-remaining-row"><span>Remaining</span><span class="conf-total-val ' + (overBudget ? 'red' : 'green') + '">' + (overBudget ? '-' : '+') + '$' + Math.abs(remaining).toLocaleString() + '</span></div>' +
            '</div>' +
            '</div>' +
            '<p class="conf-cta-hint">&#128262; It\'s show night. Expect the unexpected.</p>' +
            '<button id="btn-goto-events" class="btn btn-cta-full">Head to Show Night &#8594;</button>' +
            '</div>';

        document.body.insertBefore(sec, document.querySelector("script"));
        dynamicScreens.confirmation = sec;

        sec.querySelector("#btn-goto-events").addEventListener("click", function () {
            triggerRandomEvents();
        });
    }

    function createEventsScreen() {
        if (dynamicScreens.events) { dynamicScreens.events.remove(); }

        var sec = document.createElement("section");
        sec.id = "screen-events";
        sec.className = "screen";
        sec.innerHTML =
            '<div class="noise-overlay"></div>' +
            '<div class="container events-container">' +
            '<div class="events-header">' +
            '<span class="events-badge">⚡ BOOKING ALERT</span>' +
            '<h2 class="events-title">Something Came Up</h2>' +
            '</div>' +
            '<p class="events-subtitle">Real life doesn\'t care about your booking. Here\'s what happened.</p>' +
            '<div id="events-list" class="events-list"></div>' +
            '<div id="events-impact" class="events-impact"></div>' +
            '<button id="btn-continue-results" class="btn btn-cta-full">See How the Show Went &#8594;</button>' +
            '</div>';

        document.body.insertBefore(sec, document.querySelector("script"));
        dynamicScreens.events = sec;

        sec.querySelector("#btn-continue-results").addEventListener("click", function () {
            showResults();
        });
    }

    function createResultsScreen() {
        if (dynamicScreens.results) { dynamicScreens.results.remove(); }

        var sec = document.createElement("section");
        sec.id = "screen-results";
        sec.className = "screen";
        sec.innerHTML =
            '<div class="noise-overlay"></div>' +
            '<div class="container results-container">' +
            '<div class="confirmation-header">' +
            '<div class="confirmation-badge" id="confirmation-badge">\u2713</div>' +
            '<h2 id="confirmation-title" class="confirmation-title">Show Ended</h2>' +
            '<p id="confirmation-subtitle" class="confirmation-subtitle"></p>' +
            '</div>' +
            '<div class="results-grid">' +
            '<div class="results-card"><p class="results-card-label">Total Spent</p><p id="results-spent" class="results-card-value">$0</p></div>' +
            '<div class="results-card"><p class="results-card-label">Budget</p><p id="results-budget" class="results-card-value">$500</p></div>' +
            '<div class="results-card"><p class="results-card-label">Remaining</p><p id="results-remaining" class="results-card-value">$0</p></div>' +
            '<div class="results-card"><p class="results-card-label">Time Invested</p><p id="results-hours" class="results-card-value">0 hrs</p></div>' +
            '</div>' +
            '<div id="results-audience" class="results-audience"></div>' +
            '<div id="results-consequences" class="results-consequences"></div>' +
            '<div id="results-breakdown" class="results-breakdown"></div>' +
            '<div id="results-chart" class="results-chart-section"></div>' +
            '<div id="results-comparison" class="results-comparison-section"></div>' +
            '<div id="results-timeline" class="results-timeline-section"></div>' +
            '<div id="results-narrative" class="results-narrative"></div>' +
            '<div class="results-actions">' +
            '<button id="btn-share" class="btn btn-ghost">Share Results \ud83d\udce4</button>' +
            '<button id="btn-replay" class="btn btn-primary">Book Another Show</button>' +
            '</div></div>';

        document.body.insertBefore(sec, document.querySelector("script"));
        dynamicScreens.results = sec;

        sec.querySelector("#btn-share").addEventListener("click", function () {
            var baseCost = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
            var spent = baseCost + state.eventCostImpact;
            var remaining = state.budget - spent;
            var minH = 0, maxH = 0;
            Object.values(state.selections).forEach(function (o) { minH += o.hours[0]; maxH += o.hours[1]; });
            var avgH = Math.round((minH + maxH) / 2) + state.eventHoursImpact;
            shareResults(spent, remaining, avgH);
        });

        sec.querySelector("#btn-replay").addEventListener("click", function () {
            state.tier = "working";
            state.budget = 500;
            state.selections = {};
            state.events = [];
            state.eventCostImpact = 0;
            state.eventHoursImpact = 0;
            state.audienceScore = 0;
            // Remove dynamic screens from DOM
            Object.values(dynamicScreens).forEach(function (s) { s.remove(); });
            dynamicScreens = {};
            // Reset filter buttons
            $$("[data-tier]").forEach(function (b) {
                b.classList.remove("active");
                if (b.classList.contains("filter-btn") && b.dataset.tier === "working") b.classList.add("active");
            });
            showScreen("landing");
        });
    }

    // -------- RANDOM EVENTS --------
    function triggerRandomEvents() {
        createEventsScreen();

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

        var impactEl = $("#events-impact");
        var summaryParts = [];
        if (state.eventCostImpact > 0) summaryParts.push("added <strong>$" + state.eventCostImpact + "</strong> to your costs");
        if (state.eventHoursImpact > 0) summaryParts.push("ate <strong>" + state.eventHoursImpact + " more hours</strong> of your time");

        var summaryText = summaryParts.length > 0
            ? "These curveballs " + summaryParts.join(" and ") + "."
            : "Somehow, you dodged every bullet. Lucky.";

        impactEl.innerHTML = '<p>' + summaryText + '</p>';
        showScreen("events");
    }

    // -------- AUDIENCE REACTION --------
    function calculateAudienceReaction() {
        var base = state.tier === "working" ? 55 : state.tier === "successful" ? 45 : 28;
        Object.values(state.selections).forEach(function (sel) {
            if (sel.level === "low") base += 8;
            else if (sel.level === "mid") base += 5;
            else base += 2;
        });
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
            '<span>🦗 Dead</span><span>🤯 Legendary</span>' +
            '</div></div>' +
            '<span class="audience-score">' + score + '<small>/100</small></span>' +
            '</div>' +
            '<p class="audience-label">' + label + '</p>' +
            '<p class="audience-desc">' + desc + '</p>' +
            '</div>';

        setTimeout(function () {
            var fill = el.querySelector(".audience-meter-fill");
            if (fill) fill.style.width = score + "%";
        }, 300);
    }

    // -------- CONSEQUENCES --------
    function renderConsequences(overAmount) {
        var el = $("#results-consequences");
        if (overAmount <= 0 || state.tier !== "working") { el.innerHTML = ""; return; }

        var triggered = CONSEQUENCES.filter(function (c) { return overAmount >= c.threshold; });
        if (triggered.length === 0) { el.innerHTML = ""; return; }

        var html = '<div class="consequences-card">' +
            '<h3>💳 The Real Cost</h3>' +
            '<p class="consequences-intro">Going <strong>$' + overAmount.toLocaleString() + '</strong> over budget as a Working Class Artist means:</p>' +
            '<ul class="consequences-list">';

        triggered.forEach(function (c) {
            html += '<li class="consequence-item"><span class="consequence-emoji">' + c.emoji + '</span><span>' + c.text + '</span></li>';
        });

        html += '</ul><p class="consequences-outro">The music industry doesn\'t hand out safety nets. You just played without one.</p></div>';
        el.innerHTML = html;
    }

    // -------- COMPARISON --------
    function renderComparison(spent) {
        var compEl = $("#results-comparison");
        var rows = "";
        Object.keys(TIERS).forEach(function (tierKey) {
            var t = TIERS[tierKey];
            var isCurrentTier = tierKey === state.tier;
            var diff = t.budget - spent;
            var pctUsed = Math.min((spent / t.budget) * 100, 100);

            var statusClass = diff >= 0 ? "green" : "red";
            var statusText = diff >= 0 ? "+$" + diff.toLocaleString() + " left" : "-$" + Math.abs(diff).toLocaleString() + " over";

            rows += '<div class="comparison-row' + (isCurrentTier ? ' current' : '') + '">' +
                '<div class="comparison-info">' +
                '<span class="comparison-tier-name">' + t.label + '</span>' +
                '<span class="comparison-budget">$' + t.budget.toLocaleString() + ' budget</span>' +
                '</div>' +
                '<div class="comparison-visual">' +
                '<div class="comparison-bar-bg"><div class="comparison-bar-fill" style="width:' + pctUsed + '%"></div></div>' +
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

    // -------- TIME VS MONEY --------
    function renderTimeVsMoney(spent, avgHours) {
        var chartEl = $("#results-chart");
        var data = [];
        var tierKeys = ["working", "successful", "trustfund"];
        var tierLabels = ["Working Class", "Successful", "Trust Fund"];
        var hourMultipliers = { working: 1.6, successful: 1.0, trustfund: 0.4 };

        tierKeys.forEach(function (tk, i) {
            var isMe = tk === state.tier;
            var hrs = isMe ? avgHours : Math.round(avgHours * hourMultipliers[tk] / hourMultipliers[state.tier]);
            hrs = Math.max(8, hrs);
            data.push({ tier: tierLabels[i], hours: isMe ? avgHours : hrs, budget: TIERS[tk].budget, isCurrent: isMe });
        });

        var maxHours = Math.max.apply(null, data.map(function (d) { return d.hours; }));
        var html = '<h3>Time vs. Money</h3>' +
            '<p class="chart-intro">The same quality show costs different things — not just dollars, but <strong>life hours</strong>.</p>' +
            '<div class="chart-grid">';

        data.forEach(function (d) {
            var hPct = Math.min((d.hours / (maxHours + 5)) * 100, 95);
            var mPct = Math.min((d.budget / 10000) * 100, 100);
            html += '<div class="chart-row' + (d.isCurrent ? ' current' : '') + '">' +
                '<div class="chart-label">' + d.tier + (d.isCurrent ? ' <span class="chart-you">(You)</span>' : '') + '</div>' +
                '<div class="chart-bars">' +
                '<div class="chart-bar-row"><span class="chart-bar-icon">⏱</span><div class="chart-bar-track"><div class="chart-bar hours-bar" style="width:' + hPct + '%"></div></div><span class="chart-bar-val">' + d.hours + ' hrs</span></div>' +
                '<div class="chart-bar-row"><span class="chart-bar-icon">💰</span><div class="chart-bar-track"><div class="chart-bar money-bar" style="width:' + mPct + '%"></div></div><span class="chart-bar-val">$' + d.budget.toLocaleString() + '</span></div>' +
                '</div></div>';
        });

        html += '</div>';
        chartEl.innerHTML = html;
    }

    // -------- TIMELINE (Calendar Block View) --------
    function renderTimeline() {
        var tier = state.tier;
        var activities = [];

        if (tier === "working") {
            activities = [
                { time: "6:00 AM", text: "Alarm goes off. Day job in 30 minutes.", icon: "⏰" },
                { time: "7:00 AM", text: "Clock in at work. 8 hours to go.", icon: "💼" },
                { time: "3:30 PM", text: "Rush out. Pick up gear from storage across town.", icon: "🏃" },
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
                { time: "8:30 PM", text: "Quick meet\u2011and\u2011greet. Photos handled.", icon: "📸" },
                { time: "9:00 PM", text: "The show. Full production \u2014 lights, sound, visuals.", icon: "✨" },
                { time: "10:30 PM", text: "Set ends. Your crew breaks everything down.", icon: "📦" },
                { time: "11:00 PM", text: "Driver takes you home. You post a story on the ride.", icon: "🏠" }
            ];
        }

        // Parse "H:MM AM/PM" into minutes from midnight
        function toMins(timeStr) {
            var m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!m) return 0;
            var h = parseInt(m[1]), min = parseInt(m[2]);
            var pm = m[3].toUpperCase() === "PM";
            if (pm && h !== 12) h += 12;
            if (!pm && h === 12) h = 0;
            return h * 60 + min;
        }

        var actMins = activities.map(function (a) { return toMins(a.time); });
        // Handle next-day wrap-around (e.g. 12:30 AM after 11:30 PM)
        for (var idx = 1; idx < actMins.length; idx++) {
            if (actMins[idx] <= actMins[idx - 1]) actMins[idx] += 1440;
        }

        var firstMin = actMins[0];
        var lastMin = actMins[actMins.length - 1] + 40;
        var PX_PER_HR = 56;
        var firstHour = Math.floor(firstMin / 60);
        var lastHour = Math.ceil(lastMin / 60);
        var totalH = (lastHour - firstHour) * PX_PER_HR;

        function fmtHour(h) {
            var d = h % 24;
            if (d === 0) return "12 AM";
            if (d < 12) return d + " AM";
            if (d === 12) return "12 PM";
            return (d - 12) + " PM";
        }

        function blockClass(icon) {
            if (["🎸", "🎤", "✨"].indexOf(icon) !== -1) return "cal-block--perf";
            if (icon === "💼") return "cal-block--work";
            if (["⏰", "😴", "🌙", "🏠", "🍽️", "🥂"].indexOf(icon) !== -1) return "cal-block--rest";
            return "cal-block--prep";
        }

        // Build hour label column
        var hoursHTML = "";
        for (var hh = firstHour; hh <= lastHour; hh++) {
            hoursHTML += '<div class="cal-hour-row" style="top:' + ((hh - firstHour) * PX_PER_HR) + 'px">' +
                '<span class="cal-hour-label">' + fmtHour(hh) + '</span></div>';
        }

        // Build gridlines + event blocks for events column
        var eventsHTML = "";
        for (var gg = firstHour; gg <= lastHour; gg++) {
            eventsHTML += '<div class="cal-gridline" style="top:' + ((gg - firstHour) * PX_PER_HR) + 'px"></div>';
        }
        activities.forEach(function (a, i) {
            var startM = actMins[i];
            var endM = (i < actMins.length - 1) ? actMins[i + 1] : startM + 40;
            var durMins = endM - startM;
            var topPx = (startM - firstMin) / 60 * PX_PER_HR;
            var heightPx = Math.max(32, durMins / 60 * PX_PER_HR);
            eventsHTML +=
                '<div class="cal-block ' + blockClass(a.icon) + '" style="top:' + topPx.toFixed(0) + 'px; height:' + heightPx.toFixed(0) + 'px">' +
                '<div class="cal-block-header">' +
                '<span class="cal-block-time">' + a.time + '</span>' +
                '<span class="cal-block-icon">' + a.icon + '</span>' +
                '</div>' +
                '<p class="cal-block-text">' + a.text + '</p>' +
                '</div>';
        });

        var timelineEl = $("#results-timeline");
        timelineEl.innerHTML =
            '<h3>A Day in Your Life</h3>' +
            '<p class="timeline-intro">Show day as a <strong>' + TIERS[tier].label + '</strong>. Block height = time spent on each activity.</p>' +
            '<div class="cal-legend">' +
            '<div class="cal-legend-item"><span class="cal-legend-dot cal-block--perf"></span>Performance</div>' +
            '<div class="cal-legend-item"><span class="cal-legend-dot cal-block--work"></span>Day Job</div>' +
            '<div class="cal-legend-item"><span class="cal-legend-dot cal-block--prep"></span>Hustle / Setup</div>' +
            '<div class="cal-legend-item"><span class="cal-legend-dot cal-block--rest"></span>Rest / Meals</div>' +
            '</div>' +
            '<div class="cal-wrapper">' +
            '<div class="cal-time-col" style="height:' + totalH + 'px">' + hoursHTML + '</div>' +
            '<div class="cal-events-col" style="height:' + totalH + 'px">' + eventsHTML + '</div>' +
            '</div>';
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

    // -------- SHARE --------
    function shareResults(spent, remaining, avgHours) {
        var tierLabel = TIERS[state.tier].label;
        var shareText = "🎸 I put on a show as a " + tierLabel + "!\n" +
            "💰 Budget: $" + state.budget.toLocaleString() + "\n" +
            "💸 Spent: $" + spent.toLocaleString() + "\n" +
            "⏱ Time: ~" + avgHours + " hours\n" +
            "👏 Crowd Reaction: " + state.audienceScore + "/100\n\n" +
            "Think you could do better? Try StageFinder!";

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(function () {
                var btn = $("#btn-share");
                btn.textContent = "Copied! 📋";
                btn.classList.add("copied");
                setTimeout(function () { btn.textContent = "Share Results 📤"; btn.classList.remove("copied"); }, 2500);
            });
        } else {
            window.prompt("Copy to share:", shareText);
        }
    }

    // -------- RESULTS --------
    function showResults() {
        createResultsScreen();

        var baseCost = Object.values(state.selections).reduce(function (sum, o) { return sum + o.cost; }, 0);
        var spent = baseCost + state.eventCostImpact;
        var remaining = state.budget - spent;

        var minHours = 0, maxHours = 0;
        Object.values(state.selections).forEach(function (o) {
            minHours += o.hours[0]; maxHours += o.hours[1];
        });
        minHours += state.eventHoursImpact;
        maxHours += state.eventHoursImpact;
        var avgHours = Math.round((minHours + maxHours) / 2);

        var overBudget = spent > state.budget;

        // Confirmation header
        var badge = $("#confirmation-badge");
        if (overBudget) {
            badge.textContent = "!";
            badge.className = "confirmation-badge over-budget";
            $("#confirmation-title").textContent = "Show Ended";
        } else {
            badge.textContent = "✓";
            badge.className = "confirmation-badge";
            $("#confirmation-title").textContent = "Show Ended";
        }

        var subText;
        if (overBudget) {
            subText = "You spent $" + spent.toLocaleString() + " — that's $" + Math.abs(remaining).toLocaleString() + " over your $" + state.budget.toLocaleString() + " budget. The show might be incredible, but the bill is going to hurt.";
        } else if (spent <= state.budget * 0.5) {
            subText = "You only spent $" + spent.toLocaleString() + " out of $" + state.budget.toLocaleString() + ". That's pure hustle — " + avgHours + " hours of sweat equity. The crowd doesn't care about your budget.";
        } else {
            subText = "You spent $" + spent.toLocaleString() + " of your $" + state.budget.toLocaleString() + " budget with $" + remaining.toLocaleString() + " left over. ~" + avgHours + " hours of your time went into this. A balanced approach.";
        }
        $("#confirmation-subtitle").textContent = subText;

        // Stats
        $("#results-spent").textContent = "$" + spent.toLocaleString();
        $("#results-spent").className = "results-card-value " + (overBudget ? "red" : "green");
        $("#results-budget").textContent = "$" + state.budget.toLocaleString();
        $("#results-remaining").textContent = (remaining >= 0 ? "+" : "-") + "$" + Math.abs(remaining).toLocaleString();
        $("#results-remaining").className = "results-card-value " + (remaining >= 0 ? "green" : "red");
        $("#results-hours").textContent = "~" + avgHours + " hrs";
        $("#results-hours").className = "results-card-value yellow";

        state.audienceScore = calculateAudienceReaction();
        renderAudienceReaction();
        renderConsequences(overBudget ? Math.abs(remaining) : 0);

        // Breakdown
        var rows = "";
        CATEGORIES.forEach(function (cat) {
            var sel = state.selections[cat.id];
            rows += "<tr><td>" + cat.emoji + " " + cat.name + "</td><td>" + sel.label + "</td><td>$" + sel.cost.toLocaleString() + "</td><td>" + sel.hours[0] + "–" + sel.hours[1] + " hrs</td></tr>";
        });
        if (state.eventCostImpact > 0 || state.eventHoursImpact > 0) {
            rows += "<tr class='event-row'><td>⚡ Random Events</td><td>Life happened</td><td>" + (state.eventCostImpact > 0 ? "+$" + state.eventCostImpact.toLocaleString() : "—") + "</td><td>" + (state.eventHoursImpact > 0 ? "+" + state.eventHoursImpact + " hrs" : "—") + "</td></tr>";
        }
        rows += "<tr><td colspan=\"2\"><strong>Total</strong></td><td><strong>$" + spent.toLocaleString() + "</strong></td><td><strong>" + minHours + "–" + maxHours + " hrs</strong></td></tr>";
        $("#results-breakdown").innerHTML = "<h3>Breakdown</h3><table class=\"breakdown-table\"><thead><tr><th>Category</th><th>Choice</th><th>Cost</th><th>Time</th></tr></thead><tbody>" + rows + "</tbody></table>";

        renderTimeVsMoney(spent, avgHours);
        renderComparison(spent);
        renderTimeline();

        // Narrative
        var tierKey = state.tier;
        var narrative = "";
        if (tierKey === "working") {
            narrative = overBudget
                ? "As a <strong>Working Class Artist</strong>, every dollar is earned through hours of labor. Going over budget means dipping into rent money, skipping meals, or borrowing from friends."
                : "As a <strong>Working Class Artist</strong>, you stretched every dollar and put in the hours. That's the reality: when you can't buy convenience, you trade time instead. The DIY path is exhausting, but it builds something money can't — authenticity and grit.";
        } else if (tierKey === "successful") {
            narrative = overBudget
                ? "Even a <strong>Successful Artist</strong> can overspend. $3,000 sounds like a lot until the costs stack up. This is the trap of the middle."
                : "As a <strong>Successful Artist</strong>, you had room to breathe. You could afford quality where it mattered and save where it didn't.";
        } else {
            narrative = overBudget
                ? "Even with a <strong>$10,000 Trust Fund</strong>, you managed to overshoot. That's impressive — and revealing."
                : "With a <strong>$10,000 Trust Fund</strong>, budget was never the challenge. The real question: did you appreciate what each dollar bought?";
        }
        $("#results-narrative").innerHTML = narrative;

        showScreen("results");
        launchConfetti();
    }

    // -------- EVENT LISTENERS --------

    // Helper: update active nav link
    function setActiveNav(id) {
        $$(".nav-link").forEach(function (l) { l.classList.remove("active"); });
        var el = $("#" + id);
        if (el) el.classList.add("active");
    }

    // Info page nav links
    $("#nav-find").addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav("nav-find");
        // Remove any dynamic screens and reset to landing
        Object.values(dynamicScreens).forEach(function (s) { s.remove(); });
        dynamicScreens = {};
        showScreen("landing");
    });

    $("#nav-artists").addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav("nav-artists");
        showScreen("for-artists");
    });

    $("#nav-tension").addEventListener("click", function (e) {
        e.preventDefault();
        setActiveNav("nav-tension");
        showScreen("tension");
    });

    // Back buttons on info pages
    $("#btn-back-artists").addEventListener("click", function () {
        setActiveNav("nav-find");
        showScreen("landing");
    });

    $("#btn-back-tension").addEventListener("click", function () {
        setActiveNav("nav-find");
        showScreen("landing");
    });

    // Search bar filter buttons (tier selection from hero)
    $$("[data-tier]").forEach(function (btn) {
        if (!btn.classList.contains("filter-btn") && !btn.classList.contains("tier-tab")) return;
        btn.addEventListener("click", function () {
            $$(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            var tierKey = btn.dataset.tier;
            state.tier = tierKey;
            state.budget = TIERS[tierKey].budget;
        });
    });

    // Search input: typewriter "San Diego" on focus
    (function () {
        var input = $("#search-input");
        if (!input) return;
        var target = "San Diego";
        var timer = null;
        var typed = false; // user hasn't manually typed

        input.addEventListener("focus", function () {
            if (input.value !== "" && input.value !== target) return; // user already typed something else
            input.value = "";
            typed = false;
            var i = 0;
            clearInterval(timer);
            timer = setInterval(function () {
                if (i < target.length) {
                    input.value += target[i];
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 60);
        });

        input.addEventListener("input", function () {
            // If user starts editing during or after typewriter, stop the animation
            if (timer) { clearInterval(timer); timer = null; }
            typed = true;
        });

        input.addEventListener("blur", function () {
            clearInterval(timer);
            // Clear only if it still shows the auto-typed text and user never changed it
            if (!typed && (input.value === target || input.value === "")) {
                input.value = "";
            }
        });
    })();

    // Search CTA → go to booking
    $("#btn-search").addEventListener("click", function () {
        state.selections = {};
        state.events = [];
        state.eventCostImpact = 0;
        state.eventHoursImpact = 0;

        // Sync tier tabs with selected filter
        $$(".tier-tab").forEach(function (t) {
            t.classList.remove("selected");
            if (t.dataset.tier === state.tier) t.classList.add("selected");
        });

        renderCategories();
        updateSidebar();
        showScreen("booking");
    });

    // "Start Planning" button in how-it-works section
    if ($("#btn-start")) {
        $("#btn-start").addEventListener("click", function () {
            state.selections = {};
            state.events = [];
            state.eventCostImpact = 0;
            state.eventHoursImpact = 0;

            $$(".tier-tab").forEach(function (t) {
                t.classList.remove("selected");
                if (t.dataset.tier === state.tier) t.classList.add("selected");
            });

            renderCategories();
            updateSidebar();
            showScreen("booking");
        });
    }

    // Tier tabs in sidebar
    $$(".tier-tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
            var tierKey = tab.dataset.tier;
            state.tier = tierKey;
            state.budget = TIERS[tierKey].budget;
            state.selections = {};

            $$(".tier-tab").forEach(function (t) { t.classList.remove("selected"); });
            tab.classList.add("selected");

            renderCategories();
            updateSidebar();
        });
    });

    // Back to landing (new search)
    $("#btn-change-search").addEventListener("click", function () {
        showScreen("landing");
    });

    // Complete Booking → show booking confirmation summary first
    $("#btn-see-results").addEventListener("click", function () {
        createBookingConfirmationScreen();
        showScreen("confirmation");
    });


    // Share + Replay are attached dynamically inside createResultsScreen()

    // Replay for landing nav (optional fallback — handled by dynamic screen)

})();
