import { h, icon, money, observeReveals, countUp, ring, skeleton, formatDate } from "../ui.js";
import { ctx } from "../context.js";
import { publicShell, orbit, marquee, quotesTicker, statCard, sectionHead, COMPANY_NAMES, errorBox, empty } from "./components.js";
import { illustration } from "./deck.js";
import { PRINCIPLES } from "../content/principles.js";
import { LABS } from "./labs.js";

const accentClass = (module) => `accent-${module.accent}`;

export function skillCard(module, { compact = false } = {}) {
  return h("a", { class: `skill-card ${accentClass(module)} reveal tilt`, href: `#/skills/${module.id}`, onMousemove: tilt, onMouseleave: untilt },
    compact ? null : illustration(module.id, { class: "skill-card-art" }),
    h("div", { class: "skill-card-top" }, h("span", { class: "code" }, module.code), h("span", { class: "tag" }, module.tool)),
    h("h3", {}, module.title),
    h("p", { class: "muted" }, module.label),
    compact ? null : h("ul", { class: "ticks" }, module.outcomes.slice(0, 2).map(outcome => h("li", {}, icon("check", 14), outcome))),
    h("div", { class: "skill-card-foot" }, h("span", { class: "price" }, money(module.priceINR), h("small", {}, ` / ${money(module.priceUSD, "USD")}`)), h("span", { class: "duration" }, "2 weeks · 12 h")));
}

function tilt(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  card.style.setProperty("--rx", `${-y * 6}deg`); card.style.setProperty("--ry", `${x * 8}deg`);
  card.style.setProperty("--mx", `${(x + 0.5) * 100}%`); card.style.setProperty("--my", `${(y + 0.5) * 100}%`);
}
function untilt(event) { event.currentTarget.style.setProperty("--rx", "0deg"); event.currentTarget.style.setProperty("--ry", "0deg"); }

export async function homePage() {
  const { modules, careerBonus, referral, demo } = ctx.curriculum;
  const leaderboardHost = h("div", { class: "teaser-list" }, skeleton(3));
  ctx.api.publicLeaderboard().then(rows => leaderboardHost.replaceChildren(...rows.slice(0, 3).map(row => h("div", { class: "teaser-row" }, h("span", { class: `rank r${row.rank}` }, `#${row.rank}`), h("span", { class: "grow" }, h("strong", {}, row.name), h("small", { class: "muted" }, ` · ${row.city} · ${row.modules} modules`)), h("strong", { class: "points" }, `${row.points} pts`))))).catch(error => leaderboardHost.replaceChildren(errorBox(error)));

  const hero = h("section", { class: "hero" },
    h("div", { class: "hero-glow a" }), h("div", { class: "hero-glow b" }),
    h("div", { class: "container hero-grid" },
      h("div", { class: "hero-copy" },
        h("p", { class: "eyebrow reveal in" }, icon("spark", 14), "Affordable skill modules · from ", money(1999), " / ", money(39, "USD")),
        h("h1", { class: "display reveal in" }, "Business knowledge. ", h("span", { class: "serif" }, "Practical confidence."), h("br"), "Work you can show."),
        h("p", { class: "lead reveal in" }, "Two-week, tool-based skill modules for MBA graduates and non-technical professionals. Recorded lessons, interactive labs, daily quizzes, human feedback and selected live sessions."),
        h("div", { class: "hero-actions reveal in" }, h("a", { class: "button primary large", href: "#/register" }, "Start with one skill", icon("arrow", 18)), h("a", { class: "button ghost large", href: "#/demo" }, icon("play", 18), "Free 30-minute demo")),
        h("ul", { class: "hero-points reveal in" }, h("li", {}, icon("check", 14), `Any ${careerBonus.qualifyingModules} modules unlock Interview Ready + resume support`), h("li", {}, icon("check", 14), "One active device, OTP sign-in, verified registration"), h("li", {}, icon("check", 14), "Leaderboard badges you can share on LinkedIn"))),
      h("div", { class: "hero-visual reveal in" }, orbit(modules))));

  const stats = h("section", { class: "container stats-row" },
    statCard("08", "focused skill modules", "2 weeks each"), statCard("12 h", "per module", "4 recorded + 2 live + 6 practice"), statCard(`${careerBonus.qualifyingModules}`, "modules unlock the career kit", "Interview Ready + resume support"), statCard(`${referral.refundPercent}%`, "cashback on one module", `after ${referral.qualifyingPeople} qualifying referrals`));

  const how = h("section", { class: "container section" }, sectionHead("How it works", "Register, verify, learn, show.", "A short path from the first payment to work you can explain in an interview."),
    h("div", { class: "steps-grid" }, [
      ["01", "Register and pay", "Choose one or more skill modules, see the exact fee and pay. Every registration is verified by a person."],
      ["02", "Receive your Student ID", "After verification we email your Student ID and a temporary password. Sign-in uses a one-time code and allows one active device."],
      ["03", "Learn and practise", "Short recorded lessons, interactive labs with animation, daily quizzes and a reviewed final project each module."],
      ["04", "Show your evidence", "Climb the leaderboard, earn badges, share them on LinkedIn and add the free career kit after five modules."],
    ].map(([number, title, text], index) => h("div", { class: "step-card reveal", style: { "--i": index } }, h("span", { class: "step-number" }, number), h("h3", {}, title), h("p", { class: "muted" }, text)))));

  const skills = h("section", { class: "container section", id: "skills" }, sectionHead("Skill modules", "Pick one skill. Know the price.", "Every module is separately purchasable. No bundle is required."), h("div", { class: "skills-grid" }, modules.map(module => skillCard(module))), h("div", { class: "center" }, h("a", { class: "button ghost", href: "#/pricing" }, "Compare all fees", icon("arrow", 16))));

  const kit = h("section", { class: "container section" },
    h("div", { class: "kit-panel reveal" },
      h("div", {}, h("p", { class: "eyebrow" }, "Career kit"), h("h2", {}, `Buy any ${careerBonus.qualifyingModules} modules. `, h("span", { class: "serif" }, "Interview Ready and resume support included.")), h("p", { class: "deck" }, "Together or gradually within 12 months. You do not need all eight. One package per learner; details on the pricing page.")),
      h("div", { class: "kit-items" }, ["Interview Ready course + one personal mock", "One resume review", "One done-for-you resume (2 revision rounds)"].map(item => h("div", { class: "kit-item" }, icon("check", 16), item)))));

  const labs = h("section", { class: "container section" }, sectionHead("Interactive labs", "Less watching. More doing.", "Each module has an animated practice lab in the student portal. Here is what you practise."),
    h("div", { class: "labs-grid" }, LABS.map((lab, index) => h("div", { class: `lab-card reveal ${accentClass(modules.find(module => module.id === lab.id))}`, style: { "--i": index } }, h("span", { class: "lab-icon" }, icon(lab.icon, 22)), h("h3", {}, lab.title), h("p", { class: "muted small" }, lab.summary)))));

  const board = h("section", { class: "container section split" },
    h("div", { class: "reveal" }, sectionHead("Leaderboard", "Consistency gets noticed.", "Daily quizzes, labs and graded assignments earn points. The top scorer earns a shareable badge."), leaderboardHost, h("a", { class: "button ghost", href: "#/leaderboard" }, "See the public leaderboard", icon("arrow", 16))),
    h("div", { class: "reveal" }, h("div", { class: "security-card" }, h("p", { class: "eyebrow" }, "Account security"), h("h3", {}, "One device. One-time codes. Verified people."), h("ul", { class: "ticks" }, h("li", {}, icon("check", 14), "Student ID and password are issued only after human verification."), h("li", {}, icon("check", 14), "Each sign-in sends a one-time code to your registered email or phone."), h("li", {}, icon("check", 14), "One active device at a time; another sign-in signs the first device out."), h("li", {}, icon("check", 14), "Frequent device switching triggers a security notice and a review.")))));

  const quotes = h("section", { class: "container section" }, sectionHead("Principles", "The way we learn here.", ""), quotesTicker(PRINCIPLES));

  const demoSection = h("section", { class: "container section" }, h("div", { class: "cta-panel reveal" }, h("div", {}, h("p", { class: "eyebrow" }, "Free demo"), h("h2", {}, demo.title, h("span", { class: "serif" }, " Then decide.")), h("p", { class: "deck" }, `A ${demo.minutes}-minute session: choose a business question, watch a tool workflow, try a short task and see the rubric, workload and fee.`)), h("a", { class: "button primary large", href: "#/demo" }, "See the demo plan", icon("arrow", 18))));

  const page = publicShell(h("div", {}, hero, stats, marquee(COMPANY_NAMES), how, skills, kit, labs, board, quotes, demoSection), { active: "home" });
  queueMicrotask(() => { observeReveals(page); page.querySelectorAll(".stat-value").forEach(element => { const text = element.textContent; const number = Number.parseFloat(text); if (!Number.isNaN(number) && /^\d/.test(text)) countUp(element, number, { suffix: text.replace(/^[\d.]+/, ""), decimals: 0 }); }); });
  return page;
}

export function skillsPage() {
  const { modules } = ctx.curriculum;
  const page = publicShell(h("div", { class: "container section" }, sectionHead("Skill modules", "Eight focused skills. ", "Each module is 2 weeks, 12 learning hours, one interactive lab, daily quizzes and one reviewed project."), h("div", { class: "skills-grid" }, modules.map(module => skillCard(module)))), { active: "skills" });
  queueMicrotask(() => observeReveals(page));
  return page;
}

export function skillDetailPage({ id }) {
  const module = ctx.curriculum.modules.find(item => item.id === id);
  if (!module) return publicShell(h("div", { class: "container section" }, empty("That skill module does not exist.", h("a", { class: "button primary", href: "#/skills" }, "All skills"))), { active: "skills" });
  const lab = LABS.find(item => item.id === id);
  const page = publicShell(h("div", { class: `container section skill-detail ${accentClass(module)}` },
    h("a", { class: "back-link", href: "#/skills" }, icon("arrow", 14), "All skills"),
    h("div", { class: "detail-grid" },
      h("div", {},
        h("p", { class: "eyebrow" }, `Skill ${module.code} · ${module.label}`), h("h1", {}, module.title), h("p", { class: "lead" }, module.bestFor),
        illustration(module.id, { class: "detail-art reveal" }),
        h("div", { class: "outcome-list" }, module.outcomes.map(outcome => h("div", { class: "outcome reveal" }, icon("check", 16), outcome))),
        h("h2", { class: "h3" }, "Four practical sessions"),
        h("div", { class: "session-grid" }, module.sessions.map(([week, title, detail, output]) => h("div", { class: "session-card reveal" }, h("p", { class: "eyebrow" }, week), h("h3", {}, title), h("p", { class: "muted" }, detail), h("p", { class: "small" }, h("strong", {}, "You create: "), output)))),
        h("div", { class: "capstone reveal" }, h("p", { class: "eyebrow" }, "Final project"), h("p", {}, module.capstone), h("p", { class: "small muted" }, h("strong", {}, "Review criteria: "), module.assessment)),
        lab ? h("div", { class: "capstone reveal" }, h("p", { class: "eyebrow" }, "Interactive lab"), h("h3", {}, lab.title), h("p", { class: "muted" }, lab.summary)) : null,
        h("div", { class: "proof reveal" }, h("h3", {}, "How to describe this skill in an interview"), h("blockquote", {}, `“${module.interviewEvidence}”`), h("p", { class: "tiny muted" }, "Use this only after doing the work, and describe it as a learning project."))),
      h("aside", { class: "detail-aside" },
        h("div", { class: "price-card" }, h("p", { class: "eyebrow" }, "Proposed fee"), h("div", { class: "price-big" }, money(module.priceINR)), h("div", { class: "muted" }, `${money(module.priceUSD, "USD")} international`), h("p", { class: "small muted" }, "Per learner. Applicable taxes are shown before payment."), h("a", { class: "button primary block", href: `#/register?module=${module.id}` }, "Register for this skill", icon("arrow", 16)), h("a", { class: "button ghost block", href: "#/demo" }, "Try the free demo first")),
        h("div", { class: "aside-card" }, h("h4", {}, "Primary tool"), h("p", {}, module.tool), h("h4", {}, "Useful in"), h("p", {}, module.roles.join(" · ")), h("h4", {}, "Starting point"), h("p", { class: "small muted" }, module.prerequisite), h("h4", {}, "Research targets"), h("p", { class: "small muted" }, `${module.companies.join(", ")}. Not hiring partners.`), h("p", { class: "tiny muted" }, module.next))))), { active: "skills" });
  queueMicrotask(() => observeReveals(page));
  return page;
}

export function pricingPage(_, query) {
  const { modules, interviewCourse, services, careerBonus, referral } = ctx.curriculum;
  let currency = query.currency === "USD" ? "USD" : "INR";
  const table = h("div", { class: "pricing-table" });
  const render = () => {
    table.replaceChildren(
      h("div", { class: "pricing-head" }, h("span", {}, "Programme"), h("span", { class: "right" }, "Fee")),
      ...modules.map(module => h("a", { class: "pricing-row", href: `#/skills/${module.id}` }, h("span", {}, h("strong", {}, `${module.code} · ${module.title}`), h("small", { class: "muted" }, module.tool)), h("span", { class: "right price" }, money(module[`price${currency}`], currency)))),
      h("div", { class: "pricing-row highlight" }, h("span", {}, h("strong", {}, "Interview Ready (standalone)"), h("small", { class: "muted" }, "2 weeks · 8 hours · one personal mock · free in the career kit")), h("span", { class: "right price" }, money(interviewCourse[`price${currency}`], currency))),
      ...services.map(service => h("div", { class: "pricing-row service" }, h("span", {}, h("strong", {}, service.name), h("small", { class: "muted" }, service.scope)), h("span", { class: "right price" }, money(service[`price${currency}`], currency)))));
  };
  render();
  const toggle = h("div", { class: "segmented", role: "group", "aria-label": "Currency" }, ["INR", "USD"].map(code => h("button", { type: "button", class: code === currency ? "active" : "", onClick: (event) => { currency = code; render(); toggle.querySelectorAll("button").forEach(button => button.classList.toggle("active", button === event.currentTarget)); } }, code === "INR" ? "India · INR" : "International · USD")));
  const page = publicShell(h("div", { class: "container section" },
    sectionHead("Pricing", "Affordable, focused, separately purchasable.", "INR fees are proposed India prices. USD fees are separate international prices, not conversions. Taxes are shown before payment."),
    toggle, table,
    h("div", { class: "two-col" },
      h("div", { class: "kit-panel reveal" }, h("div", {}, h("p", { class: "eyebrow" }, "Career kit"), h("h3", {}, `Buy any ${careerBonus.qualifyingModules} skill modules`), h("p", { class: "muted" }, "Receive Interview Ready, its mock, one resume review and one done-for-you resume at no extra tuition or service fee.")), h("ol", { class: "terms" }, careerBonus.policy.map(term => h("li", {}, term)))),
      h("div", { class: "kit-panel reveal alt" }, h("div", {}, h("p", { class: "eyebrow" }, "Referral cashback"), h("h3", {}, `Refer ${referral.qualifyingPeople}, get ${referral.refundPercent}% of one module back`), h("p", { class: "muted" }, "After five qualifying new paid referrals, receive 50% cashback on one designated paid skill module, not on a whole package.")), h("ol", { class: "terms" }, referral.policy.map(term => h("li", {}, term)))))), { active: "pricing" });
  queueMicrotask(() => observeReveals(page));
  return page;
}

export function demoPage() {
  const { demo } = ctx.curriculum;
  const priceInput = h("input", { class: "input", type: "number", value: 500, min: 1, step: 1, "aria-label": "Price per unit" });
  const costInput = h("input", { class: "input", type: "number", value: 300, min: 0, step: 1, "aria-label": "Variable cost per unit" });
  const unitsInput = h("input", { class: "input", type: "range", min: 0, max: 200, value: 100, "aria-label": "Units sold" });
  const fixedInput = h("input", { class: "input", type: "number", value: 10000, min: 0, step: 100, "aria-label": "Fixed costs" });
  const output = h("div", { class: "demo-output" });
  const bar = h("div", { class: "bar-fill" });
  const compute = () => {
    const price = Number(priceInput.value) || 0, cost = Number(costInput.value) || 0, units = Number(unitsInput.value) || 0, fixed = Number(fixedInput.value) || 0;
    const contribution = price - cost; const revenue = price * units; const total = contribution * units; const surplus = total - fixed; const breakEven = contribution > 0 ? Math.ceil(fixed / contribution) : null;
    output.replaceChildren(
      h("div", { class: "metric" }, h("span", {}, "Units"), h("strong", {}, units)), h("div", { class: "metric" }, h("span", {}, "Revenue"), h("strong", {}, money(revenue))), h("div", { class: "metric" }, h("span", {}, "Contribution"), h("strong", {}, money(total))), h("div", { class: `metric ${surplus >= 0 ? "good" : "bad"}` }, h("span", {}, "After fixed costs"), h("strong", {}, money(surplus))),
      h("p", { class: "small muted full" }, breakEven === null ? "Contribution per unit must be positive before this business can break even." : `Contribution per unit ${money(contribution)} · break-even at ${breakEven} units. Revenue is not profit: fixed costs, taxes and other overheads still apply.`));
    bar.style.width = `${breakEven ? Math.min(100, (units / Math.max(breakEven, 1)) * 50) : 0}%`;
    bar.classList.toggle("over", breakEven !== null && units >= breakEven);
  };
  [priceInput, costInput, unitsInput, fixedInput].forEach(input => input.addEventListener("input", compute));
  compute();
  const page = publicShell(h("div", { class: "container section" },
    sectionHead("Free demo", `${demo.title}. `, `A proposed ${demo.minutes}-minute session at no charge. No enrollment or referral required. Dates are announced when the demo is ready.`),
    h("div", { class: "two-col" },
      h("div", { class: "card reveal" }, h("h3", {}, "Demo agenda"), h("ol", { class: "agenda" }, demo.agenda.map(([time, title, text]) => h("li", {}, h("span", { class: "time" }, time), h("div", {}, h("strong", {}, title), h("p", { class: "muted small" }, text)))))),
      h("div", { class: "card reveal demo-lab" }, h("p", { class: "eyebrow" }, "Try the sample task"), h("h3", {}, "Revenue is not profit. Show why."), h("div", { class: "demo-inputs" }, h("label", {}, "Price per unit", priceInput), h("label", {}, "Variable cost per unit", costInput), h("label", {}, "Fixed costs", fixedInput), h("label", { class: "full" }, "Units sold", unitsInput)), h("div", { class: "bar" }, bar), output, h("p", { class: "tiny muted" }, "Fictional numbers. In the demo you also ask an AI assistant to explain the result and verify every figure in a spreadsheet."))),
    h("div", { class: "center" }, h("a", { class: "button primary large", href: "#/register" }, "Register for a skill module", icon("arrow", 18)))), { active: "demo" });
  queueMicrotask(() => observeReveals(page));
  return page;
}

export async function publicLeaderboardPage() {
  const host = h("div", { class: "board" }, skeleton(5));
  ctx.api.publicLeaderboard().then(rows => {
    const max = Math.max(1, ...rows.map(row => row.points));
    host.replaceChildren(...rows.map(row => h("div", { class: "board-row reveal in" }, h("span", { class: `rank r${row.rank}` }, `#${row.rank}`), h("div", { class: "grow" }, h("div", { class: "board-name" }, h("strong", {}, row.name), h("small", { class: "muted" }, ` · ${row.city} · ${row.modules} modules`)), h("div", { class: "bar" }, h("div", { class: "bar-fill", style: { width: `${(row.points / max) * 100}%` } }))), h("strong", { class: "points" }, `${row.points} pts`))));
  }).catch(error => host.replaceChildren(errorBox(error)));
  return publicShell(h("div", { class: "container section narrow" }, sectionHead("Public leaderboard", "Top learners this season.", "Names are shortened for privacy. Students see the full board, their rank and badges in the portal."), host, h("p", { class: "tiny muted" }, "Preview shows fictional learners. Points come from daily quizzes, labs and graded assignments.")), { active: "leaderboard" });
}

export function faqPage() {
  const items = [
    ["Can I buy only one module?", "Yes. There is no compulsory bundle or subscription. Buy what helps your goal."],
    ["How does sign-in work?", "After payment and human verification you receive a Student ID and temporary password. Each sign-in sends a one-time code to your registered email or phone. One device can stay signed in at a time; signing in elsewhere signs the first device out, and frequent switching triggers a security notice."],
    ["How do refunds work?", "Proposed policy: request a tuition refund within 7 calendar days of first access to a module. Final cancellation, tax and processing terms are confirmed before payment."],
    ["Will this guarantee a job?", "No. Employers assess your broader experience. No guaranteed interview, salary, placement percentage or ATS score is offered. Company names on this site are research targets, not partners."],
    ["How is my data handled?", "Share only what is needed. Profile pictures and submissions stay in your account; resumes are never uploaded to AI tools without explicit permission. A full privacy notice is published before intake opens."],
  ];
  return publicShell(h("div", { class: "container section narrow" }, sectionHead("Before you enroll", "Clear expectations.", "Pre-launch preview: nothing here confirms that live batches or the website are already available."), h("div", { class: "faq" }, items.map(([question, answer]) => h("details", { class: "faq-item" }, h("summary", {}, question, icon("arrow", 16)), h("p", {}, answer))))), { active: "faq" });
}

export async function badgePage({ code }) {
  const host = h("div", { class: "badge-page" }, skeleton(4));
  try {
    const badge = await ctx.api.badge(code);
    host.replaceChildren(h("div", { class: "badge-card" }, h("div", { class: "badge-seal" }, icon("trophy", 40)), h("p", { class: "eyebrow" }, badge.kind), h("h1", {}, badge.name), h("p", { class: "muted" }, `${badge.points} points · ${badge.modules.length} skill module${badge.modules.length === 1 ? "" : "s"} · issued ${formatDate(badge.issuedAt)}`), h("p", { class: "small" }, badge.modules.join(" · ")), h("p", { class: "tiny muted" }, `Badge code ${badge.code}. Preview badge: verification against a live record is not yet available.`)));
  } catch (error) { host.replaceChildren(empty(error.message, h("a", { class: "button ghost", href: "#/leaderboard" }, "Public leaderboard"))); }
  return publicShell(h("div", { class: "container section narrow center" }, host), { active: "" });
}

export function notFoundPage() {
  return publicShell(h("div", { class: "container section narrow center" }, h("p", { class: "eyebrow" }, "404"), h("h1", {}, "That page is not here."), h("p", { class: "muted" }, "Try the skills catalogue or sign in."), h("div", { class: "hero-actions center" }, h("a", { class: "button primary", href: "#/skills" }, "Skills"), h("a", { class: "button ghost", href: "#/login" }, "Sign in"))), { active: "" });
}

export { ring };
