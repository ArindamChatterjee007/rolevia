// Hash-based router (works on GitHub Pages without server rewrites).
export function createRouter(routes, { outlet, onNavigate }) {
  const compiled = routes.map(route => {
    const keys = [];
    const pattern = new RegExp(`^${route.path.replace(/\/:(\w+)/g, (_, key) => { keys.push(key); return "/([^/]+)"; }).replace(/\*/g, ".*")}/?$`);
    return { ...route, keys, pattern };
  });
  let renderId = 0;

  function parse() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const [path, queryString = ""] = raw.split("?");
    return { path: path.startsWith("/") ? path : `/${path}`, query: Object.fromEntries(new URLSearchParams(queryString)) };
  }

  async function render() {
    const { path, query } = parse();
    const id = ++renderId;
    const match = compiled.find(route => route.pattern.test(path)) ?? compiled.find(route => route.path === "*");
    const values = match.pattern.exec(path) ?? [];
    const params = Object.fromEntries(match.keys.map((key, index) => [key, decodeURIComponent(values[index + 1] ?? "")]));
    outlet.classList.add("page-leave");
    let content;
    try { content = await match.render(params, query, path); }
    catch (error) { content = match.renderError?.(error) ?? document.createTextNode(error.message); }
    if (id !== renderId) return;
    if (typeof content === "string") { location.hash = content; return; }
    outlet.replaceChildren(content);
    outlet.classList.remove("page-leave");
    outlet.classList.add("page-enter");
    setTimeout(() => outlet.classList.remove("page-enter"), 450);
    if (!query.keep) window.scrollTo({ top: 0, behavior: "instant" });
    const heading = outlet.querySelector("h1");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
    onNavigate?.({ path, query, params });
  }

  window.addEventListener("hashchange", render);
  return {
    render,
    navigate: (path) => { if (`#${path}` === location.hash) render(); else location.hash = path; },
    current: parse,
  };
}
