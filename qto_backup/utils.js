// ============================================================
// QTO BACKUP TOOL — UTILITIES
// ============================================================

const Utils = {

  // Generate a unique ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  // Format plain decimal station to 0+000 display format
  // e.g. 854.4 → "0+854.4", 1200.0 → "1+200.0", 0 → "0+000"
  fmtStation(val) {
    if (val === '' || val === null || val === undefined) return '';
    const n = parseFloat(val);
    if (isNaN(n)) return String(val);
    const km = Math.floor(n / 1000);
    const m = n - km * 1000;
    // Format meters: at least 3 digits before decimal, preserve decimals
    const mStr = m % 1 === 0
      ? String(Math.round(m)).padStart(3, '0')
      : m.toFixed(1).padStart(5, '0');
    return `${km}+${mStr}`;
  },

  // Parse station string back to plain decimal
  parseStation(str) {
    if (str === '' || str === null || str === undefined) return null;
    const s = String(str).trim();
    // Already plain decimal
    if (!s.includes('+')) return parseFloat(s) || null;
    // Formatted: 0+854.4
    const parts = s.split('+');
    return parseFloat(parts[0]) * 1000 + parseFloat(parts[1]);
  },

  // Format number with commas and fixed decimals
  fmtNum(val, decimals = 2) {
    if (val === '' || val === null || val === undefined) return '';
    const n = parseFloat(val);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  // Round to N decimals
  round(val, decimals = 4) {
    return Math.round(val * 10 ** decimals) / 10 ** decimals;
  },

  // Safe parse float, returns 0 if invalid
  num(val) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  },

  // Current timestamp string
  now() {
    return new Date().toISOString();
  },

  // Format timestamp for display
  fmtTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  },

  // Deep clone
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Check if station is within limits (inclusive)
  stationInRange(sta, from, to) {
    if (from === null || to === null) return true;
    return sta >= from && sta <= to;
  },

  // Check overlap between [a1,a2] and [b1,b2]
  rangeOverlaps(a1, a2, b1, b2) {
    return a1 <= b2 && a2 >= b1;
  },

  // Trim a range [a1,a2] to fit within [b1,b2], returns null if no overlap
  trimRange(a1, a2, b1, b2) {
    if (!this.rangeOverlaps(a1, a2, b1, b2)) return null;
    return [Math.max(a1, b1), Math.min(a2, b2)];
  },

  // Standard units list
  UNITS: ['lm', 'm', 'm²', 'm³', 'kg', 'ton', 'ea', 'pcs', 'sets', 'lot', 'bag', 'l.s.', 'custom'],

  // Module type labels
  MODULE_LABELS: {
    length:    'Length',
    area:      'Area',
    volume:    'Volume',
    count:     'Count',
    rebar:     'Rebar Weight',
    direct:    'Direct Input',
    earthworks:'Earthworks',
    crossdrain:'Cross Drain',
    signs:     'Traffic Signs',
    guardrail: 'Guardrails',
    markings:  'Pavement Markings',
  },
};
