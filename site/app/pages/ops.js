import { h, icon, money, skeleton, toast, busy, formatTime } from "../ui.js";
import { ctx, setAuth, withSession } from "../context.js";
import { brand, errorBox } from "./components.js";

export const opsGuard = () => ctx.auth.token && ctx.auth.type === "ops" ? null : "/ops/login";

export async function opsPage() {
  const host = h("main", { id: "main", class: "container section ops" }, skeleton(6, "page-skeleton"));
  const page = h("div", { class: "site ops-site" }, h("header", { class: "site-header" }, h("div", { class: "container nav-row" }, brand(30), h("span", { class: "tag bad" }, "Unlisted operations view"), h("button", { class: "button ghost small", type: "button", onClick: async () => { try { await ctx.api.logout({ token: ctx.auth.token }); } catch { /* ignore */ } setAuth({}); location.hash = "#/"; } }, icon("logout", 14), "Leave"))), host);
  (async () => {
    try {
      const data = await ctx.api.opsSummary(withSession());
      const noteForm = h("form", { class: "inline-form", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const input = noteForm.querySelector("input"); const button = noteForm.querySelector("button"); busy(button, true, "Saving"); try { const notes = await ctx.api.opsSaveNote(withSession({ text: input.value })); notesList.replaceChildren(...notes.map(renderNote)); input.value = ""; toast("Note saved (preview storage).", "success"); } catch (error) { toast(error.message, "error"); } finally { busy(button, false, "Add note"); } } }, h("input", { class: "input", placeholder: "Founder note (kept in this preview only)", "aria-label": "Founder note" }), h("button", { class: "button primary small", type: "submit" }, "Add note"));
      const renderNote = (note) => h("li", {}, h("span", { class: "tiny muted" }, formatTime(note.at)), ` · ${note.text}`);
      const notesList = h("ul", { class: "history" }, data.notes.map(renderNote));
      host.replaceChildren(
        h("div", { class: "alert info" }, icon("shield", 16), h("span", {}, "Unlisted is not private. This preview uses a passphrase; production must put this view behind server-side authorisation, an allow-list and audit logging before any real data appears here.")),
        h("p", { class: "eyebrow" }, `Generated ${formatTime(data.generatedAt)}`), h("h1", {}, "Operations snapshot"),
        h("div", { class: "stat-grid" }, data.funnel.map(step => h("div", { class: "stat-card" }, h("strong", { class: "stat-value" }, step.count), h("span", { class: "stat-label" }, step.status.replace("_", " ")))), h("div", { class: "stat-card" }, h("strong", { class: "stat-value" }, data.openAlerts), h("span", { class: "stat-label" }, "open device alerts")), h("div", { class: "stat-card" }, h("strong", { class: "stat-value" }, data.ungraded), h("span", { class: "stat-label" }, "ungraded submissions"))),
        h("div", { class: "grid-2" }, data.byCurrency.map(row => h("div", { class: "card" }, h("h3", {}, `${row.currency} ledger (preview)`), [["Gross module and service collections", row.gross], ["Module sales counted", row.moduleSales, true], ["Career-kit reserve to ring-fence", row.bonusReserve], ["Referral cashback reserve", row.referralReserve], ["Payment processing allowance", row.processingAllowance], ["Career kits unlocked", row.kitsUnlocked, true], ["Fulfilment liability for unlocked kits", row.kitLiability]].map(([label, value, plain]) => h("div", { class: "order-line" }, h("span", {}, label), h("strong", {}, plain ? value : money(value, row.currency)))), h("p", { class: "tiny muted" }, "Reserves follow the private business model: INR 600 / USD 12 career-kit and INR 300 / USD 6 referral reserve per module sale. Not revenue recognition or tax advice.")))),
        h("div", { class: "card" }, h("h3", {}, "Cohort fill against the proposed 12-learner cap"), h("div", { class: "cohort-grid" }, data.cohorts.map(cohort => h("div", { class: "cohort" }, h("div", { class: "cohort-head" }, h("strong", {}, cohort.title), h("span", { class: "small muted" }, `${cohort.enrolled}/${cohort.limit}`)), h("div", { class: "bar" }, h("div", { class: `bar-fill ${cohort.enrolled >= cohort.limit ? "over" : ""}`, style: { width: `${Math.min(100, (cohort.enrolled / cohort.limit) * 100)}%` } })))))),
        h("div", { class: "card" }, h("h3", {}, "Founder notes"), noteForm, notesList),
        h("p", { class: "tiny muted" }, "Preview data is fictional. Launch gates, pricing authority and spending limits remain as recorded in the private business model PDF."));
    } catch (error) {
      if (["SESSION_REVOKED", "AUTH_REQUIRED", "SESSION_EXPIRED", "DEVICE_MISMATCH", "FORBIDDEN"].includes(error.code)) { setAuth({}); location.hash = "#/ops/login"; return; }
      host.replaceChildren(errorBox(error));
    }
  })();
  return page;
}
