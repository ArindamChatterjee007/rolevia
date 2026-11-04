import { h, icon, avatar, toast, relative, modal, copyText } from "../ui.js";
import { ctx, authed, setAuth, withSession } from "../context.js";

// Company NAMES only (nominative use with the disclaimer below). Logos are trademarks and appear only with the
// owner's written permission, so none are bundled here.
export const COMPANY_NAMES = ["Accenture", "Genpact", "Amazon", "Freshworks", "HubSpot", "Unilever", "Deloitte", "Infosys", "Zoho", "Swiggy", "Razorpay", "Tata Consultancy Services", "Wipro", "HCLTech", "Capgemini", "Cognizant", "Flipkart", "Zomato", "PhonePe", "ICICI Bank", "HDFC Bank", "Mahindra", "EY", "KPMG", "Nykaa", "Meesho", "Urban Company", "Tech Mahindra"];
const COMPANY_TINTS = ["blue", "teal", "lime", "coral", "plum", "ochre"];
const monogram = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase();

export function brand(size = 34) {
  return h("a", { class: "brand", href: "#/", "aria-label": "Rolevia home" },
    h("img", { src: "assets/brand/rolevia-mark.svg", alt: "", width: size, height: size }),
    h("span", { class: "brand-text" }, h("span", { class: "brand-name" }, "rolevia", h("span", { class: "brand-dot" }, ".")), h("span", { class: "brand-desc" }, "Business Skills Studio")));
}

export function publicShell(content, { active = "" } = {}) {
  const links = [["#/skills", "Skills", "skills"], ["#/pricing", "Pricing", "pricing"], ["#/demo", "Free demo", "demo"], ["#/leaderboard", "Leaderboard", "leaderboard"]];
  const nav = h("header", { class: "site-header" },
    h("div", { class: "container nav-row" },
      brand(),
      h("nav", { class: "nav-links", "aria-label": "Primary" }, links.map(([href, label, key]) => h("a", { href, class: active === key ? "active" : "" }, label))),
      h("div", { class: "nav-actions" },
        authed("student") ? h("a", { class: "button ghost", href: "#/portal" }, icon("user", 16), "My portal") : h("a", { class: "button ghost", href: "#/login" }, "Sign in"),
        h("a", { class: "button primary", href: "#/register" }, "Start a skill", icon("arrow", 16)),
        h("button", { class: "icon-button nav-toggle", type: "button", "aria-label": "Open menu", "aria-expanded": "false", onClick: (event) => { const open = nav.classList.toggle("open"); event.currentTarget.setAttribute("aria-expanded", String(open)); } }, icon("menu")))));
  return h("div", { class: "site public" }, previewBanner(), nav, h("main", { id: "main", class: "site-main" }, content), footer());
}

export function footer() {
  return h("footer", { class: "site-footer" },
    h("div", { class: "container footer-grid" },
      h("div", {}, brand(30), h("p", { class: "muted small" }, "Learn the role. Practise the work. Small, practical skill modules for MBA graduates and non-technical professionals."), h("p", { class: "tiny muted" }, "Pre-launch preview. Fees, dates and terms are proposals until confirmed in writing. No job placement or salary is guaranteed.")),
      h("div", {}, h("h4", {}, "Learn"), h("a", { href: "#/skills" }, "Skill modules"), h("a", { href: "#/pricing" }, "Pricing and career kit"), h("a", { href: "#/demo" }, "Free 30-minute demo"), h("a", { href: "#/register" }, "Register")),
      h("div", {}, h("h4", {}, "Students"), h("a", { href: "#/login" }, "Student sign-in"), h("a", { href: "#/leaderboard" }, "Public leaderboard"), h("a", { href: "#/faq" }, "Before you enroll")),
      h("div", {}, h("h4", {}, "Studio"), h("a", { href: "#/admin/login" }, "Admin sign-in"), h("a", { href: "#/faq" }, "Privacy and refunds"), h("span", { class: "tiny muted" }, "Company names shown are research targets, not partners."))),
    h("div", { class: "container footer-base" }, h("span", {}, `© ${new Date().getFullYear()} Rolevia (proposed brand). Manrope font under the SIL Open Font License.`), h("span", {}, "Built as a static preview; backend contract in docs/ARCHITECTURE.md")));
}

export function previewBanner() {
  if (ctx.mode !== "preview") return h("div", { hidden: true });
  return h("div", { class: "preview-banner", role: "note" }, icon("info", 14), h("span", {}, h("strong", {}, "Preview mode."), " Fictional data, no real payments, OTP codes appear in the preview inbox. Sessions are per tab: open another tab to join as a second person. "), h("button", { class: "link-button", type: "button", onClick: () => document.dispatchEvent(new CustomEvent("rolevia:inbox")) }, "Open preview inbox"));
}

// Chips alternate between an inner and an outer ring (set in CSS), so neighbours never sit side by side and
// nothing overlaps the core or leaves the box; the whole figure scales with its column width.
export function orbit(modules) {
  const wrapper = h("div", { class: "orbit", role: "group", "aria-label": "Eight skill modules orbiting one learner" });
  wrapper.append(h("div", { class: "orbit-ring ring-a" }), h("div", { class: "orbit-ring ring-b" }), h("div", { class: "orbit-ring ring-c" }));
  wrapper.append(h("div", { class: "orbit-core" }, h("span", { class: "orbit-core-label" }, "You"), h("span", { class: "orbit-core-sub" }, "one skill at a time")));
  modules.forEach((module, index) => {
    const angle = (index / modules.length) * 360 - 90;
    const chip = h("a", { class: `orbit-chip accent-${module.accent} ${index % 2 ? "ring-outer" : "ring-inner"}`, href: `#/skills/${module.id}`, "aria-label": `${module.title} (${module.tool})`, style: { "--angle": `${angle}deg`, "--delay": `${index * -4.5}s` } },
      h("span", { class: "orbit-chip-inner" }, h("strong", {}, module.short ?? module.title), h("small", {}, module.shortTool ?? module.tool)));
    wrapper.append(chip);
  });
  return wrapper;
}

// items: strings (names) or { name, careersUrl, logo } records from the public companies API. A logo renders only
// when the API supplied one (which it does only with a recorded permission); otherwise a neutral monogram chip.
export function marquee(items, { label = "Research targets: the kinds of companies where these skills are used", reverse = false } = {}) {
  const records = items.map(item => (typeof item === "string" ? { name: item } : item));
  const chip = (company, index) => {
    const inner = [company.logo ? h("img", { class: "company-logo", src: company.logo, alt: `${company.name} logo`, draggable: false }) : h("span", { class: "monogram", "aria-hidden": "true" }, monogram(company.name)), h("span", { class: "wordmark-text" }, h("span", { class: "wordmark-name" }, company.name), company.sector ? h("span", { class: "wordmark-sector" }, company.sector) : null)];
    return company.careersUrl ? h("a", { class: `wordmark tint-${COMPANY_TINTS[index % COMPANY_TINTS.length]}`, href: company.careersUrl, target: "_blank", rel: "noopener noreferrer nofollow" }, ...inner) : h("span", { class: `wordmark tint-${COMPANY_TINTS[index % COMPANY_TINTS.length]}` }, ...inner);
  };
  const track = h("div", { class: `marquee-track ${reverse ? "reverse" : ""}` }, [...records, ...records].map(chip));
  const withLogos = records.some(company => company.logo);
  return h("div", { class: "marquee-wrap" }, h("p", { class: "eyebrow center" }, label), h("div", { class: "marquee", "aria-hidden": "true" }, track), h("p", { class: "small muted center" }, withLogos ? "Company names and, where shown, logos appear with the owner's written permission. Rolevia has no partnership with, endorsement from or placement arrangement with any of them." : "Illustrative company names only. Rolevia has no partnership with, endorsement from or placement arrangement with any of them; logos appear only with written permission."));
}

export function quotesTicker(quotes) {
  const list = h("ul", { class: "quotes-list" }, [...quotes, ...quotes].map(quote => h("li", { class: "quote" }, h("span", { class: "quote-mark" }, "“"), quote)));
  return h("div", { class: "quotes-ticker", "aria-label": "Learning principles" }, list);
}

export function statCard(value, label, hint) {
  return h("div", { class: "stat-card reveal" }, h("strong", { class: "stat-value" }, value), h("span", { class: "stat-label" }, label), hint ? h("span", { class: "tiny muted" }, hint) : null);
}

export function sectionHead(eyebrow, title, deck) {
  return h("div", { class: "section-head reveal" }, h("p", { class: "eyebrow" }, eyebrow), h("h2", {}, title), deck ? h("p", { class: "deck" }, deck) : null);
}

export function empty(message, action) {
  return h("div", { class: "empty-state" }, icon("spark", 28), h("p", {}, message), action ?? null);
}

export function errorBox(error) {
  return h("div", { class: "alert error", role: "alert" }, icon("info", 16), h("span", {}, error?.message ?? String(error)));
}

// Floating preview tools: inbox for OTP/credential messages, demo accounts, device simulation and reset.
export function previewDrawer() {
  const list = h("div", { class: "inbox-list" });
  const drawer = h("aside", { class: "preview-drawer", "aria-label": "Preview inbox and tools", hidden: true });
  const refresh = async () => {
    const messages = await ctx.api.previewInbox();
    list.replaceChildren(...(messages.length ? messages.map(message => h("article", { class: `inbox-item ${message.channel}` }, h("header", {}, h("span", { class: "tag" }, message.channel === "sms" ? "SMS" : "Email"), h("span", { class: "tiny muted" }, `${message.to} · ${relative(message.at)}`)), h("strong", {}, message.subject), h("p", {}, message.body))) : [h("p", { class: "muted small" }, "No messages yet. Register or sign in to receive OTP and credential messages here.")]));
  };
  const credentials = ctx.api.previewCredentials();
  const creds = h("div", { class: "preview-creds" },
    h("p", { class: "small" }, h("strong", {}, "Demo student:"), ` ${credentials.student.id} / ${credentials.student.password}`),
    ...credentials.admins.map(admin => h("p", { class: "small" }, h("strong", {}, `${admin.name.split(" ")[0]} (${admin.role}):`), ` ${admin.adminId} / ${admin.password}`)),
    h("p", { class: "tiny muted" }, "Fictional preview accounts; admins must set a new password at first sign-in. Production issues unique credentials and never shows them here."));
  const simulate = h("button", { class: "button ghost small", type: "button", onClick: async (event) => {
    if (!authed("student")) { toast("Sign in as a student first to simulate a second device.", "info"); return; }
    event.currentTarget.disabled = true;
    try { const result = await ctx.api.previewForeignLogin({ userId: ctx.auth.user.id }); toast(`Another device signed in (switch ${result.deviceSwitches}/${result.threshold}). This device will be signed out.`, result.warned ? "error" : "info", 6000); document.dispatchEvent(new CustomEvent("rolevia:check-session")); }
    catch (error) { toast(error.message, "error"); }
    finally { event.currentTarget.disabled = false; }
  } }, icon("device", 14), "Simulate sign-in from another device");
  const reset = h("button", { class: "button ghost small", type: "button", onClick: () => modal({ title: "Reset preview data?", body: h("p", {}, "This clears all preview registrations, sessions and messages and reloads the fictional seed data."), actions: [{ label: "Reset", variant: "danger", onClick: async () => { await ctx.api.previewReset(); setAuth({}); location.hash = "#/"; location.reload(); } }] }) }, icon("refresh", 14), "Reset preview data");
  drawer.append(
    h("div", { class: "drawer-head" }, h("h3", {}, icon("mail", 18), "Preview inbox"), h("button", { class: "icon-button", type: "button", "aria-label": "Close preview inbox", onClick: () => { drawer.hidden = true; } }, icon("close"))),
    h("p", { class: "tiny muted" }, "Messages the production system would send by email or SMS. In preview they appear here instead."),
    list, h("hr"), creds, h("div", { class: "drawer-actions" }, simulate, reset));
  document.addEventListener("rolevia:inbox", () => { drawer.hidden = false; refresh(); });
  document.addEventListener("rolevia:inbox-refresh", refresh);
  const fab = h("button", { class: "inbox-fab", type: "button", "aria-label": "Open preview inbox", onClick: () => { drawer.hidden = !drawer.hidden; if (!drawer.hidden) refresh(); } }, icon("mail", 20), h("span", { class: "inbox-fab-label" }, "Inbox"));
  return h("div", {}, drawer, fab);
}

export function sessionLostOverlay(reason, onClose) {
  const text = reason === "new_device_login" ? "This account signed in on another device, so this device was signed out. Rolevia allows one active device at a time." : reason === "expired" ? "Your session expired after a week of inactivity." : "You were signed out.";
  const link = h("a", { class: "button primary", href: "#/login", onClick: () => { overlay.remove(); onClose?.(); } }, "Sign in again");
  const overlay = h("div", { class: "modal-overlay show", role: "alertdialog", "aria-modal": "true", "aria-label": "Signed out" },
    h("div", { class: "modal" }, h("div", { class: "modal-head" }, h("h3", {}, icon("device", 20), "Signed out")), h("div", { class: "modal-body" }, h("p", {}, text), h("p", { class: "small muted" }, "If this was not you, sign in again and change your password from Profile.")), h("div", { class: "modal-actions" }, link)));
  requestAnimationFrame(() => link.focus());
  return overlay;
}

export function copyButton(text, label = "Copy") {
  return h("button", { class: "button ghost small", type: "button", onClick: async (event) => { const ok = await copyText(text); toast(ok ? "Copied." : "Copy is unavailable here; select the text instead.", ok ? "success" : "info"); } }, icon("copy", 14), label);
}

export const linkedinShareUrl = (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
export const linkedinCertificationUrl = ({ name, certId, certUrl, issued }) => {
  const date = new Date(issued);
  const params = new URLSearchParams({ startTask: "CERTIFICATION_NAME", name, organizationName: "Rolevia", issueYear: String(date.getFullYear()), issueMonth: String(date.getMonth() + 1), certUrl, certId });
  return `https://www.linkedin.com/profile/add?${params}`;
};
