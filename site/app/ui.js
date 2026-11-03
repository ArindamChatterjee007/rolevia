// Small DOM toolkit: element builder, icons, toasts, modals, motion helpers. No framework.

export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") element.className = value;
    else if (key === "style" && typeof value === "object") for (const [property, css] of Object.entries(value)) { if (property.startsWith("--")) element.style.setProperty(property, css); else element.style[property] = css; }
    else if (key === "dataset") Object.assign(element.dataset, value);
    else if (key === "html") element.innerHTML = value; // trusted static markup only (icons, SVG art)
    else if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in element && typeof value !== "string" && key !== "for") element[key] = value;
    else element.setAttribute(key === "htmlFor" ? "for" : key, value === true ? "" : value);
  }
  append(element, children);
  return element;
}

export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  device: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  play: '<path d="M7 5v14l12-7z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  upload: '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.5M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4M4 13a8 8 0 0 0 14.5 4"/><path d="M20 4v7h-7M4 20v-7h7"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  lab: '<path d="M9 3h6M10 3v6l-6 10a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h5M3 10h18"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M13 3h6v18h-6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
  flag: '<path d="M5 21V4h11l-1.5 4L16 12H5"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
};
export function icon(name, size = 18) {
  const span = document.createElement("span");
  span.className = "icon";
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ICONS.info}</svg>`;
  return span;
}

export const money = (value, currency = "INR") => `${currency} ${new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 2 }).format(value)}`;
export const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const formatTime = (timestamp) => new Date(timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const relative = (timestamp) => {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 1440)} d ago`;
};
export const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join("") || "R";

export function avatar(user, size = 40) {
  if (user?.avatar) return h("img", { class: "avatar", src: user.avatar, alt: `${user.name}'s profile picture`, width: size, height: size, style: { width: `${size}px`, height: `${size}px` } });
  return h("span", { class: "avatar avatar-initials", style: { width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.38)}px` }, "aria-hidden": "true" }, initials(user?.name));
}

let toastHost;
export function toast(message, type = "info", timeout = 4200) {
  toastHost ??= document.body.appendChild(h("div", { class: "toast-host", role: "status", "aria-live": "polite" }));
  const item = h("div", { class: `toast toast-${type}` }, icon(type === "success" ? "check" : type === "error" ? "info" : "spark", 16), h("span", {}, message));
  toastHost.append(item);
  requestAnimationFrame(() => item.classList.add("show"));
  setTimeout(() => { item.classList.remove("show"); setTimeout(() => item.remove(), 400); }, timeout);
  return item;
}

export function modal({ title, body, actions = [], onClose }) {
  const close = () => { overlay.classList.remove("show"); setTimeout(() => overlay.remove(), 250); onClose?.(); };
  const overlay = h("div", { class: "modal-overlay", role: "dialog", "aria-modal": "true", "aria-label": title, onClick: (event) => { if (event.target === overlay) close(); } },
    h("div", { class: "modal" },
      h("div", { class: "modal-head" }, h("h3", {}, title), h("button", { class: "icon-button", type: "button", "aria-label": "Close dialog", onClick: close }, icon("close"))),
      h("div", { class: "modal-body" }, body),
      actions.length ? h("div", { class: "modal-actions" }, actions.map(action => h("button", { class: `button ${action.variant ?? "primary"}`, type: "button", onClick: async () => { const keep = await action.onClick?.(); if (!keep) close(); } }, action.label))) : null,
    ));
  document.body.append(overlay);
  requestAnimationFrame(() => overlay.classList.add("show"));
  const escape = (event) => { if (event.key === "Escape") { close(); document.removeEventListener("keydown", escape); } };
  document.addEventListener("keydown", escape);
  return { close };
}

export function skeleton(lines = 3, className = "") {
  return h("div", { class: `skeleton-block ${className}`, "aria-busy": "true", "aria-label": "Loading" }, Array.from({ length: lines }, (_, index) => h("div", { class: "skeleton", style: { width: `${100 - index * 12}%` } })));
}

export function spinner(label = "Loading") {
  return h("span", { class: "spinner", role: "status", "aria-label": label });
}

export const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

let revealObserver;
export function observeReveals(root = document) {
  const targets = root.querySelectorAll(".reveal:not(.in)");
  if (!targets.length) return;
  if (reduceMotion() || !("IntersectionObserver" in window)) { targets.forEach(target => target.classList.add("in")); return; }
  revealObserver ??= new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("in"); revealObserver.unobserve(entry.target); }
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  targets.forEach(target => revealObserver.observe(target));
}

export function countUp(element, to, { duration = 1200, prefix = "", suffix = "", decimals = 0 } = {}) {
  const format = (value) => `${prefix}${new Intl.NumberFormat("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value)}${suffix}`;
  if (reduceMotion()) { element.textContent = format(to); return; }
  const start = performance.now();
  const tick = (time) => {
    const progress = Math.min(1, (time - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = format(to * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function ring(value, { size = 72, stroke = 7, label = "" } = {}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, value)));
  const wrapper = h("div", { class: "ring", style: { width: `${size}px`, height: `${size}px` }, role: "img", "aria-label": `${Math.round(value * 100)} percent ${label}` });
  wrapper.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${stroke}"/><circle class="ring-value" cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke-width="${stroke}" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" style="--target:${offset}"/></svg><span class="ring-label">${Math.round(value * 100)}%</span>`;
  requestAnimationFrame(() => wrapper.querySelector(".ring-value").style.strokeDashoffset = offset);
  return wrapper;
}

export function confetti(duration = 1800) {
  if (reduceMotion()) return;
  const canvas = h("canvas", { class: "confetti", "aria-hidden": "true" });
  document.body.append(canvas);
  const context = canvas.getContext("2d");
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const colors = ["#dfed9d", "#9fd8c3", "#8fb3ff", "#f6b26b", "#ffffff"];
  const pieces = Array.from({ length: 140 }, () => ({ x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.5, size: 5 + Math.random() * 6, speed: 2 + Math.random() * 4, drift: -1 + Math.random() * 2, rotation: Math.random() * Math.PI, color: colors[Math.floor(Math.random() * colors.length)] }));
  const start = performance.now();
  const frame = (time) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const piece of pieces) {
      piece.y += piece.speed; piece.x += piece.drift; piece.rotation += 0.08;
      context.save(); context.translate(piece.x, piece.y); context.rotate(piece.rotation); context.fillStyle = piece.color; context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6); context.restore();
    }
    if (time - start < duration) requestAnimationFrame(frame); else canvas.remove();
  };
  requestAnimationFrame(frame);
}

export function field({ label, name, type = "text", value = "", placeholder = "", required = false, hint = "", autocomplete, options, rows, min, max, step, pattern, inputmode }) {
  const id = `field-${name}-${Math.random().toString(36).slice(2, 7)}`;
  let input;
  if (type === "select") input = h("select", { id, name, required, class: "input" }, options.map(option => h("option", { value: option.value, selected: option.value === value }, option.label)));
  else if (type === "textarea") input = h("textarea", { id, name, required, class: "input", rows: rows ?? 4, placeholder }, value);
  else input = h("input", { id, name, type, value, placeholder, required, class: "input", autocomplete, min, max, step, pattern, inputmode });
  return h("label", { class: "field", htmlFor: id }, h("span", { class: "field-label" }, label, required ? h("span", { class: "req", "aria-hidden": "true" }, " *") : null), input, hint ? h("span", { class: "field-hint" }, hint) : null);
}

export const formData = (form) => Object.fromEntries(new FormData(form).entries());

export function busy(button, isBusy, label) {
  if (isBusy) { button.dataset.label = button.textContent; button.disabled = true; button.classList.add("is-busy"); button.replaceChildren(spinner(), label ?? "Working"); }
  else { button.disabled = false; button.classList.remove("is-busy"); button.textContent = button.dataset.label ?? label ?? "Done"; }
}

export async function downscaleImage(file, size = 160) {
  const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const image = await new Promise((resolve, reject) => { const element = new Image(); element.onload = () => resolve(element); element.onerror = reject; element.src = dataUrl; });
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext("2d");
  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale, height = image.height * scale;
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  return Promise.resolve(false);
}
