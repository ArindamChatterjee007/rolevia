// Admin: slide decks for live classes and study. Decks stay drafts (admin-only) until published after class.
import { h, icon, toast, busy, field, formData, formatDate, relative, modal, readFileRecord, formatBytes, showFieldErrors } from "../ui.js";
import { ctx, withSession } from "../context.js";
import { errorBox } from "./components.js";
import { adminShell, adminLoad, can } from "./admin.js";
import { slideView, deckViewer, SLIDE_KIND_LABELS, ILLUSTRATION_IDS } from "./deck.js";

const statusTag = (deck) => h("span", { class: `tag ${deck.status === "published" ? "good" : "pending"}` }, deck.status === "published" ? "Published" : "Draft · admins only");

export async function adminDecksPage() {
  const content = await adminLoad(async () => {
    if (!can("content")) return h("div", { class: "card" }, h("p", { class: "muted" }, "Slide decks need the content or lead role."));
    const host = h("div", { class: "stack" });
    const render = async () => {
      const data = await ctx.api.adminDecks(withSession());
      const byModule = data.modules.map(module => ({ module, decks: data.decks.filter(deck => deck.moduleId === module.id) }));
      host.replaceChildren(
        h("div", { class: "card-head" }, h("p", { class: "muted" }, "Build the slides you present in class. Drafts are visible to admins only; publish after the class so learners can click through them (view only, no download)."), h("a", { class: "button primary small", href: "#/admin/decks/new" }, icon("spark", 14), "New deck")),
        ...byModule.map(({ module, decks }) => h("section", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, module.title), h("span", { class: "tiny muted" }, `${decks.length} deck${decks.length === 1 ? "" : "s"}`)), decks.length ? h("div", { class: "deck-rows" }, decks.map(deck => h("div", { class: "deck-row" }, h("div", { class: "grow" }, h("strong", {}, deck.title), h("p", { class: "tiny muted" }, `${deck.slideCount} slides · ${deck.source === "seed" ? "course material" : "created by admin"} · updated ${relative(deck.updatedAt)}${deck.classIds.length ? ` · attached to ${deck.classIds.length} class${deck.classIds.length === 1 ? "" : "es"}` : ""}`)), statusTag(deck), h("a", { class: "button ghost small", href: `#/admin/decks/${deck.id}` }, "Edit"),
          h("button", { class: `button ${deck.status === "published" ? "ghost" : "primary"} small`, type: "button", onClick: async (event) => { busy(event.currentTarget, true, deck.status === "published" ? "Unpublishing" : "Publishing"); try { await ctx.api.adminSetDeckStatus(withSession({ deckId: deck.id, status: deck.status === "published" ? "draft" : "published" })); toast(deck.status === "published" ? "Deck unpublished. Learners no longer see it." : "Deck published. Enrolled learners were notified.", "success"); render(); } catch (error) { toast(error.message, "error"); busy(event.currentTarget, false); } } }, deck.status === "published" ? "Unpublish" : "Publish")))) : h("p", { class: "muted small" }, "No deck yet for this module."))));
    };
    await render();
    return host;
  });
  return adminShell(content, { active: "decks", title: "Slide decks" });
}

const blankSlide = (kind) => ({ id: `s-${Math.random().toString(36).slice(2, 8)}`, kind, title: kind === "title" ? "Workshop title" : kind === "summary" ? "What we covered" : kind === "question" ? "Quick check" : "New slide", ...(kind === "content" || kind === "summary" ? { bullets: ["First point", "Second point"] } : {}), ...(kind === "steps" ? { steps: ["Open the practice file", "Apply the first change"] } : {}), ...(kind === "question" ? { question: { prompt: "Which option is correct?", options: ["Option A", "Option B", "Option C", "Option D"], answerIndex: 0, explanation: "Explain why the correct option is right in one or two sentences." } } : {}), ...(kind === "image" ? { image: null, caption: "" } : {}), notes: "" });

export async function adminDeckEditorPage({ id }) {
  const content = await adminLoad(async () => {
    if (!can("content")) return h("div", { class: "card" }, h("p", { class: "muted" }, "Slide decks need the content or lead role."));
    const data = await ctx.api.adminDecks(withSession());
    let deck = id === "new" ? { id: null, title: "", moduleId: data.modules[0].id, status: "draft", slides: [blankSlide("title")], classIds: [] } : await ctx.api.adminDeck(withSession({ deckId: id }));
    deck.slides = deck.slides.map(slide => ({ ...slide, notes: slide.notes ?? "" }));
    let selected = 0;
    let dirty = false;
    const list = h("ol", { class: "slide-list" });
    const form = h("div", { class: "slide-form" });
    const preview = h("div", { class: "deck-preview" });
    const status = h("div");
    const meta = h("form", { class: "form-grid two", novalidate: true, onSubmit: (event) => event.preventDefault() },
      field({ label: "Deck title", name: "title", value: deck.title, required: true, placeholder: "Week 1 workshop: cleaning a sales register" }),
      field({ label: "Skill module", name: "moduleId", type: "select", value: deck.moduleId, options: data.modules.map(module => ({ value: module.id, label: module.title })) }));
    meta.addEventListener("input", () => { const values = formData(meta); deck.title = values.title; deck.moduleId = values.moduleId; dirty = true; renderPreview(); });

    const renderList = () => list.replaceChildren(...deck.slides.map((slide, index) => h("li", { class: `slide-item ${index === selected ? "active" : ""}`, onClick: () => { selected = index; renderAll(); } }, h("span", { class: "slide-item-index" }, index + 1), h("div", { class: "grow" }, h("strong", {}, slide.title || "Untitled"), h("span", { class: "tiny muted" }, SLIDE_KIND_LABELS[slide.kind])), h("div", { class: "slide-item-actions" }, h("button", { class: "mini", type: "button", "aria-label": "Move up", disabled: index === 0, onClick: (event) => { event.stopPropagation(); [deck.slides[index - 1], deck.slides[index]] = [deck.slides[index], deck.slides[index - 1]]; selected = index - 1; dirty = true; renderAll(); } }, "↑"), h("button", { class: "mini", type: "button", "aria-label": "Move down", disabled: index === deck.slides.length - 1, onClick: (event) => { event.stopPropagation(); [deck.slides[index + 1], deck.slides[index]] = [deck.slides[index], deck.slides[index + 1]]; selected = index + 1; dirty = true; renderAll(); } }, "↓"), h("button", { class: "mini danger", type: "button", "aria-label": "Delete slide", disabled: deck.slides.length === 1, onClick: (event) => { event.stopPropagation(); deck.slides.splice(index, 1); selected = Math.min(selected, deck.slides.length - 1); dirty = true; renderAll(); } }, "✕")))));
    const addMenu = h("div", { class: "add-slide" }, h("span", { class: "tiny muted" }, "Add slide:"), ...Object.entries(SLIDE_KIND_LABELS).map(([kind, label]) => h("button", { class: "button ghost small", type: "button", onClick: () => { deck.slides.splice(selected + 1, 0, blankSlide(kind)); selected += 1; dirty = true; renderAll(); } }, label)));

    const textarea = (label, value, onInput, { rows = 3, hint = "" } = {}) => { const input = h("textarea", { class: "input", rows, onInput: (event) => { onInput(event.target.value); dirty = true; renderPreview(); renderList(); } }, value ?? ""); return h("label", { class: "field" }, h("span", { class: "field-label" }, label), input, hint ? h("span", { class: "field-hint" }, hint) : null); };
    const text = (label, value, onInput, { placeholder = "" } = {}) => h("label", { class: "field" }, h("span", { class: "field-label" }, label), h("input", { class: "input", value: value ?? "", placeholder, onInput: (event) => { onInput(event.target.value); dirty = true; renderPreview(); renderList(); } }));
    const renderForm = () => {
      const slide = deck.slides[selected];
      const parts = [h("div", { class: "card-head" }, h("h3", {}, `Slide ${selected + 1} · ${SLIDE_KIND_LABELS[slide.kind]}`), h("select", { class: "input compact", "aria-label": "Slide type", onChange: (event) => { const fresh = blankSlide(event.target.value); deck.slides[selected] = { ...fresh, id: slide.id, title: slide.title, notes: slide.notes }; dirty = true; renderAll(); } }, Object.entries(SLIDE_KIND_LABELS).map(([kind, label]) => h("option", { value: kind, selected: kind === slide.kind }, label)))),
        text("Title", slide.title, value => { slide.title = value; })];
      if (["title", "content", "steps", "summary"].includes(slide.kind)) parts.push(text("Subtitle (optional)", slide.subtitle, value => { slide.subtitle = value || undefined; }));
      if (["content", "summary"].includes(slide.kind)) parts.push(textarea("Points (one per line, up to 6)", (slide.bullets ?? []).join("\n"), value => { slide.bullets = value.split("\n").map(line => line.trim()).filter(Boolean).slice(0, 6); }, { rows: 5 }));
      if (slide.kind === "steps") parts.push(textarea("Steps (one per line, up to 6)", (slide.steps ?? []).join("\n"), value => { slide.steps = value.split("\n").map(line => line.trim()).filter(Boolean).slice(0, 6); }, { rows: 5 }));
      if (slide.kind === "question") {
        const question = slide.question ?? (slide.question = { prompt: "", options: ["", "", "", ""], answerIndex: 0, explanation: "" });
        parts.push(textarea("Question", question.prompt, value => { question.prompt = value; }, { rows: 2 }));
        parts.push(h("div", { class: "option-grid" }, question.options.map((option, index) => h("label", { class: "field option-field" }, h("span", { class: "field-label" }, h("input", { type: "radio", name: "answerIndex", checked: question.answerIndex === index, onChange: () => { question.answerIndex = index; dirty = true; renderPreview(); } }), ` Option ${String.fromCharCode(65 + index)}${question.answerIndex === index ? " (correct)" : ""}`), h("input", { class: "input", value: option, onInput: (event) => { question.options[index] = event.target.value; dirty = true; renderPreview(); } })))));
        parts.push(textarea("Explanation shown after answering", question.explanation, value => { question.explanation = value; }, { rows: 2 }));
      }
      if (slide.kind === "image") {
        const fileInput = h("input", { type: "file", accept: "image/png,image/jpeg,image/svg+xml,image/webp", class: "input", onChange: async (event) => { const file = event.target.files[0]; if (!file) return; const record = await readFileRecord(file); if (!record.dataUrl) { toast("Images must be 400 KB or smaller.", "error"); return; } slide.image = record; dirty = true; renderPreview(); } });
        parts.push(h("label", { class: "field" }, h("span", { class: "field-label" }, "Image (PNG, JPG, SVG or WebP, up to 400 KB)"), fileInput, slide.image ? h("span", { class: "field-hint" }, `${slide.image.name} · ${formatBytes(slide.image.size)}`) : null));
        parts.push(text("Caption (optional)", slide.caption, value => { slide.caption = value; }));
      }
      if (["title", "content", "summary"].includes(slide.kind)) parts.push(h("label", { class: "field" }, h("span", { class: "field-label" }, "Illustration (optional)"), h("select", { class: "input", onChange: (event) => { slide.illustration = event.target.value || undefined; dirty = true; renderPreview(); } }, h("option", { value: "" }, "None"), ILLUSTRATION_IDS.map(item => h("option", { value: item, selected: slide.illustration === item }, item)))));
      parts.push(textarea("Presenter notes (host only)", slide.notes, value => { slide.notes = value; }, { rows: 3, hint: "What you say or ask on this slide. Never shown to learners." }));
      form.replaceChildren(...parts);
    };
    const renderPreview = () => preview.replaceChildren(h("p", { class: "tiny muted" }, "Preview as learners see it"), slideView(deck.slides[selected], { index: selected, total: deck.slides.length, deckTitle: deck.title || "Untitled deck", reveal: true }));
    const renderAll = () => { renderList(); renderForm(); renderPreview(); };

    const save = async (button) => {
      busy(button, true, "Saving");
      try {
        const saved = await ctx.api.adminUpsertDeck(withSession({ deck: { id: deck.id, title: deck.title, moduleId: deck.moduleId, slides: deck.slides } }));
        dirty = false;
        status.replaceChildren();
        toast(deck.id ? "Deck saved." : "Deck created as a draft.", "success");
        if (!deck.id) { location.hash = `#/admin/decks/${saved.id}`; return; }
        deck = { ...saved, slides: saved.slides.map(slide => ({ ...slide, notes: slide.notes ?? "" })) };
        renderAll(); renderActions();
      } catch (error) { status.replaceChildren(errorBox(error)); if (error.extra?.fields) { const key = Object.keys(error.extra.fields).find(name => name.startsWith("slides.")); if (key) { selected = Number(key.split(".")[1]) || 0; renderAll(); } } }
      finally { busy(button, false); }
    };
    const actions = h("div", { class: "deck-actions" });
    const renderActions = () => {
      const attachable = data.classes.filter(item => item.moduleId === deck.moduleId);
      actions.replaceChildren(...[
        h("button", { class: "button primary", type: "button", onClick: (event) => save(event.currentTarget) }, icon("check", 16), deck.id ? "Save" : "Create draft"),
        deck.id ? h("button", { class: `button ${deck.status === "published" ? "ghost" : "primary"}`, type: "button", onClick: async (event) => { if (dirty) { toast("Save your changes first.", "info"); return; } busy(event.currentTarget, true, "Working"); try { const updated = await ctx.api.adminSetDeckStatus(withSession({ deckId: deck.id, status: deck.status === "published" ? "draft" : "published" })); deck.status = updated.status; toast(updated.status === "published" ? "Published. Enrolled learners were notified and can open the slides (view only)." : "Unpublished. Learners no longer see the slides.", "success"); renderActions(); } catch (error) { toast(error.message, "error"); } finally { busy(event.currentTarget, false); } } }, icon(deck.status === "published" ? "eye" : "bolt", 16), deck.status === "published" ? "Unpublish" : "Publish for learners") : null,
        deck.id ? h("button", { class: "button ghost", type: "button", onClick: () => modal({ title: "Preview the whole deck", body: deckViewer({ ...deck, title: deck.title || "Untitled deck" }, { showNotes: true, reveal: true }).element, actions: [{ label: "Close" }] }) }, icon("play", 16), "Present preview") : null,
        deck.id && attachable.length ? h("div", { class: "attach" }, h("select", { class: "input compact", "aria-label": "Attach to class", onChange: async (event) => { const cls = attachable.find(item => item.id === event.target.value); if (!cls) return; try { await ctx.api.adminUpsertClass(withSession({ cls: { id: cls.id, moduleId: cls.moduleId, title: cls.title, description: cls.description, startsAt: cls.startsAt, durationMinutes: cls.durationMinutes, mode: cls.mode, externalUrl: cls.externalUrl, hostId: cls.hostId, deckId: deck.id } })); toast(`Attached to "${cls.title}". The host can present it from the room.`, "success"); } catch (error) { toast(error.message, "error"); } } }, h("option", { value: "" }, "Attach to a class…"), attachable.map(item => h("option", { value: item.id }, `${item.title} · ${formatDate(item.startsAt)}${item.deckId === deck.id ? " (attached)" : ""}`)))) : null,
        deck.id ? h("button", { class: "link-button danger", type: "button", onClick: () => modal({ title: "Delete this deck?", body: h("p", {}, "Learners lose access immediately. Classes that used it keep their attendance and results."), actions: [{ label: "Delete", variant: "danger", onClick: async () => { try { await ctx.api.adminDeleteDeck(withSession({ deckId: deck.id })); location.hash = "#/admin/decks"; } catch (error) { toast(error.message, "error"); } } }] }) }, "Delete deck") : null,
        h("span", { class: "tiny muted" }, deck.status === "published" ? `Published ${deck.publishedAt ? formatDate(deck.publishedAt) : ""}` : "Draft: visible to admins and shown live in class; publish after the class.")].filter(Boolean));
    };
    renderAll(); renderActions();
    window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } }, { once: true });
    return h("div", { class: "stack" },
      h("a", { class: "back-link", href: "#/admin/decks" }, icon("arrow", 14), "All decks"),
      h("div", { class: "card" }, meta, status),
      h("div", { class: "editor-grid" }, h("div", { class: "card" }, h("div", { class: "card-head" }, h("h3", {}, `Slides (${deck.slides.length})`), statusTag(deck)), list, addMenu), h("div", { class: "card" }, form), h("div", { class: "card" }, preview)),
      h("div", { class: "card" }, actions));
  });
  return adminShell(content, { active: "decks", title: id === "new" ? "New slide deck" : "Edit slide deck" });
}
