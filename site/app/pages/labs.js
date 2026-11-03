// Interactive practice labs. Each lab renders an exercise and calls onComplete(score 0-100). Spreadsheet-based
// labs live in ../labs/ (Rolevia Sheets engine, Google Sheets bridge); the AI workbench in ../labs/ai-lab.js.
import { h, icon, money, toast, modal, field, formData } from "../ui.js";
import { sheetLab } from "../labs/sheet-lab.js";
import { SHEET_LABS } from "../labs/sheet-labs.js";
import { aiLab } from "../labs/ai-lab.js";

const sheetRender = (id) => (onComplete) => sheetLab({ ...SHEET_LABS[id], labId: id, onComplete });

const shuffle = (items) => items.map(item => [Math.random(), item]).sort((a, b) => a[0] - b[0]).map(([, item]) => item);
const resultPanel = (score, lines, onComplete, retry) => {
  onComplete(score);
  return h("div", { class: `lab-result ${score >= 70 ? "good" : "warn"} pop` }, h("div", { class: "lab-score" }, h("strong", {}, `${score}`), h("span", {}, "/ 100")), h("ul", { class: "ticks" }, lines.map(([ok, text]) => h("li", { class: ok ? "" : "miss" }, icon(ok ? "check" : "close", 14), text))), retry ? h("button", { class: "button ghost small", type: "button", onClick: retry }, icon("refresh", 14), "Try again") : null);
};

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
    host.replaceChildren(...[h("p", { class: "lab-brief" }, "Build a sales dashboard: choose three decision-useful KPIs, pick a chart for a three-month trend, then click the tile whose conversion figure does not match its own leads and customers."), h("h4", {}, "1 · Choose three KPIs"), kpis, h("h4", {}, "2 · Chart for a trend over months"), charts, h("h4", {}, "3 · Validate the tiles"), dashboard,
      ready ? resultPanel(Math.round(([...chosen].filter(id => kpiOptions.find(option => option[0] === id)[2]).length / 3) * 50 + (chart === "line" ? 25 : 0) + (wrongPick === "Feb" ? 25 : 0)), [[[...chosen].every(id => kpiOptions.find(option => option[0] === id)[2]), "Conversion, revenue and retention are decision KPIs; page views and followers are vanity metrics here"], [chart === "line", "A line chart shows change over time; pies compare parts of one whole"], [wrongPick === "Feb", "Feb shows 31.0% but 34 / 131 = 26.0%: always reconcile tiles to the source"]], onComplete, () => { chosen.clear(); chart = null; wrongPick = null; render(); }) : null].filter(Boolean));
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
    host.replaceChildren(...[h("p", { class: "lab-brief" }, "Arrange the five slides into a clear decision story, then pick the most readable style for a projector."),
      h("ol", { class: "slide-list" }, order.map((slide, index) => h("li", { class: "slide-item pop" }, h("span", { class: "slide-number" }, index + 1), h("span", { class: "grow" }, slide), h("div", { class: "slide-actions" }, h("button", { class: "icon-button", type: "button", "aria-label": `Move ${slide} up`, disabled: index === 0, onClick: () => { [order[index - 1], order[index]] = [order[index], order[index - 1]]; render(); } }, "↑"), h("button", { class: "icon-button", type: "button", "aria-label": `Move ${slide} down`, disabled: index === order.length - 1, onClick: () => { [order[index + 1], order[index]] = [order[index], order[index + 1]]; render(); } }, "↓"))))),
      h("h4", {}, "Readable style"), h("div", { class: "palette-row" }, [["a", "#0f1a19", "#f4f7f2", true], ["b", "#f3f1e4", "#d9d2a0", false], ["c", "#273e8c", "#e9eefc", true], ["d", "#ff6b6b", "#ffd166", false]].map(([id, bg, fg]) => h("button", { type: "button", class: `palette ${palette === id ? "on" : ""}`, style: { background: bg, color: fg }, "aria-label": `Style ${id}`, onClick: () => { palette = id; render(); } }, "Quarterly review"))),
      palette ? resultPanel(Math.round((order.filter((slide, index) => slide === correct[index]).length / 5) * 70 + (["a", "c"].includes(palette) ? 30 : 0)), [[order.every((slide, index) => slide === correct[index]), "Problem → evidence → options → recommendation → decision is the clearest order"], [["a", "c"].includes(palette), "High contrast text on a calm background stays readable; low-contrast or clashing pairs do not"]], onComplete, () => { order = shuffle(correct); palette = null; render(); }) : null].filter(Boolean));
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

export const LABS = [
  { id: "spreadsheets", title: "Clean and summarise the register", icon: "grid", summary: "A real spreadsheet: clean the register with TRIM and VALUE, then SUM, SUMIFS, COUNTIFS and IF. Six checked tasks; also openable in Google Sheets.", tool: "Rolevia Sheets · Google Sheets", render: sheetRender("spreadsheets") },
  { id: "dashboards", title: "Build an honest dashboard", icon: "chart", summary: "Choose decision KPIs, the right chart and catch a wrong tile.", render: dashboardsLab },
  { id: "business-ai", title: "Brief, run and verify", icon: "spark", summary: "An AI workbench: write a checkable brief, run it with your own assistant (API key or paste), then verify the reply line by line.", tool: "Your AI assistant", render: aiLab },
  { id: "canva", title: "Order the story", icon: "play", summary: "Sequence five slides into a decision story and pick a readable style.", render: canvaLab },
  { id: "crm", title: "Clean the pipeline", icon: "user", summary: "Move five deals to the right stage and watch the win rate.", render: crmLab },
  { id: "hr-tracker", title: "Fair scorecard", icon: "clipboard", summary: "A real spreadsheet: weights that sum to 100%, SUMPRODUCT weighted totals, MAX, INDEX/MATCH and a threshold flag. Five checked tasks.", tool: "Rolevia Sheets · Google Sheets", render: sheetRender("hr-tracker") },
  { id: "trello", title: "Respect the WIP limit", icon: "bolt", summary: "Run a board with a WIP limit, blockers and finished work.", render: trelloLab },
  { id: "budgeting", title: "Price to break even", icon: "wallet", summary: "A real spreadsheet: contribution, ROUNDUP break-even, revenue, operating result and a downside scenario, all as formulas. Five checked tasks.", tool: "Rolevia Sheets · Google Sheets", render: sheetRender("budgeting") },
];
