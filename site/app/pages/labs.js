// Interactive practice labs. Each lab renders an animated exercise and calls onComplete(score 0-100).
import { h, icon, money, toast, modal, field, formData } from "../ui.js";

const shuffle = (items) => items.map(item => [Math.random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
const resultPanel = (score, lines, onComplete, retry) => {
  onComplete(score);
  return h("div", { class: `lab-result ${score >= 70 ? "good" : "warn"} pop` }, h("div", { class: "lab-score" }, h("strong", {}, `${score}`), h("span", {}, "/ 100")), h("ul", { class: "ticks" }, lines.map(([ok, text]) => h("li", { class: ok ? "" : "miss" }, icon(ok ? "check" : "close", 14), text))), retry ? h("button", { class: "button ghost small", type: "button", onClick: retry }, icon("refresh", 14), "Try again") : null);
};

// 01 Spreadsheets: clean a register, then summarise it.
function spreadsheetsLab(onComplete) {
  const rows = [
    { id: 1, date: "2026-11-02", region: "South", product: "Starter", revenue: "1250", issue: null },
    { id: 2, date: "03/11/2026", region: "North", product: "Pro", revenue: "2400", issue: "date" },
    { id: 3, date: "2026-11-03", region: "South", product: "Pro", revenue: "2,400", issue: "number" },
    { id: 4, date: "2026-11-03", region: "", product: "Starter", revenue: "1250", issue: "blank" },
    { id: 5, date: "2026-11-02", region: "South", product: "Starter", revenue: "1250", issue: "duplicate" },
    { id: 6, date: "2026-11-04", region: "West", product: "Pro ", revenue: "2400", issue: "spaces" },
  ];
  const fixes = [["date", "Normalise date to YYYY-MM-DD"], ["number", "Convert text to a number"], ["blank", "Fill missing region from the source"], ["duplicate", "Remove duplicate row"], ["spaces", "Trim extra spaces"]];
  let applied = {};
  const host = h("div", { class: "lab" });
  const render = () => {
    const table = h("table", { class: "data-table" }, h("thead", {}, h("tr", {}, ["Date", "Region", "Product", "Revenue", "Fix"].map(label => h("th", {}, label)))),
      h("tbody", {}, rows.map(row => h("tr", { class: row.issue ? (applied[row.id] === row.issue ? "fixed" : applied[row.id] ? "wrong" : "flagged") : "" },
        h("td", {}, row.date), h("td", {}, row.region || h("em", { class: "muted" }, "blank")), h("td", {}, row.product.replace(/ /g, "␣")), h("td", {}, row.revenue),
        h("td", {}, row.issue ? h("select", { class: "input small", "aria-label": `Fix for row ${row.id}`, onChange: (event) => { applied = { ...applied, [row.id]: event.target.value }; render(); } }, h("option", { value: "" }, "Choose a fix"), fixes.map(([value, label]) => h("option", { value, selected: applied[row.id] === value }, label))) : h("span", { class: "tiny muted" }, "Looks fine"))))));
    const done = rows.filter(row => row.issue).every(row => applied[row.id]);
    host.replaceChildren(h("p", { class: "lab-brief" }, "Five rows have data problems. Choose the right fix for each, then summarise revenue by region."), table,
      done ? pivot() : h("p", { class: "tiny muted" }, `${Object.keys(applied).length} of 5 fixes chosen.`));
  };
  const pivot = () => {
    const clean = [{ region: "South", revenue: 1250 }, { region: "North", revenue: 2400 }, { region: "South", revenue: 2400 }, { region: "West", revenue: 2400 }];
    const totals = clean.reduce((acc, row) => ({ ...acc, [row.region]: (acc[row.region] ?? 0) + row.revenue }), {});
    const answer = h("input", { class: "input small", type: "number", placeholder: "South total", "aria-label": "Total revenue for South" });
    const result = h("div");
    return h("div", { class: "lab-step pop" }, h("h4", {}, "Summarise: what is total revenue for South after cleaning?"), h("div", { class: "pivot" }, Object.entries(totals).map(([region, total]) => h("div", { class: "pivot-bar" }, h("span", {}, region), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${(total / 3650) * 100}%` } })), h("span", { class: "muted" }, region === "South" ? "?" : money(total))))), h("div", { class: "inline-form" }, answer, h("button", { class: "button primary small", type: "button", onClick: () => {
      const fixScore = rows.filter(row => row.issue && applied[row.id] === row.issue).length;
      const pivotRight = Number(answer.value) === totals.South;
      const score = Math.round((fixScore / 5) * 70 + (pivotRight ? 30 : 0));
      result.replaceChildren(resultPanel(score, [[fixScore === 5, `${fixScore}/5 fixes correct (duplicate removed, date normalised, number converted, region filled, spaces trimmed)`], [pivotRight, `South total is ${money(totals.South)} (1,250 + 2,400 after removing the duplicate)`]], onComplete, () => { applied = {}; render(); }));
    } }, "Check")), result);
  };
  render();
  return host;
}

// 02 Dashboards: pick honest KPIs, the right chart, then find the wrong number.
function dashboardsLab(onComplete) {
  const kpiOptions = [["conversion", "Lead-to-customer conversion", true], ["revenue", "Monthly revenue", true], ["views", "Total page views", false], ["followers", "Social followers", false], ["retention", "90-day retention", true]];
  const chosen = new Set();
  let chart = null; let wrongPick = null;
  const host = h("div", { class: "lab" });
  const source = [["Jan", 42000, 120, 30], ["Feb", 46500, 131, 34], ["Mar", 51200, 140, 35]];
  const render = () => {
    const kpis = h("div", { class: "chip-row" }, kpiOptions.map(([id, label]) => h("button", { type: "button", class: `chip ${chosen.has(id) ? "on" : ""}`, "aria-pressed": String(chosen.has(id)), onClick: () => { if (chosen.has(id)) chosen.delete(id); else if (chosen.size < 3) chosen.add(id); else toast("Pick exactly three KPIs.", "info"); render(); } }, label)));
    const charts = h("div", { class: "chip-row" }, [["line", "Line chart"], ["pie", "Pie chart"], ["table", "Big table"]].map(([id, label]) => h("button", { type: "button", class: `chip ${chart === id ? "on" : ""}`, onClick: () => { chart = id; render(); } }, label)));
    const dashboard = h("div", { class: "mini-dashboard" },
      source.map(([month, revenue, leads, customers], index) => h("button", { type: "button", class: `kpi-tile ${wrongPick === month ? "picked" : ""}`, onClick: () => { wrongPick = month; render(); } }, h("span", { class: "eyebrow" }, month), h("strong", {}, money(revenue)), h("small", { class: "muted" }, `${leads} leads · ${customers} customers · ${index === 1 ? "31.0%" : `${((customers / leads) * 100).toFixed(1)}%`} conversion`))));
    const ready = chosen.size === 3 && chart && wrongPick;
    host.replaceChildren(h("p", { class: "lab-brief" }, "Build a sales dashboard: choose three decision-useful KPIs, pick a chart for a three-month trend, then click the tile whose conversion figure does not match its own leads and customers."), h("h4", {}, "1 · Choose three KPIs"), kpis, h("h4", {}, "2 · Chart for a trend over months"), charts, h("h4", {}, "3 · Validate the tiles"), dashboard,
      ready ? resultPanel(Math.round(([...chosen].filter(id => kpiOptions.find(option => option[0] === id)[2]).length / 3) * 50 + (chart === "line" ? 25 : 0) + (wrongPick === "Feb" ? 25 : 0)), [[[...chosen].every(id => kpiOptions.find(option => option[0] === id)[2]), "Conversion, revenue and retention are decision KPIs; page views and followers are vanity metrics here"], [chart === "line", "A line chart shows change over time; pies compare parts of one whole"], [wrongPick === "Feb", "Feb shows 31.0% but 34 / 131 = 26.0%: always reconcile tiles to the source"]], onComplete, () => { chosen.clear(); chart = null; wrongPick = null; render(); }) : null);
  };
  render();
  return host;
}

// 03 Business AI: write a complete brief, then verify the assistant's answer.
function businessAiLab(onComplete) {
  const parts = shuffle([["task", "Task: compare three CRM plans for a 10-person sales team", true], ["audience", "Audience: a non-technical founder deciding this week", true], ["constraints", "Constraints: use only official pricing pages; mark anything unverified", true], ["checks", "Acceptance: a table with source links and a one-line recommendation", true], ["impress", "Make it sound as impressive as possible", false], ["guess", "If a price is missing, estimate it and present it as fact", false]]);
  const output = [["Plan A costs INR 1,200 per user per month on the official page (link included).", false], ["Plan B is 20% cheaper than Plan A at INR 1,000 per user.", true], ["Plan C offers unlimited users, according to a 2019 blog post I could not verify.", true], ["All three plans include email support according to their pricing pages (links included).", false], ["Recommendation: Plan B, assuming the team needs under 15 seats and no phone support.", false]];
  const picked = new Set(); const flagged = new Set(); let stage = 1;
  const host = h("div", { class: "lab" });
  const render = () => {
    if (stage === 1) {
      host.replaceChildren(h("p", { class: "lab-brief" }, "Assemble a brief for an AI assistant. Pick every element a good brief needs and leave out the unsafe ones."), h("div", { class: "stack" }, parts.map(([id, label]) => h("button", { type: "button", class: `choice-line ${picked.has(id) ? "on" : ""}`, "aria-pressed": String(picked.has(id)), onClick: () => { if (picked.has(id)) picked.delete(id); else picked.add(id); render(); } }, h("span", { class: "choice-check" }, icon("check", 12)), label))), h("button", { class: "button primary", type: "button", onClick: () => { stage = 2; render(); } }, "Send brief and read the answer", icon("arrow", 16)));
    } else {
      const check = h("div");
      host.replaceChildren(h("p", { class: "lab-brief" }, "The assistant answered. Flag every line that is wrong or cannot be trusted. Keep the lines that are correct and sourced."), h("div", { class: "ai-output" }, h("div", { class: "ai-head" }, icon("spark", 14), "Assistant output"), output.map(([line], index) => h("button", { type: "button", class: `ai-line ${flagged.has(index) ? "flagged" : ""}`, "aria-pressed": String(flagged.has(index)), onClick: () => { if (flagged.has(index)) flagged.delete(index); else flagged.add(index); render(); } }, icon("flag", 14), line))), h("button", { class: "button primary", type: "button", onClick: () => {
        const briefScore = parts.filter(([id, , good]) => good === picked.has(id)).length;
        const verifyScore = output.filter(([, wrong], index) => wrong === flagged.has(index)).length;
        const score = Math.round((briefScore / 6) * 50 + (verifyScore / 5) * 50);
        check.replaceChildren(resultPanel(score, [[briefScore === 6, "A good brief states task, audience, constraints and acceptance checks, and never asks the model to guess or impress"], [verifyScore === 5, "Line 2 fails arithmetic (1,000 is 16.7% below 1,200); line 3 relies on an unverified 2019 source. The others are sourced or clearly labelled assumptions"]], onComplete, () => { picked.clear(); flagged.clear(); stage = 1; render(); }));
      } }, "Check my review"), check);
    }
  };
  render();
  return host;
}

// 04 Canva: order the story and choose a readable style.
function canvaLab(onComplete) {
  const correct = ["The problem in one sentence", "Evidence: three numbers that matter", "Options we considered", "Recommendation and cost", "Decision we need today"];
  let order = shuffle(correct);
  let palette = null;
  const host = h("div", { class: "lab" });
  const render = () => {
    host.replaceChildren(h("p", { class: "lab-brief" }, "Arrange the five slides into a clear decision story, then pick the most readable style for a projector."),
      h("ol", { class: "slide-list" }, order.map((slide, index) => h("li", { class: "slide-item pop" }, h("span", { class: "slide-number" }, index + 1), h("span", { class: "grow" }, slide), h("div", { class: "slide-actions" }, h("button", { class: "icon-button", type: "button", "aria-label": `Move ${slide} up`, disabled: index === 0, onClick: () => { [order[index - 1], order[index]] = [order[index], order[index - 1]]; render(); } }, "↑"), h("button", { class: "icon-button", type: "button", "aria-label": `Move ${slide} down`, disabled: index === order.length - 1, onClick: () => { [order[index + 1], order[index]] = [order[index], order[index + 1]]; render(); } }, "↓"))))),
      h("h4", {}, "Readable style"), h("div", { class: "palette-row" }, [["a", "#0f1a19", "#f4f7f2", true], ["b", "#f3f1e4", "#d9d2a0", false], ["c", "#273e8c", "#e9eefc", true], ["d", "#ff6b6b", "#ffd166", false]].map(([id, bg, fg]) => h("button", { type: "button", class: `palette ${palette === id ? "on" : ""}`, style: { background: bg, color: fg }, "aria-label": `Style ${id}`, onClick: () => { palette = id; render(); } }, "Quarterly review"))),
      palette ? resultPanel(Math.round((order.filter((slide, index) => slide === correct[index]).length / 5) * 70 + (["a", "c"].includes(palette) ? 30 : 0)), [[order.every((slide, index) => slide === correct[index]), "Problem → evidence → options → recommendation → decision is the clearest order"], [["a", "c"].includes(palette), "High contrast text on a calm background stays readable; low-contrast or clashing pairs do not"]], onComplete, () => { order = shuffle(correct); palette = null; render(); }) : null);
  };
  render();
  return host;
}

// 05 CRM: move deals to the right stage and watch the funnel.
function crmLab(onComplete) {
  const stages = ["Lead", "Qualified", "Proposal", "Won", "Lost"];
  const deals = [
    { id: 1, name: "Nimbus Retail", note: "Discovery done: budget confirmed, decision in 3 weeks", target: "Qualified", stage: "Lead" },
    { id: 2, name: "Kiran Foods", note: "Said: no budget this year, call again next April", target: "Lost", stage: "Lead" },
    { id: 3, name: "Orbit Fitness", note: "Signed order form received", target: "Won", stage: "Proposal" },
    { id: 4, name: "Lumen Clinics", note: "Asked for a written quote after a qualified call", target: "Proposal", stage: "Qualified" },
    { id: 5, name: "Juniper Tours", note: "Replied to the first email only, no call yet", target: "Lead", stage: "Lead" },
  ];
  const host = h("div", { class: "lab" });
  const render = () => {
    const won = deals.filter(deal => deal.stage === "Won").length;
    host.replaceChildren(h("p", { class: "lab-brief" }, "Read each deal note and move it to the correct stage. A clean pipeline makes the funnel honest."),
      h("div", { class: "kanban" }, stages.map(stage => h("div", { class: "kanban-col" }, h("h4", {}, stage, h("span", { class: "count" }, deals.filter(deal => deal.stage === stage).length)), deals.filter(deal => deal.stage === stage).map(deal => h("div", { class: "kanban-card pop" }, h("strong", {}, deal.name), h("p", { class: "tiny muted" }, deal.note), h("select", { class: "input small", "aria-label": `Stage for ${deal.name}`, onChange: (event) => { deal.stage = event.target.value; render(); } }, stages.map(option => h("option", { value: option, selected: option === deal.stage }, option)))))))),
      h("div", { class: "funnel-line" }, `Won ${won} of ${deals.length} deals · win rate ${Math.round((won / deals.length) * 100)}%`),
      h("button", { class: "button primary", type: "button", onClick: () => { const right = deals.filter(deal => deal.stage === deal.target).length; host.append(resultPanel(Math.round((right / deals.length) * 100), deals.map(deal => [deal.stage === deal.target, `${deal.name} → ${deal.target}`]), onComplete, () => { deals.forEach((deal, index) => { deal.stage = ["Lead", "Lead", "Proposal", "Qualified", "Lead"][index]; }); render(); })); } }, "Check pipeline"));
  };
  render();
  return host;
}

// 06 HR tracker: consistent scoring and a fairness check.
function hrLab(onComplete) {
  const criteria = [["excel", "Spreadsheet test score", true, 0], ["comms", "Written communication sample", true, 1], ["process", "Process-mapping exercise", true, 2], ["college", "Studied at my college", false, null], ["gut", "Gut feeling", false, null]];
  const candidates = [["Candidate A", [4, 3, 5]], ["Candidate B", [3, 5, 3]], ["Candidate C", [5, 2, 3]]];
  const kept = new Set(criteria.map(([id]) => id));
  let advance = null;
  const host = h("div", { class: "lab" });
  const render = () => {
    const activeFair = criteria.filter(([id, , fair]) => kept.has(id) && fair);
    const scores = candidates.map(([name, values]) => [name, activeFair.reduce((sum, criterion) => sum + values[criterion[3]], 0) / Math.max(1, activeFair.length)]);
    const best = [...scores].sort((a, b) => b[1] - a[1])[0]?.[0];
    host.replaceChildren(h("p", { class: "lab-brief" }, "Keep only job-related criteria, then advance the candidate with the strongest evidence-based score."),
      h("div", { class: "chip-row" }, criteria.map(([id, label]) => h("button", { type: "button", class: `chip ${kept.has(id) ? "on" : ""}`, "aria-pressed": String(kept.has(id)), onClick: () => { if (kept.has(id)) kept.delete(id); else kept.add(id); render(); } }, label))),
      h("table", { class: "data-table" }, h("thead", {}, h("tr", {}, h("th", {}, "Candidate"), activeFair.map(([, label]) => h("th", {}, label)), h("th", {}, "Average"))), h("tbody", {}, candidates.map(([name, values], row) => h("tr", {}, h("td", {}, name), activeFair.map(criterion => h("td", {}, values[criterion[3]])), h("td", {}, h("strong", {}, scores[row][1].toFixed(2))))))),
      h("div", { class: "chip-row" }, candidates.map(([name]) => h("button", { type: "button", class: `chip ${advance === name ? "on" : ""}`, onClick: () => { advance = name; render(); } }, `Advance ${name}`))),
      advance ? resultPanel(Math.round((criteria.filter(([id, , fair]) => fair === kept.has(id)).length / 5) * 60 + (advance === best && !kept.has("college") && !kept.has("gut") ? 40 : 0)), [[!kept.has("college") && !kept.has("gut") && kept.size === 3, "Alma mater and gut feeling are not job-related evidence; the three work samples are"], [advance === best, `With fair criteria only, ${best} has the highest average`]], onComplete, () => { criteria.forEach(([id]) => kept.add(id)); advance = null; render(); }) : null);
  };
  render();
  return host;
}

// 07 Trello: respect the WIP limit, surface blockers, finish work.
function trelloLab(onComplete) {
  const cards = [{ id: 1, title: "Confirm venue", col: "Backlog" }, { id: 2, title: "Send invitations", col: "Backlog" }, { id: 3, title: "Prepare slides", col: "Backlog" }, { id: 4, title: "Order catering", col: "Backlog" }, { id: 5, title: "Book photographer", col: "Backlog" }];
  const limit = 3; const events = [];
  const host = h("div", { class: "lab" });
  const move = (card, col) => {
    if (col === "Doing" && cards.filter(item => item.col === "Doing").length >= limit) { events.push("wip-rejected"); toast(`Doing is limited to ${limit} cards. Finish or block something first.`, "error"); host.querySelector(".kanban-col.doing")?.classList.add("shake"); setTimeout(() => host.querySelector(".kanban-col.doing")?.classList.remove("shake"), 500); return; }
    if (col === "Blocked" && !card.reason) {
      const form = h("form", { class: "form-grid", novalidate: true }, field({ label: "Why is this card blocked?", name: "reason", required: true, placeholder: "e.g. waiting for venue confirmation" }));
      modal({ title: `Block "${card.title}"`, body: form, actions: [{ label: "Block card", onClick: () => { const reason = formData(form).reason?.trim(); if (!reason) { toast("A blocker needs a written reason.", "error"); return true; } card.reason = reason; card.col = col; events.push(`${card.id}:${col}`); render(); } }] });
      return;
    }
    card.col = col; events.push(`${card.id}:${col}`); render();
  };
  const render = () => {
    const columns = ["Backlog", "Doing", "Blocked", "Done"];
    host.replaceChildren(h("p", { class: "lab-brief" }, `Move work through the board. Doing has a WIP limit of ${limit}. Block a card only with a written reason. Finish at least two cards.`),
      h("div", { class: "kanban" }, columns.map(col => h("div", { class: `kanban-col ${col.toLowerCase()}` }, h("h4", {}, col, h("span", { class: "count" }, cards.filter(card => card.col === col).length, col === "Doing" ? ` / ${limit}` : "")), cards.filter(card => card.col === col).map(card => h("div", { class: "kanban-card pop" }, h("strong", {}, card.title), card.reason && col === "Blocked" ? h("p", { class: "tiny muted" }, `Blocked: ${card.reason}`) : null, h("div", { class: "card-actions" }, columns.filter(target => target !== col).map(target => h("button", { class: "mini", type: "button", onClick: () => move(card, target) }, target)))))))),
      h("button", { class: "button primary", type: "button", onClick: () => {
        const done = cards.filter(card => card.col === "Done").length; const blocked = cards.filter(card => card.col === "Blocked" && card.reason).length; const respected = cards.filter(card => card.col === "Doing").length <= limit; const hitLimit = events.includes("wip-rejected");
        host.append(resultPanel(Math.round((done >= 2 ? 40 : done * 15) + (blocked >= 1 ? 25 : 0) + (respected ? 20 : 0) + (hitLimit ? 15 : 5)), [[done >= 2, `${done} card(s) finished`], [blocked >= 1, "A blocker was recorded with a reason"], [respected, "WIP limit respected"], [hitLimit, "You tested the WIP limit: it stops overloading the team"]], onComplete, () => { cards.forEach(card => { card.col = "Backlog"; delete card.reason; }); events.length = 0; render(); }));
      } }, "Review my board"));
  };
  render();
  return host;
}

// 08 Budgeting: find a sustainable price and test a downside case.
function budgetingLab(onComplete) {
  const state = { price: 400, cost: 250, fixed: 12000, units: 60 };
  const host = h("div", { class: "lab" });
  const downside = h("input", { class: "input small", type: "number", placeholder: "Surplus at -20% demand", "aria-label": "Surplus if demand falls 20 percent" });
  const slider = (key, label, min, max, step) => { const input = h("input", { type: "range", min, max, step, value: state[key], "aria-label": label, onInput: (event) => { state[key] = Number(event.target.value); render(); } }); return h("label", { class: "slider" }, h("span", {}, label, h("strong", {}, key === "units" ? state[key] : money(state[key]))), input); };
  const render = () => {
    const contribution = state.price - state.cost; const breakEven = contribution > 0 ? Math.ceil(state.fixed / contribution) : null; const surplus = contribution * state.units - state.fixed;
    host.replaceChildren(h("p", { class: "lab-brief" }, "Set a price so contribution per unit is at least INR 150 and the break-even is 80 units or fewer at fixed costs of INR 12,000. Then calculate the surplus if demand falls 20%."),
      h("div", { class: "slider-grid" }, slider("price", "Price per unit", 250, 700, 10), slider("cost", "Variable cost per unit", 150, 350, 10), slider("units", "Units sold", 20, 150, 5)),
      h("div", { class: "metric-row" }, h("div", { class: "metric" }, h("span", {}, "Contribution / unit"), h("strong", {}, money(contribution))), h("div", { class: "metric" }, h("span", {}, "Break-even units"), h("strong", {}, breakEven ?? "—")), h("div", { class: `metric ${surplus >= 0 ? "good" : "bad"}` }, h("span", {}, "Surplus"), h("strong", {}, money(surplus)))),
      h("div", { class: "bar big" }, h("div", { class: `bar-fill ${breakEven && state.units >= breakEven ? "over" : ""}`, style: { width: `${breakEven ? Math.min(100, (state.units / breakEven) * 50) : 0}%` } })),
      h("div", { class: "inline-form" }, downside, h("button", { class: "button primary small", type: "button", onClick: () => {
        const expected = contribution * Math.round(state.units * 0.8) - state.fixed;
        const priceOk = contribution >= 150 && breakEven !== null && breakEven <= 80; const downsideOk = Math.abs(Number(downside.value) - expected) <= 1;
        host.append(resultPanel((priceOk ? 60 : 20) + (downsideOk ? 40 : 0), [[priceOk, `Contribution ${money(contribution)} and break-even ${breakEven ?? "n/a"} units${priceOk ? " meet the target" : " do not meet the target yet"}`], [downsideOk, `At ${Math.round(state.units * 0.8)} units the surplus is ${money(expected)} (contribution × units − fixed costs)`]], onComplete, () => { Object.assign(state, { price: 400, cost: 250, units: 60 }); downside.value = ""; render(); }));
      } }, "Check")));
  };
  render();
  return host;
}

export const LABS = [
  { id: "spreadsheets", title: "Clean the register", icon: "grid", summary: "Fix five data problems, then summarise revenue by region.", render: spreadsheetsLab },
  { id: "dashboards", title: "Build an honest dashboard", icon: "chart", summary: "Choose decision KPIs, the right chart and catch a wrong tile.", render: dashboardsLab },
  { id: "business-ai", title: "Brief and verify", icon: "spark", summary: "Write a complete AI brief, then flag unreliable lines in the answer.", render: businessAiLab },
  { id: "canva", title: "Order the story", icon: "play", summary: "Sequence five slides into a decision story and pick a readable style.", render: canvaLab },
  { id: "crm", title: "Clean the pipeline", icon: "user", summary: "Move five deals to the right stage and watch the win rate.", render: crmLab },
  { id: "hr-tracker", title: "Fair scorecard", icon: "clipboard", summary: "Remove biased criteria and advance the best-evidenced candidate.", render: hrLab },
  { id: "trello", title: "Respect the WIP limit", icon: "bolt", summary: "Run a board with a WIP limit, blockers and finished work.", render: trelloLab },
  { id: "budgeting", title: "Price to break even", icon: "wallet", summary: "Tune price and cost, then compute a downside scenario.", render: budgetingLab },
];
