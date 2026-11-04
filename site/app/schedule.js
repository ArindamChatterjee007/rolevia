// Batch calendar: consecutive courses of `courseWeeks` weeks from the first batch date, no holiday gaps.
const DAY = 24 * 60 * 60 * 1000;
const parseDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const formatBatchDate = (date, { year = true } = {}) => date.toLocaleDateString("en-GB", { day: "numeric", month: "long", ...(year ? { year: "numeric" } : {}), timeZone: "UTC" });

export function batches(schedule, { from = Date.now(), count = schedule?.batchesShown ?? 4 } = {}) {
  if (!schedule?.firstBatchStart) return [];
  const weeks = schedule.courseWeeks ?? 8;
  const gap = schedule.gapDays ?? 0;
  const list = [];
  let start = parseDate(schedule.firstBatchStart);
  for (let number = 1; list.length < count && number < 200; number += 1) {
    const end = new Date(start.getTime() + (weeks * 7 - 1) * DAY);
    const status = from > end.getTime() ? "finished" : from >= start.getTime() ? "running" : "upcoming";
    if (status !== "finished") list.push({ number, start, end, status, label: `Batch ${number}`, range: `${formatBatchDate(start, { year: false })} – ${formatBatchDate(end)}` });
    start = new Date(end.getTime() + (1 + gap) * DAY);
  }
  return list;
}
export const nextBatch = (schedule, options) => batches(schedule, options).find(batch => batch.status === "upcoming") ?? batches(schedule, options)[0] ?? null;
