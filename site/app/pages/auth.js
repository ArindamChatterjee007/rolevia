import { h, icon, money, field, formData, busy, toast, showFieldErrors, clearFieldErrors } from "../ui.js";
import { ctx, setAuth } from "../context.js";
import { publicShell, errorBox } from "./components.js";

const REGISTER_KEY = "rolevia.registration.v1";
const loadDraft = () => { try { return JSON.parse(sessionStorage.getItem(REGISTER_KEY)) ?? {}; } catch { return {}; } };
const saveDraft = (draft) => sessionStorage.setItem(REGISTER_KEY, JSON.stringify(draft));

function stepper(current) {
  const steps = ["Your details", "Choose skills", "Review & pay", "Verification"];
  return h("ol", { class: "stepper", "aria-label": "Registration progress" }, steps.map((label, index) => h("li", { class: index + 1 < current ? "done" : index + 1 === current ? "current" : "", "aria-current": index + 1 === current ? "step" : null }, h("span", { class: "step-dot" }, index + 1 < current ? icon("check", 12) : index + 1), h("span", {}, label))));
}

function authShell(content, { title, eyebrow, aside }) {
  return publicShell(h("div", { class: "container section auth-layout" },
    h("div", { class: "auth-main" }, h("p", { class: "eyebrow" }, eyebrow), h("h1", {}, title), content),
    aside ? h("aside", { class: "auth-aside" }, aside) : null), { active: "" });
}

export function registerPage(_, query) {
  const draft = loadDraft();
  if (query.module && !draft.moduleIds?.includes(query.module)) { draft.moduleIds = [...(draft.moduleIds ?? []), query.module]; saveDraft(draft); }
  const step = draft.applicationId ? (draft.paid ? 4 : 3) : Number(query.step) || (draft.name ? 2 : 1);
  if (step === 1) return detailsStep(draft);
  if (step === 2) return skillsStep(draft);
  if (step === 3) return paymentStep(draft);
  return verificationStep(draft);
}

function detailsStep(draft) {
  const error = h("div");
  let challenge = draft.contactChallengeId ? { challengeId: draft.contactChallengeId, channels: draft.contactChannels ?? [] } : null;
  const wrapper = h("div");
  const validate = (values) => {
    const fields = {};
    if (!values.name?.trim() || values.name.trim().length < 2) fields.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email ?? "")) fields.email = "Enter a valid email address.";
    if (!/^\+?[0-9\s-]{8,16}$/.test(values.phone ?? "")) fields.phone = "Enter a mobile number with country code, e.g. +91 98XXXXXXXX.";
    if (!values.city?.trim()) fields.city = "Enter your city.";
    if (!values.education) fields.education = "Choose your highest qualification.";
    if (values.graduationYear && !(Number(values.graduationYear) >= 1990 && Number(values.graduationYear) <= 2030)) fields.graduationYear = "Enter a valid year.";
    if (!values.currentStatus) fields.currentStatus = "Tell us your current situation.";
    if (!values.preferredSlot) fields.preferredSlot = "Pick a live-session slot.";
    if ((values.goal ?? "").trim().length < 10) fields.goal = "One sentence about your goal (at least 10 characters).";
    return fields;
  };
  const form = h("form", { class: "form-grid two", novalidate: true, onSubmit: async (event) => {
    event.preventDefault();
    const values = formData(form);
    const fields = validate(values);
    if (showFieldErrors(form, fields)) { error.replaceChildren(errorBox(new Error("Please fix the highlighted fields."))); return; }
    error.replaceChildren();
    const button = form.querySelector("button[type=submit]");
    busy(button, true, "Sending code");
    try {
      challenge = await ctx.api.requestContactCode({ email: values.email, phone: values.phone });
      saveDraft({ ...draft, ...values, moduleIds: draft.moduleIds ?? [], contactChallengeId: challenge.challengeId, contactChannels: challenge.channels, contactCode: "" });
      document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh"));
      renderCode(values);
    } catch (apiError) { if (!showFieldErrors(form, apiError.extra?.field ? { [apiError.extra.field]: apiError.message } : apiError.extra?.fields ?? {})) error.replaceChildren(errorBox(apiError)); busy(button, false); }
  } },
    field({ label: "Full name", name: "name", value: draft.name ?? "", required: true, autocomplete: "name", placeholder: "As on your degree certificate" }),
    field({ label: "City", name: "city", value: draft.city ?? "", required: true, autocomplete: "address-level2" }),
    field({ label: "Email", name: "email", type: "email", value: draft.email ?? "", required: true, autocomplete: "email", hint: "Your Student ID and one-time codes go here." }),
    field({ label: "Mobile number", name: "phone", type: "tel", value: draft.phone ?? "", required: true, autocomplete: "tel", placeholder: "+91 98XXXXXXXX", hint: "Used only for one-time codes." }),
    field({ label: "Highest qualification", name: "education", type: "select", value: draft.education ?? "", required: true, options: [{ value: "", label: "Choose" }, { value: "mba", label: "MBA" }, { value: "pgdm", label: "PGDM" }, { value: "graduate", label: "Graduate (any stream)" }, { value: "other", label: "Other" }] }),
    field({ label: "Graduation year (optional)", name: "graduationYear", type: "number", value: draft.graduationYear ?? "", min: 1990, max: 2030, placeholder: "2025" }),
    field({ label: "Current situation", name: "currentStatus", type: "select", value: draft.currentStatus ?? "", required: true, options: [{ value: "", label: "Choose" }, { value: "student", label: "Still studying" }, { value: "fresher", label: "Graduated, looking for a first role" }, { value: "working", label: "Working, want to upskill" }, { value: "switching", label: "Working, want to switch roles" }] }),
    field({ label: "Preferred live-session slot", name: "preferredSlot", type: "select", value: draft.preferredSlot ?? "", required: true, options: [{ value: "", label: "Choose" }, { value: "weekday-evening", label: "Weekday evenings (IST)" }, { value: "weekend-morning", label: "Weekend mornings (IST)" }, { value: "weekend-evening", label: "Weekend evenings (IST)" }], hint: "Confirmed by email before each module starts." }),
    field({ label: "What do you want this skill for?", name: "goal", type: "textarea", value: draft.goal ?? "", required: true, rows: 2, placeholder: "One sentence, e.g. move into an operations analyst role within six months." }),
    field({ label: "Referral code (optional)", name: "referralCode", value: draft.referralCode ?? "", placeholder: "RV-REF-XXXXX" }),
    error,
    h("div", { class: "form-actions" }, h("button", { class: "button primary large", type: "submit" }, "Send confirmation code", icon("mail", 16))));
  const renderCode = (values) => {
    const codeForm = h("form", { class: "form-grid", novalidate: true, onSubmit: (event) => {
      event.preventDefault();
      const code = formData(codeForm).contactCode?.trim() ?? "";
      if (!/^\d{6}$/.test(code)) { showFieldErrors(codeForm, { contactCode: "Enter the 6-digit code." }); return; }
      saveDraft({ ...loadDraft(), contactCode: code });
      location.hash = "#/register?step=2";
    } },
      h("div", { class: "alert info" }, icon("mail", 16), h("span", {}, `We sent a 6-digit code to ${challenge.channels.join(" and ")}. Enter it to confirm your contact details.`)),
      field({ label: "Confirmation code", name: "contactCode", inputmode: "numeric", required: true, autocomplete: "one-time-code" }),
      h("div", { class: "form-actions between" }, h("button", { class: "link-button", type: "button", onClick: () => { challenge = null; wrapper.replaceChildren(form); } }, "Edit details"), h("button", { class: "button primary large", type: "submit" }, "Confirm and continue", icon("arrow", 16))),
      h("p", { class: "tiny muted" }, "Preview: the code is in the preview inbox (bottom-right). Production sends it to your email and phone."));
    wrapper.replaceChildren(codeForm);
  };
  wrapper.append(form);
  if (challenge && draft.email) renderCode(draft);
  return authShell(h("div", {}, stepper(1), wrapper), { eyebrow: "Student registration", title: "Tell us who is learning.", aside: registrationAside() });
}

function skillsStep(draft) {
  const { modules, careerBonus } = ctx.curriculum;
  const selected = new Set(draft.moduleIds ?? []);
  const total = h("div", { class: "plan-total" });
  const progress = h("div", { class: "kit-progress" });
  const refresh = () => {
    const chosen = modules.filter(module => selected.has(module.id));
    total.replaceChildren(h("span", {}, `${chosen.length} module${chosen.length === 1 ? "" : "s"}`), h("strong", {}, money(chosen.reduce((sum, module) => sum + module.priceINR, 0))), h("small", { class: "muted" }, ` / ${money(chosen.reduce((sum, module) => sum + module.priceUSD, 0), "USD")}`));
    const count = Math.min(chosen.length, careerBonus.qualifyingModules);
    progress.replaceChildren(h("div", { class: "kit-progress-bar" }, h("div", { style: { width: `${(count / careerBonus.qualifyingModules) * 100}%` } })), h("span", { class: "small" }, chosen.length >= careerBonus.qualifyingModules ? "Career kit unlocked: Interview Ready + resume support included at no extra charge." : `${careerBonus.qualifyingModules - chosen.length} more module${careerBonus.qualifyingModules - chosen.length === 1 ? "" : "s"} unlock the free career kit (optional).`));
    grid.querySelectorAll(".choice").forEach(card => card.classList.toggle("selected", selected.has(card.dataset.id)));
  };
  const grid = h("div", { class: "choice-grid" }, modules.map(module => h("button", { type: "button", class: `choice accent-${module.accent}`, dataset: { id: module.id }, "aria-pressed": String(selected.has(module.id)), onClick: (event) => { if (selected.has(module.id)) selected.delete(module.id); else selected.add(module.id); event.currentTarget.setAttribute("aria-pressed", String(selected.has(module.id))); refresh(); } },
    h("span", { class: "choice-check" }, icon("check", 14)), h("span", { class: "code" }, module.code), h("strong", {}, module.title), h("small", { class: "muted" }, module.tool), h("span", { class: "price" }, money(module.priceINR), h("small", {}, ` / ${money(module.priceUSD, "USD")}`)))));
  refresh();
  const error = h("div");
  const terms = h("input", { type: "checkbox", name: "acceptedTerms", checked: true, required: true });
  const next = h("button", { class: "button primary large", type: "button", onClick: async (event) => {
    if (!selected.size) { error.replaceChildren(errorBox(new Error("Choose at least one skill module."))); return; }
    if (!terms.checked) { error.replaceChildren(errorBox(new Error("Please accept the proposed terms to continue."))); return; }
    if (!draft.contactChallengeId || !draft.contactCode) { location.hash = "#/register?step=1"; return; }
    busy(event.currentTarget, true, "Creating application");
    try {
      const result = await ctx.api.register({ ...draft, moduleIds: [...selected], acceptedTerms: terms.checked });
      saveDraft({ ...draft, moduleIds: [...selected], applicationId: result.applicationId, reference: result.reference });
      location.hash = "#/register?step=3";
    } catch (apiError) {
      if (["CONTACT_UNVERIFIED", "OTP_INVALID", "OTP_EXPIRED", "OTP_LOCKED"].includes(apiError.code)) { saveDraft({ ...draft, moduleIds: [...selected], contactChallengeId: null, contactCode: "" }); toast(apiError.message, "error", 6000); location.hash = "#/register?step=1"; return; }
      if (apiError.extra?.fields) { saveDraft({ ...draft, moduleIds: [...selected] }); toast("Some details need a correction.", "error"); location.hash = "#/register?step=1"; return; }
      error.replaceChildren(errorBox(apiError)); busy(event.currentTarget, false);
    }
  } }, "Review and pay", icon("arrow", 16));
  return authShell(h("div", {}, stepper(2), h("p", { class: "muted" }, "Choose one or more skill modules. You can add more later from the portal."), grid, progress, total, h("label", { class: "check" }, terms, h("span", { class: "small" }, "I accept the proposed terms: fees exclude applicable taxes, 7-day refund window from first access, one active device per account, fictional preview payment.")), error, h("div", { class: "form-actions" }, h("a", { class: "button ghost", href: "#/register?step=1" }, "Back"), next)), { eyebrow: "Student registration", title: "Choose your skills.", aside: registrationAside() });
}

function paymentStep(draft) {
  const { modules } = ctx.curriculum;
  const chosen = modules.filter(module => draft.moduleIds?.includes(module.id));
  let currency = draft.currency ?? "INR";
  const summary = h("div", { class: "order-summary" });
  const renderSummary = () => {
    const subtotal = chosen.reduce((sum, module) => sum + module[`price${currency}`], 0);
    summary.replaceChildren(...chosen.map(module => h("div", { class: "order-line" }, h("span", {}, module.title), h("span", {}, money(module[`price${currency}`], currency)))), h("div", { class: "order-line total" }, h("span", {}, "Total before taxes"), h("strong", {}, money(subtotal, currency))), h("p", { class: "tiny muted" }, "Applicable taxes are itemised at checkout. Preview mode charges nothing."));
  };
  renderSummary();
  const toggle = h("div", { class: "segmented", role: "group", "aria-label": "Billing currency" }, ["INR", "USD"].map(code => h("button", { type: "button", class: code === currency ? "active" : "", onClick: (event) => { currency = code; renderSummary(); toggle.querySelectorAll("button").forEach(button => button.classList.toggle("active", button === event.currentTarget)); } }, code)));
  const error = h("div");
  const card = h("div", { class: "pay-card" }, h("div", { class: "pay-card-chip" }), h("span", { class: "pay-card-number" }, "4242 •••• •••• 4242"), h("span", { class: "pay-card-name" }, draft.name ?? "Student"), h("span", { class: "pay-card-brand" }, "PREVIEW"));
  const pay = async (event, outcome) => {
    const button = event.currentTarget;
    busy(button, true, "Processing");
    try {
      const result = await ctx.api.pay({ applicationId: draft.applicationId, currency, outcome });
      saveDraft({ ...draft, currency, paid: true, paymentId: result.payment.id, reference: result.reference });
      document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh"));
      toast("Payment recorded. Verification is next.", "success");
      location.hash = "#/register?step=4";
    } catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); }
  };
  return authShell(h("div", {}, stepper(3), h("p", { class: "muted" }, "Payment comes before credentials. After payment, a person verifies the registration and emails your Student ID."), toggle, h("div", { class: "pay-grid" }, card, summary), error,
    h("div", { class: "form-actions" }, h("a", { class: "button ghost", href: "#/register?step=2" }, "Change skills"), h("button", { class: "button ghost", type: "button", onClick: (event) => pay(event, "declined") }, "Simulate declined"), h("button", { class: "button primary large", type: "button", onClick: (event) => pay(event, "success") }, icon("lock", 16), "Pay (preview)")),
    h("p", { class: "tiny muted" }, `Application reference ${draft.reference}. Production uses a PCI-compliant payment provider and server-side webhooks; card data never touches Rolevia servers.`)), { eyebrow: "Student registration", title: "Review and pay.", aside: registrationAside() });
}

function verificationStep(draft) {
  const status = h("div", { class: "status-card" }, h("span", { class: "spinner" }), " Checking status");
  const refresh = async () => {
    try {
      const result = await ctx.api.applicationStatus(draft.applicationId);
      const verified = result.status === "active";
      status.replaceChildren(h("div", { class: `status-badge ${verified ? "good" : "pending"}` }, icon(verified ? "check" : "shield", 16), verified ? "Verified: credentials sent" : "Awaiting human verification"), h("p", {}, verified ? `Your Student ID ${result.studentId} and a temporary password were sent to your email. Sign in to set a new password.` : "We verify every registration within 1 business day. You will receive your Student ID and a temporary password by email and SMS."), verified ? h("a", { class: "button primary", href: "#/login" }, "Go to sign-in", icon("arrow", 16)) : h("button", { class: "button ghost small", type: "button", onClick: refresh }, icon("refresh", 14), "Check again"));
    } catch (error) { status.replaceChildren(errorBox(error)); }
  };
  refresh();
  return authShell(h("div", {}, stepper(4), h("p", { class: "muted" }, `Reference ${draft.reference}. Keep it for support questions.`), status, h("div", { class: "info-grid" }, [["Verification", "A person checks the payment and details; nothing is automatic."], ["Credentials", "Student ID + temporary password by email and SMS. Change the password at first sign-in."], ["Sign-in security", "One-time code each time; one active device per account."]].map(([title, text]) => h("div", { class: "info-card" }, h("strong", {}, title), h("p", { class: "small muted" }, text)))), h("p", { class: "tiny muted" }, "Preview: open the preview inbox to see the verification email. An admin verifies registrations from the admin console."), h("button", { class: "link-button", type: "button", onClick: () => { sessionStorage.removeItem(REGISTER_KEY); location.hash = "#/register"; } }, "Start a new registration")), { eyebrow: "Student registration", title: "Thank you. Verification is in progress.", aside: registrationAside() });
}

function registrationAside() {
  return h("div", { class: "aside-card" }, h("h4", {}, "What happens next"), h("ol", { class: "mini-steps" }, h("li", {}, "Fill the form and confirm your email with a code."), h("li", {}, "Choose skills and pay."), h("li", {}, "We verify your registration (within 1 business day)."), h("li", {}, "Receive your Student ID and temporary password."), h("li", {}, "Sign in with a one-time code; one device at a time.")), h("hr"), h("p", { class: "small muted" }, "Buy any 5 skill modules, together or gradually, and the career kit (Interview Ready, resume review, resume writing) is included."));
}

// ---------- sign-in ----------
export function loginPage(_, query) {
  const next = query.next || "/portal";
  const error = h("div");
  let challenge = null;
  const wrapper = h("div", { class: "auth-card" });
  const renderCredentials = () => {
    const form = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => {
      event.preventDefault();
      const values = formData(form);
      const button = form.querySelector("button[type=submit]");
      busy(button, true, "Checking");
      try {
        challenge = await ctx.api.login({ identifier: values.identifier, password: values.password, deviceId: ctx.device.id, deviceLabel: ctx.device.label });
        document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh"));
        renderOtp();
      } catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); }
    } },
      field({ label: "Student ID or email", name: "identifier", required: true, autocomplete: "username", placeholder: "RV-26-0001" }),
      field({ label: "Password", name: "password", type: "password", required: true, autocomplete: "current-password" }),
      error,
      h("div", { class: "form-actions between" }, h("a", { class: "link-button", href: "#/reset" }, "Forgot password?"), h("button", { class: "button primary large", type: "submit" }, "Continue", icon("arrow", 16))));
    wrapper.replaceChildren(h("div", { class: "device-note" }, icon("device", 16), h("span", {}, `This device: ${ctx.device.label}. One active device per account.`)), form);
  };
  const renderOtp = () => {
    error.replaceChildren();
    const inputs = Array.from({ length: 6 }, (_, index) => h("input", { class: "otp-box", type: "text", inputmode: "numeric", maxlength: 1, "aria-label": `Digit ${index + 1}`, autocomplete: index === 0 ? "one-time-code" : "off" }));
    inputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        const digits = input.value.replace(/\D/g, "");
        if (digits.length > 1) { digits.split("").slice(0, 6 - index).forEach((digit, offset) => { inputs[index + offset].value = digit; }); inputs[Math.min(5, index + digits.length)].focus(); }
        else { input.value = digits; if (digits && index < 5) inputs[index + 1].focus(); }
        if (inputs.every(box => box.value)) form.requestSubmit();
      });
      input.addEventListener("keydown", (event) => { if (event.key === "Backspace" && !input.value && index > 0) inputs[index - 1].focus(); });
    });
    const form = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => {
      event.preventDefault();
      const code = inputs.map(input => input.value).join("");
      if (code.length < 6) { error.replaceChildren(errorBox(new Error("Enter the 6-digit code."))); return; }
      const button = form.querySelector("button[type=submit]");
      busy(button, true, "Verifying");
      try {
        const result = await ctx.api.verifyOtp({ challengeId: challenge.challengeId, code, deviceId: ctx.device.id, deviceLabel: ctx.device.label });
        setAuth({ token: result.token, type: result.user.type, user: result.user });
        if (result.warned) toast(`Security notice: this account switched devices ${result.deviceSwitches} times. Only one device stays signed in.`, "error", 7000);
        toast(`Welcome back, ${result.user.name.split(" ")[0]}.`, "success");
        location.hash = result.mustChangePassword ? "#/portal/profile?first=1" : `#${next}`;
      } catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); inputs.forEach(input => { input.value = ""; }); inputs[0].focus(); }
    } },
      h("p", { class: "muted" }, `We sent a 6-digit code to ${challenge.channels.join(" and ")}. It expires in 5 minutes.`),
      h("div", { class: "otp-row" }, inputs),
      error,
      h("div", { class: "form-actions between" }, h("button", { class: "link-button", type: "button", onClick: renderCredentials }, "Use a different account"), h("button", { class: "button primary large", type: "submit" }, "Verify and sign in", icon("lock", 16))),
      h("p", { class: "tiny muted" }, "Preview: the code is in the preview inbox (bottom-right)."));
    wrapper.replaceChildren(form);
    inputs[0].focus();
  };
  renderCredentials();
  return authShell(wrapper, { eyebrow: "Student sign-in", title: "Welcome back.", aside: h("div", { class: "aside-card" }, h("h4", {}, "No account yet?"), h("p", { class: "small muted" }, "Register, pay for a skill module and we will verify you within 1 business day."), h("a", { class: "button ghost block", href: "#/register" }, "Register"), h("hr"), h("h4", {}, "Signing in from a new device?"), h("p", { class: "small muted" }, "Your previous device is signed out automatically. If you switch devices often you will receive a security notice.")) });
}

export function resetPage() {
  const error = h("div");
  let challenge = null;
  const wrapper = h("div", { class: "auth-card" });
  const requestForm = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => {
    event.preventDefault();
    const button = requestForm.querySelector("button[type=submit]");
    busy(button, true, "Sending");
    try {
      challenge = await ctx.api.requestReset({ identifier: formData(requestForm).identifier });
      document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh"));
      wrapper.replaceChildren(resetForm);
    } catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); }
  } }, field({ label: "Student ID or email", name: "identifier", required: true }), error, h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, "Send reset code")));
  const resetForm = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => {
    event.preventDefault();
    const values = formData(resetForm);
    const button = resetForm.querySelector("button[type=submit]");
    if (!challenge?.challengeId) { error.replaceChildren(errorBox(new Error("If that account exists, a code was sent. Check the inbox and try again with the correct ID."))); return; }
    busy(button, true, "Updating");
    try { await ctx.api.resetPassword({ challengeId: challenge.challengeId, code: values.code, newPassword: values.password }); toast("Password updated. Sign in with your new password.", "success"); location.hash = "#/login"; }
    catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); }
  } }, h("p", { class: "muted" }, "If the account exists, a 6-digit code was sent to the registered email and phone."), field({ label: "6-digit code", name: "code", inputmode: "numeric", required: true }), field({ label: "New password", name: "password", type: "password", required: true, autocomplete: "new-password", hint: "At least 8 characters with letters and numbers." }), error, h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, "Set new password")));
  wrapper.append(requestForm);
  return authShell(wrapper, { eyebrow: "Password reset", title: "Reset your password.", aside: null });
}

export function adminLoginPage() {
  const error = h("div");
  let challenge = null;
  const wrapper = h("div", { class: "auth-card" });
  const credentials = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => {
    event.preventDefault();
    const values = formData(credentials);
    const button = credentials.querySelector("button[type=submit]");
    busy(button, true, "Checking");
    try {
      challenge = await ctx.api.login({ identifier: values.identifier, password: values.password, deviceId: ctx.device.id, deviceLabel: ctx.device.label });
      if (challenge.accountType !== "admin") throw new Error("This sign-in is for programme administrators.");
      document.dispatchEvent(new CustomEvent("rolevia:inbox-refresh"));
      wrapper.replaceChildren(otpForm);
    } catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); }
  } }, field({ label: "Admin ID or email", name: "identifier", required: true, autocomplete: "username", placeholder: "RV-ADM-001" }), field({ label: "Password", name: "password", type: "password", required: true, autocomplete: "current-password" }), error, h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, "Continue", icon("arrow", 16))));
  const otpForm = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => {
    event.preventDefault();
    const button = otpForm.querySelector("button[type=submit]");
    busy(button, true, "Verifying");
    try {
      const result = await ctx.api.verifyOtp({ challengeId: challenge.challengeId, code: formData(otpForm).code, deviceId: ctx.device.id, deviceLabel: ctx.device.label });
      setAuth({ token: result.token, type: "admin", user: result.user });
      toast(`Signed in as ${result.user.roleLabel}.`, "success");
      location.hash = result.mustChangePassword ? "#/admin/account?first=1" : "#/admin";
    } catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); }
  } }, h("p", { class: "muted" }, "Enter the 6-digit code sent to the admin email."), field({ label: "One-time code", name: "code", inputmode: "numeric", required: true }), error, h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, "Open admin console", icon("lock", 16))));
  wrapper.append(credentials);
  return authShell(wrapper, { eyebrow: "Admin console", title: "Programme administration.", aside: h("div", { class: "aside-card" }, h("h4", {}, "Admin responsibilities"), h("ul", { class: "ticks small" }, h("li", {}, icon("check", 14), "Verify registrations and issue credentials"), h("li", {}, icon("check", 14), "Upload lessons, assignments and announcements"), h("li", {}, icon("check", 14), "Grade submissions and review device alerts")), h("p", { class: "tiny muted" }, "Three role-based admin accounts exist: programme lead, learning & content manager, student success & verification. Preview credentials are listed in the preview inbox panel.")) });
}

export function opsLoginPage() {
  const error = h("div");
  const form = h("form", { class: "form-grid", novalidate: true, onSubmit: async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    busy(button, true, "Checking");
    try {
      const result = await ctx.api.opsLogin({ passphrase: formData(form).passphrase, deviceId: ctx.device.id, deviceLabel: ctx.device.label });
      setAuth({ token: result.token, type: "ops", user: { name: "Founder operations", type: "ops" } });
      location.hash = "#/ops";
    } catch (apiError) { error.replaceChildren(errorBox(apiError)); busy(button, false); }
  } }, field({ label: "Operations passphrase", name: "passphrase", type: "password", required: true, autocomplete: "off" }), error, h("div", { class: "form-actions" }, h("button", { class: "button primary", type: "submit" }, "Enter", icon("lock", 16))));
  return h("div", { class: "site ops-gate" }, h("main", { class: "container section narrow" }, h("p", { class: "eyebrow" }, "Unlisted"), h("h1", {}, "Operations."), h("p", { class: "muted small" }, "This page is unlisted, not secret. In production it sits behind server-side authorisation and an allow-list; in preview it uses a passphrase."), h("div", { class: "auth-card" }, form)));
}
