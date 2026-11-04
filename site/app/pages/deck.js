// Slide decks: one renderer for study (published, view-only with watermark), presenting (host) and following
// (learner in a live class). Slides are structured data, never files, so nothing here offers a download.
import { h, icon } from "../ui.js";

export const ILLUSTRATION_IDS = ["spreadsheets", "dashboards", "business-ai", "canva", "crm", "hr-tracker", "trello", "budgeting", "live-class", "interview", "labs", "welcome"];

// Photographs (Pexels licence, see assets/photos/CREDITS.md) for modules and portal areas; the vector mark for
// the rest. `art: "vector"` forces the illustration, used inside slides where photos would compete with text.
export const PHOTO_IDS = ["spreadsheets", "dashboards", "business-ai", "canva", "crm", "hr-tracker", "trello", "budgeting", "live-class", "interview", "labs"];
export function illustration(id, { class: className = "", size = null, art = "photo" } = {}) {
  const safe = ILLUSTRATION_IDS.includes(id) ? id : "welcome";
  if (art === "photo" && PHOTO_IDS.includes(safe)) return h("img", { class: `illustration photo ${className}`, src: `assets/photos/${safe}.jpg`, alt: "", draggable: false, loading: "lazy", width: 960, height: 600 });
  return h("img", { class: `illustration ${className}`, src: `assets/illustrations/${safe}.svg`, alt: "", draggable: false, loading: "lazy", width: size, height: size });
}

export const SLIDE_KIND_LABELS = { title: "Title", content: "Points", steps: "Steps", question: "Question", image: "Image", summary: "Summary" };

// reveal: answers may be shown (study mode or host). onAnswer: learner clicked an option in study mode.
export function slideView(slide, { index = 0, total = 1, deckTitle = "", reveal = false, chosen = null, onChoose = null, accent = "" } = {}) {
  const body = [];
  if (slide.kind === "title") {
    body.push(h("div", { class: "slide-title-layout" }, h("div", { class: "slide-title-copy" }, h("p", { class: "slide-eyebrow" }, deckTitle), h("h2", {}, slide.title), slide.subtitle ? h("p", { class: "slide-subtitle" }, slide.subtitle) : null), illustration(slide.illustration ?? "welcome", { class: "slide-art", art: "vector" })));
  } else if (slide.kind === "content" || slide.kind === "summary") {
    body.push(h("div", { class: `slide-split ${slide.illustration ? "with-art" : ""}` }, h("div", {}, h("h2", {}, slide.title), slide.subtitle ? h("p", { class: "slide-subtitle" }, slide.subtitle) : null, h("ul", { class: "slide-bullets" }, (slide.bullets ?? []).map(bullet => h("li", {}, h("span", { class: "slide-marker" }), h("span", {}, bullet))))), slide.illustration ? illustration(slide.illustration, { class: "slide-art small", art: "vector" }) : null));
  } else if (slide.kind === "steps") {
    body.push(h("h2", {}, slide.title), slide.subtitle ? h("p", { class: "slide-subtitle" }, slide.subtitle) : null, h("ol", { class: "slide-steps" }, (slide.steps ?? []).map((step, stepIndex) => h("li", {}, h("span", { class: "slide-step-index" }, stepIndex + 1), h("span", {}, step)))));
  } else if (slide.kind === "question") {
    const question = slide.question ?? { options: [] };
    const answered = chosen !== null && chosen !== undefined;
    body.push(h("p", { class: "slide-eyebrow" }, "Question"), h("h2", {}, slide.title), h("p", { class: "slide-prompt" }, question.prompt),
      h("div", { class: "slide-options" }, (question.options ?? []).map((option, optionIndex) => {
        const correct = reveal && question.answerIndex === optionIndex;
        const wrong = answered && chosen === optionIndex && !correct;
        return h("button", { type: "button", class: `slide-option ${answered && correct ? "correct" : ""} ${wrong ? "wrong" : ""} ${chosen === optionIndex ? "chosen" : ""}`, disabled: !onChoose || answered, onClick: onChoose ? () => onChoose(optionIndex) : null }, h("span", { class: "slide-option-letter" }, String.fromCharCode(65 + optionIndex)), h("span", {}, option));
      })),
      answered && reveal ? h("div", { class: `slide-explanation ${chosen === question.answerIndex ? "good" : ""}` }, h("strong", {}, chosen === question.answerIndex ? "Correct. " : `Not quite: the answer is ${String.fromCharCode(65 + question.answerIndex)}. `), question.explanation ?? "") : null,
      !onChoose && !reveal ? h("p", { class: "tiny muted" }, "The host opens this question as a live poll; answer it when it appears on your screen.") : null);
  } else if (slide.kind === "image") {
    body.push(h("h2", {}, slide.title), h("figure", { class: "slide-figure" }, slide.image?.dataUrl ? h("img", { src: slide.image.dataUrl, alt: slide.caption ?? slide.title, draggable: false }) : h("div", { class: "slide-figure-empty" }, icon("upload", 24), h("span", {}, "No image yet")), slide.caption ? h("figcaption", {}, slide.caption) : null));
  } else {
    body.push(h("h2", {}, slide.title ?? "Slide"));
  }
  return h("article", { class: `slide kind-${slide.kind} ${accent}`, "aria-roledescription": "slide", "aria-label": `Slide ${index + 1} of ${total}`, onContextmenu: (event) => event.preventDefault() },
    h("div", { class: "slide-body" }, body),
    h("footer", { class: "slide-foot" }, h("span", { class: "slide-brand" }, h("img", { src: "assets/brand/rolevia-mark.svg", alt: "", width: 16, height: 16, draggable: false }), "rolevia"), h("span", {}, deckTitle), h("span", { class: "slide-count" }, `${index + 1} / ${total}`)));
}

// Full viewer: navigation, progress, keyboard, optional watermark, optional presenter notes and host actions.
export function deckViewer(deck, { watermark = null, index = 0, nav = true, showNotes = false, reveal = true, interactive = true, onNavigate = null, onAsk = null, accent = "" } = {}) {
  const total = deck.slides.length;
  let current = Math.min(Math.max(0, index), Math.max(0, total - 1));
  const answers = new Map();
  const stage = h("div", { class: "deck-stage" });
  const dots = h("div", { class: "deck-dots", role: "tablist", "aria-label": "Slides" });
  const notes = h("div", { class: "deck-notes", hidden: !showNotes });
  const prev = h("button", { class: "icon-button deck-nav", type: "button", "aria-label": "Previous slide", onClick: () => goTo(current - 1) }, icon("arrow", 18));
  const next = h("button", { class: "button primary small deck-next", type: "button", onClick: () => goTo(current + 1) }, "Next", icon("arrow", 16));
  const counter = h("span", { class: "deck-counter" });
  const ask = onAsk ? h("button", { class: "button ghost small", type: "button", hidden: true, onClick: () => onAsk(deck.slides[current], current) }, icon("quiz", 14), "Ask the room") : null;
  const render = () => {
    const slide = deck.slides[current];
    stage.replaceChildren(...[slideView(slide, { index: current, total, deckTitle: deck.title, reveal, chosen: answers.get(slide.id) ?? null, onChoose: interactive && reveal && slide.kind === "question" ? (choice) => { answers.set(slide.id, choice); render(); } : null, accent }),
      watermark ? h("div", { class: "deck-watermark", "aria-hidden": "true" }, ...Array.from({ length: 6 }, () => h("span", {}, watermark))) : null].filter(Boolean));
    dots.replaceChildren(...deck.slides.map((item, dotIndex) => h("button", { type: "button", role: "tab", class: `deck-dot ${dotIndex === current ? "active" : ""} ${dotIndex < current ? "seen" : ""}`, "aria-selected": String(dotIndex === current), "aria-label": `Slide ${dotIndex + 1}: ${item.title}`, title: item.title, onClick: () => goTo(dotIndex) })));
    counter.textContent = `${current + 1} of ${total}`;
    prev.disabled = current === 0;
    next.replaceChildren(current === total - 1 ? "Finish" : "Next", icon("arrow", 16));
    next.disabled = current === total - 1 && !onNavigate;
    if (showNotes) notes.replaceChildren(h("strong", {}, "Presenter notes"), h("p", {}, slide.notes || "No notes for this slide."));
    if (ask) ask.hidden = slide.kind !== "question";
  };
  function goTo(target, { silent = false } = {}) {
    const clamped = Math.min(Math.max(0, target), total - 1);
    if (clamped === current && target !== current) return;
    current = clamped;
    render();
    if (!silent) onNavigate?.(current, deck.slides[current]);
  }
  const element = h("section", { class: `deck-viewer ${nav ? "" : "no-nav"}`, tabindex: 0, "aria-label": `${deck.title} slides`, onKeydown: (event) => { if (!nav) return; if (["ArrowRight", " ", "PageDown"].includes(event.key)) { event.preventDefault(); goTo(current + 1); } if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); goTo(current - 1); } } },
    stage,
    nav ? h("div", { class: "deck-controls" }, prev, dots, counter, ask, next) : h("div", { class: "deck-controls follow" }, dots, counter),
    notes);
  render();
  return { element, goTo, get index() { return current; }, get slide() { return deck.slides[current]; } };
}
