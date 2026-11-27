// Shared by build-tsbot.mjs (inlines the menu) and warm-tsbot-cache.mjs (asks its questions ahead of visitors).
import { fail } from './origin.mjs';

/** The menu's shape, with limits that keep the start screen usable. Anything else fails the build. */
export function checkMenu(m) {
  const text = (v, name, max) => {
    if (typeof v !== 'string' || !v.trim() || v.length > max) fail(`menu.json: ${name} must be text of 1 to ${max} characters`);
    return v.trim();
  };
  if (!m || typeof m !== 'object') fail('menu.json must be an object');
  const out = {};
  if (m.accent !== undefined) {
    if (!/^#[0-9a-f]{6}$/i.test(m.accent)) fail('menu.json: accent must be a #rrggbb colour');
    out.accent = m.accent;
  }
  for (const [k, max] of [['title', 40], ['subtitle', 80], ['heading', 80], ['intro', 200], ['back', 40], ['placeholder', 120], ['note', 200]]) {
    if (m[k] !== undefined) out[k] = text(m[k], k, max);
  }
  if (!Array.isArray(m.categories) || !m.categories.length || m.categories.length > 12) fail('menu.json: categories must list 1 to 12 categories');
  out.categories = m.categories.map((c, i) => {
    if (typeof c.icon !== 'string' || !/^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]{1,400}$/.test(c.icon)) fail(`menu.json: categories[${i}].icon must be SVG path data`);
    if (!Array.isArray(c.issues) || !c.issues.length || c.issues.length > 12) fail(`menu.json: categories[${i}].issues must list 1 to 12 questions`);
    return { name: text(c.name, `categories[${i}].name`, 40), desc: text(c.desc, `categories[${i}].desc`, 120), icon: c.icon, issues: c.issues.map((q, j) => text(q, `categories[${i}].issues[${j}]`, 300)) };
  });
  return out;
}
