/* =========================================================
   ANIMATION STUDIOS – Version 1.4
   Frame-by-frame 2D animation app (laptop + iPad / Apple Pencil)
   ========================================================= */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
let toastT;
function toast(m, ms) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms || 2200); }
let hintT;
function hint(m, ms) { const h = $('#hint'); h.textContent = m; h.classList.add('show'); clearTimeout(hintT); hintT = setTimeout(() => h.classList.remove('show'), ms || 900); }

/* ---------------- icons ---------------- */
const IC = {
  pencil: 'M4 20l1-4L16 5l3 3L8 19z M14 7l3 3 M4 20l4-1',
  pen: 'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z M9.5 15a2.5 2.5 0 0 0 2.5 2.5',
  brush: 'M19 3l2 2-8 9-3-3z M10 11c-3.2 0-5 2-5 4.5 0 1.8-1 3-2.5 3.8 4.8.6 10-.8 10-5.3',
  marker: 'M14 3l7 7-8 8H7v-6z M7 18l-3 3h5 M11 8l5 5',
  eraser: 'M15 4l6 6-10 10H6l-3-3z M8.5 10.5l6 6 M11 20h10',
  fill: 'M5 11l7-7 7 7-7 7z M5 11h14 M20 14s2 2.6 2 4a2 2 0 0 1-4 0c0-1.4 2-4 2-4z',
  shape: 'M3.5 13.5h7v7h-7z M17 3.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z M13.5 20.5l3.5-6.5 3.5 6.5z',
  select: 'M12 4c5 0 9 2.4 9 5.6S17 15 12 15s-9-2.2-9-5.4S7 4 12 4z M6.5 13.5c-1.2 2.2-.6 4.6 2 5.8 M8 20l1.5-1',
  picker: 'M17 3l4 4-3 3-4-4z M15 8l-9 9-1.5 3.5L8 19l9-9 M12.5 6.5l5 5',
  hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V11 M11 11V4a1.5 1.5 0 0 1 3 0v7 M14 11V5.5a1.5 1.5 0 0 1 3 0V12 M17 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.8l-3-4.7a1.5 1.5 0 0 1 2.4-1.8L8 14',
  home: 'M15 5l-7 7 7 7',
  undo: 'M9 14L4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  redo: 'M15 14l5-5-5-5 M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
  onion: 'M10 12a6 6 0 1 0 12 0 6 6 0 1 0-12 0 M2 12a6 6 0 1 0 12 0 6 6 0 1 0-12 0',
  layers: 'M12 3l9 5-9 5-9-5z M3 12.5l9 5 9-5 M3 17l9 5 9-5',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M8 5v14 M16 5v14',
  preview: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  dup: 'M8 8h12v12H8z M4 16V4h12',
  prev: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  eyeoff: 'M3 3l18 18 M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.8 M6.6 6.6C3.8 8.3 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6',
  lock: 'M6 11h12v10H6z M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
  unlock: 'M6 11h12v10H6z M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13'
};
function icon(n) { return `<svg class="ic" viewBox="0 0 24 24"><path d="${IC[n]}"${n === 'play' ? ' fill="currentColor"' : ''}/></svg>`; }

/* ---------------- colour helpers ---------------- */
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function hsvToRgb(h, s, v) { const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5) * 255, f(3) * 255, f(1) * 255]; }
function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, mx ? d / mx : 0, mx]; }

/* ---------------- storage ---------------- */
const DB = {
  db: null, failed: false, mem: { projects: new Map(), meta: new Map() },
  open() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open('animation-studios', 1);
        r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' }); if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'id' }); };
        r.onsuccess = () => { this.db = r.result; res(true); };
        r.onerror = () => { this.failed = true; res(false); };
        r.onblocked = () => { this.failed = true; res(false); };
      } catch (e) { this.failed = true; res(false); }
    });
  },
  tx(store, mode, fn) {
    return new Promise((res, rej) => {
      const t = this.db.transaction(store, mode), req = fn(t.objectStore(store));
      t.oncomplete = () => res(req ? req.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  },
  async put(s, v) { if (this.failed) { this.mem[s].set(v.id, v); return; } return this.tx(s, 'readwrite', (o) => o.put(v)); },
  async get(s, k) { if (this.failed) return this.mem[s].get(k); return this.tx(s, 'readonly', (o) => o.get(k)); },
  async del(s, k) { if (this.failed) { this.mem[s].delete(k); return; } return this.tx(s, 'readwrite', (o) => o.delete(k)); },
  async all(s) { if (this.failed) return [...this.mem[s].values()]; return this.tx(s, 'readonly', (o) => o.getAll()); }
};
const LS = {
  get(k, d) { try { const v = localStorage.getItem('as_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('as_' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------------- state ---------------- */
const DEFAULT_SWATCHES = ['#111111', '#ffffff', '#7a7f8a', '#c9ccd3', '#e5383b', '#ff7a45', '#ffb703', '#ffe066',
  '#8ac926', '#2a9d4a', '#1fb5a8', '#4cc9f0', '#3a86ff', '#3d3fbf', '#8338ec', '#c77dff',
  '#ff4fa3', '#ff99c8', '#f4c7a1', '#d8a07a', '#a0663d', '#6b3e1f', '#ffd6a5', '#bde0fe'];
const BRUSHES = ['pencil', 'pen', 'brush', 'marker', 'eraser'];
const TOOLS = [['pencil', 'Pencil'], ['pen', 'Ink'], ['brush', 'Brush'], ['marker', 'Marker'], ['eraser', 'Eraser'], ['fill', 'Fill'], ['shape', 'Shapes'], ['select', 'Select'], ['picker', 'Picker'], ['hand', 'Move']];
const S = {
  proj: null, cur: 0, layer: 0,
  tool: LS.get('tool', 'pen'), color: LS.get('color', '#111111'), prevColor: '#111111',
  swatches: LS.get('swatches', DEFAULT_SWATCHES.slice()), recent: LS.get('recent', []),
  size: Object.assign({ pencil: 3, pen: 6, brush: 28, marker: 14, eraser: 26, shape: 5 }, LS.get('size', {})),
  opac: Object.assign({ pencil: 0.9, pen: 1, brush: 0.9, marker: 0.55, eraser: 1, shape: 1 }, LS.get('opac', {})),
  stab: LS.get('stab', 0.35), pressure: LS.get('pressure', true), straighten: LS.get('straighten', true),
  finger: LS.get('finger', 'auto'),
  onion: Object.assign({ on: true, prev: 1, next: 1, op: 0.35, tint: true }, LS.get('onion', {})),
  fill: Object.assign({ tol: 35, all: true }, LS.get('fill', {})),
  shape: Object.assign({ type: 'ellipse', filled: false }, LS.get('shape', {})),
  selMode: 'lasso',
  device: LS.get('device', (navigator.maxTouchPoints > 1 && !/Windows/.test(navigator.userAgent)) ? 'ipad' : 'laptop'),
  view: { x: 0, y: 0, z: 1, r: 0 },
  playing: false, playIdx: 0,
  undo: [], redo: [], undoBytes: 0,
  stroke: null, shapeDraw: null, lasso: null, sel: null, selDrag: null, hover: null,
  penSeen: false, spaceDown: false
};
S.hsv = rgbToHsv(...hexToRgb(S.color));
function saveSettings() {
  LS.set('tool', S.tool); LS.set('color', S.color); LS.set('swatches', S.swatches); LS.set('recent', S.recent);
  LS.set('size', S.size); LS.set('opac', S.opac); LS.set('stab', S.stab); LS.set('pressure', S.pressure); LS.set('straighten', S.straighten);
  LS.set('finger', S.finger); LS.set('onion', S.onion); LS.set('fill', S.fill); LS.set('shape', S.shape); LS.set('device', S.device);
}

/* ---------------- project model ---------------- */
function newCell(w, h) { return { c: mkCanvas(w, h), url: null, dirty: true }; }
function newFrame(w, h, n) { return { id: uid(), hold: 1, cells: Array.from({ length: n }, () => newCell(w, h)), ver: 0, thumb: null, thumbDirty: true }; }
function newProject(name, w, h, fps, paper) {
  return { id: uid(), name, w, h, fps, paper: paper || '#ffffff', layers: [{ id: uid(), name: 'Layer 1', visible: true, locked: false, opacity: 1 }], frames: [newFrame(w, h, 1)] };
}
const curFrame = () => S.proj.frames[S.cur];
const curCell = () => curFrame().cells[S.layer];
function touchFrame(f) { f.ver++; f.thumbDirty = true; scheduleThumbs(); scheduleSave(); }
function markCell(f, cell) { cell.dirty = true; touchFrame(f); }

/* ---------------- saving / loading ---------------- */
let saveTimer = null;
function setSaveState(t) { const e = $('#save-state'); if (e) e.textContent = t; }
function scheduleSave() { if (!S.proj) return; setSaveState('Editing…'); clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 1300); }
function compositeTo(ctx, f, scale, paper) {
  const p = S.proj; ctx.save(); ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (paper !== false) { ctx.fillStyle = p.paper; ctx.fillRect(0, 0, p.w, p.h); } else ctx.clearRect(0, 0, p.w, p.h);
  drawFrameLayers(ctx, f); ctx.restore();
}
function drawFrameLayers(ctx, f) { const p = S.proj; p.layers.forEach((L, i) => { if (!L.visible || !f.cells[i]) return; ctx.globalAlpha = L.opacity; ctx.drawImage(f.cells[i].c, 0, 0); }); ctx.globalAlpha = 1; }
function projectThumb() {
  const p = S.proj, tw = 320, th = Math.round(320 * p.h / p.w); const c = mkCanvas(tw, th);
  compositeTo(c.getContext('2d'), p.frames[0], tw / p.w); return c.toDataURL('image/jpeg', 0.8);
}
async function saveNow() {
  clearTimeout(saveTimer);
  const p = S.proj; if (!p) return;
  if (S.stroke || S.sel || S.shapeDraw) { scheduleSave(); return; }
  setSaveState('Saving…');
  try {
    const data = { id: p.id, name: p.name, w: p.w, h: p.h, fps: p.fps, paper: p.paper, cur: S.cur, layer: S.layer,
      layers: p.layers.map((l) => Object.assign({}, l)),
      frames: p.frames.map((f) => ({ id: f.id, hold: f.hold, cells: f.cells.map((cell) => { if (cell.dirty || cell.url === null) { cell.url = cell.c.toDataURL('image/png'); cell.dirty = false; } return cell.url; }) })) };
    await DB.put('projects', data);
    await DB.put('meta', { id: p.id, name: p.name, w: p.w, h: p.h, fps: p.fps, frames: p.frames.length, updated: Date.now(), thumb: projectThumb() });
    setSaveState(DB.failed ? 'Not saved (no storage)' : 'Saved ✓');
  } catch (e) { console.error(e); setSaveState('⚠ Not saved'); toast('Could not save – device storage may be full.', 3500); }
}
function drawUrl(c, u) { return new Promise((res) => { if (!u) return res(); const im = new Image(); im.onload = () => { c.getContext('2d').drawImage(im, 0, 0); res(); }; im.onerror = () => res(); im.src = u; }); }
async function loadProject(id) {
  const d = await DB.get('projects', id); if (!d) throw new Error('Project not found');
  const p = { id: d.id, name: d.name, w: d.w, h: d.h, fps: d.fps, paper: d.paper || '#ffffff', layers: d.layers, frames: [] };
  for (const fd of d.frames) {
    const f = newFrame(d.w, d.h, 0); f.id = fd.id; f.hold = fd.hold || 1;
    f.cells = await Promise.all(fd.cells.map(async (u) => { const cell = newCell(d.w, d.h); if (u) { await drawUrl(cell.c, u); cell.url = u; cell.dirty = false; } return cell; }));
    p.frames.push(f);
  }
  return { p, cur: d.cur || 0, layer: d.layer || 0 };
}

/* ---------------- view / rendering ---------------- */
const view = $('#view'), vctx = view.getContext('2d');
let VW = 1, VH = 1, DPR = 1, need = true, VM = new DOMMatrix(), VMI = new DOMMatrix();
const req = () => { need = true; };
function resizeView() {
  const r = $('#stage').getBoundingClientRect(); DPR = Math.min(window.devicePixelRatio || 1, 2);
  VW = Math.max(1, r.width); VH = Math.max(1, r.height);
  view.width = Math.round(VW * DPR); view.height = Math.round(VH * DPR); view.style.width = VW + 'px'; view.style.height = VH + 'px'; req();
}
function updVM() { const v = S.view; VM = new DOMMatrix().translate(v.x, v.y).rotate(v.r * 180 / Math.PI).scale(v.z); VMI = VM.inverse(); req(); updZoomLabel(); }
function s2d(x, y) { const p = VMI.transformPoint(new DOMPoint(x, y)); return { x: p.x, y: p.y }; }
function d2s(x, y) { const p = VM.transformPoint(new DOMPoint(x, y)); return { x: p.x, y: p.y }; }
function fitView() { const p = S.proj; if (!p) return; const m = 28; const z = Math.min((VW - m * 2) / p.w, (VH - m * 2) / p.h); S.view = { x: (VW - p.w * z) / 2, y: (VH - p.h * z) / 2, z, r: 0 }; updVM(); }
function setViewKeep(z, r, docP, sp) { const c = Math.cos(r), s = Math.sin(r); S.view = { z, r, x: sp.x - (c * docP.x - s * docP.y) * z, y: sp.y - (s * docP.x + c * docP.y) * z }; updVM(); }
function zoomAt(sp, k) { const d = s2d(sp.x, sp.y); setViewKeep(clamp(S.view.z * k, 0.05, 32), S.view.r, d, sp); }
function updZoomLabel() { const l = $('#zoom-lab'); if (l) l.textContent = Math.round(S.view.z * 100) + '%' + (S.view.r ? ' · ' + Math.round(S.view.r * 180 / Math.PI) + '°' : ''); }

const work = { c: null, x: null };
function getWork() { const p = S.proj; if (!work.c || work.c.width !== p.w || work.c.height !== p.h) { work.c = mkCanvas(p.w, p.h); work.x = work.c.getContext('2d', { willReadFrequently: true }); } return work; }
const onionCache = new Map();
function layerKey() { return S.proj.layers.map((l) => (l.visible ? 1 : 0) + ':' + l.opacity).join(','); }
function onionCanvas(f, col) {
  const p = S.proj, key = f.ver + '|' + col + '|' + layerKey(); let e = onionCache.get(f.id);
  if (e && e.key === key) return e.c;
  const c = (e && e.c.width === p.w && e.c.height === p.h) ? e.c : mkCanvas(p.w, p.h), x = c.getContext('2d');
  x.clearRect(0, 0, p.w, p.h); drawFrameLayers(x, f);
  if (col) { x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, p.w, p.h); x.globalCompositeOperation = 'source-over'; }
  onionCache.delete(f.id); onionCache.set(f.id, { key, c });
  while (onionCache.size > 10) onionCache.delete(onionCache.keys().next().value);
  return c;
}
function render() {
  const p = S.proj; if (!p) return;
  vctx.setTransform(1, 0, 0, 1, 0, 0); vctx.fillStyle = '#2c2e35'; vctx.fillRect(0, 0, view.width, view.height);
  vctx.setTransform(new DOMMatrix().scale(DPR).multiply(VM));
  vctx.save(); vctx.shadowColor = 'rgba(0,0,0,.45)'; vctx.shadowBlur = 22; vctx.fillStyle = p.paper; vctx.fillRect(0, 0, p.w, p.h); vctx.restore();
  vctx.imageSmoothingEnabled = S.view.z < 3;
  if (S.playing) { drawFrameLayers(vctx, p.frames[S.playIdx]); }
  else {
    if (S.onion.on) {
      for (let i = S.onion.prev; i >= 1; i--) { const f = p.frames[S.cur - i]; if (!f) continue; vctx.globalAlpha = S.onion.op * (1 - (i - 1) / (S.onion.prev + 0.6)); vctx.drawImage(onionCanvas(f, S.onion.tint ? '#ff3b3b' : null), 0, 0); }
      for (let i = S.onion.next; i >= 1; i--) { const f = p.frames[S.cur + i]; if (!f) continue; vctx.globalAlpha = S.onion.op * (1 - (i - 1) / (S.onion.next + 0.6)); vctx.drawImage(onionCanvas(f, S.onion.tint ? '#16c45a' : null), 0, 0); }
      vctx.globalAlpha = 1;
    }
    const f = curFrame();
    p.layers.forEach((L, i) => {
      if (!L.visible) return; let src = f.cells[i].c;
      if (i === S.layer && (S.stroke || S.shapeDraw || S.sel)) {
        const w = getWork(); w.x.clearRect(0, 0, p.w, p.h); w.x.drawImage(src, 0, 0);
        const t = S.stroke || S.shapeDraw;
        if (t) { w.x.globalAlpha = t.alpha; w.x.globalCompositeOperation = t.erase ? 'destination-out' : 'source-over'; w.x.drawImage(buf, 0, 0); w.x.globalAlpha = 1; w.x.globalCompositeOperation = 'source-over'; }
        if (S.sel) drawSelFloat(w.x, S.sel);
        src = w.c;
      }
      vctx.globalAlpha = L.opacity; vctx.drawImage(src, 0, 0);
    });
    vctx.globalAlpha = 1;
  }
  vctx.imageSmoothingEnabled = true;
  vctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (S.lasso) drawLasso();
  if (S.sel) drawSelHandles();
  if (S.hover && !S.stroke && BRUSHES.includes(S.tool) && !S.playing) {
    const r = S.size[S.tool] / 2 * S.view.z; vctx.beginPath(); vctx.arc(S.hover.x, S.hover.y, Math.max(1.5, r), 0, 6.2832);
    vctx.strokeStyle = '#000a'; vctx.lineWidth = 3; vctx.stroke(); vctx.strokeStyle = '#fffd'; vctx.lineWidth = 1.2; vctx.stroke();
  }
}

/* ---------------- thumbnails ---------------- */
let thumbTimer = null;
function scheduleThumbs() { clearTimeout(thumbTimer); thumbTimer = setTimeout(updateStripThumbs, 220); }
function thumbFor(f) {
  const p = S.proj, th = 72, tw = Math.max(24, Math.round(th * p.w / p.h));
  if (!f.thumb || f.thumb.width !== tw) { f.thumb = mkCanvas(tw, th); f.thumbDirty = true; }
  if (f.thumbDirty) { compositeTo(f.thumb.getContext('2d'), f, tw / p.w); f.thumbDirty = false; }
  return f.thumb;
}

/* =========================================================
   UNDO / REDO
   ========================================================= */
function updUndoBtns() { const u = $('#b-undo'), r = $('#b-redo'); if (u) u.disabled = !S.undo.length && !S.sel; if (r) r.disabled = !S.redo.length; }
function pushUndo(e) {
  e.bytes = e.k === 'px' ? e.before.data.length * 2 : 2000;
  S.undo.push(e); S.undoBytes += e.bytes; S.redo = [];
  while (S.undo.length > 80 || (S.undoBytes > 200e6 && S.undo.length > 1)) { const o = S.undo.shift(); S.undoBytes -= o.bytes; }
  updUndoBtns();
}
function applyEntry(e, which) {
  if (e.k === 'px') {
    e.cell.c.getContext('2d').putImageData(which === 'before' ? e.before : e.after, e.r.x, e.r.y);
    markCell(e.f, e.cell);
    const i = S.proj.frames.indexOf(e.f); if (i >= 0 && i !== S.cur) setFrame(i, true);
  } else if (e.k === 'struct') restoreStruct(which === 'before' ? e.before : e.after);
  else if (e.k === 'prop') { e.apply(which === 'before' ? e.before : e.after); }
  req();
}
function undo() {
  if (S.sel) { cancelSel(); return; }
  if (S.stroke || S.shapeDraw || S.lasso) return;
  const e = S.undo.pop(); if (!e) { hint('Nothing to undo'); return; }
  S.undoBytes -= e.bytes; applyEntry(e, 'before'); S.redo.push(e); updUndoBtns(); hint('↶ Undo', 500);
}
function redo() {
  if (S.stroke || S.shapeDraw || S.sel) return;
  const e = S.redo.pop(); if (!e) { hint('Nothing to redo'); return; }
  applyEntry(e, 'after'); S.undo.push(e); S.undoBytes += e.bytes; updUndoBtns(); hint('↷ Redo', 500);
}
function snap() {
  const p = S.proj;
  return { frames: p.frames.slice(), cells: p.frames.map((f) => f.cells.slice()), holds: p.frames.map((f) => f.hold), layers: p.layers.map((l) => Object.assign({}, l)), cur: S.cur, layer: S.layer };
}
function restoreStruct(s) {
  const p = S.proj; p.frames = s.frames.slice();
  p.frames.forEach((f, i) => { f.cells = s.cells[i].slice(); f.hold = s.holds[i]; f.thumbDirty = true; f.ver++; });
  p.layers = s.layers.map((l) => Object.assign({}, l));
  S.cur = clamp(s.cur, 0, p.frames.length - 1); S.layer = clamp(s.layer, 0, p.layers.length - 1);
  onionCache.clear(); renderStrip(); renderLayers(); scheduleSave(); req();
}
function structOp(fn) {
  commitSel(); stopPlay();
  const before = snap(); fn(); const after = snap();
  pushUndo({ k: 'struct', before, after }); onionCache.clear(); renderStrip(); renderLayers(); scheduleSave(); req();
}

/* =========================================================
   TOOLS
   ========================================================= */
let buf = null, bctx = null;
function ensureBuf() { const p = S.proj; if (!buf || buf.width !== p.w || buf.height !== p.h) { buf = mkCanvas(p.w, p.h); bctx = buf.getContext('2d'); } bctx.clearRect(0, 0, buf.width, buf.height); }
function canEdit() {
  const L = S.proj.layers[S.layer];
  if (!L.visible) { toast('This layer is hidden – tap 👁 in Layers to show it'); return false; }
  if (L.locked) { toast('This layer is locked 🔒'); return false; }
  if (S.playing) stopPlay();
  return true;
}
const bbNew = () => [1e9, 1e9, -1e9, -1e9];
function bbAdd(bb, x, y, r) { if (x - r < bb[0]) bb[0] = x - r; if (y - r < bb[1]) bb[1] = y - r; if (x + r > bb[2]) bb[2] = x + r; if (y + r > bb[3]) bb[3] = y + r; }
function clipBB(bb) {
  const p = S.proj; const x0 = Math.max(0, Math.floor(bb[0])), y0 = Math.max(0, Math.floor(bb[1])), x1 = Math.min(p.w, Math.ceil(bb[2])), y1 = Math.min(p.h, Math.ceil(bb[3]));
  if (x1 <= x0 || y1 <= y0) return null; return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function commitBuf(bb, op, alpha) {
  const r = clipBB(bb); if (!r) return;
  const f = curFrame(), cell = curCell(), x = cell.c.getContext('2d');
  const before = x.getImageData(r.x, r.y, r.w, r.h);
  x.save(); x.globalAlpha = alpha; x.globalCompositeOperation = op; x.drawImage(buf, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h); x.restore();
  const after = x.getImageData(r.x, r.y, r.w, r.h);
  pushUndo({ k: 'px', f, cell, r, before, after }); markCell(f, cell);
}

/* ---------- brush strokes ---------- */
let soft = { col: '', c: null };
function softStamp(col) {
  if (soft.col === col && soft.c) return soft.c;
  const c = mkCanvas(128, 128), x = c.getContext('2d'), [r, g, b] = hexToRgb(col);
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${r},${g},${b},0.42)`); gr.addColorStop(0.55, `rgba(${r},${g},${b},0.22)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128); soft = { col, c }; return c;
}
function radiusFor(pr) {
  const s = S.stroke; let pf = 1;
  if (S.pressure && s.pen && s.tool !== 'marker') pf = s.tool === 'pencil' ? 0.45 + 0.55 * pr : 0.1 + 0.9 * Math.pow(pr, 1.15);
  return Math.max(0.35, s.size / 2 * pf);
}
function stamp(x, y, pr) {
  const s = S.stroke, r = radiusFor(pr); bbAdd(s.bb, x, y, r + 2);
  if (s.tool === 'brush') { bctx.drawImage(softStamp(s.col), x - r, y - r, r * 2, r * 2); return; }
  if (s.tool === 'pencil') { bctx.globalAlpha = 0.3 + Math.random() * 0.55; bctx.beginPath(); bctx.arc(x + (Math.random() - 0.5) * 0.7, y + (Math.random() - 0.5) * 0.7, r, 0, 6.2832); bctx.fill(); bctx.globalAlpha = 1; return; }
  bctx.beginPath(); bctx.arc(x, y, r, 0, 6.2832); bctx.fill();
}
function segment(a, b) {
  const s = S.stroke, d = Math.hypot(b.x - a.x, b.y - a.y); if (d < 0.01) return;
  const r = radiusFor((a.p + b.p) / 2);
  const sp = s.tool === 'brush' ? Math.max(0.5, r * 0.2) : s.tool === 'pencil' ? Math.max(0.35, r * 0.45) : Math.max(0.3, r * 0.25);
  const n = Math.min(4000, Math.ceil(d / sp));
  for (let i = 1; i <= n; i++) { const t = i / n; stamp(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.p, b.p, t)); }
  s.len += d;
}
function strokeStart(pt, isPen) {
  ensureBuf();
  const t = S.tool;
  S.stroke = { tool: t, erase: t === 'eraser', alpha: S.opac[t], size: S.size[t], col: S.color, pen: isPen, last: Object.assign({}, pt), raw: Object.assign({}, pt), start: Object.assign({}, pt), bb: bbNew(), len: 0, anchor: Object.assign({}, pt), anchorT: performance.now(), straight: false };
  bctx.fillStyle = t === 'eraser' ? '#000' : S.color;
  stamp(pt.x, pt.y, pt.p); req();
}
function strokeMove(pt) {
  const s = S.stroke; s.raw = pt;
  if (Math.hypot(pt.x - s.anchor.x, pt.y - s.anchor.y) > 5 / S.view.z) { s.anchor = Object.assign({}, pt); s.anchorT = performance.now(); }
  if (s.straight) { redrawStraight(); return; }
  const k = S.stab * 0.86;
  const sm = { x: lerp(pt.x, s.last.x, k), y: lerp(pt.y, s.last.y, k), p: lerp(pt.p, s.last.p, k * 0.5) };
  segment(s.last, sm); s.last = sm; req();
}
function makeStraight() { const s = S.stroke; s.straight = true; s.sp = clamp(s.raw.p || 1, 0.3, 1); redrawStraight(); hint('📏 Straight line'); }
function redrawStraight() {
  const s = S.stroke; bctx.clearRect(0, 0, buf.width, buf.height); s.bb = bbNew();
  const a = { x: s.start.x, y: s.start.y, p: s.sp }, b = { x: s.raw.x, y: s.raw.y, p: s.sp };
  stamp(a.x, a.y, a.p); segment(a, b); req();
}
function strokeEnd() {
  const s = S.stroke; if (!s) return;
  if (!s.straight) segment(s.last, s.raw);
  commitBuf(s.bb, s.erase ? 'destination-out' : 'source-over', s.alpha);
  S.stroke = null; if (!s.erase) addRecent(s.col); req();
}

/* ---------- fill ---------- */
function doFill(pt) {
  if (!canEdit()) return;
  const p = S.proj, w = p.w, h = p.h, x0 = Math.floor(pt.x), y0 = Math.floor(pt.y);
  if (x0 < 0 || y0 < 0 || x0 >= w || y0 >= h) return;
  const f = curFrame(), cell = curCell(), lx = cell.c.getContext('2d');
  let sd;
  if (S.fill.all) { const wk = getWork(); wk.x.clearRect(0, 0, w, h); drawFrameLayers(wk.x, f); sd = wk.x.getImageData(0, 0, w, h).data; }
  else sd = lx.getImageData(0, 0, w, h).data;
  const own = lx.getImageData(x0, y0, 1, 1).data, replace = own[3] > 40;
  const i0 = (y0 * w + x0) * 4, tr = sd[i0], tg = sd[i0 + 1], tb = sd[i0 + 2], ta = sd[i0 + 3];
  const tol = S.fill.tol / 100;
  const emptyT = ta < 10, aTh = 12 + tol * 200, cTh = 8 + tol * 420;
  const mask = new Uint8Array(w * h);
  const match = (k) => { if (mask[k]) return false; const j = k * 4; if (emptyT) return sd[j + 3] < aTh; return Math.abs(sd[j] - tr) + Math.abs(sd[j + 1] - tg) + Math.abs(sd[j + 2] - tb) + Math.abs(sd[j + 3] - ta) * 1.5 <= cTh; };
  const stack = [x0, y0]; let minX = x0, maxX = x0, minY = y0, maxY = y0, cnt = 0;
  while (stack.length) {
    const y = stack.pop(); let x = stack.pop(), row = y * w;
    while (x >= 0 && match(row + x)) x--; x++;
    let up = false, dn = false;
    while (x < w && match(row + x)) {
      mask[row + x] = 1; cnt++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (y > 0) { if (match(row - w + x)) { if (!up) { stack.push(x, y - 1); up = true; } } else up = false; }
      if (y < h - 1) { if (match(row + w + x)) { if (!dn) { stack.push(x, y + 1); dn = true; } } else dn = false; }
      x++;
    }
  }
  if (!cnt) return;
  let mk = mask;
  if (!replace) { for (let pass = 0; pass < 2; pass++) { const out = mk.slice(); const ax = Math.max(0, minX - 1), bx = Math.min(w - 1, maxX + 1), ay = Math.max(0, minY - 1), by = Math.min(h - 1, maxY + 1);
    for (let y = ay; y <= by; y++) for (let x = ax; x <= bx; x++) { const k = y * w + x; if (mk[k]) continue; if ((x > 0 && mk[k - 1]) || (x < w - 1 && mk[k + 1]) || (y > 0 && mk[k - w]) || (y < h - 1 && mk[k + w])) out[k] = 1; }
    mk = out; minX = ax; maxX = bx; minY = ay; maxY = by; } }
  const r = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  const img = new ImageData(r.w, r.h), d = img.data, [cr, cg, cb] = hexToRgb(S.color);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { if (!mk[(y + r.y) * w + x + r.x]) continue; const j = (y * r.w + x) * 4; d[j] = cr; d[j + 1] = cg; d[j + 2] = cb; d[j + 3] = 255; }
  const tmp = mkCanvas(r.w, r.h); tmp.getContext('2d').putImageData(img, 0, 0);
  const before = lx.getImageData(r.x, r.y, r.w, r.h);
  lx.save(); lx.globalCompositeOperation = replace ? 'source-over' : 'destination-over'; lx.drawImage(tmp, r.x, r.y); lx.restore();
  const after = lx.getImageData(r.x, r.y, r.w, r.h);
  pushUndo({ k: 'px', f, cell, r, before, after }); markCell(f, cell); addRecent(S.color); req();
}

/* ---------- shapes ---------- */
function shapeStart(pt) { ensureBuf(); S.shapeDraw = { a: pt, b: pt, alpha: S.opac.shape, erase: false, bb: null, snap: false, anchor: pt, anchorT: performance.now(), moved: false }; drawShape(); }
function shapeMove(pt, shift) {
  const s = S.shapeDraw; if (Math.hypot(pt.x - s.anchor.x, pt.y - s.anchor.y) > 5 / S.view.z) { s.anchor = pt; s.anchorT = performance.now(); s.moved = true; if (!shift) s.snapKey = false; }
  s.b = pt; s.shift = shift; drawShape();
}
function drawShape() {
  const s = S.shapeDraw, lw = S.size.shape; let { a, b } = s;
  if (s.shift || s.snap) {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (S.shape.type === 'line') { const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * Math.PI / 4, L = Math.hypot(dx, dy); b = { x: a.x + Math.cos(ang) * L, y: a.y + Math.sin(ang) * L }; }
    else { const m = Math.max(Math.abs(dx), Math.abs(dy)); b = { x: a.x + Math.sign(dx || 1) * m, y: a.y + Math.sign(dy || 1) * m }; }
  }
  bctx.clearRect(0, 0, buf.width, buf.height);
  bctx.lineWidth = lw; bctx.lineCap = 'round'; bctx.lineJoin = 'round'; bctx.strokeStyle = S.color; bctx.fillStyle = S.color;
  const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
  bctx.beginPath();
  if (S.shape.type === 'line') { bctx.moveTo(a.x, a.y); bctx.lineTo(b.x, b.y); }
  else if (S.shape.type === 'rect') bctx.rect(x0, y0, w, h);
  else bctx.ellipse(x0 + w / 2, y0 + h / 2, Math.max(0.5, w / 2), Math.max(0.5, h / 2), 0, 0, Math.PI * 2);
  if (S.shape.filled && S.shape.type !== 'line') bctx.fill();
  bctx.stroke();
  s.bb = [x0 - lw, y0 - lw, x0 + w + lw, y0 + h + lw]; req();
}
function shapeEnd() { const s = S.shapeDraw; S.shapeDraw = null; if (!s) return; if (Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y) < 1) { req(); return; } commitBuf(s.bb, 'source-over', s.alpha); addRecent(S.color); req(); }

/* ---------- picker ---------- */
let pickCache = null;
function pickStart() { const p = S.proj, wk = getWork(); wk.x.fillStyle = p.paper; wk.x.fillRect(0, 0, p.w, p.h); drawFrameLayers(wk.x, curFrame()); pickCache = wk; }
function pickAt(pt) { const p = S.proj, x = Math.floor(pt.x), y = Math.floor(pt.y); if (x < 0 || y < 0 || x >= p.w || y >= p.h || !pickCache) return; const d = pickCache.x.getImageData(x, y, 1, 1).data; setColor(rgbToHex(d[0], d[1], d[2]), true); }

/* ---------- selection ---------- */
function pathPts(ctx, pts) { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.closePath(); }
function selStart(pt) { S.lasso = { pts: [pt], box: S.selMode === 'box', a: pt, b: pt }; req(); }
function selMove(pt) { const L = S.lasso; if (L.box) L.b = pt; else { const l = L.pts[L.pts.length - 1]; if (Math.hypot(pt.x - l.x, pt.y - l.y) > 2 / S.view.z) L.pts.push(pt); } req(); }
function selEnd() {
  const L = S.lasso; S.lasso = null; let pts = L.pts;
  if (L.box) { const a = L.a, b = L.b; pts = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }]; }
  if (pts.length < 3) { req(); return; }
  liftSelection(pts);
}
function drawLasso() {
  const L = S.lasso; let pts = L.pts; if (L.box) { const a = L.a, b = L.b; pts = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }]; }
  const sp = pts.map((q) => d2s(q.x, q.y)); vctx.save(); pathPts(vctx, sp); vctx.fillStyle = '#5aa8ff22'; vctx.fill();
  vctx.setLineDash([6, 5]); vctx.lineWidth = 1.5; vctx.strokeStyle = '#000'; vctx.stroke(); vctx.lineDashOffset = 5.5; vctx.strokeStyle = '#fff'; vctx.stroke(); vctx.restore();
}
function liftSelection(pts) {
  if (!canEdit()) { req(); return; }
  const p = S.proj;
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity; pts.forEach((q) => { bx0 = Math.min(bx0, q.x); by0 = Math.min(by0, q.y); bx1 = Math.max(bx1, q.x); by1 = Math.max(by1, q.y); });
  const r = clipBB([bx0, by0, bx1, by1]); if (!r || r.w < 2 || r.h < 2) { req(); return; }
  const cell = curCell(), f = curFrame(), lx = cell.c.getContext('2d');
  const fl = mkCanvas(r.w, r.h), fx = fl.getContext('2d');
  fx.save(); fx.translate(-r.x, -r.y); pathPts(fx, pts); fx.clip(); fx.drawImage(cell.c, 0, 0); fx.restore();
  const dd = fx.getImageData(0, 0, r.w, r.h).data; let any = false; for (let i = 3; i < dd.length; i += 4) { if (dd[i] > 0) { any = true; break; } }
  if (!any) { toast('Nothing on this layer inside the selection'); req(); return; }
  const orig = mkCanvas(p.w, p.h); orig.getContext('2d').drawImage(cell.c, 0, 0);
  lx.save(); lx.globalCompositeOperation = 'destination-out'; pathPts(lx, pts); lx.fill(); lx.restore();
  S.sel = { fl, w: r.w, h: r.h, cx: r.x + r.w / 2, cy: r.y + r.h / 2, sx: 1, sy: 1, rot: 0, orig, cell, f, ob: r, uniform: true };
  showSelBar(); updUndoBtns(); req();
}
function contentBounds(c) {
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data, w = c.width, h = c.height;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if (d[(y * w + xx) * 4 + 3] > 0) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
function selectAll() {
  commitSel(); if (!canEdit()) return;
  const b = contentBounds(curCell().c); if (!b) { toast('This layer is empty on this frame'); return; }
  const x0 = b.x - 1, y0 = b.y - 1, x1 = b.x + b.w + 1, y1 = b.y + b.h + 1;
  setTool('select', true);
  liftSelection([{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }]);
}
function drawSelFloat(ctx, s) { ctx.save(); ctx.translate(s.cx, s.cy); ctx.rotate(s.rot); ctx.scale(s.sx, s.sy); ctx.drawImage(s.fl, -s.w / 2, -s.h / 2); ctx.restore(); }
function rot2(x, y, a) { const c = Math.cos(a), s = Math.sin(a); return { x: x * c - y * s, y: x * s + y * c }; }
const CS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
function selDocPt(s, ux, uy) { const q = rot2(ux * s.w / 2 * s.sx, uy * s.h / 2 * s.sy, s.rot); return { x: s.cx + q.x, y: s.cy + q.y }; }
function selHandles() {
  const s = S.sel; const corners = CS.map(([ux, uy]) => d2s(...Object.values(selDocPt(s, ux, uy))));
  const edges = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([ux, uy]) => d2s(...Object.values(selDocPt(s, ux, uy))));
  const c = d2s(s.cx, s.cy), top = edges[0]; let vx = top.x - c.x, vy = top.y - c.y; const L = Math.hypot(vx, vy) || 1; vx /= L; vy /= L;
  if (Math.sign(s.sy) < 0) { vx = -vx; vy = -vy; }
  const rotH = { x: top.x + vx * 34, y: top.y + vy * 34 };
  return { corners, edges, rotH, top, c };
}
function drawSelHandles() {
  const H = selHandles(); vctx.save();
  vctx.beginPath(); H.corners.forEach((q, i) => (i ? vctx.lineTo(q.x, q.y) : vctx.moveTo(q.x, q.y))); vctx.closePath();
  vctx.setLineDash([6, 5]); vctx.lineWidth = 1.5; vctx.strokeStyle = '#000'; vctx.stroke(); vctx.lineDashOffset = 5.5; vctx.strokeStyle = '#5aa8ff'; vctx.stroke(); vctx.setLineDash([]);
  vctx.beginPath(); vctx.moveTo(H.top.x, H.top.y); vctx.lineTo(H.rotH.x, H.rotH.y); vctx.strokeStyle = '#5aa8ff'; vctx.stroke();
  const R = S.device === 'ipad' ? 9 : 7;
  const dot = (q, col, r) => { vctx.beginPath(); vctx.arc(q.x, q.y, r, 0, 6.2832); vctx.fillStyle = col; vctx.fill(); vctx.lineWidth = 2; vctx.strokeStyle = '#0b1220'; vctx.stroke(); };
  H.corners.forEach((q) => dot(q, '#fff', R)); H.edges.forEach((q) => dot(q, '#5aa8ff', R - 2)); dot(H.rotH, '#ff7a45', R);
  vctx.restore();
}
function pointInPoly(pt, poly) { let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) ins = !ins; } return ins; }
function selHit(sp) {
  const H = selHandles(), R = S.device === 'ipad' ? 26 : 16, near = (q) => Math.hypot(q.x - sp.x, q.y - sp.y) < R;
  if (near(H.rotH)) return { mode: 'rot' };
  for (let i = 0; i < 4; i++) if (near(H.corners[i])) return { mode: 'corner', idx: i };
  for (let i = 0; i < 4; i++) if (near(H.edges[i])) return { mode: 'edge', idx: i };
  if (pointInPoly(sp, H.corners)) return { mode: 'move' };
  return null;
}
function selDragStart(hit, pt) { const s = S.sel; S.selDrag = Object.assign({}, hit, { p0: pt, cx0: s.cx, cy0: s.cy, sx0: s.sx, sy0: s.sy, rot0: s.rot }); }
function selDragMove(pt, shift) {
  const d = S.selDrag, s = S.sel; if (!d) return;
  const nz = (v) => (Math.abs(v) < 0.02 ? (v < 0 ? -0.02 : 0.02) : v);
  if (d.mode === 'move') { s.cx = d.cx0 + pt.x - d.p0.x; s.cy = d.cy0 + pt.y - d.p0.y; }
  else if (d.mode === 'rot') { let a = Math.atan2(pt.y - s.cy, pt.x - s.cx) + Math.PI / 2; if (Math.sign(s.sy) < 0) a += Math.PI; const st = Math.PI / 12; const sn = Math.round(a / st) * st; if (shift || Math.abs(a - sn) < 0.05) a = sn; s.rot = a; }
  else {
    const q = rot2(pt.x - s.cx, pt.y - s.cy, -s.rot);
    if (d.mode === 'corner') {
      const [ux, uy] = CS[d.idx]; let nsx = q.x / (ux * s.w / 2), nsy = q.y / (uy * s.h / 2);
      if (s.uniform !== shift) { const k = (Math.abs(nsx / d.sx0) + Math.abs(nsy / d.sy0)) / 2; nsx = d.sx0 * k; nsy = d.sy0 * k; }
      s.sx = nz(nsx); s.sy = nz(nsy);
    } else {
      if (d.idx === 0 || d.idx === 2) s.sy = nz(q.y / ((d.idx === 0 ? -1 : 1) * s.h / 2));
      else s.sx = nz(q.x / ((d.idx === 3 ? -1 : 1) * s.w / 2));
    }
  }
  req();
}
function selTransformedBB(s) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; CS.forEach(([ux, uy]) => { const q = selDocPt(s, ux, uy); x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }); return [x0 - 2, y0 - 2, x1 + 2, y1 + 2]; }
function finishSel(drawFloat) {
  const s = S.sel; if (!s) return; const lx = s.cell.c.getContext('2d');
  if (drawFloat) drawSelFloat(lx, s);
  const tb = selTransformedBB(s), ob = s.ob; const r = clipBB([Math.min(ob.x, tb[0]), Math.min(ob.y, tb[1]), Math.max(ob.x + ob.w, tb[2]), Math.max(ob.y + ob.h, tb[3])]);
  if (r) { const before = s.orig.getContext('2d').getImageData(r.x, r.y, r.w, r.h), after = lx.getImageData(r.x, r.y, r.w, r.h); pushUndo({ k: 'px', f: s.f, cell: s.cell, r, before, after }); }
  markCell(s.f, s.cell); S.sel = null; S.selDrag = null; hideSelBar(); updUndoBtns(); req();
}
function commitSel() { if (S.sel) finishSel(true); }
function deleteSel() { if (S.sel) { finishSel(false); hint('🗑 Deleted'); } }
function cancelSel() { const s = S.sel; if (!s) return; const lx = s.cell.c.getContext('2d'); lx.clearRect(0, 0, s.cell.c.width, s.cell.c.height); lx.drawImage(s.orig, 0, 0); markCell(s.f, s.cell); S.sel = null; S.selDrag = null; hideSelBar(); updUndoBtns(); req(); }
function stampSel() { const s = S.sel; if (!s) return; drawSelFloat(s.cell.c.getContext('2d'), s); s.cx += 20 / S.view.z; s.cy += 20 / S.view.z; markCell(s.f, s.cell); hint('⧉ Copy stamped – move the copy'); req(); }
function showSelBar() {
  const b = $('#sel-bar'); const s = S.sel;
  b.innerHTML = `<button type="button" class="ok" data-a="done">✓ Done</button><button type="button" data-a="fh">⇋ Flip</button><button type="button" data-a="fv">⇵ Flip</button><button type="button" data-a="stamp">⧉ Copy</button><button type="button" data-a="uni" class="${s.uniform ? 'on' : ''}">${s.uniform ? '🔗 Keep shape' : '↔ Free stretch'}</button><button type="button" data-a="del">🗑</button><button type="button" data-a="cancel">✕</button>`;
  b.classList.add('show');
  b.querySelectorAll('[data-a]').forEach((x) => x.addEventListener('click', () => {
    const a = x.dataset.a, s2 = S.sel; if (!s2) return;
    if (a === 'done') commitSel(); else if (a === 'cancel') cancelSel(); else if (a === 'del') deleteSel(); else if (a === 'stamp') stampSel();
    else if (a === 'fh') { s2.sx *= -1; req(); } else if (a === 'fv') { s2.sy *= -1; req(); } else if (a === 'uni') { s2.uniform = !s2.uniform; showSelBar(); }
  }));
}
function hideSelBar() { $('#sel-bar').classList.remove('show'); }

/* =========================================================
   POINTER INPUT
   ========================================================= */
const ptrs = new Map(); let action = null, gesture = null, pan = null;
function evPos(e) { const r = view.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
function pressureOf(e) { return e.pointerType === 'pen' ? (e.pressure > 0 ? e.pressure : 0.5) : 1; }
const fingerDraws = () => S.finger === 'on' || (S.finger === 'auto' && !S.penSeen);
view.addEventListener('pointerdown', (e) => {
  if (!S.proj) return; e.preventDefault(); closePops();
  try { view.setPointerCapture(e.pointerId); } catch (er) {}
  const sp = evPos(e); ptrs.set(e.pointerId, { id: e.pointerId, type: e.pointerType, x: sp.x, y: sp.y, x0: sp.x, y0: sp.y, t0: performance.now() });
  if (e.pointerType === 'pen' && !S.penSeen) { S.penSeen = true; if (S.finger === 'auto') hint('✏️ Apple Pencil detected – fingers now move & zoom', 1800); }
  if (S.playing) stopPlay();
  if (e.pointerType === 'touch') {
    const touches = [...ptrs.values()].filter((q) => q.type === 'touch');
    if (gesture) { gesture.max = Math.max(gesture.max, touches.length); return; }
    if (touches.length >= 2) { if (action && action.type === 'touch') abortAction(); pan = null; startGesture(touches); return; }
    if (!fingerDraws() || S.tool === 'hand') { pan = { id: e.pointerId, s0: sp, v0: Object.assign({}, S.view), tap: true }; return; }
  }
  if (e.pointerType === 'mouse') { if (e.button === 1 || e.button === 2 || S.spaceDown || S.tool === 'hand') { pan = { id: e.pointerId, s0: sp, v0: Object.assign({}, S.view) }; view.classList.add('hand'); return; } if (e.button !== 0) return; }
  if (e.pointerType === 'pen' && S.tool === 'hand') { pan = { id: e.pointerId, s0: sp, v0: Object.assign({}, S.view) }; return; }
  if (action || gesture) return;
  beginAction(e, sp);
});
view.addEventListener('pointermove', (e) => {
  const sp = evPos(e); const q = ptrs.get(e.pointerId);
  if (e.pointerType === 'mouse' && !q) { S.hover = sp; if (BRUSHES.includes(S.tool)) req(); return; }
  if (!q) return; q.x = sp.x; q.y = sp.y;
  if (e.pointerType === 'mouse') S.hover = sp;
  if (gesture) { updateGesture(); return; }
  if (pan && pan.id === e.pointerId) { S.view.x = pan.v0.x + sp.x - pan.s0.x; S.view.y = pan.v0.y + sp.y - pan.s0.y; if (Math.hypot(sp.x - pan.s0.x, sp.y - pan.s0.y) > 8) pan.tap = false; updVM(); return; }
  if (action && action.id === e.pointerId) {
    const evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    for (const ev of evs) { const p2 = evPos(ev), d = s2d(p2.x, p2.y); moveAction({ x: d.x, y: d.y, p: pressureOf(ev) }, ev, p2); }
  }
});
function endPtr(e) {
  const q = ptrs.get(e.pointerId); ptrs.delete(e.pointerId);
  if (gesture) { if (![...ptrs.values()].some((t) => t.type === 'touch')) endGesture(); return; }
  if (pan && pan.id === e.pointerId) { pan = null; view.classList.toggle('hand', S.tool === 'hand'); return; }
  if (action && action.id === e.pointerId) { if (e.type === 'pointercancel') abortAction(); else endAction(); }
}
view.addEventListener('pointerup', endPtr); view.addEventListener('pointercancel', endPtr);
view.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { S.hover = null; req(); } });
view.addEventListener('contextmenu', (e) => e.preventDefault());
view.addEventListener('wheel', (e) => {
  if (!S.proj) return; e.preventDefault(); const sp = evPos(e);
  const mouseWheel = e.deltaMode === 1 || (Math.abs(e.deltaY) >= 50 && e.deltaX === 0 && Number.isInteger(e.deltaY));
  if (e.ctrlKey || e.metaKey || mouseWheel) zoomAt(sp, Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0018) * (e.deltaMode === 1 ? 30 : 1)));
  else { S.view.x -= e.deltaX; S.view.y -= e.deltaY; updVM(); }
}, { passive: false });
['gesturestart', 'gesturechange', 'gestureend'].forEach((n) => document.addEventListener(n, (e) => e.preventDefault()));

function beginAction(e, sp) {
  const d = s2d(sp.x, sp.y), pt = { x: d.x, y: d.y, p: pressureOf(e) }, t = S.tool;
  if (BRUSHES.includes(t)) { if (!canEdit()) return; commitSel(); action = { id: e.pointerId, type: e.pointerType, kind: 'stroke' }; strokeStart(pt, e.pointerType === 'pen'); return; }
  if (t === 'fill') { commitSel(); doFill(pt); action = { id: e.pointerId, type: e.pointerType, kind: 'none' }; return; }
  if (t === 'shape') { if (!canEdit()) return; commitSel(); shapeStart(pt); action = { id: e.pointerId, type: e.pointerType, kind: 'shape' }; return; }
  if (t === 'picker') { pickStart(); pickAt(pt); action = { id: e.pointerId, type: e.pointerType, kind: 'pick' }; return; }
  if (t === 'select') {
    if (S.sel) { const hit = selHit(sp); if (hit) { selDragStart(hit, pt); action = { id: e.pointerId, type: e.pointerType, kind: 'seldrag' }; return; } commitSel(); }
    selStart(pt); action = { id: e.pointerId, type: e.pointerType, kind: 'lasso' };
  }
}
function moveAction(pt, ev) {
  const k = action.kind;
  if (k === 'stroke' && S.stroke) strokeMove(pt);
  else if (k === 'shape' && S.shapeDraw) shapeMove(pt, ev.shiftKey);
  else if (k === 'pick') pickAt(pt);
  else if (k === 'lasso' && S.lasso) selMove(pt);
  else if (k === 'seldrag') selDragMove(pt, ev.shiftKey);
}
function endAction() {
  const k = action.kind; action = null;
  if (k === 'stroke') strokeEnd(); else if (k === 'shape') shapeEnd(); else if (k === 'lasso') selEnd();
  else if (k === 'pick') { pickCache = null; addRecent(S.color); hint('🎨 Colour picked'); }
  else if (k === 'seldrag') { S.selDrag = null; }
  req();
}
function abortAction() { if (!action) return; S.stroke = null; S.shapeDraw = null; S.lasso = null; S.selDrag = null; action = null; req(); }

function tpos(id) { return ptrs.get(id); }
function startGesture(touches) {
  const [a, b] = touches; const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  gesture = { ids: [a.id, b.id], c0: c, d0: Math.hypot(b.x - a.x, b.y - a.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), v0: Object.assign({}, S.view), doc0: s2d(c.x, c.y), max: touches.length, moved: false, t0: performance.now() };
}
function updateGesture() {
  const a = tpos(gesture.ids[0]), b = tpos(gesture.ids[1]); if (!a || !b) return;
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, d = Math.hypot(b.x - a.x, b.y - a.y), an = Math.atan2(b.y - a.y, b.x - a.x);
  if (Math.abs(d - gesture.d0) > 10 || Math.hypot(c.x - gesture.c0.x, c.y - gesture.c0.y) > 10) gesture.moved = true;
  if (!gesture.moved) return;
  let r = gesture.v0.r + (an - gesture.a0); r = Math.atan2(Math.sin(r), Math.cos(r)); if (Math.abs(r) < 0.09) r = 0;
  setViewKeep(clamp(gesture.v0.z * d / gesture.d0, 0.05, 32), r, gesture.doc0, c);
}
function endGesture() {
  const g = gesture; gesture = null;
  if (!g.moved && performance.now() - g.t0 < 350) { if (g.max >= 3) redo(); else if (g.max === 2) undo(); }
}

/* rAF loop + hold-to-straighten */
function tick() {
  const now = performance.now();
  const s = S.stroke;
  if (s && S.straighten && !s.straight && s.tool !== 'eraser' && now - s.anchorT > 550 && s.len > 30 / S.view.z) makeStraight();
  const sd = S.shapeDraw;
  if (sd && !sd.snap && sd.moved && now - sd.anchorT > 550) { sd.snap = true; drawShape(); hint(S.shape.type === 'line' ? '📐 Snapped angle' : '⭕ Perfect shape'); }
  if (need) { need = false; try { render(); } catch (e) { console.error(e); } }
  requestAnimationFrame(tick);
}

/* =========================================================
   COLOUR
   ========================================================= */
function setColor(hex, live) {
  S.color = hex.toLowerCase(); const [r, g, b] = hexToRgb(S.color); const hsv = rgbToHsv(r, g, b);
  if (hsv[1] < 0.001 || hsv[2] < 0.001) hsv[0] = S.hsv[0]; S.hsv = hsv;
  $('#color-dot').style.background = S.color; saveSettings();
  if ($('#pop-color').classList.contains('show')) { drawWheel(); if (!live) renderColorExtras(); else updColorRow(); }
}
function addRecent(c) { S.recent = [c].concat(S.recent.filter((x) => x !== c)).slice(0, 8); saveSettings(); }
const WH = { size: 250, ro: 120, ri: 98 };
let ringImg = null;
function buildRing() {
  const s = WH.size, img = new ImageData(s, s), d = img.data, c = s / 2;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = x - c + 0.5, dy = y - c + 0.5, r = Math.hypot(dx, dy); if (r < WH.ri - 1 || r > WH.ro + 1) continue;
    const h = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360, [R, G, B] = hsvToRgb(h, 1, 1), j = (y * s + x) * 4;
    const a = Math.min(1, r - WH.ri + 1, WH.ro + 1 - r); d[j] = R; d[j + 1] = G; d[j + 2] = B; d[j + 3] = clamp(a, 0, 1) * 255;
  }
  ringImg = img;
}
function sqGeom() { const side = WH.ri * Math.SQRT2 * 0.92, c = WH.size / 2; return { x: c - side / 2, y: c - side / 2, s: side }; }
function drawWheel() {
  const cv = $('#wheel'); if (!cv) return; const x = cv.getContext('2d'), s = WH.size;
  if (!ringImg) buildRing();
  x.clearRect(0, 0, s, s); x.putImageData(ringImg, 0, 0);
  const q = sqGeom(), [h, sat, val] = S.hsv;
  const [R, G, B] = hsvToRgb(h, 1, 1); x.fillStyle = `rgb(${R},${G},${B})`; x.fillRect(q.x, q.y, q.s, q.s);
  let gr = x.createLinearGradient(q.x, 0, q.x + q.s, 0); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(q.x, q.y, q.s, q.s);
  gr = x.createLinearGradient(0, q.y, 0, q.y + q.s); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(q.x, q.y, q.s, q.s);
  const a = (h - 90) * Math.PI / 180, rm = (WH.ri + WH.ro) / 2, c = s / 2;
  const ring = (px, py, col) => { x.beginPath(); x.arc(px, py, 8, 0, 6.2832); x.lineWidth = 3; x.strokeStyle = '#fff'; x.stroke(); x.lineWidth = 1; x.strokeStyle = '#000'; x.stroke(); if (col) { x.fillStyle = col; x.fill(); } };
  ring(c + Math.cos(a) * rm, c + Math.sin(a) * rm, `rgb(${R},${G},${B})`);
  ring(q.x + sat * q.s, q.y + (1 - val) * q.s, S.color);
}
function wheelPick(px, py, mode) {
  const c = WH.size / 2, dx = px - c, dy = py - c, r = Math.hypot(dx, dy), q = sqGeom();
  if (!mode) mode = r >= WH.ri - 6 ? 'ring' : 'sq';
  if (mode === 'ring') S.hsv[0] = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
  else { S.hsv[1] = clamp((px - q.x) / q.s, 0, 1); S.hsv[2] = clamp(1 - (py - q.y) / q.s, 0, 1); }
  const [R, G, B] = hsvToRgb(...S.hsv); S.color = rgbToHex(R, G, B); $('#color-dot').style.background = S.color;
  drawWheel(); updColorRow(); return mode;
}
function buildColorPop() {
  const p = $('#pop-color');
  p.innerHTML = `<canvas id="wheel" width="${WH.size}" height="${WH.size}"></canvas>
    <div class="c-row"><div class="c-cur" title="New / previous"><i id="c-new"></i><i id="c-old"></i></div><input id="c-hex" maxlength="7" spellcheck="false"><div class="grow"></div><button type="button" class="pb" id="c-save" title="Save to swatches">+ Save</button></div>
    <h4>Recent</h4><div class="sw-grid" id="c-recent"></div><h4>Swatches</h4><div class="sw-grid" id="c-sw"></div><p class="note">Long-press (or right-click) a swatch to remove it.</p>`;
  const cv = $('#wheel'); let mode = null;
  cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(); mode = wheelPick((e.clientX - r.left) * WH.size / r.width, (e.clientY - r.top) * WH.size / r.height); });
  cv.addEventListener('pointermove', (e) => { if (!mode) return; const r = cv.getBoundingClientRect(); wheelPick((e.clientX - r.left) * WH.size / r.width, (e.clientY - r.top) * WH.size / r.height, mode); });
  const up = () => { if (mode) { mode = null; saveSettings(); } }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  $('#c-hex').addEventListener('change', (e) => { let v = e.target.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) setColor(v.length === 4 ? '#' + v.slice(1).split('').map((c) => c + c).join('') : v); else updColorRow(); });
  $('#c-save').addEventListener('click', () => { if (!S.swatches.includes(S.color)) { S.swatches.push(S.color); saveSettings(); renderColorExtras(); hint('Saved to swatches'); } });
  $('#c-old').addEventListener('click', () => setColor(S.prevColor));
}
function updColorRow() { const h = $('#c-hex'); if (h && document.activeElement !== h) h.value = S.color.toUpperCase(); const n = $('#c-new'), o = $('#c-old'); if (n) n.style.background = S.color; if (o) o.style.background = S.prevColor; }
function renderColorExtras() {
  updColorRow();
  const mkSw = (c, removable) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw' + (c === S.color ? ' on' : ''); b.style.background = c; b.title = c;
    b.addEventListener('click', () => setColor(c));
    if (removable) { let t = null; const rm = (e) => { e.preventDefault(); S.swatches = S.swatches.filter((x) => x !== c); saveSettings(); renderColorExtras(); hint('Swatch removed'); };
      b.addEventListener('contextmenu', rm); b.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') t = setTimeout(() => rm(e), 650); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach((n) => b.addEventListener(n, () => clearTimeout(t))); }
    return b; };
  const rc = $('#c-recent'); rc.innerHTML = ''; S.recent.forEach((c) => rc.appendChild(mkSw(c)));
  if (!S.recent.length) rc.innerHTML = '<span class="note">Colours you use appear here.</span>';
  const sw = $('#c-sw'); sw.innerHTML = ''; S.swatches.forEach((c) => sw.appendChild(mkSw(c, true)));
}

/* =========================================================
   TOOLS PANEL + SLIDERS
   ========================================================= */
function buildTools() {
  $('#tool-list').innerHTML = TOOLS.map(([k, n]) => `<button type="button" class="tool" data-tool="${k}" title="${n}">${icon(k)}<span>${n}</span></button>`).join('');
  $$('.tool').forEach((b) => b.addEventListener('click', () => { if (S.tool === b.dataset.tool && ['pencil', 'pen', 'brush', 'marker', 'eraser', 'fill', 'shape', 'select'].includes(S.tool)) openToolPop(b); else setTool(b.dataset.tool); }));
}
function setTool(t, keepSel) {
  if (!keepSel && t !== 'select') commitSel();
  S.tool = t; saveSettings();
  $$('.tool').forEach((b) => b.classList.toggle('on', b.dataset.tool === t));
  view.classList.toggle('hand', t === 'hand'); updSliders(); req();
}
const sizeKey = () => (BRUSHES.includes(S.tool) ? S.tool : S.tool === 'shape' ? 'shape' : null);
const SMAX = 150;
function updSliders() {
  const k = sizeKey(), vs = $('#vs-size'), vo = $('#vs-opac');
  vs.classList.toggle('dis', !k); vo.classList.toggle('dis', !k);
  if (!k) { vs.querySelector('.vs-val').textContent = '–'; vo.querySelector('.vs-val').textContent = '–'; return; }
  const sz = S.size[k], t = Math.log(sz) / Math.log(SMAX); vs.querySelector('.vs-fill').style.height = clamp(t, 0.03, 1) * 100 + '%'; vs.querySelector('.vs-val').textContent = sz < 10 ? sz.toFixed(1).replace('.0', '') : Math.round(sz);
  const o = S.opac[k]; vo.querySelector('.vs-fill').style.height = o * 100 + '%'; vo.querySelector('.vs-val').textContent = Math.round(o * 100) + '%';
}
function bindVSlider(el, onT) {
  let on = false;
  const set = (e) => { const r = el.getBoundingClientRect(); onT(clamp(1 - (e.clientY - r.top) / r.height, 0, 1)); updSliders(); req(); };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); on = true; el.setPointerCapture(e.pointerId); set(e); });
  el.addEventListener('pointermove', (e) => { if (on) set(e); });
  const up = () => { if (on) { on = false; saveSettings(); } }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
function nudgeSize(k) { const key = sizeKey(); if (!key) return; S.size[key] = clamp(Math.round(S.size[key] * k * 10) / 10, 1, SMAX); updSliders(); saveSettings(); hint('Size ' + S.size[key]); req(); }

/* =========================================================
   POPOVERS
   ========================================================= */
let popAnchor = null;
function placePop(p, anchor) {
  p.classList.add('show'); const r = anchor.getBoundingClientRect(), pw = p.offsetWidth, ph = p.offsetHeight;
  let left, top;
  if (anchor.closest('#tools')) { left = r.right + 8; top = r.top - 10; }
  else if (anchor.closest('#timeline')) { left = r.left + r.width / 2 - pw / 2; top = r.top - ph - 8; }
  else { left = r.right - pw; top = r.bottom + 6; }
  p.style.left = clamp(left, 6, innerWidth - pw - 6) + 'px'; p.style.top = clamp(top, 6, innerHeight - ph - 6) + 'px';
}
function openPop(id, anchor) {
  const p = $('#' + id); const wasOpen = p.classList.contains('show') && popAnchor === anchor;
  closePops(); if (wasOpen) return;
  popAnchor = anchor;
  if (id === 'pop-color') { S.prevColor = S.color; drawWheel(); renderColorExtras(); }
  if (id === 'pop-layers') renderLayers();
  if (id === 'pop-onion') renderOnionPop();
  if (id === 'pop-fps') renderFpsPop();
  if (id === 'pop-export') renderExportPop();
  if (id === 'pop-more') renderMorePop();
  placePop(p, anchor);
}
function closePops() { $$('.pop.show').forEach((p) => p.classList.remove('show')); popAnchor = null; }
document.addEventListener('pointerdown', (e) => { if (!e.target.closest('.pop') && !e.target.closest('[data-pop]') && !e.target.closest('.tool') && !e.target.closest('.fr') && !e.target.closest('.card .dots')) closePops(); }, true);
$$('[data-pop]').forEach((b) => b.addEventListener('click', () => openPop(b.dataset.pop, b)));
function tog(on) { return `<span class="tog-sw ${on ? 'on' : ''}"></span>`; }

function openToolPop(anchor) {
  const p = $('#pop-tool'), t = S.tool; let h = '';
  if (BRUSHES.includes(t)) {
    h = `<h4>${TOOLS.find((x) => x[0] === t)[1]} settings</h4>
      <div class="row"><label>Size</label><b id="tp-sv">${S.size[t]}</b></div><input type="range" id="tp-size" min="0" max="1" step="0.001" value="${Math.log(S.size[t]) / Math.log(SMAX)}">
      <div class="row"><label>Opacity</label><b id="tp-ov">${Math.round(S.opac[t] * 100)}%</b></div><input type="range" id="tp-op" min="0.05" max="1" step="0.01" value="${S.opac[t]}">
      <h4>Stroke</h4><div class="row"><label>Smoothing (stabiliser)</label><b id="tp-stv">${Math.round(S.stab * 100)}%</b></div><input type="range" id="tp-stab" min="0" max="0.95" step="0.01" value="${S.stab}">
      <button type="button" class="row menu-t" id="tp-pr" style="width:100%"><label>Apple Pencil pressure</label>${tog(S.pressure)}</button>
      <button type="button" class="row menu-t" id="tp-st" style="width:100%"><label>Hold to make a straight line</label>${tog(S.straighten)}</button>
      <p class="note">Tip: draw a line, then keep the pen still for a moment – it snaps straight.</p>`;
  } else if (t === 'fill') {
    h = `<h4>Fill bucket</h4><div class="row"><label>Tolerance</label><b id="tp-tv">${S.fill.tol}</b></div><input type="range" id="tp-tol" min="0" max="100" step="1" value="${S.fill.tol}">
      <button type="button" class="row" id="tp-all" style="width:100%"><label>Use lines from all layers</label>${tog(S.fill.all)}</button>
      <p class="note">With this on, you can draw lines on one layer and fill colour on the layer underneath.</p>`;
  } else if (t === 'shape') {
    h = `<h4>Shape</h4><div class="btns">${[['ellipse', '◯ Circle'], ['rect', '▭ Rectangle'], ['line', '╱ Line']].map(([k, n]) => `<button type="button" class="pb ${S.shape.type === k ? 'on' : ''}" data-sh="${k}">${n}</button>`).join('')}</div>
      <button type="button" class="row" id="tp-fillsh" style="width:100%"><label>Filled shape</label>${tog(S.shape.filled)}</button>
      <p class="note">Hold Shift – or hold still for a moment – for a perfect circle/square or straight angle.</p>`;
  } else if (t === 'select') {
    h = `<h4>Select</h4><div class="btns">${[['lasso', '➰ Lasso'], ['box', '▭ Box']].map(([k, n]) => `<button type="button" class="pb ${S.selMode === k ? 'on' : ''}" data-sm="${k}">${n}</button>`).join('')}<button type="button" class="pb" id="tp-all-sel">⬚ Select whole layer</button></div>
      <p class="note">After selecting: drag inside to move, corners to resize, side handles to <b>squash & stretch</b>, orange dot to rotate.</p>`;
  }
  p.innerHTML = h; closePops(); popAnchor = anchor; placePop(p, anchor);
  const on = (id, ev, fn) => { const e = $('#' + id); if (e) e.addEventListener(ev, fn); };
  on('tp-size', 'input', (e) => { S.size[t] = clamp(Math.round(Math.pow(SMAX, +e.target.value) * 10) / 10, 1, SMAX); $('#tp-sv').textContent = S.size[t]; updSliders(); saveSettings(); });
  on('tp-op', 'input', (e) => { S.opac[t] = +e.target.value; $('#tp-ov').textContent = Math.round(S.opac[t] * 100) + '%'; updSliders(); saveSettings(); });
  on('tp-stab', 'input', (e) => { S.stab = +e.target.value; $('#tp-stv').textContent = Math.round(S.stab * 100) + '%'; saveSettings(); });
  on('tp-pr', 'click', () => { S.pressure = !S.pressure; saveSettings(); openToolPop(anchor); });
  on('tp-st', 'click', () => { S.straighten = !S.straighten; saveSettings(); openToolPop(anchor); });
  on('tp-tol', 'input', (e) => { S.fill.tol = +e.target.value; $('#tp-tv').textContent = S.fill.tol; saveSettings(); });
  on('tp-all', 'click', () => { S.fill.all = !S.fill.all; saveSettings(); openToolPop(anchor); });
  on('tp-fillsh', 'click', () => { S.shape.filled = !S.shape.filled; saveSettings(); openToolPop(anchor); });
  on('tp-all-sel', 'click', () => { closePops(); selectAll(); });
  $$('[data-sh]', p).forEach((b) => b.addEventListener('click', () => { S.shape.type = b.dataset.sh; saveSettings(); openToolPop(anchor); }));
  $$('[data-sm]', p).forEach((b) => b.addEventListener('click', () => { S.selMode = b.dataset.sm; openToolPop(anchor); }));
}

/* ---------- layers ---------- */
function renderLayers() {
  const p = $('#pop-layers'); if (!S.proj) return; const pr = S.proj, f = curFrame();
  let h = `<h4>Layers <span style="float:right;text-transform:none;letter-spacing:0">${pr.layers.length}/3</span></h4>`;
  for (let i = pr.layers.length - 1; i >= 0; i--) {
    const L = pr.layers[i];
    h += `<div class="lay ${i === S.layer ? 'on' : ''}" data-li="${i}"><canvas width="112" height="72" data-lt="${i}"></canvas>
      <div style="flex:1;min-width:0"><div class="nm">${esc(L.name)}</div><input type="range" class="op" data-lo="${i}" min="0" max="1" step="0.05" value="${L.opacity}"></div>
      <button type="button" data-lv="${i}" class="${L.visible ? 'act' : ''}" title="Show / hide">${icon(L.visible ? 'eye' : 'eyeoff')}</button>
      <button type="button" data-lk="${i}" class="${L.locked ? 'act' : ''}" title="Lock">${icon(L.locked ? 'lock' : 'unlock')}</button></div>`;
  }
  h += `<div class="btns" style="margin-top:8px"><button type="button" class="pb" id="l-add" ${pr.layers.length >= 3 ? 'disabled' : ''}>+ Layer</button><button type="button" class="pb" id="l-up">↑</button><button type="button" class="pb" id="l-dn">↓</button><button type="button" class="pb" id="l-ren">Rename</button><button type="button" class="pb danger" id="l-del" ${pr.layers.length <= 1 ? 'disabled' : ''}>Delete</button></div>
    <p class="note">Tip: sketch on one layer, ink on another, colour underneath. Turn the sketch layer down or hide it at the end.</p>`;
  p.innerHTML = h;
  $$('[data-lt]', p).forEach((c) => { const i = +c.dataset.lt, x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 112, 72); const sc = Math.min(112 / pr.w, 72 / pr.h); x.drawImage(f.cells[i].c, (112 - pr.w * sc) / 2, (72 - pr.h * sc) / 2, pr.w * sc, pr.h * sc); });
  $$('.lay', p).forEach((el) => el.addEventListener('click', (e) => { if (e.target.closest('button') || e.target.closest('input')) return; commitSel(); S.layer = +el.dataset.li; renderLayers(); req(); }));
  $$('[data-lv]', p).forEach((b) => b.addEventListener('click', () => { const L = pr.layers[+b.dataset.lv]; L.visible = !L.visible; renderLayers(); scheduleSave(); pr.frames.forEach((f2) => (f2.thumbDirty = true)); scheduleThumbs(); req(); }));
  $$('[data-lk]', p).forEach((b) => b.addEventListener('click', () => { const L = pr.layers[+b.dataset.lk]; L.locked = !L.locked; renderLayers(); scheduleSave(); }));
  $$('[data-lo]', p).forEach((r) => { r.addEventListener('input', () => { pr.layers[+r.dataset.lo].opacity = +r.value; pr.frames.forEach((f2) => (f2.thumbDirty = true)); req(); }); r.addEventListener('change', () => { scheduleThumbs(); scheduleSave(); }); });
  const on = (id, fn) => { const e = $('#' + id); if (e) e.addEventListener('click', fn); };
  on('l-add', () => structOp(() => { const at = S.layer + 1; pr.layers.splice(at, 0, { id: uid(), name: 'Layer ' + (pr.layers.length + 1), visible: true, locked: false, opacity: 1 }); pr.frames.forEach((f2) => f2.cells.splice(at, 0, newCell(pr.w, pr.h))); S.layer = at; }));
  on('l-del', () => { if (pr.layers.length <= 1) return; confirmBox('Delete layer?', `“${esc(pr.layers[S.layer].name)}” will be removed from every frame. (You can undo.)`, 'Delete', () => structOp(() => { pr.layers.splice(S.layer, 1); pr.frames.forEach((f2) => { f2.cells.splice(S.layer, 1); f2.thumbDirty = true; }); S.layer = clamp(S.layer - 1, 0, pr.layers.length - 1); })); });
  on('l-up', () => { if (S.layer >= pr.layers.length - 1) return; structOp(() => { const i = S.layer; [pr.layers[i], pr.layers[i + 1]] = [pr.layers[i + 1], pr.layers[i]]; pr.frames.forEach((f2) => { [f2.cells[i], f2.cells[i + 1]] = [f2.cells[i + 1], f2.cells[i]]; f2.thumbDirty = true; }); S.layer = i + 1; }); });
  on('l-dn', () => { if (S.layer <= 0) return; structOp(() => { const i = S.layer; [pr.layers[i], pr.layers[i - 1]] = [pr.layers[i - 1], pr.layers[i]]; pr.frames.forEach((f2) => { [f2.cells[i], f2.cells[i - 1]] = [f2.cells[i - 1], f2.cells[i]]; f2.thumbDirty = true; }); S.layer = i - 1; }); });
  on('l-ren', () => promptBox('Rename layer', pr.layers[S.layer].name, (v) => { pr.layers[S.layer].name = v.slice(0, 24); renderLayers(); scheduleSave(); }));
}

/* ---------- onion / fps / more ---------- */
function renderOnionPop() {
  const p = $('#pop-onion'), o = S.onion;
  p.innerHTML = `<h4>Onion skin</h4><button type="button" class="row" id="on-on" style="width:100%"><label>Show onion skin</label>${tog(o.on)}</button>
    <div class="row"><label>Frames before <span style="color:#ff6b6b">●</span></label><b id="on-pv">${o.prev}</b></div><input type="range" id="on-prev" min="0" max="5" step="1" value="${o.prev}">
    <div class="row"><label>Frames after <span style="color:#22c55e">●</span></label><b id="on-nv">${o.next}</b></div><input type="range" id="on-next" min="0" max="5" step="1" value="${o.next}">
    <div class="row"><label>Strength</label><b id="on-ov">${Math.round(o.op * 100)}%</b></div><input type="range" id="on-op" min="0.05" max="0.8" step="0.01" value="${o.op}">
    <button type="button" class="row" id="on-tint" style="width:100%"><label>Colour code (red = before, green = after)</label>${tog(o.tint)}</button>`;
  const ch = () => { saveSettings(); updOnionBtn(); req(); };
  $('#on-on').onclick = () => { o.on = !o.on; ch(); renderOnionPop(); };
  $('#on-tint').onclick = () => { o.tint = !o.tint; onionCache.clear(); ch(); renderOnionPop(); };
  $('#on-prev').oninput = (e) => { o.prev = +e.target.value; $('#on-pv').textContent = o.prev; ch(); };
  $('#on-next').oninput = (e) => { o.next = +e.target.value; $('#on-nv').textContent = o.next; ch(); };
  $('#on-op').oninput = (e) => { o.op = +e.target.value; $('#on-ov').textContent = Math.round(o.op * 100) + '%'; ch(); };
}
function updOnionBtn() { $('#b-onion').classList.toggle('on', S.onion.on); }
function renderFpsPop() {
  const p = $('#pop-fps'), pr = S.proj;
  p.innerHTML = `<h4>Speed – frames per second</h4><div class="btns">${[4, 6, 8, 12, 15, 24].map((v) => `<button type="button" class="pb ${pr.fps === v ? 'on' : ''}" data-fps="${v}">${v}</button>`).join('')}</div>
    <div class="row"><label>Custom</label><b id="fps-v">${pr.fps} fps</b></div><input type="range" id="fps-r" min="1" max="24" step="1" value="${pr.fps}">
    <p class="note">12 fps is the classic hand-drawn anime look (“animating on twos”). Use “Hold” on a frame to keep it on screen longer.</p>`;
  const set = (v) => { pr.fps = v; $('#b-fps').textContent = v + ' fps'; scheduleSave(); };
  $$('[data-fps]', p).forEach((b) => b.addEventListener('click', () => { set(+b.dataset.fps); renderFpsPop(); }));
  $('#fps-r').oninput = (e) => { set(+e.target.value); $('#fps-v').textContent = pr.fps + ' fps'; };
}
function renderMorePop() {
  const p = $('#pop-more'), pr = S.proj;
  p.innerHTML = `<div class="menu">
    <button type="button" data-m="fit">⊡ Fit canvas to screen <span class="grow"></span><small>0</small></button>
    <button type="button" data-m="rot">⟲ Reset canvas rotation</button>
    <hr><button type="button" data-m="clear">🧽 Clear this layer (this frame)</button>
    <button type="button" data-m="paper">📄 Paper colour</button>
    <button type="button" data-m="rename">✏️ Rename animation</button>
    <hr><div style="padding:6px 10px"><div style="font-size:12px;color:var(--mute);font-weight:700;margin-bottom:6px">FINGER DRAWING</div><div class="btns">${[['auto', 'Auto'], ['on', 'Always'], ['off', 'Never']].map(([k, n]) => `<button type="button" class="pb ${S.finger === k ? 'on' : ''}" data-fg="${k}">${n}</button>`).join('')}</div><p class="note">Auto: fingers draw until an Apple Pencil is used – then fingers only move/zoom (palm rejection).</p></div>
    <hr><button type="button" data-m="keys">⌨️ Shortcuts & gestures</button>
    <button type="button" data-m="device">${S.device === 'ipad' ? '💻 Switch to Laptop mode' : '📱 Switch to iPad mode'}</button>
  </div>`;
  $$('[data-fg]', p).forEach((b) => b.addEventListener('click', () => { S.finger = b.dataset.fg; saveSettings(); renderMorePop(); }));
  $$('[data-m]', p).forEach((b) => b.addEventListener('click', () => {
    const m = b.dataset.m; closePops();
    if (m === 'fit') fitView();
    else if (m === 'rot') { const c = { x: VW / 2, y: VH / 2 }; setViewKeep(S.view.z, 0, s2d(c.x, c.y), c); }
    else if (m === 'clear') clearLayer();
    else if (m === 'paper') paperBox();
    else if (m === 'rename') renameProj();
    else if (m === 'keys') helpBox();
    else if (m === 'device') { setDevice(S.device === 'ipad' ? 'laptop' : 'ipad'); }
  }));
}
function clearLayer() {
  if (!canEdit()) return; commitSel(); const f = curFrame(), cell = curCell(), x = cell.c.getContext('2d'), p = S.proj;
  const r = { x: 0, y: 0, w: p.w, h: p.h }, before = x.getImageData(0, 0, p.w, p.h); x.clearRect(0, 0, p.w, p.h); const after = x.getImageData(0, 0, p.w, p.h);
  pushUndo({ k: 'px', f, cell, r, before, after }); markCell(f, cell); req(); hint('Layer cleared');
}

/* =========================================================
   TIMELINE
   ========================================================= */
function renderStrip() {
  const st = $('#strip'), p = S.proj; if (!p) return;
  st.innerHTML = '';
  p.frames.forEach((f, i) => {
    const d = document.createElement('div'); d.className = 'fr' + (i === S.cur ? ' on' : ''); d.dataset.i = i;
    const c = thumbFor(f); const cc = c.cloneNode(); cc.getContext('2d').drawImage(c, 0, 0); f.stripCanvas = cc;
    d.appendChild(cc); d.insertAdjacentHTML('beforeend', `<span class="n">${i + 1}</span>${f.hold > 1 ? `<span class="h">×${f.hold}</span>` : ''}`);
    bindFrameItem(d, i); st.appendChild(d);
  });
  $('#f-count').textContent = (S.cur + 1) + ' / ' + p.frames.length;
  const on = st.querySelector('.fr.on'); if (on) { const r = on.getBoundingClientRect(), sr = st.getBoundingClientRect(); if (r.left < sr.left || r.right > sr.right) on.scrollIntoView({ inline: 'center', block: 'nearest' }); }
}
function updateStripThumbs() { if (!S.proj) return; S.proj.frames.forEach((f) => { if (f.thumbDirty && f.stripCanvas) { const c = thumbFor(f); const x = f.stripCanvas.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.drawImage(c, 0, 0); } }); }
function bindFrameItem(d, i) {
  let drag = null;
  d.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    drag = { x0: e.clientX, on: false, id: e.pointerId };
  });
  d.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.on && Math.abs(e.clientX - drag.x0) > 10) { drag.on = true; d.setPointerCapture(e.pointerId); d.classList.add('drag'); }
    if (drag.on) { $$('.fr-drop').forEach((x) => x.remove()); const t = dropTarget(e.clientX); const items = $$('.fr'); const mk = document.createElement('div'); mk.className = 'fr-drop'; if (t >= items.length) $('#strip').appendChild(mk); else items[t].before(mk); drag.t = t; }
  });
  d.addEventListener('pointerup', (e) => {
    if (drag && drag.on) { $$('.fr-drop').forEach((x) => x.remove()); d.classList.remove('drag'); const to = drag.t; drag = null; moveFrame(i, to > i ? to - 1 : to); return; }
    drag = null;
  });
  d.addEventListener('click', () => { if (i === S.cur) openFrameMenu(d); else setFrame(i); });
  d.addEventListener('contextmenu', (e) => { e.preventDefault(); setFrame(i); openFrameMenu(d); });
  let lp = null; d.addEventListener('touchstart', () => { lp = setTimeout(() => { setFrame(i); openFrameMenu(d); }, 550); }, { passive: true });
  ['touchend', 'touchmove', 'touchcancel'].forEach((n) => d.addEventListener(n, () => clearTimeout(lp), { passive: true }));
}
function dropTarget(x) { const items = $$('.fr'); for (let k = 0; k < items.length; k++) { const r = items[k].getBoundingClientRect(); if (x < r.left + r.width / 2) return k; } return items.length; }
function setFrame(i, quiet) {
  const p = S.proj; i = clamp(i, 0, p.frames.length - 1); if (i === S.cur && !quiet) return;
  commitSel(); if (S.playing && !quiet) stopPlay();
  S.cur = i; $$('.fr').forEach((d) => d.classList.toggle('on', +d.dataset.i === i)); $('#f-count').textContent = (i + 1) + ' / ' + p.frames.length;
  const on = $('.fr.on'); if (on) on.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  if ($('#pop-layers').classList.contains('show')) renderLayers();
  req();
}
function addFrame(copy) {
  structOp(() => {
    const p = S.proj, src = curFrame(), f = newFrame(p.w, p.h, p.layers.length);
    if (copy) { f.hold = src.hold; f.cells.forEach((c, k) => c.c.getContext('2d').drawImage(src.cells[k].c, 0, 0)); }
    p.frames.splice(S.cur + 1, 0, f); S.cur++;
  });
  hint(copy ? '⧉ Frame duplicated' : '＋ New frame ' + (S.cur + 1));
}
function insertBefore() { structOp(() => { const p = S.proj; p.frames.splice(S.cur, 0, newFrame(p.w, p.h, p.layers.length)); }); }
function deleteFrame() {
  const p = S.proj;
  if (p.frames.length <= 1) { structOp(() => { const f = newFrame(p.w, p.h, p.layers.length); p.frames[0] = f; }); hint('Frame cleared'); return; }
  structOp(() => { p.frames.splice(S.cur, 1); S.cur = clamp(S.cur, 0, p.frames.length - 1); }); hint('🗑 Frame deleted (undo to bring it back)');
}
function moveFrame(from, to) { const p = S.proj; to = clamp(to, 0, p.frames.length - 1); if (from === to) return; structOp(() => { const [f] = p.frames.splice(from, 1); p.frames.splice(to, 0, f); S.cur = to; }); }
function setHold(dh) { const f = curFrame(); const nv = clamp(f.hold + dh, 1, 12); if (nv === f.hold) return; structOp(() => { f.hold = nv; }); }
function clearFrameAll() { structOp(() => { const p = S.proj, f = newFrame(p.w, p.h, p.layers.length); f.hold = curFrame().hold; p.frames[S.cur] = f; }); hint('Frame cleared'); }
function openFrameMenu(anchor) {
  const p = $('#pop-frame'), f = curFrame();
  p.innerHTML = `<div class="menu"><h4>Frame ${S.cur + 1}</h4>
    <button type="button" data-f="dup">⧉ Duplicate</button><button type="button" data-f="after">＋ New blank frame after</button><button type="button" data-f="before">＋ New blank frame before</button>
    <hr><div class="row" style="padding:2px 10px"><label>Hold (stay on screen)</label><button type="button" class="pb" data-f="h-">−</button><b style="min-width:30px;text-align:center">×${f.hold}</b><button type="button" class="pb" data-f="h+">+</button></div>
    <div class="row" style="padding:2px 10px"><label>Move</label><button type="button" class="pb" data-f="ml">◀</button><button type="button" class="pb" data-f="mr">▶</button></div>
    <hr><button type="button" data-f="clear">🧽 Clear frame (all layers)</button><button type="button" class="danger" data-f="del">🗑 Delete frame</button></div>`;
  closePops(); popAnchor = anchor; placePop(p, anchor);
  $$('[data-f]', p).forEach((b) => b.addEventListener('click', () => {
    const a = b.dataset.f; const keep = ['h-', 'h+', 'ml', 'mr'].includes(a);
    if (a === 'dup') addFrame(true); else if (a === 'after') addFrame(false); else if (a === 'before') insertBefore();
    else if (a === 'h-') setHold(-1); else if (a === 'h+') setHold(1);
    else if (a === 'ml') moveFrame(S.cur, S.cur - 1); else if (a === 'mr') moveFrame(S.cur, S.cur + 1);
    else if (a === 'clear') clearFrameAll(); else if (a === 'del') deleteFrame();
    if (keep) { const a2 = $('.fr.on'); if (a2) openFrameMenu(a2); } else closePops();
  }));
}

/* =========================================================
   PLAYBACK + PREVIEW
   ========================================================= */
let playTimer = null;
function startPlay() {
  if (S.playing) return; commitSel(); S.playing = true; S.playIdx = S.cur;
  const b = $('#b-play'); b.innerHTML = icon('pause'); b.classList.add('on');
  const step = () => {
    if (!S.playing) return; const p = S.proj; $$('.fr').forEach((d) => d.classList.toggle('play', +d.dataset.i === S.playIdx)); req();
    playTimer = setTimeout(() => { S.playIdx = (S.playIdx + 1) % p.frames.length; step(); }, 1000 / p.fps * p.frames[S.playIdx].hold);
  };
  step();
}
function stopPlay() { if (!S.playing) return; S.playing = false; clearTimeout(playTimer); const b = $('#b-play'); b.innerHTML = icon('play'); b.classList.remove('on'); $$('.fr.play').forEach((d) => d.classList.remove('play')); req(); }
let pvState = null;
function openPreview() {
  commitSel(); stopPlay(); const p = S.proj, cv = $('#pv'); cv.width = p.w; cv.height = p.h; const x = cv.getContext('2d');
  pvState = { i: 0, playing: true, t: null };
  const step = () => { if (!pvState) return; compositeTo(x, p.frames[pvState.i], 1); $('#pv-info').textContent = `Frame ${pvState.i + 1} / ${p.frames.length} · ${p.fps} fps`;
    if (pvState.playing) pvState.t = setTimeout(() => { pvState.i = (pvState.i + 1) % p.frames.length; step(); }, 1000 / p.fps * p.frames[pvState.i].hold); };
  $('#preview').classList.add('show'); $('#pv-play').textContent = '❚❚'; step(); pvState.step = step;
}
function closePreview() { if (pvState) clearTimeout(pvState.t); pvState = null; $('#preview').classList.remove('show'); }
$('#pv-close').addEventListener('click', closePreview);
$('#pv-play').addEventListener('click', () => { if (!pvState) return; pvState.playing = !pvState.playing; $('#pv-play').textContent = pvState.playing ? '❚❚' : '▶'; clearTimeout(pvState.t); if (pvState.playing) pvState.step(); });
$('#pv').addEventListener('click', () => { if (!pvState) return; if (!pvState.playing) { pvState.i = (pvState.i + 1) % S.proj.frames.length; pvState.step(); } });

/* =========================================================
   EXPORT
   ========================================================= */
let EX = { fmt: 'video', scale: 1, loops: 1, share: false };
function renderExportPop() {
  const p = $('#pop-export'), pr = S.proj;
  p.innerHTML = `<h4>Export</h4><div class="btns">${[['video', '🎞 Video'], ['gif', '🖼 GIF'], ['png', '📷 This frame (PNG)']].map(([k, n]) => `<button type="button" class="pb ${EX.fmt === k ? 'on' : ''}" data-ef="${k}">${n}</button>`).join('')}</div>
    ${EX.fmt !== 'png' ? `<h4>Size</h4><div class="btns">${[[1, `Full ${pr.w}×${pr.h}`], [0.5, `Half ${Math.round(pr.w / 2)}×${Math.round(pr.h / 2)}`]].map(([k, n]) => `<button type="button" class="pb ${EX.scale === k ? 'on' : ''}" data-es="${k}">${n}</button>`).join('')}</div>` : ''}
    ${EX.fmt === 'video' ? `<h4>Repeat</h4><div class="btns">${[1, 2, 3, 5].map((k) => `<button type="button" class="pb ${EX.loops === k ? 'on' : ''}" data-el="${k}">${k}×</button>`).join('')}</div>` : ''}
    <h4>When it's ready</h4><div class="btns"><button type="button" class="pb ${!EX.share ? 'on' : ''}" data-sh2="0">💾 Save to device</button><button type="button" class="pb ${EX.share ? 'on' : ''}" data-sh2="1">📤 Share</button></div>
    <button type="button" class="pb big" id="ex-go">${EX.share ? '📤 Make & share' : 'Export'} ${EX.fmt === 'video' ? 'video' : EX.fmt === 'gif' ? 'GIF' : 'PNG'}</button>
    <p class="note">${EX.fmt === 'video' ? 'Video records in real time, so it takes as long as the animation plays. MP4 or WebM depending on the browser.' : EX.fmt === 'gif' ? 'GIFs loop forever and work everywhere. Half size keeps the file small.' : 'Saves the current frame as a picture.'}</p>`;
  $$('[data-ef]', p).forEach((b) => b.addEventListener('click', () => { EX.fmt = b.dataset.ef; if (EX.fmt === 'gif' && EX.scale === 1 && pr.w * pr.h > 500000) EX.scale = 0.5; renderExportPop(); }));
  $$('[data-es]', p).forEach((b) => b.addEventListener('click', () => { EX.scale = +b.dataset.es; renderExportPop(); }));
  $$('[data-el]', p).forEach((b) => b.addEventListener('click', () => { EX.loops = +b.dataset.el; renderExportPop(); }));
  $$('[data-sh2]', p).forEach((b) => b.addEventListener('click', () => { EX.share = b.dataset.sh2 === '1'; renderExportPop(); }));
  $('#ex-go').addEventListener('click', () => { closePops(); runExport(); });
}
function canShareFile(file) { try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] })); } catch (e) { return false; } }
function download(blob, name) {
  if (!EX.share) { saveFile(blob, name); return; }
  const file = new File([blob], name, { type: blob.type || 'application/octet-stream' });
  if (!canShareFile(file)) { saveFile(blob, name); toast('Sharing isn’t available here – the file was saved instead. Share it from your Files/Downloads.', 4500); return; }
  setTimeout(() => {
    openModal(`<h3>📤 Ready to share</h3><p class="note" style="font-size:14px">${esc(name)} is ready. Tap Share to send it with AirDrop, Messages, Teams, email…</p><div class="foot"><button type="button" class="pb" id="sh-save">💾 Save instead</button><button type="button" class="pb go" id="sh-go">📤 Share</button></div>`);
    $('#sh-save').onclick = () => { closeModal(); saveFile(blob, name); };
    $('#sh-go').onclick = async () => { closeModal(); try { await navigator.share({ files: [file], title: S.proj ? S.proj.name : 'My animation', text: 'Made with Animation Studios 🎬' }); } catch (e) { if (e && e.name !== 'AbortError') { saveFile(blob, name); toast('Could not share – saved instead.'); } } };
  }, 60);
}
const safeName = (n) => (n || 'animation').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') || 'animation';
function saveFile(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 8000); }
function progressBox(title) { openModal(`<h3>${title}</h3><div id="pg-txt" class="note">Starting…</div><div class="prog"><i id="pg"></i></div>`); return (f, t) => { const g = $('#pg'); if (g) g.style.width = Math.round(f * 100) + '%'; if (t && $('#pg-txt')) $('#pg-txt').textContent = t; }; }
async function runExport() {
  commitSel(); stopPlay(); await saveNow();
  try {
    if (EX.fmt === 'png') { const p = S.proj, c = mkCanvas(p.w, p.h); compositeTo(c.getContext('2d'), curFrame(), 1); c.toBlob((b) => download(b, safeName(p.name) + '_frame' + (S.cur + 1) + '.png'), 'image/png'); if (!EX.share) toast('📷 PNG saved'); return; }
    if (EX.fmt === 'gif') await exportGif(EX.scale); else await exportVideo(EX.scale, EX.loops);
  } catch (e) { console.error(e); closeModal(); toast('Export failed: ' + e.message, 4000); }
}
async function exportVideo(scale, loops) {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { toast('Video export isn’t supported in this browser – try GIF.', 4000); return; }
  const types = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const type = types.find((t) => { try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; } });
  if (!type) { toast('Video export isn’t supported here – try GIF.', 4000); return; }
  const p = S.proj, w = Math.round(p.w * scale / 2) * 2, h = Math.round(p.h * scale / 2) * 2, c = mkCanvas(w, h), x = c.getContext('2d');
  compositeTo(x, p.frames[0], w / p.w);
  const stream = c.captureStream(p.fps), rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8e6 }), chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); }; const done = new Promise((r) => (rec.onstop = r));
  const prog = progressBox('🎞 Recording video…'); rec.start(200);
  const seq = []; for (let l = 0; l < loops; l++) p.frames.forEach((f) => seq.push(f));
  const t0 = performance.now(); let t = 0; const track = stream.getVideoTracks()[0];
  for (let i = 0; i < seq.length; i++) {
    compositeTo(x, seq[i], w / p.w); if (track && track.requestFrame) track.requestFrame();
    t += 1000 / p.fps * seq[i].hold; const wait = t0 + t - performance.now(); prog(i / seq.length, `Frame ${i + 1} of ${seq.length}`); if (wait > 0) await sleep(wait);
  }
  await sleep(250); rec.stop(); await done; stream.getTracks().forEach((tr) => tr.stop());
  const mime = type.split(';')[0]; download(new Blob(chunks, { type: mime }), safeName(p.name) + (mime === 'video/mp4' ? '.mp4' : '.webm'));
  closeModal(); if (!EX.share) toast('🎞 Video saved!');
}
async function exportGif(scale) {
  const p = S.proj, w = Math.max(1, Math.round(p.w * scale)), h = Math.max(1, Math.round(p.h * scale)), c = mkCanvas(w, h), x = c.getContext('2d', { willReadFrequently: true });
  const prog = progressBox('🖼 Making GIF…'); const n = p.frames.length, datas = [];
  for (let i = 0; i < n; i++) { compositeTo(x, p.frames[i], w / p.w); datas.push(x.getImageData(0, 0, w, h).data); prog(i / n * 0.25, 'Reading frames…'); if (i % 4 === 0) await sleep(0); }
  const counts = new Uint32Array(32768), sr = new Float64Array(32768), sg = new Float64Array(32768), sb = new Float64Array(32768);
  for (const d of datas) for (let j = 0; j < d.length; j += 8) { const k = ((d[j] >> 3) << 10) | ((d[j + 1] >> 3) << 5) | (d[j + 2] >> 3); counts[k]++; sr[k] += d[j]; sg[k] += d[j + 1]; sb[k] += d[j + 2]; }
  const keys = []; for (let k = 0; k < 32768; k++) if (counts[k]) keys.push(k); keys.sort((a, b) => counts[b] - counts[a]);
  const pal = keys.slice(0, 256).map((k) => [sr[k] / counts[k], sg[k] / counts[k], sb[k] / counts[k]].map(Math.round)); while (pal.length < 256) pal.push([0, 0, 0]);
  const lut = new Int16Array(32768).fill(-1);
  const nearest = (r, g, b) => { let bi = 0, bd = 1e9; for (let i = 0; i < 256; i++) { const q = pal[i], dd = (q[0] - r) ** 2 + (q[1] - g) ** 2 + (q[2] - b) ** 2; if (dd < bd) { bd = dd; bi = i; } } return bi; };
  const out = new ByteOut(); out.str('GIF89a'); out.u16(w); out.u16(h); out.byte(0xf7); out.byte(0); out.byte(0); pal.forEach((q) => { out.byte(q[0]); out.byte(q[1]); out.byte(q[2]); });
  out.bytes([0x21, 0xff, 0x0b]); out.str('NETSCAPE2.0'); out.bytes([3, 1, 0, 0, 0]);
  for (let i = 0; i < n; i++) {
    const d = datas[i], idx = new Uint8Array(w * h);
    for (let j = 0, q = 0; j < d.length; j += 4, q++) { const k = ((d[j] >> 3) << 10) | ((d[j + 1] >> 3) << 5) | (d[j + 2] >> 3); let v = lut[k]; if (v < 0) { v = nearest(d[j], d[j + 1], d[j + 2]); lut[k] = v; } idx[q] = v; }
    const delay = Math.max(2, Math.round(100 / p.fps * p.frames[i].hold));
    out.bytes([0x21, 0xf9, 4, 0x04]); out.u16(delay); out.bytes([0, 0]);
    out.byte(0x2c); out.u16(0); out.u16(0); out.u16(w); out.u16(h); out.byte(0);
    out.byte(8); const lz = lzw(idx, 8); for (let s = 0; s < lz.length; s += 255) { const len = Math.min(255, lz.length - s); out.byte(len); for (let t = 0; t < len; t++) out.byte(lz[s + t]); } out.byte(0);
    prog(0.25 + (i + 1) / n * 0.75, `Encoding frame ${i + 1} of ${n}`); await sleep(0);
  }
  out.byte(0x3b);
  download(new Blob([out.result()], { type: 'image/gif' }), safeName(p.name) + '.gif'); closeModal(); if (!EX.share) toast('🖼 GIF saved!');
}
class ByteOut {
  constructor() { this.buf = new Uint8Array(1 << 20); this.n = 0; }
  grow(k) { if (this.n + k <= this.buf.length) return; let L = this.buf.length * 2; while (L < this.n + k) L *= 2; const nb = new Uint8Array(L); nb.set(this.buf.subarray(0, this.n)); this.buf = nb; }
  byte(b) { this.grow(1); this.buf[this.n++] = b & 255; }
  bytes(a) { a.forEach((b) => this.byte(b)); }
  u16(v) { this.byte(v & 255); this.byte((v >> 8) & 255); }
  str(s) { for (let i = 0; i < s.length; i++) this.byte(s.charCodeAt(i)); }
  result() { return this.buf.slice(0, this.n); }
}
function lzw(ind, minCode) {
  const clear = 1 << minCode, eoi = clear + 1; let size = minCode + 1, next = eoi + 1, dict = new Map();
  const out = []; let acc = 0, bits = 0;
  const emit = (c) => { acc |= c << bits; bits += size; while (bits >= 8) { out.push(acc & 255); acc >>>= 8; bits -= 8; } };
  emit(clear); let prefix = ind[0];
  for (let i = 1; i < ind.length; i++) {
    const k = ind[i], key = (prefix << 8) | k, v = dict.get(key);
    if (v !== undefined) { prefix = v; continue; }
    emit(prefix);
    if (next === 4096) { emit(clear); dict = new Map(); size = minCode + 1; next = eoi + 1; }
    else { if (next >= (1 << size)) size++; dict.set(key, next++); }
    prefix = k;
  }
  emit(prefix); emit(eoi); if (bits > 0) out.push(acc & 255);
  return out;
}

/* =========================================================
   MODALS
   ========================================================= */
function openModal(html) { $('#m-box').innerHTML = html; $('#modal').classList.add('show'); }
function closeModal() { $('#modal').classList.remove('show'); }
function confirmBox(title, msg, okText, fn) {
  openModal(`<h3>${title}</h3><p class="note" style="font-size:14px">${msg}</p><div class="foot"><button type="button" class="pb" id="m-no">Cancel</button><button type="button" class="pb go" id="m-ok">${okText}</button></div>`);
  $('#m-no').onclick = closeModal; $('#m-ok').onclick = () => { closeModal(); fn(); };
}
function promptBox(title, val, fn) {
  openModal(`<h3>${title}</h3><input type="text" id="m-in" maxlength="40" value="${esc(val)}"><div class="foot"><button type="button" class="pb" id="m-no">Cancel</button><button type="button" class="pb go" id="m-ok">Save</button></div>`);
  const i = $('#m-in'); setTimeout(() => { i.focus(); i.select(); }, 50);
  const ok = () => { const v = i.value.trim(); if (!v) return; closeModal(); fn(v); };
  $('#m-no').onclick = closeModal; $('#m-ok').onclick = ok; i.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') closeModal(); });
}
function renameProj() { promptBox('Rename animation', S.proj.name, (v) => { S.proj.name = v; $('#b-name').textContent = v; scheduleSave(); }); }
function paperBox() {
  const cols = ['#ffffff', '#fbf6ea', '#eef3f8', '#d9dde3', '#2b2d33', '#000000'];
  openModal(`<h3>Paper colour</h3><div class="btns">${cols.map((c) => `<button type="button" class="sw ${S.proj.paper === c ? 'on' : ''}" data-pc="${c}" style="width:52px;height:52px;background:${c}"></button>`).join('')}</div><div class="foot"><button type="button" class="pb go" id="m-ok">Done</button></div>`);
  $$('[data-pc]').forEach((b) => b.addEventListener('click', () => { S.proj.paper = b.dataset.pc; S.proj.frames.forEach((f) => (f.thumbDirty = true)); scheduleThumbs(); scheduleSave(); req(); paperBox(); }));
  $('#m-ok').onclick = closeModal;
}
function helpBox() {
  const k = (a, b) => `<kbd>${a}</kbd><span>${b}</span>`;
  openModal(`<h3>Shortcuts & gestures</h3><div class="keys">
    ${k('N / P / B / M / E', 'Pencil · Ink · Brush · Marker · Eraser')}${k('G / U / S / I / H', 'Fill · Shapes · Select · Picker · Move')}
    ${k('[  ]', 'Smaller / bigger brush')}${k('Ctrl+Z / Ctrl+Shift+Z', 'Undo / redo')}
    ${k(',  .', 'Previous / next frame')}${k('A / D', 'New blank frame / duplicate frame')}
    ${k('Enter', 'Play / pause')}${k('O', 'Onion skin on/off')}${k('Space + drag', 'Move the canvas')}${k('Wheel / Ctrl+wheel', 'Zoom')}${k('0', 'Fit to screen')}
    ${k('Delete', 'Delete selection')}${k('Esc', 'Cancel selection')}
    <kbd>iPad</kbd><span><b>Pinch</b> zoom & rotate · <b>2-finger tap</b> undo · <b>3-finger tap</b> redo · hold the Pencil still at the end of a line to make it <b>straight</b></span>
  </div><div class="foot"><button type="button" class="pb go" id="m-ok">Got it</button></div>`);
  $('#m-ok').onclick = closeModal;
}

/* =========================================================
   GALLERY
   ========================================================= */
function setDevice(d) { S.device = d; saveSettings(); document.body.classList.toggle('ipad', d === 'ipad'); $$('#g-device button').forEach((b) => b.classList.toggle('on', b.dataset.dev === d)); if (S.proj) { setTimeout(() => { resizeView(); fitView(); renderStrip(); }, 30); } }
$$('#g-device button').forEach((b) => b.addEventListener('click', () => setDevice(b.dataset.dev)));
$('#g-help').addEventListener('click', helpBox);
async function renderGallery() {
  const g = $('#g-grid'); let metas = [];
  try { metas = await DB.all('meta'); } catch (e) { console.error(e); }
  metas.sort((a, b) => b.updated - a.updated);
  g.innerHTML = `<button type="button" class="card new" id="g-new"><span class="plus">+</span><b>New animation</b><small>Start drawing</small></button><button type="button" class="card tut" id="g-tut"><span class="tut-ic">▶</span><b>Tutorial</b><small>Learn with Sticky · 1 min</small></button>` +
    metas.map((m) => `<div class="card" data-id="${m.id}"><div class="th" style="background-image:url('${m.thumb || ''}')"></div><div class="meta"><b>${esc(m.name)}</b><small>${m.frames} frame${m.frames === 1 ? '' : 's'} · ${m.fps} fps · ${m.w}×${m.h}</small></div><button type="button" class="dots" data-dots="${m.id}" aria-label="Options">⋯</button></div>`).join('');
  $('#g-new').addEventListener('click', newProjectBox);
  $('#g-tut').addEventListener('click', openTutorial);
  $$('.card[data-id]').forEach((c) => c.addEventListener('click', (e) => { if (e.target.closest('.dots')) return; openProject(c.dataset.id); }));
  $$('[data-dots]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); cardMenu(b, metas.find((m) => m.id === b.dataset.dots)); }));
}
function cardMenu(anchor, m) {
  const p = $('#pop-card');
  p.innerHTML = `<div class="menu"><button type="button" data-c="open">▶ Open</button><button type="button" data-c="ren">✏️ Rename</button><button type="button" data-c="dup">⧉ Duplicate</button><hr><button type="button" class="danger" data-c="del">🗑 Delete</button></div>`;
  closePops(); popAnchor = anchor; placePop(p, anchor);
  $$('[data-c]', p).forEach((b) => b.addEventListener('click', async () => {
    closePops(); const a = b.dataset.c;
    if (a === 'open') openProject(m.id);
    if (a === 'ren') promptBox('Rename animation', m.name, async (v) => { const d = await DB.get('projects', m.id); d.name = v; m.name = v; await DB.put('projects', d); await DB.put('meta', m); renderGallery(); });
    if (a === 'dup') { const d = await DB.get('projects', m.id); const id = uid(); d.id = id; d.name = m.name + ' copy'; await DB.put('projects', d); await DB.put('meta', Object.assign({}, m, { id, name: d.name, updated: Date.now() })); renderGallery(); toast('Duplicated'); }
    if (a === 'del') confirmBox('Delete animation?', `“${esc(m.name)}” will be deleted from this device. This can’t be undone.`, 'Delete', async () => { await DB.del('projects', m.id); await DB.del('meta', m.id); renderGallery(); toast('Deleted'); });
  }));
}
function newProjectBox() {
  const st = { name: 'My animation', size: '1280x720', fps: 12, paper: '#ffffff' };
  const draw = () => {
    openModal(`<h3>🎬 New animation</h3><label class="f">Name</label><input type="text" id="np-name" maxlength="40" value="${esc(st.name)}">
      <label class="f">Canvas</label><div class="btns">${[['1280x720', '▭ Landscape 16:9'], ['1080x1080', '◻ Square'], ['720x1280', '▯ Portrait 9:16'], ['960x540', '▭ Small 16:9']].map(([k, n]) => `<button type="button" class="pb ${st.size === k ? 'on' : ''}" data-ns="${k}">${n}</button>`).join('')}</div>
      <label class="f">Speed</label><div class="btns">${[8, 12, 24].map((v) => `<button type="button" class="pb ${st.fps === v ? 'on' : ''}" data-nf="${v}">${v} fps</button>`).join('')}</div>
      <label class="f">Paper</label><div class="btns">${['#ffffff', '#fbf6ea', '#eef3f8', '#2b2d33'].map((c) => `<button type="button" class="sw ${st.paper === c ? 'on' : ''}" data-np="${c}" style="width:44px;height:44px;background:${c}"></button>`).join('')}</div>
      <div class="foot"><button type="button" class="pb" id="m-no">Cancel</button><button type="button" class="pb go" id="m-ok">Create</button></div>`);
    const nm = $('#np-name'); nm.addEventListener('input', () => (st.name = nm.value));
    $$('[data-ns]').forEach((b) => b.addEventListener('click', () => { st.size = b.dataset.ns; draw(); }));
    $$('[data-nf]').forEach((b) => b.addEventListener('click', () => { st.fps = +b.dataset.nf; draw(); }));
    $$('[data-np]').forEach((b) => b.addEventListener('click', () => { st.paper = b.dataset.np; draw(); }));
    $('#m-no').onclick = closeModal;
    $('#m-ok').onclick = async () => { closeModal(); const [w, h] = st.size.split('x').map(Number); const p = newProject((st.name || 'My animation').trim().slice(0, 40), w, h, st.fps, st.paper); S.proj = p; await saveNow(); S.proj = null; openProject(p.id); };
  };
  draw();
}

/* =========================================================
   OPEN / CLOSE PROJECT
   ========================================================= */
async function openProject(id) {
  try {
    toast('Opening…', 900); const { p, cur, layer } = await loadProject(id);
    S.proj = p; S.cur = clamp(cur, 0, p.frames.length - 1); S.layer = clamp(layer, 0, p.layers.length - 1);
    S.undo = []; S.redo = []; S.undoBytes = 0; S.sel = null; S.stroke = null; onionCache.clear();
    $('#gallery').classList.remove('active'); $('#editor').classList.add('active');
    $('#b-name').textContent = p.name; $('#b-fps').textContent = p.fps + ' fps'; setSaveState('Saved ✓');
    resizeView(); fitView(); renderStrip(); updUndoBtns(); updOnionBtn(); setTool(S.tool); req();
  } catch (e) { console.error(e); toast('Could not open: ' + e.message, 3500); }
}
async function closeProject() {
  commitSel(); stopPlay(); closePops(); await saveNow();
  S.proj = null; S.undo = []; S.redo = []; onionCache.clear(); buf = null; work.c = null;
  $('#editor').classList.remove('active'); $('#gallery').classList.add('active'); renderGallery();
}

/* =========================================================
   DEMO PROJECT
   ========================================================= */
async function makeDemo() {
  const w = 1280, h = 720, p = newProject('Demo – Bouncing Ball', w, h, 12, '#ffffff'); p.frames = [];
  const ys = [140, 175, 270, 420, 560, 600, 560, 420, 270, 175, 140, 130], squash = [1, 1, 1, 0.92, 0.85, 0.62, 0.85, 0.92, 1, 1, 1, 1];
  ys.forEach((y, i) => {
    const f = newFrame(w, h, 1), x = f.cells[0].c.getContext('2d');
    x.strokeStyle = '#2b2d33'; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(180, 682); x.lineTo(1100, 682); x.stroke();
    const sx = 1 / Math.sqrt(squash[i]) , sy = squash[i], R = 78, cx = 260 + i * 66, cy = y + (1 - sy) * R;
    x.fillStyle = 'rgba(0,0,0,0.12)'; x.beginPath(); x.ellipse(cx, 676, R * (0.5 + y / 1200), 10, 0, 0, Math.PI * 2); x.fill();
    x.save(); x.translate(cx, cy); x.scale(sx, sy); x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.fillStyle = '#ff7a45'; x.fill(); x.lineWidth = 7 / Math.max(sx, sy); x.strokeStyle = '#1b1b1f'; x.stroke();
    x.beginPath(); x.arc(-26, -28, 18, 0, Math.PI * 2); x.fillStyle = '#ffffffaa'; x.fill(); x.restore();
    p.frames.push(f);
  });
  p.frames[5].hold = 1;
  S.proj = p; await saveNow(); S.proj = null;
}

/* =========================================================
   KEYBOARD
   ========================================================= */
document.addEventListener('keydown', (e) => {
  if (!S.proj || e.target.tagName === 'INPUT' || $('#modal').classList.contains('show')) return;
  if ($('#preview').classList.contains('show')) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closePreview(); } return; }
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && k === 'y') { e.preventDefault(); redo(); return; }
  if (mod && k === 's') { e.preventDefault(); saveNow(); return; }
  if (mod && k === 'a') { e.preventDefault(); selectAll(); return; }
  if (mod) return;
  if (e.code === 'Space') { e.preventDefault(); if (!S.spaceDown) { S.spaceDown = true; view.classList.add('hand'); } return; }
  const tools = { n: 'pencil', p: 'pen', b: 'brush', m: 'marker', e: 'eraser', g: 'fill', u: 'shape', s: 'select', l: 'select', i: 'picker', h: 'hand' };
  if (tools[k]) { setTool(tools[k]); return; }
  if (k === '[') nudgeSize(0.85); else if (k === ']') nudgeSize(1.18);
  else if (k === ',' || e.key === 'ArrowLeft') setFrame(S.cur - 1); else if (k === '.' || e.key === 'ArrowRight') setFrame(S.cur + 1);
  else if (k === 'a') addFrame(false); else if (k === 'd') addFrame(true);
  else if (e.key === 'Enter') { e.preventDefault(); S.playing ? stopPlay() : startPlay(); }
  else if (k === 'o') { S.onion.on = !S.onion.on; saveSettings(); updOnionBtn(); req(); hint('Onion skin ' + (S.onion.on ? 'on' : 'off')); }
  else if (k === '0') fitView();
  else if (e.key === 'Delete' || e.key === 'Backspace') { if (S.sel) { e.preventDefault(); deleteSel(); } }
  else if (e.key === 'Escape') { if (S.sel) cancelSel(); closePops(); }
});
document.addEventListener('keyup', (e) => { if (e.code === 'Space') { S.spaceDown = false; view.classList.toggle('hand', S.tool === 'hand'); } });

/* =========================================================
   BOOT
   ========================================================= */
function wireTopbar() {
  $('#b-home').innerHTML = icon('home'); $('#b-undo').innerHTML = icon('undo'); $('#b-redo').innerHTML = icon('redo');
  $('#b-onion').innerHTML = icon('onion'); $('#b-layers').innerHTML = icon('layers'); $('#b-play').innerHTML = icon('play');
  $('#b-preview').innerHTML = icon('preview'); $('#b-more').innerHTML = icon('more'); $('#b-prev').innerHTML = icon('prev'); $('#b-next').innerHTML = icon('next'); $('#b-dup').innerHTML = icon('dup');
  $('#b-home').onclick = closeProject; $('#b-name').onclick = renameProj;
  $('#b-undo').onclick = undo; $('#b-redo').onclick = redo;
  $('#b-onion').onclick = () => { S.onion.on = !S.onion.on; saveSettings(); updOnionBtn(); req(); };
  $('#b-play').onclick = () => (S.playing ? stopPlay() : startPlay());
  $('#b-preview').onclick = openPreview;
  $('#b-prev').onclick = () => setFrame(S.cur - 1); $('#b-next').onclick = () => setFrame(S.cur + 1);
  $('#b-add').onclick = () => addFrame(false); $('#b-dup').onclick = () => addFrame(true);
  $('#zoom-lab').onclick = fitView;
  $('#modal').addEventListener('pointerdown', (e) => { if (e.target.id === 'modal' && !$('#pg')) closeModal(); });
}
async function boot() {
  document.body.classList.toggle('ipad', S.device === 'ipad'); $$('#g-device button').forEach((b) => b.classList.toggle('on', b.dataset.dev === S.device));
  buildTools(); buildColorPop(); wireTopbar(); setColor(S.color); updSliders();
  bindVSlider($('#vs-size'), (t) => { const k = sizeKey(); if (k) S.size[k] = clamp(Math.round(Math.pow(SMAX, t) * 10) / 10, 1, SMAX); });
  bindVSlider($('#vs-opac'), (t) => { const k = sizeKey(); if (k) S.opac[k] = clamp(Math.round(t * 100) / 100, 0.05, 1); });
  await DB.open(); if (DB.failed) toast('Storage is blocked here – your work won’t be saved after closing.', 4500);
  let metas = []; try { metas = await DB.all('meta'); } catch (e) {}
  if (!metas.length && !LS.get('demoMade', false)) { await makeDemo(); LS.set('demoMade', true); }
  renderGallery();
  if (!LS.get('tutSeen', false)) { LS.set('tutSeen', true); setTimeout(() => toast('👋 New here? Tap ▶ Tutorial to learn with Sticky!', 4000), 900); }
  window.addEventListener('resize', () => { if (S.proj) { const c = { x: VW / 2, y: VH / 2 }, d = s2d(c.x, c.y); resizeView(); setViewKeep(S.view.z, S.view.r, d, { x: VW / 2, y: VH / 2 }); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.proj) saveNow(); });
  window.addEventListener('pagehide', () => { if (S.proj) saveNow(); });
  requestAnimationFrame(tick);
}

/* =========================================================
   TUTORIAL – "Sticky" the talking stick person + anime ending
   (V1.1)  Plays voice.mp3 if it exists next to index.html.
   ========================================================= */
const LOGO_IMG = new Image(); LOGO_IMG.src = 'logo.png';
const TUT_STEPS = [
  { t: 'Hi! I’m Sticky. Let’s make your first animation together!', demo: 'wave' },
  { t: 'Pick a tool on the left. Ink makes clean lines – try the Apple Pencil!', demo: 'tools' },
  { t: 'Draw your first pose on frame 1. A simple ball is a great start.', demo: 'draw' },
  { t: 'Tap the orange + to add a new frame. Frames are numbered 1, 2, 3…', demo: 'frames' },
  { t: 'Onion skin shows the last frame in red. Draw the ball a little further along.', demo: 'onion' },
  { t: 'Squash the ball when it hits the ground – it makes it feel bouncy!', demo: 'squash' },
  { t: 'Press Play to watch it move. 12 fps is the classic anime look.', demo: 'play' },
  { t: 'Export a video or GIF – then Share it with your friends!', demo: 'export' },
  { t: 'Practise a lot… and one day you can animate THIS.', demo: 'tease' }
];
const TUT = { on: false, step: 0, t0: 0, stepT0: 0, raf: 0, muted: LS.get('tutMuted', false), mode: 'steps', endT0: 0, chars: 0, cv: null, x: null, W: 1280, H: 720, auto: true,
  speaking: false, spokeStep: -1, spokeEnd: 0, utt: null, voiceName: LS.get('tutVoice', ''), rate: LS.get('tutRate', 1), voices: [], tts: 'speechSynthesis' in window };
const sayText = (t) => t.replace(/\+/g, 'plus').replace(/fps/g, 'frames per second').replace(/GIF/g, 'gif').replace(/ – /g, ', ').replace(/…/g, '...');

/* ---------- built-in text-to-speech (V1.2) ---------- */
function loadVoices() {
  if (!TUT.tts) return [];
  const all = speechSynthesis.getVoices() || [];
  const en = all.filter((v) => /^en/i.test(v.lang));
  const rank = (v) => (/en-AU/i.test(v.lang) ? 0 : /en-GB/i.test(v.lang) ? 1 : /en-US/i.test(v.lang) ? 2 : 3) + (v.localService ? 0 : 0.5);
  TUT.voices = (en.length ? en : all).slice().sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return TUT.voices;
}
if (TUT.tts) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', () => { loadVoices(); if ($('#tt-vpanel')) renderVoicePanel(); }); } catch (e) { speechSynthesis.onvoiceschanged = () => loadVoices(); } }
function pickVoice() { const v = TUT.voices; if (!v.length) loadVoices(); return TUT.voices.find((x) => x.name === TUT.voiceName) || TUT.voices[0] || null; }
function stopSpeech() { if (TUT.tts) { try { speechSynthesis.cancel(); } catch (e) {} } TUT.speaking = false; TUT.utt = null; }
function speakStep(i) {
  stopSpeech(); TUT.spokeStep = i; TUT.spokeEnd = 0;
  if (!TUT.tts || TUT.muted) return;
  const u = new SpeechSynthesisUtterance(sayText(TUT_STEPS[i].t)); const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-AU';
  u.rate = TUT.rate; u.pitch = 1.08;
  u.onstart = () => { if (TUT.utt === u) TUT.speaking = true; };
  u.onend = u.onerror = () => { if (TUT.utt === u) { TUT.speaking = false; TUT.spokeEnd = performance.now(); } };
  TUT.utt = u;
  setTimeout(() => { if (TUT.utt === u && TUT.on) { try { speechSynthesis.speak(u); } catch (e) {} } }, 60);
}
function voiceLevel(now) {
  if (!TUT.speaking || TUT.muted) return -1;
  const t = now / 1000; return clamp(0.4 + 0.35 * Math.sin(t * 19) * Math.sin(t * 6.1) + 0.25 * Math.sin(t * 33), 0, 1);
}
function renderVoicePanel() {
  const p = $('#tt-vpanel'); if (!p) return;
  if (!TUT.tts) { p.innerHTML = '<b>Voice</b><p class="note">This browser has no built-in voice. Try Safari on iPad or Chrome/Edge on a laptop.</p>'; return; }
  const vs = loadVoices(), cur = pickVoice();
  p.innerHTML = `<b>🗣 Sticky's voice</b><select id="tt-vsel">${vs.map((v) => `<option value="${esc(v.name)}" ${cur && v.name === cur.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('') || '<option>Default voice</option>'}</select>
    <div class="row"><label>Speed</label><b id="tt-rv">${TUT.rate.toFixed(1)}×</b></div><input type="range" id="tt-rate" min="0.7" max="1.4" step="0.1" value="${TUT.rate}">
    <div class="btns"><button type="button" class="pb" id="tt-test">▶ Test voice</button><button type="button" class="pb on" id="tt-vok">Done</button></div>`;
  $('#tt-vsel').onchange = (e) => { TUT.voiceName = e.target.value; LS.set('tutVoice', TUT.voiceName); };
  $('#tt-rate').oninput = (e) => { TUT.rate = +e.target.value; $('#tt-rv').textContent = TUT.rate.toFixed(1) + '×'; LS.set('tutRate', TUT.rate); };
  $('#tt-test').onclick = () => { TUT.muted = false; LS.set('tutMuted', false); speakStep(TUT.step); TUT.stepT0 = performance.now(); TUT.chars = 0; updTutBar(); };
  $('#tt-vok').onclick = () => { p.remove(); speakStep(TUT.step); TUT.stepT0 = performance.now(); TUT.chars = 0; };
}
function toggleVoicePanel() {
  let p = $('#tt-vpanel'); if (p) { p.remove(); return; }
  p = document.createElement('div'); p.id = 'tt-vpanel'; $('#tut').appendChild(p); renderVoicePanel();
}

function openTutorial() {
  closePops(); $('#toast').classList.remove('show');
  const ov = $('#tut'); ov.classList.add('show');
  TUT.cv = $('#tut-cv'); TUT.x = TUT.cv.getContext('2d'); TUT.cv.width = TUT.W; TUT.cv.height = TUT.H;
  TUT.on = true; TUT.mode = 'steps'; TUT.step = 0; TUT.t0 = TUT.stepT0 = performance.now(); TUT.chars = 0;
  loadVoices(); speakStep(0);
  updTutBar(); cancelAnimationFrame(TUT.raf); TUT.raf = requestAnimationFrame(tutLoop);
}
function closeTutorial() { TUT.on = false; cancelAnimationFrame(TUT.raf); stopSpeech(); const p = $('#tt-vpanel'); if (p) p.remove(); $('#tut').classList.remove('show'); }
function tutGo(i) {
  if (i >= TUT_STEPS.length) { startEnding(); return; }
  TUT.mode = 'steps'; TUT.step = clamp(i, 0, TUT_STEPS.length - 1); TUT.stepT0 = performance.now(); TUT.chars = 0; speakStep(TUT.step); updTutBar();
}
function startEnding() { stopSpeech(); TUT.mode = 'ending'; TUT.endT0 = performance.now(); updTutBar(); }
function updTutBar() {
  const b = $('#tut-bar'); if (!b) return;
  const end = TUT.mode === 'ending' || TUT.mode === 'done';
  b.innerHTML = end
    ? `<button type="button" id="tt-again">↺ Watch again</button><button type="button" id="tt-ending">✨ Replay ending</button><button type="button" class="go" id="tt-start">🎬 Start animating</button><button type="button" id="tt-close">✕</button>`
    : `<button type="button" id="tt-back" ${TUT.step === 0 ? 'disabled' : ''}>◀ Back</button><span class="tt-dots">${TUT_STEPS.map((_, i) => `<i class="${i === TUT.step ? 'on' : i < TUT.step ? 'done' : ''}"></i>`).join('')}</span><button type="button" class="go" id="tt-next">${TUT.step === TUT_STEPS.length - 1 ? 'Show me! ✨' : 'Next ▶'}</button><button type="button" id="tt-skip">Skip</button><button type="button" id="tt-mute" title="Voice on/off">${TUT.muted || !TUT.tts ? '🔇' : '🔊'}</button><button type="button" id="tt-voice" title="Choose voice & speed">🗣</button><button type="button" id="tt-close">✕</button>`;
  const on = (id, fn) => { const e = $('#' + id); if (e) e.onclick = fn; };
  on('tt-back', () => tutGo(TUT.step - 1)); on('tt-next', () => tutGo(TUT.step + 1)); on('tt-skip', startEnding); on('tt-close', closeTutorial);
  on('tt-mute', () => { if (!TUT.tts) { toast('This browser has no built-in voice.', 3000); return; } TUT.muted = !TUT.muted; LS.set('tutMuted', TUT.muted); if (TUT.muted) stopSpeech(); else { speakStep(TUT.step); TUT.stepT0 = performance.now(); TUT.chars = 0; } updTutBar(); });
  on('tt-voice', toggleVoicePanel);
  on('tt-again', () => tutGo(0));
  on('tt-ending', startEnding);
  on('tt-start', () => { closeTutorial(); newProjectBox(); });
}
$('#tut-cv').addEventListener('click', () => { if (TUT.mode === 'steps') tutGo(TUT.step + 1); });
document.addEventListener('keydown', (e) => { if (!TUT.on) return; if (e.key === 'Escape') closeTutorial(); else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (TUT.mode === 'steps') tutGo(TUT.step + 1); } else if (e.key === 'ArrowLeft' && TUT.mode === 'steps') tutGo(TUT.step - 1); }, true);

function tutLoop(now) {
  if (!TUT.on) return;
  try {
    if (TUT.mode === 'steps') drawStep(now); else drawEnding(now);
  } catch (e) { console.error(e); }
  TUT.raf = requestAnimationFrame(tutLoop);
}

/* ---------- drawing helpers ---------- */
function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
function wrapText(x, txt, X, Y, maxW, lh) {
  const words = txt.split(' '); let line = '', y = Y;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { x.fillText(line, X, y); line = w; y += lh; } else line = t; }
  if (line) x.fillText(line, X, y); return y;
}
function drawSticky(x, cx, cy, s, pose, now, talk) {
  // pose: {wave, point, pencil, hop}
  x.save(); x.translate(cx, cy - (pose.hop || 0)); x.scale(s, s);
  x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#1b1b22'; x.lineWidth = 9;
  const t = now / 1000, sway = Math.sin(t * 2) * 3;
  // shadow
  x.save(); x.fillStyle = 'rgba(0,0,0,.12)'; x.beginPath(); x.ellipse(0, 182 + (pose.hop || 0) / s, 60 - (pose.hop || 0) * 0.2, 10, 0, 0, 6.3); x.fill(); x.restore();
  // legs
  x.beginPath(); x.moveTo(0, 60); x.lineTo(-30, 180); x.moveTo(0, 60); x.lineTo(30, 180); x.stroke();
  // body
  x.beginPath(); x.moveTo(0, -38); x.lineTo(sway * 0.3, 60); x.stroke();
  // arms
  const sh = { x: 0, y: -18 };
  x.beginPath(); x.moveTo(sh.x, sh.y);
  if (pose.wave) { const a = -2.3 + Math.sin(t * 9) * 0.45; const el = { x: Math.cos(-1.1) * 50, y: sh.y + Math.sin(-1.1) * 50 }; x.lineTo(el.x, el.y); x.lineTo(el.x + Math.cos(a + 1.2) * 48, el.y + Math.sin(a + 1.2) * 48); }
  else if (pose.point) { x.lineTo(52, sh.y - 8); x.lineTo(98, sh.y - 30 + Math.sin(t * 4) * 4); }
  else if (pose.pencil) { const k = Math.sin(t * 10) * 8; x.lineTo(46, sh.y + 26); x.lineTo(86 + k, sh.y + 20); }
  else { x.lineTo(40, sh.y + 40); x.lineTo(52, sh.y + 88); }
  x.moveTo(sh.x, sh.y); x.lineTo(-40, sh.y + 40 + sway); x.lineTo(-50, sh.y + 88 + sway); x.stroke();
  if (pose.pencil) { const k = Math.sin(t * 10) * 8; x.save(); x.translate(86 + k, sh.y + 20); x.rotate(0.9); x.fillStyle = '#ffb703'; x.fillRect(-5, -34, 10, 34); x.fillStyle = '#f4c7a1'; x.beginPath(); x.moveTo(-5, 0); x.lineTo(5, 0); x.lineTo(0, 12); x.fill(); x.restore(); }
  // head
  x.fillStyle = '#fff'; x.beginPath(); x.arc(sway * 0.3, -82, 46, 0, 6.3); x.fill(); x.stroke();
  // eyes (blink)
  const blink = (t % 3.6) < 0.12;
  x.fillStyle = '#1b1b22';
  [-16, 16].forEach((ex) => { if (blink) { x.lineWidth = 5; x.beginPath(); x.moveTo(ex - 6 + sway * 0.3, -90); x.lineTo(ex + 6 + sway * 0.3, -90); x.stroke(); x.lineWidth = 9; } else { x.beginPath(); x.ellipse(ex + sway * 0.3, -90, 6, 9, 0, 0, 6.3); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + 2 + sway * 0.3, -93, 2.5, 0, 6.3); x.fill(); x.fillStyle = '#1b1b22'; } });
  // cheeks
  x.fillStyle = 'rgba(255,120,120,.35)'; [-28, 28].forEach((ex) => { x.beginPath(); x.ellipse(ex + sway * 0.3, -70, 8, 5, 0, 0, 6.3); x.fill(); });
  // mouth
  const m = clamp(talk, 0, 1), mx = sway * 0.3;
  if (m > 0.06) { x.fillStyle = '#7a1f2b'; x.beginPath(); x.ellipse(mx, -62, 13 - m * 2, 3 + m * 13, 0, 0, 6.3); x.fill(); x.lineWidth = 5; x.stroke(); x.fillStyle = '#ff7a8a'; x.beginPath(); x.ellipse(mx, -62 + m * 7, 7, 2 + m * 4, 0, 0, 3.15); x.fill(); }
  else { x.lineWidth = 5; x.beginPath(); x.arc(mx, -68, 14, 0.25, Math.PI - 0.25); x.stroke(); }
  x.restore();
}
function demoPanel(x) { x.save(); x.fillStyle = '#ffffff'; x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 24; rr(x, 560, 210, 640, 380, 22); x.fill(); x.restore(); x.strokeStyle = '#e3e6ec'; x.lineWidth = 2; rr(x, 560, 210, 640, 380, 22); x.stroke(); }
function ball(x, cx, cy, r, sx, sy, col, alpha) { x.save(); x.globalAlpha = alpha == null ? 1 : alpha; x.translate(cx, cy); x.scale(sx, sy); x.beginPath(); x.arc(0, 0, r, 0, 6.3); x.fillStyle = col; x.fill(); x.lineWidth = 5 / Math.max(sx, sy); x.strokeStyle = alpha != null && alpha < 1 ? col : '#1b1b22'; x.stroke(); if (alpha == null || alpha >= 1) { x.beginPath(); x.arc(-r * 0.33, -r * 0.36, r * 0.22, 0, 6.3); x.fillStyle = '#ffffffaa'; x.fill(); } x.restore(); }
function pulse(x, X, Y, r, now) { const k = (now / 700) % 1; x.save(); x.strokeStyle = `rgba(255,122,69,${1 - k})`; x.lineWidth = 5; x.beginPath(); x.arc(X, Y, r + k * 26, 0, 6.3); x.stroke(); x.restore(); }

function drawStep(now) {
  const x = TUT.x, W = TUT.W, H = TUT.H, st = TUT_STEPS[TUT.step], el = (now - TUT.stepT0) / 1000;
  // background
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff6ec'); g.addColorStop(1, '#ffe2cf'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,122,69,.08)'; for (let i = 0; i < 9; i++) { x.beginPath(); x.arc((i * 173 + now / 60) % (W + 200) - 100, 80 + (i % 3) * 230, 60 + (i % 4) * 18, 0, 6.3); x.fill(); }
  x.fillStyle = '#ffd9c2'; x.fillRect(0, 640, W, 80);
  // speech bubble
  TUT.chars = Math.min(st.t.length, TUT.chars + 1.1);
  const shown = st.t.slice(0, Math.floor(TUT.chars));
  x.save(); x.shadowColor = 'rgba(0,0,0,.15)'; x.shadowBlur = 18; x.fillStyle = '#fff'; rr(x, 300, 40, 900, 140, 26); x.fill(); x.restore();
  x.fillStyle = '#fff'; x.beginPath(); x.moveTo(330, 170); x.lineTo(290, 236); x.lineTo(388, 176); x.fill();
  x.fillStyle = '#ff7a45'; x.font = '800 22px system-ui, sans-serif'; x.fillText(`STEP ${TUT.step + 1} OF ${TUT_STEPS.length}`, 330, 82);
  x.fillStyle = '#1b1b22'; x.font = '700 32px system-ui, sans-serif'; wrapText(x, shown, 330, 126, 840, 40);
  // talking level
  let lv = voiceLevel(now);
  if (lv < 0) lv = TUT.chars < st.t.length ? 0.25 + 0.75 * Math.abs(Math.sin(now / 70)) : 0;
  const d = st.demo;
  drawSticky(x, 190, 420, 1.05, { wave: d === 'wave' || d === 'tease', point: ['tools', 'frames', 'onion', 'play', 'export', 'squash'].includes(d), pencil: d === 'draw', hop: d === 'wave' ? Math.max(0, Math.sin(el * 5)) * 14 : 0 }, now, lv);
  // demo panel
  if (d !== 'wave') demoPanel(x);
  const P = { x: 560, y: 210, w: 640, h: 380 };
  if (d === 'wave') {
    if (LOGO_IMG.complete && LOGO_IMG.naturalWidth) { const lw = 560, lh = lw * LOGO_IMG.naturalHeight / LOGO_IMG.naturalWidth; x.drawImage(LOGO_IMG, 610, 215, lw, lh); }
    else { x.fillStyle = '#1b1b22'; x.font = '900 64px system-ui, sans-serif'; x.fillText('Animation', 560, 380); x.fillStyle = '#ff7a45'; x.fillText('Studios', 560, 455); }
    x.font = '600 24px system-ui, sans-serif'; x.fillStyle = '#6b6f7a'; x.fillText('Tap anywhere or press Next', 700, 610);
  } else if (d === 'tools') {
    const names = ['✏️ Pencil', '💧 Ink', '🖌 Brush', '🖍 Marker', '🧽 Eraser', '🪣 Fill'];
    names.forEach((n, i) => { const on = i === 1; x.fillStyle = on ? '#ff7a45' : '#f1f2f5'; rr(x, P.x + 40, P.y + 30 + i * 54, 220, 44, 12); x.fill(); x.fillStyle = on ? '#1b0c05' : '#333'; x.font = '700 22px system-ui'; x.fillText(n, P.x + 60, P.y + 60 + i * 54); });
    pulse(x, P.x + 150, P.y + 106, 20, now);
    // ink stroke demo
    const k = clamp((el % 3) / 2, 0, 1); x.strokeStyle = '#1b1b22'; x.lineCap = 'round';
    for (let i = 0; i < 60 * k; i++) { const u = i / 60; x.lineWidth = 2 + 10 * Math.sin(u * Math.PI); x.beginPath(); x.moveTo(P.x + 320 + u * 260, P.y + 190 + Math.sin(u * 7) * 60); x.lineTo(P.x + 320 + (u + 1 / 60) * 260, P.y + 190 + Math.sin((u + 1 / 60) * 7) * 60); x.stroke(); }
    x.fillStyle = '#6b6f7a'; x.font = '600 18px system-ui'; x.fillText('Press harder = thicker line', P.x + 340, P.y + 320);
  } else if (d === 'draw') {
    const k = clamp(el / 2.2, 0, 1); x.strokeStyle = '#1b1b22'; x.lineWidth = 7; x.lineCap = 'round';
    x.beginPath(); x.arc(P.x + 320, P.y + 170, 80, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); x.stroke();
    if (k >= 1) { const f = clamp((el - 2.4) / 0.5, 0, 1); ball(x, P.x + 320, P.y + 170, 80, 1, 1, '#ff7a45', f < 1 ? f : null); }
    x.strokeStyle = '#2b2d33'; x.lineWidth = 6; x.beginPath(); x.moveTo(P.x + 60, P.y + 330); x.lineTo(P.x + 580, P.y + 330); x.stroke();
    x.fillStyle = '#000b'; rr(x, P.x + 14, P.y + 14, 40, 28, 8); x.fill(); x.fillStyle = '#fff'; x.font = '800 18px system-ui'; x.fillText('1', P.x + 28, P.y + 34);
  } else if (d === 'frames') {
    const n = 1 + Math.min(4, Math.floor(el / 0.9));
    for (let i = 0; i < n; i++) { const X = P.x + 30 + i * 112; x.fillStyle = i === n - 1 ? '#ff7a45' : '#d7dae2'; rr(x, X - 4, P.y + 126, 104, 76, 10); x.fill(); x.fillStyle = '#fff'; rr(x, X, P.y + 130, 96, 68, 8); x.fill(); ball(x, X + 20 + i * 14, P.y + 152 + i * 8, 12, 1, 1, '#ff7a45'); x.fillStyle = '#000b'; rr(x, X + 4, P.y + 134, 24, 18, 5); x.fill(); x.fillStyle = '#fff'; x.font = '800 13px system-ui'; x.fillText(String(i + 1), X + 11, P.y + 148); }
    const bx = P.x + 560, by = P.y + 164; x.fillStyle = '#ff7a45'; rr(x, bx - 34, by - 26, 68, 52, 14); x.fill(); x.fillStyle = '#1b0c05'; x.font = '800 40px system-ui'; x.fillText('+', bx - 12, by + 14); pulse(x, bx, by, 34, now);
    x.fillStyle = '#6b6f7a'; x.font = '600 20px system-ui'; x.font = '600 18px system-ui'; x.fillText('Each frame = one drawing. Play them fast = movement!', P.x + 40, P.y + 300);
  } else if (d === 'onion') {
    x.strokeStyle = '#2b2d33'; x.lineWidth = 6; x.beginPath(); x.moveTo(P.x + 60, P.y + 330); x.lineTo(P.x + 580, P.y + 330); x.stroke();
    ball(x, P.x + 220, P.y + 130, 60, 1, 1, '#ff3b3b', 0.35);
    const k = clamp((el - 0.6) / 1.4, 0, 1); x.strokeStyle = '#1b1b22'; x.lineWidth = 6; x.beginPath(); x.arc(P.x + 340, P.y + 190, 60, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); x.stroke();
    if (k >= 1) ball(x, P.x + 340, P.y + 190, 60, 1, 1, '#ff7a45');
    x.fillStyle = '#ff3b3b'; x.font = '700 18px system-ui'; x.fillText('red = last frame', P.x + 150, P.y + 50);
  } else if (d === 'squash') {
    x.strokeStyle = '#2b2d33'; x.lineWidth = 6; x.beginPath(); x.moveTo(P.x + 60, P.y + 330); x.lineTo(P.x + 580, P.y + 330); x.stroke();
    const s = 1 - 0.38 * Math.max(0, Math.sin(el * 3)); ball(x, P.x + 320, P.y + 327 - 70 * s, 70, 1 / Math.sqrt(s), s, '#ff7a45');
    x.fillStyle = '#6b6f7a'; x.font = '600 20px system-ui'; x.fillText('Select ▸ drag the side handle to squash', P.x + 40, P.y + 46);
  } else if (d === 'play') {
    x.strokeStyle = '#2b2d33'; x.lineWidth = 6; x.beginPath(); x.moveTo(P.x + 60, P.y + 330); x.lineTo(P.x + 580, P.y + 330); x.stroke();
    const ph = (el * 1.2) % 1, y = Math.abs(Math.cos(ph * Math.PI)), s = y < 0.12 ? 0.7 + y * 2.5 : 1;
    ball(x, P.x + 100 + ((el * 140) % 440), P.y + 327 - 60 * s - (1 - y * y) * 0 - (y) * 200, 60, 1 / Math.sqrt(s), s, '#ff7a45');
    x.fillStyle = '#2d3a2f'; rr(x, P.x + 470, P.y + 24, 140, 50, 14); x.fill(); x.fillStyle = '#7dff9a'; x.font = '800 22px system-ui'; x.fillText('▶ 12 fps', P.x + 492, P.y + 57);
  } else if (d === 'export') {
    const items = [['🎞', 'Video'], ['🖼', 'GIF'], ['📤', 'Share']];
    items.forEach(([ic, n], i) => { const X = P.x + 60 + i * 190, Y = P.y + 110, hot = Math.floor(el / 1.1) % 3 === i; x.fillStyle = hot ? '#ff7a45' : '#f1f2f5'; rr(x, X, Y, 150, 150, 22); x.fill(); x.font = '64px system-ui'; x.fillText(ic, X + 40, Y + 90); x.fillStyle = hot ? '#1b0c05' : '#333'; x.font = '800 22px system-ui'; x.fillText(n, X + 75 - x.measureText(n).width / 2, Y + 134); });
  } else if (d === 'tease') {
    x.save(); rr(x, P.x, P.y, P.w, P.h, 22); x.clip(); drawAnime(x, P.x, P.y, P.w, P.h, 1.3 + (el % 1.5)); x.restore();
    x.fillStyle = '#fff'; x.font = '900 34px system-ui'; x.fillText('Coming up…', P.x + 24, P.y + 50);
  }
  // auto-advance
  // auto-advance: after the voice finishes (+ a short pause), or by reading time when muted / no voice
  if (TUT.auto && !$('#tt-vpanel')) {
    const voiced = TUT.tts && !TUT.muted && TUT.spokeStep === TUT.step;
    if (voiced) { if (!TUT.speaking && TUT.spokeEnd && performance.now() - TUT.spokeEnd > 1600 + (d === 'tease' ? 600 : 0) && el > 2) tutGo(TUT.step + 1); else if (el > 25) tutGo(TUT.step + 1); }
    else { const dur = 1.2 + st.t.length * 0.055 + 1.8; if (el > dur + (d === 'tease' ? 0.6 : 0)) tutGo(TUT.step + 1); }
  }
}

/* =========================================================
   ANIME ENDING  (~7.5 s, drawn live)
   ========================================================= */
function drawEnding(now) {
  const x = TUT.x, t = (now - TUT.endT0) / 1000;
  drawAnime(x, 0, 0, TUT.W, TUT.H, t);
  if (t > 8.6 && TUT.mode === 'ending') { TUT.mode = 'done'; updTutBar(); }
  if (t > 9.6) TUT.endT0 = now - 4.8 * 1000; // gently loop the final shot
}
function animeHero(x, pose, t, sc, flip) {
  // pose: 'stand' | 'run' | 'land'
  x.save(); x.scale(flip ? -sc : sc, sc);
  const ink = '#14121c', skin = '#ffe0c8', skinS = '#f2bda0', hair = '#1d2a6b', hairL = '#3a56c9', jacket = '#e8463a', jacketS = '#b52d2a', pants = '#22243a', scarf = '#ffd23f';
  x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = 4; x.strokeStyle = ink;
  const run = pose === 'run', land = pose === 'land';
  const lean = run ? 0.42 : land ? 0.15 : 0;
  const bob = run ? Math.abs(Math.sin(t * 22)) * 10 : land ? 8 : Math.sin(t * 2.2) * 2;
  x.translate(0, -bob); x.rotate(lean);
  // scarf (behind)
  x.save(); x.fillStyle = scarf; x.beginPath(); x.moveTo(-6, -150);
  const L = run ? 190 : 120;
  for (let i = 0; i <= 10; i++) { const u = i / 10; x.lineTo(-10 - u * L, -150 + Math.sin(t * 14 + u * 6) * 14 * u + u * (run ? 10 : 40)); }
  for (let i = 10; i >= 0; i--) { const u = i / 10; x.lineTo(-10 - u * L, -132 + Math.sin(t * 14 + u * 6) * 14 * u + u * (run ? 18 : 48)); }
  x.closePath(); x.fill(); x.stroke(); x.restore();
  // legs
  const legA = run ? Math.sin(t * 22) * 0.9 : land ? 0.7 : 0.08, legB = run ? -Math.sin(t * 22) * 0.9 : land ? -0.5 : -0.08;
  const leg = (a, kneeBend) => { x.save(); x.translate(0, -70); x.rotate(a); x.fillStyle = pants; rr(x, -12, 0, 24, 46, 10); x.fill(); x.stroke(); x.translate(0, 42); x.rotate(kneeBend); rr(x, -11, 0, 22, 42, 9); x.fill(); x.stroke(); x.fillStyle = '#f2f2f2'; rr(x, -12, 36, 34, 16, 7); x.fill(); x.stroke(); x.restore(); };
  leg(legB, run ? Math.max(0, -legB) * 1.4 + 0.2 : land ? 1.3 : 0); leg(legA, run ? Math.max(0, -legA) * 1.4 + 0.2 : land ? 0.4 : 0);
  // torso
  x.fillStyle = jacket; x.beginPath(); x.moveTo(-26, -150); x.quadraticCurveTo(-34, -110, -24, -68); x.lineTo(24, -68); x.quadraticCurveTo(34, -110, 26, -150); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = jacketS; x.beginPath(); x.moveTo(6, -148); x.lineTo(24, -70); x.lineTo(26, -150); x.fill();
  x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, -146); x.lineTo(0, -72); x.stroke(); x.strokeStyle = ink; x.lineWidth = 4;
  // arms
  const arm = (side, a, b) => { x.save(); x.translate(side * 22, -142); x.rotate(a); x.fillStyle = jacket; rr(x, -9, 0, 18, 40, 8); x.fill(); x.stroke(); x.translate(0, 36); x.rotate(b); x.fillStyle = jacket; rr(x, -8, 0, 16, 34, 7); x.fill(); x.stroke(); x.fillStyle = skin; x.beginPath(); x.arc(0, 40, 10, 0, 6.3); x.fill(); x.stroke(); x.restore(); };
  if (run) { arm(-1, 1.6, 0.2); arm(1, 1.9, 0.1); } else if (land) { arm(-1, 0.6, -1.4); arm(1, -1.1, -0.4); } else { arm(-1, 0.18, -0.15); arm(1, -0.18, 0.15); }
  // neck + head
  x.fillStyle = skin; rr(x, -8, -166, 16, 20, 6); x.fill(); x.stroke();
  x.save(); x.translate(0, -208); x.rotate(run ? -0.35 : 0);
  x.fillStyle = skin; x.beginPath(); x.moveTo(-34, -18); x.quadraticCurveTo(-36, 26, 0, 42); x.quadraticCurveTo(34, 26, 34, -18); x.quadraticCurveTo(0, -46, -34, -18); x.fill(); x.stroke();
  x.fillStyle = skinS; x.beginPath(); x.moveTo(-30, 10); x.quadraticCurveTo(-26, 30, 0, 40); x.quadraticCurveTo(-12, 26, -30, 10); x.fill();
  // eyes
  const eye = (ex) => { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(ex, 4, 9, 12, 0, 0, 6.3); x.fill(); x.fillStyle = '#2b6be0'; x.beginPath(); x.ellipse(ex + 2, 6, 6, 9, 0, 0, 6.3); x.fill(); x.fillStyle = ink; x.beginPath(); x.ellipse(ex + 2, 7, 3, 5, 0, 0, 6.3); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + 4, 2, 2.4, 0, 6.3); x.fill(); x.lineWidth = 4; x.beginPath(); x.moveTo(ex - 11, -6); x.quadraticCurveTo(ex, -14, ex + 11, -8); x.stroke(); };
  eye(-13); eye(15);
  x.lineWidth = 3; x.beginPath(); x.moveTo(-2, 28); x.lineTo(run ? 8 : 6, 27); x.stroke(); x.lineWidth = 4;
  // hair spikes
  x.fillStyle = hair; x.beginPath(); x.moveTo(-40, 0);
  const sp = [[-46, -28], [-30, -20], [-40, -56], [-14, -36], [-8, -70], [8, -40], [26, -64], [24, -30], [46, -40], [36, -8], [44, 6], [30, -4], [22, -16], [6, -14], [-6, -2], [-18, -18], [-28, 4]];
  const w = Math.sin(t * (run ? 18 : 3)) * (run ? 6 : 2);
  sp.forEach(([a, b], i) => x.lineTo(a - (b < -30 ? w + (run ? 14 : 0) : 0), b));
  x.closePath(); x.fill(); x.stroke();
  x.fillStyle = hairL; x.beginPath(); x.moveTo(-20, -30); x.quadraticCurveTo(-4, -44, 14, -36); x.quadraticCurveTo(-2, -38, -20, -30); x.fill();
  x.restore();
  x.restore();
}
function speedLines(x, X, Y, W, H, cx, cy, t, n, col) {
  x.save(); x.strokeStyle = col; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.sin(i * 12.9) * 0.3, r0 = 140 + ((i * 97 + t * 900) % 300), r1 = r0 + 160 + (i % 5) * 60; x.lineWidth = 1 + (i % 4) * 2; x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); x.stroke(); } x.restore();
}
function drawAnime(x, X, Y, W, H, t) {
  x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip(); x.translate(X, Y); const sx = W / 1280, sy = H / 720; x.scale(sx, sy);
  const Wv = 1280, Hv = 720;
  let shake = 0; if (t > 4.4 && t < 5.0) shake = (5.0 - t) * 26;
  x.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  if (t < 1.4) {
    // SHOT 1: dusk rooftop, wind
    const g = x.createLinearGradient(0, 0, 0, Hv); g.addColorStop(0, '#1b1d4a'); g.addColorStop(0.55, '#7a3d8f'); g.addColorStop(1, '#ff8a5b'); x.fillStyle = g; x.fillRect(-40, -40, Wv + 80, Hv + 80);
    x.fillStyle = '#ffe9b0'; x.beginPath(); x.arc(980, 260, 120, 0, 6.3); x.fill();
    x.fillStyle = '#20163a'; for (let i = 0; i < 14; i++) { const bw = 70 + (i * 37) % 60, bh = 160 + (i * 53) % 220; x.fillRect(i * 96 - 20, Hv - 140 - bh, bw, bh + 200); }
    x.fillStyle = '#120d24'; x.fillRect(-40, Hv - 150, Wv + 80, 200);
    const z = 1 + t * 0.08; x.save(); x.translate(560, Hv - 150); x.scale(z, z); animeHero(x, 'stand', t, 1.15, false); x.restore();
    x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 2; for (let i = 0; i < 12; i++) { const yy = 80 + i * 50, xx = ((i * 211 - t * 1400) % 1500 + 1500) % 1500 - 100; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + 120, yy - 6); x.stroke(); }
    for (let i = 0; i < 18; i++) { x.fillStyle = `hsla(${330 + i * 3},90%,85%,.9)`; const px = ((i * 177 - t * 500) % 1400 + 1400) % 1400 - 60, py = (i * 83 + t * 120) % Hv; x.save(); x.translate(px, py); x.rotate(t * 3 + i); x.beginPath(); x.ellipse(0, 0, 8, 4, 0, 0, 6.3); x.fill(); x.restore(); }
  } else if (t < 2.1) {
    // SHOT 2: eye close-up + glint
    const k = (t - 1.4) / 0.7;
    x.fillStyle = '#0d0b1a'; x.fillRect(-40, -40, Wv + 80, Hv + 80);
    x.fillStyle = '#ffe0c8'; x.fillRect(-40, 220, Wv + 80, 280);
    x.fillStyle = '#1d2a6b'; x.beginPath(); x.moveTo(-40, 220); for (let i = 0; i <= 14; i++) x.lineTo(i * 100 - 40, 220 + (i % 2 ? 70 : 10)); x.lineTo(Wv + 40, 160); x.lineTo(-40, 160); x.fill();
    const ey = 370; [380, 900].forEach((ex) => { x.fillStyle = '#fff'; x.beginPath(); x.ellipse(ex, ey, 150, 92 * Math.min(1, 0.2 + k * 3), 0, 0, 6.3); x.fill(); x.lineWidth = 12; x.strokeStyle = '#14121c'; x.beginPath(); x.ellipse(ex, ey, 150, 92 * Math.min(1, 0.2 + k * 3), 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
      x.fillStyle = '#2b6be0'; x.beginPath(); x.ellipse(ex + 10, ey + 6, 70, 80 * Math.min(1, 0.2 + k * 3), 0, 0, 6.3); x.fill(); x.fillStyle = '#14121c'; x.beginPath(); x.ellipse(ex + 10, ey + 10, 30, 40 * Math.min(1, 0.2 + k * 3), 0, 0, 6.3); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + 40, ey - 30, 18, 0, 6.3); x.fill(); });
    x.fillStyle = 'rgba(0,0,0,.85)'; x.fillRect(-40, -40, Wv + 80, 260 - k * 40); x.fillRect(-40, 480 + k * 40, Wv + 80, 300);
    if (k > 0.55) { const g2 = (k - 0.55) / 0.45, gx = 950, gy = 330; x.save(); x.translate(gx, gy); x.rotate(g2 * 1.2); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 14 : 90 * Math.sin(g2 * Math.PI); const a = i / 8 * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); x.restore(); }
  } else if (t < 4.4) {
    // SHOT 3: the dash
    const k = (t - 2.1) / 2.3;
    x.fillStyle = '#ff5d3a'; x.fillRect(-40, -40, Wv + 80, Hv + 80);
    const g = x.createRadialGradient(640, 380, 40, 640, 380, 800); g.addColorStop(0, '#ffe066'); g.addColorStop(0.5, '#ff7a45'); g.addColorStop(1, '#8a1f4a'); x.fillStyle = g; x.fillRect(-40, -40, Wv + 80, Hv + 80);
    speedLines(x, 0, 0, Wv, Hv, 640, 380, t, 90, 'rgba(255,255,255,.85)');
    x.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 26; i++) { const yy = (i * 29) % Hv, xx = ((i * 331 - t * 3000) % 1700 + 1700) % 1700 - 200; x.fillRect(xx, yy, 260 + (i % 4) * 90, 3 + (i % 3) * 3); }
    const hx = 260 + k * 760;
    for (let j = 3; j >= 1; j--) { x.save(); x.globalAlpha = 0.18 / j; x.translate(hx - j * 70, 610); animeHero(x, 'run', t - j * 0.04, 1.05, false); x.restore(); }
    x.save(); x.translate(hx, 610); animeHero(x, 'run', t, 1.05, false); x.restore();
    for (let i = 0; i < 10; i++) { const a = i * 0.7 + t * 4, d = 30 + ((t * 300 + i * 40) % 120); x.fillStyle = `rgba(255,240,220,${1 - d / 150})`; x.beginPath(); x.arc(hx - 80 - d, 612 - Math.abs(Math.sin(a)) * 30, 10 + i % 3 * 5, 0, 6.3); x.fill(); }
    x.fillStyle = '#14121c'; x.fillRect(-40, 612, Wv + 80, 200);
  } else if (t < 5.0) {
    // SHOT 4: impact flash
    const k = (t - 4.4) / 0.6;
    x.fillStyle = k < 0.25 ? '#ffffff' : '#14121c'; x.fillRect(-40, -40, Wv + 80, Hv + 80);
    x.save(); x.translate(640, 380); for (let i = 0; i < 24; i++) { x.rotate(Math.PI * 2 / 24); x.fillStyle = i % 2 ? '#ffd23f' : '#ff4fa3'; x.beginPath(); x.moveTo(0, 0); x.lineTo(30, 80 + k * 900); x.lineTo(-30, 80 + k * 900); x.fill(); } x.restore();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(640, 380, 60 + k * 500, 0, 6.3); x.globalAlpha = 1 - k; x.fill(); x.globalAlpha = 1;
  } else {
    // SHOT 5: final pose + title
    const k = Math.min(1, (t - 5.0) / 1.2);
    const g = x.createLinearGradient(0, 0, 0, Hv); g.addColorStop(0, '#0e1240'); g.addColorStop(0.6, '#5a2a8a'); g.addColorStop(1, '#ff6a5a'); x.fillStyle = g; x.fillRect(-40, -40, Wv + 80, Hv + 80);
    for (let i = 0; i < 60; i++) { const sx2 = (i * 211) % Wv, sy2 = (i * 97) % 380, tw = 0.5 + 0.5 * Math.sin(t * 4 + i); x.fillStyle = `rgba(255,255,255,${tw})`; x.fillRect(sx2, sy2, 2 + (i % 3), 2 + (i % 3)); }
    x.fillStyle = '#fff2c8'; x.beginPath(); x.arc(640, 330 + (1 - k) * 60, 230, 0, 6.3); x.fill();
    x.fillStyle = '#ffe2a0'; x.beginPath(); x.arc(640, 330 + (1 - k) * 60, 260, 0, 6.3); x.globalAlpha = 0.25; x.fill(); x.globalAlpha = 1;
    x.fillStyle = '#120d24'; x.beginPath(); x.moveTo(-40, 600); x.quadraticCurveTo(640, 520, Wv + 40, 600); x.lineTo(Wv + 40, Hv + 40); x.lineTo(-40, Hv + 40); x.fill();
    x.save(); x.translate(640, 572); x.filter = 'brightness(0.18)'; animeHero(x, 'land', t, 1.25, false); x.filter = 'none'; x.restore();
    for (let i = 0; i < 26; i++) { const px = ((i * 151 + t * 60) % Wv), py = Hv - ((t * 90 + i * 53) % Hv); x.fillStyle = `rgba(255,${200 + i % 50},150,${0.7 * k})`; x.beginPath(); x.arc(px, py, 2 + i % 3, 0, 6.3); x.fill(); }
    x.globalAlpha = k; x.textAlign = 'center';
    x.font = '900 64px system-ui, sans-serif'; x.lineWidth = 10; x.strokeStyle = '#14121c'; x.strokeText('Practise a lot…', 640, 120); x.fillStyle = '#fff'; x.fillText('Practise a lot…', 640, 120);
    if (t > 6.0) { x.globalAlpha = Math.min(1, (t - 6.0) / 0.8); x.font = '900 46px system-ui, sans-serif'; x.strokeText('and you can animate like this!', 640, 182); x.fillStyle = '#ffd23f'; x.fillText('and you can animate like this!', 640, 182); }
    x.textAlign = 'left'; x.globalAlpha = 1;
  }
  // letterbox
  x.fillStyle = '#000'; x.fillRect(-40, -40, Wv + 80, 40 + 22); x.fillRect(-40, Hv - 22, Wv + 80, 80);
  x.restore();
}

window.AS = { openTutorial, TUT, S, get proj() { return S.proj; }, openProject, closeProject, setTool, addFrame, setFrame, startPlay, stopPlay, undo, redo, exportGif, saveNow, runExport, EX, selectAll, commitSel, doFill };
boot();
})();
