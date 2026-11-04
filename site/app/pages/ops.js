import { h, icon, money, skeleton, toast, busy, formatTime, field, formData, modal, showFieldErrors, relative, readFileRecord } from "../ui.js";
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
      const teamHost = h("div", { class: "stack" }, skeleton(3));
      const renderTeam = async () => {
        const team = await ctx.api.opsTeam(withSession());
        const createForm = h("form", { class: "form-grid two", novalidate: true, onSubmit: async (event) => { event.preventDefault(); const values = formData(createForm); const button = createForm.querySelector("button[type=submit]"); busy(button, true, "Creating"); try { const result = await ctx.api.opsCreateAdmin(withSession(values)); document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh")); modal({ title: "Admin account created", body: h("div", {}, h("p", {}, `${values.name}: Admin ID ${result.adminId}, role ${result.role}.`), h("p", { class: "small" }, "Temporary password (shown once; also sent to their email in production): ", h("strong", {}, result.previewTemporaryPassword)), h("p", { class: "tiny muted" }, "They set their own password at first sign-in; every sign-in also needs a one-time code.")), actions: [{ label: "Done" }] }); createForm.reset(); renderTeam(); } catch (error) { if (!showFieldErrors(createForm, error.extra?.fields ?? {})) toast(error.message, "error"); } finally { busy(button, false, "Create admin"); } } },
          field({ label: "Name", name: "name", required: true }), field({ label: "Email", name: "email", type: "email", required: true }), field({ label: "Mobile (with country code)", name: "phone", type: "tel", required: true, placeholder: "+91..." }), field({ label: "Role", name: "role", type: "select", value: "content", options: Object.entries(team.roles).map(([value, role]) => ({ value, label: role.label })) }),
          h("div", { class: "form-actions" }, h("button", { class: "button primary small", type: "submit" }, icon("user", 14), "Create admin")));
        teamHost.replaceChildren(
          h("div", { class: "table-wrap" }, h("table", { class: "data-table" }, h("thead", {}, h("tr", {}, ["Person", "Admin ID", "Role", "Status", "Last sign-in", "Open tasks", ""].map(label => h("th", {}, label)))), h("tbody", {}, team.admins.map(admin => h("tr", {}, h("td", {}, h("strong", {}, admin.name), h("br"), h("span", { class: "tiny muted" }, admin.email)), h("td", {}, admin.adminId), h("td", {}, h("select", { class: "input small", "aria-label": `Role for ${admin.name}`, onChange: async (event) => { try { await ctx.api.opsSetAdmin(withSession({ adminUserId: admin.id, role: event.target.value })); toast("Role updated.", "success"); renderTeam(); } catch (error) { toast(error.message, "error"); } } }, Object.entries(team.roles).map(([value, role]) => h("option", { value, selected: value === admin.role }, role.label)))), h("td", {}, h("span", { class: `tag ${admin.status === "active" ? "good" : "bad"}` }, admin.status), admin.mustChangePassword ? h("span", { class: "tiny muted" }, " · temp password") : null), h("td", {}, admin.lastSignIn ? relative(admin.lastSignIn) : "never"), h("td", {}, admin.openTasks), h("td", {}, h("div", { class: "task-actions" }, h("button", { class: "mini", type: "button", onClick: () => modal({ title: `Reset password for ${admin.name}?`, body: h("p", {}, "A new temporary password is generated and every active session is signed out."), actions: [{ label: "Reset", variant: "danger", onClick: async () => { const result = await ctx.api.opsResetAdmin(withSession({ adminUserId: admin.id })); document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh")); toast(`Temporary password for ${result.adminId}: ${result.previewTemporaryPassword}`, "info", 12000); renderTeam(); } }] }) }, "Reset password"), h("button", { class: "mini", type: "button", onClick: async () => { try { await ctx.api.opsSetAdmin(withSession({ adminUserId: admin.id, status: admin.status === "active" ? "suspended" : "active" })); renderTeam(); } catch (error) { toast(error.message, "error"); } } }, admin.status === "active" ? "Suspend" : "Reactivate")))))))),
          h("div", { class: "grid-2" }, Object.entries(team.roles).map(([key, role]) => h("div", { class: "panel-mini" }, h("span", { class: `role-pill ${key}` }, role.label), h("p", { class: "tiny muted" }, role.summary)))),
          h("details", { class: "edit-row new" }, h("summary", {}, icon("user", 14), "Create an admin account"), createForm));
      };
      renderTeam().catch(error => teamHost.replaceChildren(errorBox(error)));
      host.replaceChildren(
        h("div", { class: "alert info" }, icon("shield", 16), h("span", {}, "Unlisted is not private. This preview uses a passphrase; production must put this view behind server-side authorisation, an allow-list and audit logging before any real data appears here.")),
        h("p", { class: "eyebrow" }, `Generated ${formatTime(data.generatedAt)}`), h("h1", {}, "Operations snapshot"),
        h("div", { class: "stat-grid" }, data.funnel.map(step => h("div", { class: "stat-card" }, h("strong", { class: "stat-value" }, step.count), h("span", { class: "stat-label" }, step.status.replace("_", " ")))), h("div", { class: "stat-card" }, h("strong", { class: "stat-value" }, data.openAlerts), h("span", { class: "stat-label" }, "open device alerts")), h("div", { class: "stat-card" }, h("strong", { class: "stat-value" }, data.ungraded), h("span", { class: "stat-label" }, "ungraded submissions"))),
        h("div", { class: "grid-2" }, data.byCurrency.map(row => h("div", { class: "card" }, h("h3", {}, `${row.currency} collections (preview)`), [["Gross module and service collections", money(row.gross, row.currency)], ["Module sales counted", row.moduleSales], ["Service sales counted", row.serviceSales], ["Active learners billed in this currency", row.learners], ["Career kits unlocked", row.kitsUnlocked]].map(([label, value]) => h("div", { class: "order-line" }, h("span", {}, label), h("strong", {}, value))), h("p", { class: "tiny muted" }, "Fictional preview collections. Reserve rates, fulfilment costs and margins stay in the private business model and the production backend; they are not published in this public preview.")))),
        h("div", { class: "card" }, h("h3", {}, "Cohort fill against the proposed 12-learner cap"), h("div", { class: "cohort-grid" }, data.cohorts.map(cohort => h("div", { class: "cohort" }, h("div", { class: "cohort-head" }, h("strong", {}, cohort.title), h("span", { class: "small muted" }, `${cohort.enrolled}/${cohort.limit}`)), h("div", { class: "bar" }, h("div", { class: `bar-fill ${cohort.enrolled >= cohort.limit ? "over" : ""}`, style: { width: `${Math.min(100, (cohort.enrolled / cohort.limit) * 100)}%` } })))))),
        h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, icon("user", 18), "Admin team and roles"), h("span", { class: "tiny muted" }, "No CEO/CTO titles: three working roles")), h("p", { class: "small muted" }, "Create admin accounts here, share the Admin ID and temporary password privately, and assign work from the admin tracker. Each person sets their own password at first sign-in."), teamHost),
        companiesCard(),
        h("div", { class: "card" }, h("h3", {}, "Founder notes"), noteForm, notesList),
        h("p", { class: "tiny muted" }, "Preview data is fictional. Launch gates, pricing authority and spending limits remain as recorded in the private business model PDF."));
    } catch (error) {
      if (["SESSION_REVOKED", "AUTH_REQUIRED", "SESSION_EXPIRED", "DEVICE_MISMATCH", "FORBIDDEN"].includes(error.code)) { setAuth({}); location.hash = "#/ops/login"; return; }
      host.replaceChildren(errorBox(error));
    }
  })();
  return page;
}


// Hiring-company list shown on the public site. A logo is published only with a recorded written permission;
// without it the site keeps showing the neutral monogram chip. Names are nominative use and need no permission.
function companiesCard() {
  const host = h("div", { class: "stack" }, skeleton(3));
  const render = async () => {
    const companies = await ctx.api.opsCompanies(withSession());
    const form = (company = {}) => {
      const logoInput = h("input", { type: "file", accept: "image/png,image/jpeg,image/svg+xml,image/webp", class: "input" });
      let logoRecord;
      logoInput.addEventListener("change", async () => { const file = logoInput.files[0]; logoRecord = file ? await readFileRecord(file, { maxStoredBytes: 60 * 1024 }) : undefined; if (file && !logoRecord.dataUrl) toast("Logo files must be 60 KB or smaller.", "error"); });
      const requestEmail = () => `Subject: Request to display the ${company.name || "[Company]"} logo on Rolevia's "where these skills are used" page

Dear ${company.name || "[Company]"} brand team,

I run Rolevia, a small business-skills studio in India that teaches practical tools (spreadsheets, dashboards, CRM, budgeting) to non-technical MBA graduates. On our public website we list companies whose published job advertisements ask for these skills, as research targets for our learners.

We would like permission to show the ${company.name || "[Company]"} logo next to your company name in that list. The page states clearly that Rolevia has no partnership with, endorsement from or placement arrangement with any listed company, and we would reproduce the logo exactly as supplied in your brand guidelines, without alteration, at a small size, on this page only: ${location.origin}${location.pathname}

If you agree, could you reply with written confirmation and the preferred logo file (or a link to your brand resources), and let us know of any conditions? We will remove the logo immediately on request at any time. Until we hear from you the page shows only your company name.

Thank you for considering this.

Arindam Chatterjee
Founder, Rolevia`;
      const copyEmail = h("button", { class: "button ghost small", type: "button", onClick: async () => { try { await navigator.clipboard.writeText(requestEmail()); toast("Permission request email copied. Send it from your own mailbox and record the date below.", "success", 6000); } catch { modal({ title: "Permission request email", body: h("pre", { class: "ai-prompt" }, requestEmail()), actions: [{ label: "Close" }] }); } } }, icon("mail", 14), "Copy permission request email");
      const element = h("form", { class: "form-grid two company-form", novalidate: true, onSubmit: async (event) => {
        event.preventDefault();
        const values = formData(element);
        const button = element.querySelector("button[type=submit]");
        busy(button, true, "Saving");
        try {
          const permission = values.grantedBy || values.reference || values.date ? { grantedBy: values.grantedBy, reference: values.reference, date: values.date } : (company.permission && values.keepPermission ? undefined : null);
          await ctx.api.opsUpsertCompany(withSession({ company: { id: company.id, name: values.name, sector: values.sector, careersUrl: values.careersUrl, visible: values.visible === "on", logo: logoRecord?.dataUrl ? logoRecord : values.removeLogo === "on" ? null : undefined, permission, request: { status: values.requestStatus, date: values.requestDate, contact: values.requestContact, notes: values.requestNotes } } }));
          toast(company.id ? "Company updated." : "Company added.", "success");
          render();
        } catch (error) { if (!showFieldErrors(element, error.extra?.fields ?? {})) toast(error.message, "error"); busy(button, false); }
      } },
        field({ label: "Company name", name: "name", value: company.name ?? "", required: true }),
        field({ label: "Sector shown under the name", name: "sector", value: company.sector ?? "", placeholder: "IT services" }),
        field({ label: "Public careers page (https, optional)", name: "careersUrl", type: "url", value: company.careersUrl ?? "", placeholder: "https://…/careers" }),
        h("div", { class: "field span-2 permission-box request-box" }, h("span", { class: "field-label" }, "Logo permission request (the legitimate route to a real logo)"),
          h("div", { class: "form-grid three" }, field({ label: "Status", name: "requestStatus", type: "select", value: company.request?.status ?? "none", options: [{ value: "none", label: "Not requested yet" }, { value: "requested", label: "Requested, awaiting reply" }, { value: "granted", label: "Granted (record the permission below)" }, { value: "declined", label: "Declined (keep the name only)" }] }), field({ label: "Date sent / decided", name: "requestDate", type: "date", value: company.request?.date ?? "" }), field({ label: "Contact (brand or press team)", name: "requestContact", value: company.request?.contact ?? "", placeholder: "brand@…" })),
          field({ label: "Notes", name: "requestNotes", value: company.request?.notes ?? "", placeholder: "Brand guidelines link, conditions, follow-up date" }),
          h("div", { class: "form-actions start" }, copyEmail), h("p", { class: "tiny muted" }, "Send the request from your own mailbox. When a company replies yes, upload the file they supply and record the permission; the logo then appears automatically.")),
        h("label", { class: "field" }, h("span", { class: "field-label" }, "Logo file (PNG, JPG, SVG or WebP, up to 60 KB)"), logoInput, h("span", { class: "field-hint" }, company.logo ? `Current: ${company.logo.name}` : "No logo on file. Use the file the company's brand team supplied.")),
        h("div", { class: "field" }, h("span", { class: "field-label" }, "Publication"), h("label", { class: "check" }, h("input", { type: "checkbox", name: "visible", checked: company.visible !== false }), h("span", { class: "small" }, "Show this company on the public site")), company.logo ? h("label", { class: "check" }, h("input", { type: "checkbox", name: "removeLogo" }), h("span", { class: "small" }, "Remove the logo")) : null),
        h("div", { class: "field span-2 permission-box" }, h("span", { class: "field-label" }, "Written permission to show the logo (required before a logo is published)"), company.permission ? h("p", { class: "tiny" }, `On file: ${company.permission.grantedBy}, ${company.permission.reference}, ${company.permission.date}. `, h("label", { class: "check inline" }, h("input", { type: "checkbox", name: "keepPermission", checked: true }), h("span", { class: "small" }, "keep"))) : null,
          h("div", { class: "form-grid three" }, field({ label: "Granted by (name, role, company)", name: "grantedBy", value: "" }), field({ label: "Reference (email subject, letter, licence id)", name: "reference", value: "" }), field({ label: "Date", name: "date", type: "date", value: "" })),
          h("p", { class: "tiny muted" }, "Company logos are trademarks. Rolevia publishes a logo only when the owner has given written permission for this use; the record above is what the public page cites. Until then the site shows a neutral monogram chip with the company name.")),
        h("div", { class: "form-actions span-2" }, company.id ? h("button", { class: "link-button danger", type: "button", onClick: () => modal({ title: `Remove ${company.name}?`, body: h("p", {}, "The company disappears from the public marquee."), actions: [{ label: "Remove", variant: "danger", onClick: async () => { await ctx.api.opsDeleteCompany(withSession({ companyId: company.id })); render(); } }] }) }, "Remove") : null, h("button", { class: "button primary small", type: "submit" }, company.id ? "Save" : "Add company")));
      return element;
    };
    host.replaceChildren(
      h("p", { class: "small muted" }, `${companies.length} companies listed · ${companies.filter(company => company.logo && company.permission).length} with a permitted logo · ${companies.filter(company => company.request?.status === "requested").length} permission requests awaiting a reply · ${companies.filter(company => company.request?.status === "declined").length} declined · ${companies.filter(company => company.logo && !company.permission).length} with a logo on file but no permission record (not published).`),
      h("div", { class: "company-rows" }, companies.map(company => h("details", { class: "company-row" }, h("summary", {}, company.logo && company.permission ? h("img", { class: "company-logo", src: company.logo.dataUrl, alt: "" }) : h("span", { class: "monogram" }, company.name.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase()), h("strong", {}, company.name), h("span", { class: `tag ${company.logo && company.permission ? "good" : company.logo ? "pending" : ""}` }, company.logo && company.permission ? "logo published" : company.logo ? "logo held, no permission" : "name only"), company.request?.status && company.request.status !== "none" ? h("span", { class: `tag ${company.request.status === "granted" ? "good" : company.request.status === "declined" ? "bad" : "pending"}` }, `permission ${company.request.status}`) : null, company.visible === false ? h("span", { class: "tag bad" }, "hidden") : null), form(company)))),
      h("details", { class: "company-row add" }, h("summary", {}, icon("spark", 14), h("strong", {}, "Add a company")), form()));
  };
  render().catch(error => host.replaceChildren(errorBox(error)));
  return h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, icon("star", 18), "Hiring companies on the public site"), h("span", { class: "tiny muted" }, "Names: nominative use · Logos: permission required")), host);
}
