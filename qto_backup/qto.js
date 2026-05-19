// ============================================================
// QTO BACKUP TOOL — DATABASE CONSTANTS
// Hardcoded for file:// compatibility (no fetch needed)
// ============================================================

const DB = {

  rebar: [
    { diameter_mm: 10,  unit_weight: 0.616 },
    { diameter_mm: 12,  unit_weight: 0.888 },
    { diameter_mm: 16,  unit_weight: 1.578 },
    { diameter_mm: 20,  unit_weight: 2.466 },
    { diameter_mm: 25,  unit_weight: 3.853 },
    { diameter_mm: 28,  unit_weight: 4.834 },
    { diameter_mm: 32,  unit_weight: 6.313 },
    { diameter_mm: 36,  unit_weight: 7.990 },
  ],

  headwall: [
    { diameter_mm: 450,  type: 'single', volume: 0.85 },
    { diameter_mm: 450,  type: 'double', volume: 1.45 },
    { diameter_mm: 600,  type: 'single', volume: 1.10 },
    { diameter_mm: 600,  type: 'double', volume: 1.90 },
    { diameter_mm: 750,  type: 'single', volume: 1.55 },
    { diameter_mm: 750,  type: 'double', volume: 2.70 },
    { diameter_mm: 910,  type: 'single', volume: 2.10 },
    { diameter_mm: 910,  type: 'double', volume: 3.60 },
    { diameter_mm: 1050, type: 'single', volume: 2.80 },
    { diameter_mm: 1050, type: 'double', volume: 4.80 },
    { diameter_mm: 1200, type: 'single', volume: 3.60 },
    { diameter_mm: 1200, type: 'double', volume: 6.20 },
  ],

  signs: [
    { code: 'W1-1',  description: 'Curve Right',           category: 'Warning' },
    { code: 'W1-2',  description: 'Curve Left',            category: 'Warning' },
    { code: 'W2-1',  description: 'Reverse Curve Right',   category: 'Warning' },
    { code: 'W2-2',  description: 'Reverse Curve Left',    category: 'Warning' },
    { code: 'W3-1',  description: 'Winding Road Right',    category: 'Warning' },
    { code: 'W4-1',  description: 'Intersection Ahead',    category: 'Warning' },
    { code: 'W5-1',  description: 'T-Intersection Ahead',  category: 'Warning' },
    { code: 'W8-1',  description: 'Road Narrows',          category: 'Warning' },
    { code: 'W10-1', description: 'Slippery Road',         category: 'Warning' },
    { code: 'W12-1', description: 'Pedestrian Crossing',   category: 'Warning' },
    { code: 'W13-1', description: 'School Ahead',          category: 'Warning' },
    { code: 'W14-1', description: 'Animal Crossing',       category: 'Warning' },
    { code: 'R1-1',  description: 'Stop',                  category: 'Regulatory' },
    { code: 'R2-1',  description: 'Give Way',              category: 'Regulatory' },
    { code: 'R3-1',  description: 'No Entry',              category: 'Regulatory' },
    { code: 'R4-1',  description: 'Speed Limit 60',        category: 'Regulatory' },
    { code: 'R4-2',  description: 'Speed Limit 80',        category: 'Regulatory' },
    { code: 'R5-1',  description: 'No Overtaking',         category: 'Regulatory' },
    { code: 'R6-1',  description: 'No U-Turn',             category: 'Regulatory' },
    { code: 'I1-1',  description: 'Direction Sign',        category: 'Informational' },
    { code: 'I2-1',  description: 'Distance Sign',         category: 'Informational' },
    { code: 'I3-1',  description: 'Route Marker',          category: 'Informational' },
  ],

  guardrails: [
    { code: 'W-BEAM',     description: 'W-Beam Guardrail' },
    { code: 'THRIE-BEAM', description: 'Thrie-Beam Guardrail' },
    { code: 'CABLE',      description: 'Cable Guardrail' },
    { code: 'CONCRETE',   description: 'Concrete Barrier' },
    { code: 'METAL-BEAM', description: 'Metal Beam Crash Barrier' },
  ],

  // Helper lookups
  getHeadwallVolume(diameter_mm, type) {
    const row = this.headwall.find(r => r.diameter_mm === diameter_mm && r.type === type);
    return row ? row.volume : 0;
  },

  getRebarWeight(diameter_mm) {
    const row = this.rebar.find(r => r.diameter_mm === diameter_mm);
    return row ? row.unit_weight : 0;
  },

  getSign(code) {
    return this.signs.find(s => s.code === code) || null;
  },
};
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
// ============================================================
// QTO BACKUP TOOL — STATE MANAGEMENT
// ============================================================

const State = {

  // ── Project ──────────────────────────────────────────────
  projectDefaults() {
    return {
      name:        '',
      contractId:  '',
      preparedBy:  '',
      date:        new Date().toISOString().slice(0, 10),
    };
  },

  // ── Station Limits ───────────────────────────────────────
  limitsDefaults() {
    return {
      from:     '',
      to:       '',
      autoTrim: false,
      applied:  false,
    };
  },

  // ── Module Factories ─────────────────────────────────────

  newLengthRow() {
    return { id: Utils.uid(), staFrom: '', staTo: '', ref: '', _status: 'normal', _trimmedFrom: null, _trimmedTo: null };
  },

  newLengthModule() {
    return {
      id:    Utils.uid(),
      type:  'length',
      label: '',
      showLabel: false,
      rows:  [this.newLengthRow()],
    };
  },

  newAreaRow() {
    return {
      id: Utils.uid(),
      description: '',
      staFrom: '', staTo: '',
      width: '',
      thickness: '',
      directArea: '',
      useSpacing: false,
      spacing_totalLen: '', spacing_segLen: '', spacing_spacing: '', spacing_width: '',
      ref: '',
      _status: 'normal',
    };
  },

  newAreaDeduction() {
    return { id: Utils.uid(), description: '', area: '' };
  },

  newAreaModule() {
    return {
      id:   Utils.uid(),
      type: 'area',
      label: '',
      showLabel: false,
      rows: [this.newAreaRow()],
      deductions: [],
    };
  },

  newVolumeComponent() {
    return {
      id:     Utils.uid(),
      name:   '',
      method: 'dimensional', // 'dimensional' | 'area'
      // dimensional
      L: '', W: '', H: '', count: '',
      // area-based
      csArea: '', length: '',
      // deductions
      deductions: [],
    };
  },

  newVolumeDeduction() {
    return { id: Utils.uid(), L: '', W: '', H: '', count: '' };
  },

  newVolumeModule() {
    return {
      id:    Utils.uid(),
      type:  'volume',
      label: '',
      showLabel: false,
      components: [this.newVolumeComponent()],
    };
  },

  newCountRow() {
    return { id: Utils.uid(), description: '', qty: '', ref: '' };
  },

  newCountModule() {
    return {
      id:    Utils.uid(),
      type:  'count',
      label: '',
      showLabel: false,
      unit:  'ea',
      customUnit: '',
      rows:  [this.newCountRow()],
    };
  },

  // ── Component Factory ────────────────────────────────────
  newComponent(name = '') {
    return {
      id:          Utils.uid(),
      name:        name,
      note:        '',
      showNote:    false,
      modules:     [],
      outputs:     [], // { outputId, label, qty, unit, tag } — computed, refreshed on render
      reviewed:    false,
      lastEdited:  Utils.now(),
    };
  },

  // ── Schedule Factory ─────────────────────────────────────
  newSchedule() {
    return {
      id:           Utils.uid(),
      name:         '',
      type:         1, // 1 = single station, 2 = station limits
      componentIds: [],
    };
  },

  // ── Full Session ─────────────────────────────────────────
  newSession() {
    return {
      version:    1,
      project:    this.projectDefaults(),
      limits:     this.limitsDefaults(),
      components: [],
      schedules:  [],
      qtySheets:  [],
      savedAt:    null,
    };
  },

  // ── localStorage ────────────────────────────────────────

  storageKey(contractId) {
    const id = (contractId || '').trim();
    return id ? `qto_project_${id}` : 'qto_project_default';
  },

  save(session) {
    try {
      const key = this.storageKey(session.project.contractId);
      session.savedAt = Utils.now();
      localStorage.setItem(key, JSON.stringify(session));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  },

  load(contractId) {
    try {
      const key = this.storageKey(contractId);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('localStorage load failed:', e);
      return null;
    }
  },

  loadLatest() {
    // Try to find any existing session
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('qto_project_')) {
          const raw = localStorage.getItem(key);
          if (raw) return JSON.parse(raw);
        }
      }
    } catch (e) {}
    return null;
  },

  exportJSON(session) {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const name = (session.project.contractId || 'qto_backup').replace(/\s+/g, '_');
    a.href     = url;
    a.download = `${name}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const session = JSON.parse(e.target.result);
        callback(null, session);
      } catch (err) {
        callback('Invalid JSON file', null);
      }
    };
    reader.readAsText(file);
  },
};
// ============================================================
// QTO BACKUP TOOL — COMPUTATION ENGINE
// ============================================================

const Compute = {

  // ── Length ───────────────────────────────────────────────
  length(module, limits) {
    let total = 0;
    const rows = module.rows.map(row => {
      const from = Utils.num(row.staFrom);
      const to   = Utils.num(row.staTo);
      let len    = 0;
      let status = 'normal';
      let trimmedFrom = null, trimmedTo = null;

      if (row.staFrom !== '' && row.staTo !== '') {
        if (limits.applied && limits.from !== '' && limits.to !== '') {
          const lf = Utils.num(limits.from);
          const lt = Utils.num(limits.to);
          const trimmed = Utils.trimRange(from, to, lf, lt);
          if (!trimmed) {
            status = 'excluded';
            len = 0;
          } else if (trimmed[0] !== from || trimmed[1] !== to) {
            status = limits.autoTrim ? 'trimmed' : 'flagged';
            trimmedFrom = trimmed[0];
            trimmedTo   = trimmed[1];
            len = limits.autoTrim ? trimmed[1] - trimmed[0] : to - from;
          } else {
            len = to - from;
          }
        } else {
          len = to - from;
        }
      }

      if (status !== 'excluded') total += len;
      return { ...row, _computed: Utils.round(len), _status: status, _trimmedFrom: trimmedFrom, _trimmedTo: trimmedTo };
    });

    return {
      rows,
      outputs: [
        { label: module.label || 'Length', qty: Utils.round(total), unit: 'lm' }
      ]
    };
  },

  // ── Area ─────────────────────────────────────────────────
  area(module, limits) {
    let total = 0;

    const rows = module.rows.map(row => {
      let area = 0;
      let status = 'normal';

      if (row.directArea !== '') {
        area = Utils.num(row.directArea);
      } else if (row.useSpacing) {
        const totalLen = Utils.num(row.spacing_totalLen);
        const segLen   = Utils.num(row.spacing_segLen);
        const spacing  = Utils.num(row.spacing_spacing);
        const width    = Utils.num(row.spacing_width);
        const count    = (segLen + spacing) > 0 ? Math.floor(totalLen / (segLen + spacing)) : 0;
        area = count * segLen * width;
      } else {
        let len = 0;
        if (row.staFrom !== '' && row.staTo !== '') {
          const from = Utils.num(row.staFrom);
          const to   = Utils.num(row.staTo);

          if (limits.applied && limits.from !== '' && limits.to !== '') {
            const lf = Utils.num(limits.from);
            const lt = Utils.num(limits.to);
            const trimmed = Utils.trimRange(from, to, lf, lt);
            if (!trimmed) {
              status = 'excluded';
            } else if (trimmed[0] !== from || trimmed[1] !== to) {
              status = limits.autoTrim ? 'trimmed' : 'flagged';
              len = limits.autoTrim ? trimmed[1] - trimmed[0] : to - from;
            } else {
              len = to - from;
            }
          } else {
            len = to - from;
          }
        }
        area = status !== 'excluded' ? len * Utils.num(row.width) : 0;
      }

      total += area;
      return { ...row, _computed: Utils.round(area), _status: status };
    });

    // Deductions
    let deductTotal = 0;
    const deductions = module.deductions.map(d => {
      const val = Utils.num(d.area);
      deductTotal += val;
      return { ...d, _computed: val };
    });

    const net = Utils.round(total - deductTotal);
    return {
      rows, deductions,
      outputs: [
        { label: module.label || 'Area', qty: net, unit: 'm²' }
      ]
    };
  },

  // ── Volume ───────────────────────────────────────────────
  volume(module) {
    let total = 0;

    const components = module.components.map(comp => {
      let gross = 0;
      if (comp.method === 'dimensional') {
        gross = Utils.num(comp.L) * Utils.num(comp.W) * Utils.num(comp.H) * (Utils.num(comp.count) || 1);
      } else {
        gross = Utils.num(comp.csArea) * Utils.num(comp.length);
      }

      let deductTotal = 0;
      const deductions = (comp.deductions || []).map(d => {
        const val = Utils.num(d.L) * Utils.num(d.W) * Utils.num(d.H) * (Utils.num(d.count) || 1);
        deductTotal += val;
        return { ...d, _computed: Utils.round(val) };
      });

      const net = Utils.round(gross - deductTotal);
      total += net;
      return { ...comp, deductions, _gross: Utils.round(gross), _deductTotal: Utils.round(deductTotal), _net: net };
    });

    return {
      components,
      outputs: [
        { label: module.label || 'Volume', qty: Utils.round(total), unit: 'm³' }
      ]
    };
  },

  // ── Count ────────────────────────────────────────────────
  count(module) {
    let total = 0;
    const rows = module.rows.map(row => {
      const val = Utils.num(row.qty);
      total += val;
      return { ...row, _computed: val };
    });

    const unit = module.unit === 'custom' ? (module.customUnit || 'ea') : module.unit;
    return {
      rows,
      outputs: [
        { label: module.label || 'Count', qty: total, unit }
      ]
    };
  },

  // ── Run all modules in a component ───────────────────────
  runComponent(component, limits) {
    const results = {};
    for (const mod of component.modules) {
      switch (mod.type) {
        case 'length':    results[mod.id] = this.length(mod, limits);    break;
        case 'area':      results[mod.id] = this.area(mod, limits);      break;
        case 'volume':    results[mod.id] = this.volume(mod);            break;
        case 'count':     results[mod.id] = this.count(mod);             break;
        // Future modules will be added here
        default:          results[mod.id] = { outputs: [] };             break;
      }
    }
    return results;
  },

  // ── Aggregate outputs by tag (for Summary tab) ───────────
  aggregateByTag(components, limits) {
    const tagMap = {}; // tag → { qty, unit, components: [] }

    for (const comp of components) {
      const results = this.runComponent(comp, limits);
      // Build output list from component modules + their tags
      const outputTags = comp._outputTags || {}; // { outputKey → tag }

      for (const mod of comp.modules) {
        const res = results[mod.id];
        if (!res) continue;
        for (let i = 0; i < res.outputs.length; i++) {
          const out  = res.outputs[i];
          const key  = `${mod.id}_${i}`;
          const tag  = (outputTags[key] || '').trim();
          if (!tag || out.qty === 0) continue;

          if (!tagMap[tag]) tagMap[tag] = { qty: 0, unit: out.unit, conflict: false, components: [] };
          if (tagMap[tag].unit !== out.unit) tagMap[tag].conflict = true;
          tagMap[tag].qty += out.qty;
          tagMap[tag].components.push({ compName: comp.name, qty: out.qty, unit: out.unit });
        }
      }
    }
    return tagMap;
  },
};
// ============================================================
// QTO BACKUP TOOL — PDF EXPORT (pdfmake)
// ============================================================

const PDF = {

  // Page header repeated on every page
  pageHeader(project, limits) {
    const staStr = (limits.from !== '' && limits.to !== '')
      ? `${Utils.fmtStation(limits.from)} — ${Utils.fmtStation(limits.to)}`
      : 'Not Set';
    return {
      columns: [
        { text: project.name || 'Untitled Project', style: 'headerProject', width: '*' },
        {
          width: 'auto',
          stack: [
            { text: `Contract ID: ${project.contractId || '—'}`, style: 'headerMeta' },
            { text: `Sta. Limits: ${staStr}`, style: 'headerMeta' },
          ]
        }
      ],
      margin: [0, 0, 0, 8],
    };
  },

  // Cover page
  cover(session, tagMap) {
    const { project, limits } = session;
    const staStr = (limits.from !== '' && limits.to !== '')
      ? `${Utils.fmtStation(limits.from)} — ${Utils.fmtStation(limits.to)}`
      : 'Not Set';

    const tagRows = Object.entries(tagMap)
      .filter(([, v]) => v.qty > 0)
      .map(([tag, v]) => [
        { text: tag, style: 'tableCell' },
        { text: Utils.fmtNum(v.qty), style: 'tableCellRight' },
        { text: v.unit, style: 'tableCellCenter' },
        v.conflict ? { text: '⚠ Unit Conflict', style: 'warn' } : { text: '', style: 'tableCell' },
      ]);

    return [
      { text: 'QTO BACKUP COMPUTATION', style: 'coverTitle' },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: `Project: ${project.name || '—'}`, style: 'coverMeta' },
              { text: `Contract ID: ${project.contractId || '—'}`, style: 'coverMeta' },
            ],
            [
              { text: `Prepared By: ${project.preparedBy || '—'}`, style: 'coverMeta' },
              { text: `Date: ${project.date || '—'}`, style: 'coverMeta' },
            ],
            [
              { text: `Station Limits: ${staStr}`, style: 'coverMeta', colSpan: 2 }, {}
            ],
          ]
        },
        layout: 'noBorders',
        margin: [0, 8, 0, 16],
      },
      { text: 'MASTER QUANTITY LIST', style: 'sectionHeader' },
      tagRows.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 80, 50, 100],
              body: [
                [
                  { text: 'Tag / Item of Work', style: 'tableHeader' },
                  { text: 'Total Qty', style: 'tableHeaderRight' },
                  { text: 'Unit', style: 'tableHeaderCenter' },
                  { text: 'Notes', style: 'tableHeaderCenter' },
                ],
                ...tagRows,
              ]
            },
            layout: 'lightHorizontalLines',
          }
        : { text: 'No tagged outputs.', style: 'dimText', margin: [0, 4, 0, 0] },
      { text: '', margin: [0, 24, 0, 0] },
      {
        columns: [
          {
            width: '45%',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 160, y2: 0, lineWidth: 0.5 }] },
              { text: 'Prepared By', style: 'sigLabel' },
            ]
          },
          { width: '10%', text: '' },
          {
            width: '45%',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 160, y2: 0, lineWidth: 0.5 }] },
              { text: 'Checked By', style: 'sigLabel' },
            ]
          },
        ],
        margin: [0, 16, 0, 0],
      },
    ];
  },

  // Component page
  componentPage(component, results, session) {
    const blocks = [
      { text: `COMPONENT: ${component.name || 'Untitled'}`, style: 'componentTitle', pageBreak: 'before' },
    ];

    if (component.note) {
      blocks.push({ text: `Note: ${component.note}`, style: 'noteText', margin: [0, 2, 0, 8] });
    }

    // Each module
    for (const mod of component.modules) {
      const res = results[mod.id];
      if (!res) continue;

      const label = mod.label || Utils.MODULE_LABELS[mod.type] || mod.type;
      blocks.push({ text: label, style: 'moduleHeader', margin: [0, 12, 0, 4] });
      blocks.push({ text: `Type: ${Utils.MODULE_LABELS[mod.type] || mod.type}`, style: 'moduleType', margin: [0, 0, 0, 4] });

      // Module-specific tables
      switch (mod.type) {
        case 'length':
          blocks.push(this._lengthTable(mod, res));
          break;
        case 'area':
          blocks.push(this._areaTable(mod, res));
          break;
        case 'volume':
          blocks.push(this._volumeTable(mod, res));
          break;
        case 'count':
          blocks.push(this._countTable(mod, res));
          break;
      }
    }

    // Outputs summary
    const outputTags = component._outputTags || {};
    const allOutputs = [];
    for (const mod of component.modules) {
      const res = results[mod.id];
      if (!res) continue;
      res.outputs.forEach((out, i) => {
        if (out.qty === 0) return;
        const key = `${mod.id}_${i}`;
        allOutputs.push({
          label: out.label,
          qty:   Utils.fmtNum(out.qty),
          unit:  out.unit,
          tag:   outputTags[key] || '',
        });
      });
    }

    if (allOutputs.length > 0) {
      blocks.push({ text: 'OUTPUTS', style: 'sectionHeader', margin: [0, 12, 0, 4] });
      blocks.push({
        table: {
          headerRows: 1,
          widths: ['*', 70, 50, '*'],
          body: [
            [
              { text: 'Output', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeaderRight' },
              { text: 'Unit', style: 'tableHeaderCenter' },
              { text: 'Tag', style: 'tableHeader' },
            ],
            ...allOutputs.map(o => [
              { text: o.label, style: 'tableCell' },
              { text: o.qty, style: 'tableCellRight' },
              { text: o.unit, style: 'tableCellCenter' },
              { text: o.tag, style: 'tableCell' },
            ]),
          ]
        },
        layout: 'lightHorizontalLines',
      });
    }

    return blocks;
  },

  _lengthTable(mod, res) {
    const rows = (res.rows || mod.rows).map(row => {
      const status = row._status || 'normal';
      const cell = (text, right = false) => ({
        text: String(text), style: status === 'excluded' ? 'excludedCell' : (right ? 'tableCellRight' : 'tableCell')
      });
      return [
        cell(Utils.fmtStation(row.staFrom)),
        cell(Utils.fmtStation(row.staTo)),
        cell(Utils.fmtNum(row._computed ?? (Utils.num(row.staTo) - Utils.num(row.staFrom))), true),
        cell(row.ref || ''),
        cell(status === 'trimmed' ? `Trimmed (orig: ${Utils.fmtStation(row.staFrom)}–${Utils.fmtStation(row.staTo)})` :
             status === 'excluded' ? 'Excluded' :
             status === 'flagged' ? '⚠ Review' : ''),
      ];
    });
    return {
      table: {
        headerRows: 1,
        widths: [70, 70, 60, '*', 80],
        body: [
          ['Sta. From','Sta. To','Length (lm)','Reference','Status'].map(h => ({ text: h, style: 'tableHeader' })),
          ...rows,
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 4],
    };
  },

  _areaTable(mod, res) {
    const rows = (res.rows || mod.rows).map(row => [
      { text: row.description || '', style: 'tableCell' },
      { text: row.directArea !== '' ? 'Direct' : row.useSpacing ? 'Spacing' : `${Utils.fmtStation(row.staFrom)} — ${Utils.fmtStation(row.staTo)}`, style: 'tableCell' },
      { text: Utils.fmtNum(row.width || ''), style: 'tableCellRight' },
      { text: Utils.fmtNum(row._computed ?? 0), style: 'tableCellRight' },
      { text: row.ref || '', style: 'tableCell' },
    ]);

    const blocks = [{
      table: {
        headerRows: 1,
        widths: ['*', 100, 50, 60, '*'],
        body: [
          ['Description','Basis','Width (m)','Area (m²)','Ref'].map(h => ({ text: h, style: 'tableHeader' })),
          ...rows,
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 4],
    }];

    if (res.deductions && res.deductions.length > 0) {
      blocks.push({ text: 'Deductions:', style: 'dimText', margin: [0, 4, 0, 2] });
      blocks.push({
        table: {
          headerRows: 1,
          widths: ['*', 70],
          body: [
            [{ text: 'Description', style: 'tableHeader' }, { text: 'Area (m²)', style: 'tableHeaderRight' }],
            ...res.deductions.map(d => [{ text: d.description, style: 'tableCell' }, { text: Utils.fmtNum(d._computed), style: 'tableCellRight' }]),
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 4],
      });
    }
    return { stack: blocks };
  },

  _volumeTable(mod, res) {
    const rows = (res.components || mod.components).map(comp => [
      { text: comp.name || '', style: 'tableCell' },
      { text: comp.method === 'dimensional' ? `${comp.L || 0} × ${comp.W || 0} × ${comp.H || 0} × ${comp.count || 1}` : `${comp.csArea || 0} m² × ${comp.length || 0} m`, style: 'tableCell' },
      { text: Utils.fmtNum(comp._net ?? 0), style: 'tableCellRight' },
    ]);
    return {
      table: {
        headerRows: 1,
        widths: ['*', '*', 70],
        body: [
          ['Component','Formula','Volume (m³)'].map(h => ({ text: h, style: 'tableHeader' })),
          ...rows,
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 4],
    };
  },

  _countTable(mod, res) {
    const unit = mod.unit === 'custom' ? (mod.customUnit || 'ea') : mod.unit;
    const rows = (res.rows || mod.rows).map(row => [
      { text: row.description || '', style: 'tableCell' },
      { text: Utils.fmtNum(row._computed ?? row.qty, 0), style: 'tableCellRight' },
      { text: row.ref || '', style: 'tableCell' },
    ]);
    return {
      table: {
        headerRows: 1,
        widths: ['*', 70, '*'],
        body: [
          [`Description`, `Qty (${unit})`, 'Reference'].map(h => ({ text: h, style: 'tableHeader' })),
          ...rows,
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 4],
    };
  },

  // Main export function
  export(session, components, tagMap) {
    const { project, limits } = session;

    const docDef = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 50],
      header: (page, pages) => page > 1 ? {
        columns: [
          { text: project.name || 'QTO Backup', style: 'pageHeaderText', margin: [40, 12, 0, 0] },
          { text: `${project.contractId || ''}  |  Page ${page} of ${pages}`, style: 'pageHeaderMeta', margin: [0, 12, 40, 0], alignment: 'right' },
        ]
      } : null,
      footer: (page, pages) => ({
        text: `QTO Backup Computation  ·  ${project.preparedBy || ''}  ·  ${project.date || ''}`,
        style: 'footer',
        margin: [40, 0, 40, 16],
      }),
      content: [],
      styles: this.styles(),
      defaultStyle: { font: 'Roboto', fontSize: 9 },
    };

    // Cover
    docDef.content.push(...this.cover(session, tagMap));

    // Component pages
    for (const comp of components) {
      const results = Compute.runComponent(comp, limits);
      docDef.content.push(...this.componentPage(comp, results, session));
    }

    pdfMake.createPdf(docDef).download(
      `QTO_${(project.contractId || 'backup').replace(/\s+/g, '_')}_${project.date || new Date().toISOString().slice(0,10)}.pdf`
    );
  },

  styles() {
    return {
      coverTitle:       { fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
      coverMeta:        { fontSize: 10, margin: [4, 2, 4, 2] },
      sectionHeader:    { fontSize: 10, bold: true, margin: [0, 8, 0, 4], decoration: 'underline' },
      componentTitle:   { fontSize: 12, bold: true, margin: [0, 0, 0, 4] },
      moduleHeader:     { fontSize: 10, bold: true },
      moduleType:       { fontSize: 8, color: '#666', italics: true },
      noteText:         { fontSize: 9, italics: true, color: '#555' },
      tableHeader:      { fontSize: 8, bold: true, fillColor: '#e8e8e8' },
      tableHeaderRight: { fontSize: 8, bold: true, fillColor: '#e8e8e8', alignment: 'right' },
      tableHeaderCenter:{ fontSize: 8, bold: true, fillColor: '#e8e8e8', alignment: 'center' },
      tableCell:        { fontSize: 8 },
      tableCellRight:   { fontSize: 8, alignment: 'right' },
      tableCellCenter:  { fontSize: 8, alignment: 'center' },
      excludedCell:     { fontSize: 8, color: '#aaa', decoration: 'lineThrough' },
      headerProject:    { fontSize: 10, bold: true },
      headerMeta:       { fontSize: 8, color: '#666' },
      pageHeaderText:   { fontSize: 8, bold: true, color: '#333' },
      pageHeaderMeta:   { fontSize: 8, color: '#888' },
      dimText:          { fontSize: 8, color: '#888', italics: true },
      warn:             { fontSize: 8, color: '#c0392b', bold: true },
      sigLabel:         { fontSize: 8, color: '#666', margin: [0, 3, 0, 0] },
      footer:           { fontSize: 7, color: '#aaa', alignment: 'center' },
    };
  },
};
// ============================================================
// QTO BACKUP TOOL — MAIN APP (Vue 3)
// ============================================================

const { createApp, ref, computed, reactive, watch, nextTick, onMounted } = Vue;

createApp({
  setup() {

    // ── Session ──────────────────────────────────────────
    const session = reactive(State.newSession());

    // ── UI State ─────────────────────────────────────────
    const activeTab        = ref('component');
    const activeCompId     = ref(null);
    const showProjectModal = ref(false);
    const toasts           = ref([]);

    // Per-component output tags: { compId: { outputKey: tag } }
    const outputTags = reactive({});

    // Summary tab: unit costs per tag
    const unitCosts = reactive({});

    // ── Init ─────────────────────────────────────────────
    onMounted(() => {
      const saved = State.loadLatest();
      if (saved) {
        Object.assign(session, saved);
        // Restore outputTags and unitCosts if saved
        if (saved._outputTags) Object.assign(outputTags, saved._outputTags);
        if (saved._unitCosts)  Object.assign(unitCosts, saved._unitCosts);
        toast('Session restored', 'success');
      } else {
        showProjectModal.value = true;
      }
    });

    // ── Auto-save ────────────────────────────────────────
    watch(() => JSON.stringify(session), () => {
      session._outputTags = JSON.parse(JSON.stringify(outputTags));
      session._unitCosts  = JSON.parse(JSON.stringify(unitCosts));
      State.save(session);
    }, { deep: true });

    watch(() => JSON.stringify(outputTags), () => {
      session._outputTags = JSON.parse(JSON.stringify(outputTags));
      State.save(session);
    }, { deep: true });

    // ── Active Component ─────────────────────────────────
    const activeComp = computed(() =>
      session.components.find(c => c.id === activeCompId.value) || null
    );

    function selectComp(id) {
      activeCompId.value = id;
      activeTab.value = 'component';
    }

    function addComponent() {
      const comp = State.newComponent('');
      session.components.push(comp);
      outputTags[comp.id] = {};
      selectComp(comp.id);
      markChanged(comp);
      nextTick(() => {
        const el = document.querySelector('.comp-name-input');
        if (el) el.focus();
      });
    }

    function deleteComponent(id) {
      const idx = session.components.findIndex(c => c.id === id);
      if (idx === -1) return;
      session.components.splice(idx, 1);
      delete outputTags[id];
      if (activeCompId.value === id) {
        activeCompId.value = session.components.length > 0
          ? session.components[Math.max(0, idx - 1)].id : null;
      }
      toast('Component deleted');
    }

    // ── Module Management ────────────────────────────────
    function addModule(comp, type) {
      let mod;
      switch (type) {
        case 'length':    mod = State.newLengthModule();  break;
        case 'area':      mod = State.newAreaModule();    break;
        case 'volume':    mod = State.newVolumeModule();  break;
        case 'count':     mod = State.newCountModule();   break;
        default: return;
      }
      comp.modules.push(mod);
      markChanged(comp);
    }

    function deleteModule(comp, modId) {
      const idx = comp.modules.findIndex(m => m.id === modId);
      if (idx > -1) comp.modules.splice(idx, 1);
      markChanged(comp);
    }

    // ── Row Management ───────────────────────────────────
    function addRow(mod) {
      switch (mod.type) {
        case 'length': mod.rows.push(State.newLengthRow()); break;
        case 'area':   mod.rows.push(State.newAreaRow());   break;
        case 'count':  mod.rows.push(State.newCountRow());  break;
      }
    }

    function deleteRow(mod, rowId) {
      const idx = mod.rows.findIndex(r => r.id === rowId);
      if (idx > -1) mod.rows.splice(idx, 1);
    }

    function addVolComp(mod) {
      mod.components.push(State.newVolumeComponent());
    }

    function deleteVolComp(mod, compId) {
      const idx = mod.components.findIndex(c => c.id === compId);
      if (idx > -1) mod.components.splice(idx, 1);
    }

    function addVolDeduct(comp) {
      comp.deductions.push(State.newVolumeDeduction());
    }

    function deleteVolDeduct(comp, dId) {
      const idx = comp.deductions.findIndex(d => d.id === dId);
      if (idx > -1) comp.deductions.splice(idx, 1);
    }

    function addAreaDeduct(mod) {
      mod.deductions.push(State.newAreaDeduction());
    }

    function deleteAreaDeduct(mod, dId) {
      const idx = mod.deductions.findIndex(d => d.id === dId);
      if (idx > -1) mod.deductions.splice(idx, 1);
    }

    // ── Computed results for active component ────────────
    const activeResults = computed(() => {
      if (!activeComp.value) return {};
      return Compute.runComponent(activeComp.value, session.limits);
    });

    // ── Outputs for active component (flat list) ─────────
    const activeOutputs = computed(() => {
      if (!activeComp.value) return [];
      const out = [];
      for (const mod of activeComp.value.modules) {
        const res = activeResults.value[mod.id];
        if (!res) continue;
        res.outputs.forEach((o, i) => {
          if (o.qty === 0) return;
          const key = `${mod.id}_${i}`;
          out.push({ key, label: o.label, qty: o.qty, unit: o.unit });
        });
      }
      return out;
    });

    function getTag(compId, key) {
      return (outputTags[compId] || {})[key] || '';
    }
    function setTag(compId, key, val) {
      if (!outputTags[compId]) outputTags[compId] = {};
      outputTags[compId][key] = val;
    }

    // ── Summary: aggregate by tag ────────────────────────
    const tagSummary = computed(() => {
      const map = {};
      for (const comp of session.components) {
        const results = Compute.runComponent(comp, session.limits);
        const tags = outputTags[comp.id] || {};
        for (const mod of comp.modules) {
          const res = results[mod.id];
          if (!res) continue;
          res.outputs.forEach((out, i) => {
            if (out.qty === 0) return;
            const key = `${mod.id}_${i}`;
            const tag = (tags[key] || '').trim();
            if (!tag) return;
            if (!map[tag]) map[tag] = { qty: 0, unit: out.unit, conflict: false, breakdown: [] };
            if (map[tag].unit !== out.unit) map[tag].conflict = true;
            map[tag].qty = Utils.round(map[tag].qty + out.qty);
            map[tag].breakdown.push({ comp: comp.name, qty: out.qty, unit: out.unit });
          });
        }
      }
      return map;
    });

    const projectTotal = computed(() => {
      let total = 0;
      for (const [tag, data] of Object.entries(tagSummary.value)) {
        const cost = Utils.num(unitCosts[tag] || 0);
        total += data.qty * cost;
      }
      return total;
    });

    // ── Station Limits ───────────────────────────────────
    function applyLimits() {
      session.limits.applied = true;
      toast('Station limits applied', 'success');
    }

    // ── Project Modal ────────────────────────────────────
    function saveProject() {
      showProjectModal.value = false;
      State.save(session);
      toast('Project saved', 'success');
    }

    // ── Mark changed ────────────────────────────────────
    function markChanged(comp) {
      comp.reviewed = false;
      comp.lastEdited = Utils.now();
    }

    // ── Save / Load ──────────────────────────────────────
    function exportJSON() {
      session._outputTags = JSON.parse(JSON.stringify(outputTags));
      session._unitCosts  = JSON.parse(JSON.stringify(unitCosts));
      State.exportJSON(session);
      toast('Checkpoint exported', 'success');
    }

    function triggerImport() {
      document.getElementById('import-file-input').click();
    }

    function onImport(e) {
      const file = e.target.files[0];
      if (!file) return;
      State.importJSON(file, (err, loaded) => {
        if (err) { toast(err, 'error'); return; }
        Object.assign(session, loaded);
        if (loaded._outputTags) Object.assign(outputTags, loaded._outputTags);
        if (loaded._unitCosts)  Object.assign(unitCosts, loaded._unitCosts);
        toast('Session loaded', 'success');
      });
      e.target.value = '';
    }

    // ── PDF Export ───────────────────────────────────────
    function exportPDF() {
      if (session.components.length === 0) { toast('No components to export', 'warn'); return; }
      toast('Preparing PDF...', '');
      const compsForPDF = session.components.map(c => ({
        ...c,
        _outputTags: outputTags[c.id] || {},
      }));
      window._loadPdfmake(() => {
        try {
          PDF.export(session, compsForPDF, tagSummary.value);
          toast('PDF exported', 'success');
        } catch (e) {
          toast('PDF export failed: ' + e.message, 'error');
          console.error(e);
        }
      });
    }

    // ── Toasts ───────────────────────────────────────────
    function toast(msg, type = '') {
      const t = { id: Utils.uid(), msg, type };
      toasts.value.push(t);
      setTimeout(() => {
        const idx = toasts.value.findIndex(x => x.id === t.id);
        if (idx > -1) toasts.value.splice(idx, 1);
      }, 2800);
    }

    // ── Helpers ──────────────────────────────────────────
    const fmtSta  = Utils.fmtStation.bind(Utils);
    const fmtNum  = Utils.fmtNum.bind(Utils);
    const MODULE_LABELS = Utils.MODULE_LABELS;
    const UNITS   = Utils.UNITS;

    function compPrimaryOutput(comp) {
      const results = Compute.runComponent(comp, session.limits);
      for (const mod of comp.modules) {
        const res = results[mod.id];
        if (res && res.outputs && res.outputs.length > 0 && res.outputs[0].qty > 0) {
          return res.outputs[0];
        }
      }
      return null;
    }

    return {
      session, activeTab, activeCompId, activeComp, activeResults,
      activeOutputs, showProjectModal, toasts, outputTags, unitCosts,
      tagSummary, projectTotal,
      selectComp, addComponent, deleteComponent,
      addModule, deleteModule,
      addRow, deleteRow,
      addVolComp, deleteVolComp, addVolDeduct, deleteVolDeduct,
      addAreaDeduct, deleteAreaDeduct,
      getTag, setTag,
      applyLimits, saveProject, exportJSON, triggerImport, onImport,
      exportPDF, markChanged, toast,
      fmtSta, fmtNum, MODULE_LABELS, UNITS,
      compPrimaryOutput,
    };
  },

  template: `
<div id="app">

  <!-- ── Topbar ─────────────────────────────────────────── -->
  <div class="topbar">
    <a href="../index.html" class="topbar-back">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 3L5 8l5 5"/>
      </svg>
      FA Work Tools
    </a>
    <div class="topbar-divider"></div>
    <div class="topbar-logo">FA</div>
    <div class="topbar-title">QTO Backup Computation</div>
    <div class="topbar-divider"></div>

    <!-- Station Limits -->
    <div class="topbar-limits">
      <label>STA.</label>
      <input class="sta-input" v-model="session.limits.from" placeholder="0+000" title="From station (plain decimal, e.g. 0)">
      <span class="dim" style="font-size:11px;">—</span>
      <input class="sta-input" v-model="session.limits.to"   placeholder="1+000" title="To station (plain decimal, e.g. 1000)">
      <label class="toggle-label" title="Auto-trim entries to station limits">
        <input type="checkbox" v-model="session.limits.autoTrim"> Auto-trim
      </label>
      <button class="btn btn-ghost btn-sm" @click="applyLimits">Apply</button>
      <span v-if="session.limits.applied" class="status-flag flag-trimmed" style="font-size:9px;">Active</span>
    </div>

    <div class="topbar-spacer"></div>

    <!-- Action buttons -->
    <div class="topbar-actions">
      <button class="btn btn-ghost btn-sm" @click="showProjectModal = true">⚙ Project</button>
      <button class="btn btn-ghost btn-sm" @click="exportJSON">↓ Save</button>
      <button class="btn btn-ghost btn-sm" @click="triggerImport">↑ Load</button>
      <button class="btn btn-primary btn-sm" @click="exportPDF">⬡ PDF</button>
      <input type="file" id="import-file-input" accept=".json" @change="onImport">
    </div>
  </div>

  <!-- ── Main body ────────────────────────────────────────── -->
  <div class="main-body">

    <!-- ── Sidebar ──────────────────────────────────────── -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>Components</h3>
        <button class="btn btn-accent-ghost btn-sm" @click="addComponent">+ Add</button>
      </div>
      <div class="sidebar-list">
        <div v-if="session.components.length === 0" class="sidebar-empty">
          No components yet.<br>Click + Add to start.
        </div>
        <div
          v-for="comp in session.components"
          :key="comp.id"
          class="sidebar-item"
          :class="{ active: activeCompId === comp.id }"
          @click="selectComp(comp.id)"
        >
          <div class="sidebar-item-name">{{ comp.name || 'Untitled' }}</div>
          <span v-if="comp.reviewed" class="sidebar-item-badge badge-reviewed">✓</span>
          <span v-else-if="comp.modules.length > 0" class="sidebar-item-badge badge-changed">~</span>
        </div>
      </div>
    </div>

    <!-- ── Workspace ────────────────────────────────────── -->
    <div class="workspace">

      <!-- Tab bar -->
      <div class="tabbar">
        <button class="tab-btn" :class="{ active: activeTab === 'component' }" @click="activeTab = 'component'">Component</button>
        <button class="tab-btn" :class="{ active: activeTab === 'summary' }"   @click="activeTab = 'summary'">Summary</button>
        <button class="tab-btn" :class="{ active: activeTab === 'schedules' }" @click="activeTab = 'schedules'">Schedules</button>
        <button class="tab-btn" :class="{ active: activeTab === 'qtysheets' }" @click="activeTab = 'qtysheets'">Qty Sheets</button>
      </div>

      <!-- ── Component Tab ──────────────────────────────── -->
      <div v-if="activeTab === 'component'" class="tab-content">

        <!-- No component selected -->
        <div v-if="!activeComp" class="empty-state">
          <div class="empty-icon">📐</div>
          <div class="empty-title">No component selected</div>
          <div class="empty-desc">Select a component from the sidebar or click + Add to create one.</div>
        </div>

        <!-- Component workspace -->
        <template v-else>

          <!-- Component header -->
          <div class="comp-header">
            <div style="flex:1; min-width:0;">
              <input
                class="comp-name-input bc"
                v-model="activeComp.name"
                placeholder="Component name..."
                @input="markChanged(activeComp)"
              >
              <div class="comp-meta">
                {{ activeComp.modules.length }} module{{ activeComp.modules.length !== 1 ? 's' : '' }}
                · Last edited {{ fmtNum ? '' : '' }}{{ activeComp.lastEdited ? new Date(activeComp.lastEdited).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '' }}
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="btn btn-ghost btn-sm" @click="activeComp.showNote = !activeComp.showNote">
                {{ activeComp.showNote ? '− Note' : '+ Note' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteComponent(activeComp.id)">Delete</button>
            </div>
          </div>

          <!-- Note area -->
          <textarea
            v-if="activeComp.showNote"
            class="comp-note-area"
            v-model="activeComp.note"
            placeholder="Add notes, references, assumptions..."
            @input="markChanged(activeComp)"
          ></textarea>

          <!-- Add Module bar (always shown if no modules, collapsible if modules exist) -->
          <div class="add-module-bar">
            <span class="add-module-label">+ Module:</span>
            <button class="module-type-btn" v-for="type in ['length','area','volume','count']" :key="type"
              @click="addModule(activeComp, type)">
              {{ MODULE_LABELS[type] }}
            </button>
            <span class="dim" style="font-size:10px; font-family:'Barlow Condensed',sans-serif;">
              Rebar · Direct · Earthworks · Cross Drain · Signs · Guardrails · Markings — coming soon
            </span>
          </div>

          <!-- Modules -->
          <div v-for="mod in activeComp.modules" :key="mod.id" class="module-block">

            <!-- Module header -->
            <div class="module-block-header">
              <span class="module-type-badge">{{ MODULE_LABELS[mod.type] || mod.type }}</span>
              <input
                v-if="mod.showLabel"
                class="module-label-input"
                v-model="mod.label"
                placeholder="Label (optional)..."
                @input="markChanged(activeComp)"
              >
              <span v-else class="dim" style="font-size:11px; flex:1; font-family:'Barlow Condensed',sans-serif; padding-left:6px;">
                {{ mod.label || '' }}
              </span>
              <button class="toggle-btn" @click="mod.showLabel = !mod.showLabel" style="margin-right:8px;">
                {{ mod.showLabel ? 'hide label' : 'label' }}
              </button>

              <!-- Inline result -->
              <span class="module-result-inline" v-if="activeResults[mod.id]">
                <template v-for="(out, i) in activeResults[mod.id].outputs" :key="i">
                  <span>{{ fmtNum(out.qty) }}</span> {{ out.unit }}
                  <span v-if="i < activeResults[mod.id].outputs.length - 1">, </span>
                </template>
              </span>

              <button class="btn btn-danger btn-sm" style="margin-left:8px;" @click="deleteModule(activeComp, mod.id)">✕</button>
            </div>

            <!-- Module body -->
            <div class="module-body">

              <!-- ── LENGTH MODULE ── -->
              <template v-if="mod.type === 'length'">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width:90px;">Sta. From</th>
                      <th style="width:90px;">Sta. To</th>
                      <th style="width:80px;" class="right">Length (lm)</th>
                      <th>Reference</th>
                      <th style="width:80px;">Status</th>
                      <th style="width:28px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in mod.rows" :key="row.id"
                      :class="{ 'row-excluded': row._status === 'excluded', 'row-trimmed': row._status === 'trimmed', 'row-flagged': row._status === 'flagged' }">
                      <td><input class="cell-input" v-model="row.staFrom" placeholder="0" @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input" v-model="row.staTo" placeholder="0" @input="markChanged(activeComp)"></td>
                      <td>
                        <div class="cell-computed" v-if="activeResults[mod.id]">
                          {{ fmtNum(activeResults[mod.id].rows?.find(r=>r.id===row.id)?._computed ?? 0) }}
                        </div>
                      </td>
                      <td><input class="cell-input" v-model="row.ref" placeholder="Sheet ref..." @input="markChanged(activeComp)"></td>
                      <td>
                        <span v-if="row._status === 'trimmed'"  class="status-flag flag-trimmed">Trimmed</span>
                        <span v-if="row._status === 'excluded'" class="status-flag flag-excluded">Excluded</span>
                        <span v-if="row._status === 'flagged'"  class="status-flag flag-flagged">⚠ Review</span>
                      </td>
                      <td><button class="btn btn-icon btn-sm" @click="deleteRow(mod, row.id)" title="Remove row">✕</button></td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="2" style="color:var(--text3); font-size:11px;">TOTAL</td>
                      <td style="text-align:right; color:var(--accent);">
                        {{ activeResults[mod.id] ? fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0) : '—' }}
                      </td>
                      <td colspan="3"><span class="dim" style="font-size:11px;">lm</span></td>
                    </tr>
                  </tbody>
                </table>
                <button class="add-row-btn" @click="addRow(mod)">+ row</button>
              </template>

              <!-- ── AREA MODULE ── -->
              <template v-if="mod.type === 'area'">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style="width:90px;">Sta. From</th>
                      <th style="width:90px;">Sta. To</th>
                      <th style="width:65px;">Width (m)</th>
                      <th style="width:65px;">Thk (m)</th>
                      <th style="width:75px;">Direct (m²)</th>
                      <th style="width:80px;" class="right">Area (m²)</th>
                      <th>Ref</th>
                      <th style="width:28px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in mod.rows" :key="row.id">
                      <td><input class="cell-input" v-model="row.description" placeholder="e.g. Main Lane" @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input" v-model="row.staFrom" placeholder="0" @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input" v-model="row.staTo" placeholder="0" @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input right" v-model="row.width" placeholder="0" @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input right" v-model="row.thickness" placeholder="ref" @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input right" v-model="row.directArea" placeholder="override" @input="markChanged(activeComp)"></td>
                      <td>
                        <div class="cell-computed" v-if="activeResults[mod.id]">
                          {{ fmtNum(activeResults[mod.id].rows?.find(r=>r.id===row.id)?._computed ?? 0) }}
                        </div>
                      </td>
                      <td><input class="cell-input" v-model="row.ref" placeholder="Ref..." @input="markChanged(activeComp)"></td>
                      <td><button class="btn btn-icon btn-sm" @click="deleteRow(mod, row.id)">✕</button></td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="6" style="color:var(--text3); font-size:11px;">GROSS TOTAL</td>
                      <td style="text-align:right; color:var(--text2);">
                        {{ activeResults[mod.id] ? fmtNum((activeResults[mod.id].outputs[0]?.qty ?? 0) + (activeResults[mod.id].deductions?.reduce((s,d)=>s+d._computed,0) ?? 0)) : '—' }}
                      </td>
                      <td colspan="2"></td>
                    </tr>
                  </tbody>
                </table>
                <button class="add-row-btn" @click="addRow(mod)">+ row</button>

                <!-- Deductions -->
                <div v-if="mod.deductions.length > 0 || true" class="sub-section" style="margin-top:10px;">
                  <div class="sub-label">Deductions (−)</div>
                  <div v-for="d in mod.deductions" :key="d.id" class="deduct-row">
                    <input class="cell-input" v-model="d.description" placeholder="Description" style="flex:1;" @input="markChanged(activeComp)">
                    <input class="cell-input right" v-model="d.area" placeholder="m²" style="width:80px;" @input="markChanged(activeComp)">
                    <button class="btn btn-icon btn-sm" @click="deleteAreaDeduct(mod, d.id)">✕</button>
                  </div>
                  <button class="add-row-btn" @click="addAreaDeduct(mod)">+ deduction</button>
                </div>

                <!-- Net total -->
                <div v-if="activeResults[mod.id]" style="display:flex; justify-content:flex-end; margin-top:8px; gap:8px; align-items:baseline;">
                  <span class="dim" style="font-size:11px;">NET AREA</span>
                  <span style="font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700; color:var(--accent);">
                    {{ fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0) }}
                  </span>
                  <span class="dim" style="font-size:12px;">m²</span>
                </div>
              </template>

              <!-- ── VOLUME MODULE ── -->
              <template v-if="mod.type === 'volume'">
                <div v-for="vc in mod.components" :key="vc.id" class="vol-component-block">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                    <input class="cell-input" v-model="vc.name" placeholder="Component name (e.g. Footing)" style="flex:1; font-family:'Barlow Condensed',sans-serif; font-weight:600;" @input="markChanged(activeComp)">
                    <button class="btn btn-danger btn-sm" @click="deleteVolComp(mod, vc.id)">✕</button>
                  </div>

                  <!-- Method toggle -->
                  <div class="method-toggle">
                    <button class="method-btn" :class="{active: vc.method==='dimensional'}" @click="vc.method='dimensional'">L × W × H × n</button>
                    <button class="method-btn" :class="{active: vc.method==='area'}"        @click="vc.method='area'">Area × Length</button>
                  </div>

                  <!-- Dimensional -->
                  <div v-if="vc.method === 'dimensional'" class="dim-grid">
                    <div class="dim-field">
                      <label>L (m)</label>
                      <input class="cell-input right" v-model="vc.L" placeholder="0" @input="markChanged(activeComp)">
                    </div>
                    <div class="dim-field">
                      <label>W (m)</label>
                      <input class="cell-input right" v-model="vc.W" placeholder="0" @input="markChanged(activeComp)">
                    </div>
                    <div class="dim-field">
                      <label>H (m)</label>
                      <input class="cell-input right" v-model="vc.H" placeholder="0" @input="markChanged(activeComp)">
                    </div>
                    <div class="dim-field">
                      <label>Count</label>
                      <input class="cell-input right" v-model="vc.count" placeholder="1" @input="markChanged(activeComp)">
                    </div>
                  </div>

                  <!-- Area-based -->
                  <div v-else style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                    <div class="dim-field">
                      <label>Cross-section Area (m²)</label>
                      <input class="cell-input right" v-model="vc.csArea" placeholder="0" @input="markChanged(activeComp)">
                    </div>
                    <div class="dim-field">
                      <label>Length (m)</label>
                      <input class="cell-input right" v-model="vc.length" placeholder="0" @input="markChanged(activeComp)">
                    </div>
                  </div>

                  <!-- Component result -->
                  <div v-if="activeResults[mod.id]" style="font-size:11px; color:var(--text3); margin-bottom:6px; font-family:'Barlow Condensed',sans-serif;">
                    Gross:
                    <span style="color:var(--text2);">
                      {{ fmtNum(activeResults[mod.id].components?.find(c=>c.id===vc.id)?._gross ?? 0) }} m³
                    </span>
                  </div>

                  <!-- Deductions -->
                  <div class="sub-section">
                    <div class="sub-label">Deductions (−)</div>
                    <div v-for="d in vc.deductions" :key="d.id" class="deduct-row">
                      <div class="dim-grid" style="flex:1;">
                        <div class="dim-field"><label>L</label><input class="cell-input right" v-model="d.L" placeholder="0" @input="markChanged(activeComp)"></div>
                        <div class="dim-field"><label>W</label><input class="cell-input right" v-model="d.W" placeholder="0" @input="markChanged(activeComp)"></div>
                        <div class="dim-field"><label>H</label><input class="cell-input right" v-model="d.H" placeholder="0" @input="markChanged(activeComp)"></div>
                        <div class="dim-field"><label>n</label><input class="cell-input right" v-model="d.count" placeholder="1" @input="markChanged(activeComp)"></div>
                      </div>
                      <button class="btn btn-icon btn-sm" @click="deleteVolDeduct(vc, d.id)">✕</button>
                    </div>
                    <button class="add-row-btn" @click="addVolDeduct(vc)">+ deduction</button>
                  </div>

                  <!-- Net -->
                  <div v-if="activeResults[mod.id]" style="text-align:right; margin-top:6px;">
                    <span class="dim" style="font-size:10px;">Net: </span>
                    <span style="font-family:'Barlow Condensed',sans-serif; font-weight:700; color:var(--text);">
                      {{ fmtNum(activeResults[mod.id].components?.find(c=>c.id===vc.id)?._net ?? 0) }} m³
                    </span>
                  </div>
                </div>

                <button class="add-row-btn" @click="addVolComp(mod)">+ component</button>

                <!-- Module total -->
                <div v-if="activeResults[mod.id]" style="display:flex; justify-content:flex-end; margin-top:10px; gap:8px; align-items:baseline; border-top:1px solid var(--border2); padding-top:8px;">
                  <span class="dim" style="font-size:11px;">TOTAL VOLUME</span>
                  <span style="font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:700; color:var(--accent);">
                    {{ fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0) }}
                  </span>
                  <span class="dim" style="font-size:12px;">m³</span>
                </div>
              </template>

              <!-- ── COUNT MODULE ── -->
              <template v-if="mod.type === 'count'">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                  <span class="dim" style="font-size:11px; font-family:'Barlow Condensed',sans-serif;">Unit:</span>
                  <select class="cell-select" v-model="mod.unit" @change="markChanged(activeComp)">
                    <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
                  </select>
                  <input v-if="mod.unit === 'custom'" class="cell-input" v-model="mod.customUnit" placeholder="Custom unit..." style="width:120px;" @input="markChanged(activeComp)">
                </div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th style="width:80px;" class="right">Qty</th>
                      <th>Reference</th>
                      <th style="width:28px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in mod.rows" :key="row.id">
                      <td><input class="cell-input" v-model="row.description" placeholder="Item description..." @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input right" v-model="row.qty" placeholder="0" @input="markChanged(activeComp)"></td>
                      <td><input class="cell-input" v-model="row.ref" placeholder="Sheet ref..." @input="markChanged(activeComp)"></td>
                      <td><button class="btn btn-icon btn-sm" @click="deleteRow(mod, row.id)">✕</button></td>
                    </tr>
                    <tr class="total-row">
                      <td style="color:var(--text3); font-size:11px;">TOTAL</td>
                      <td style="text-align:right; color:var(--accent); font-family:'Barlow Condensed',sans-serif;">
                        {{ activeResults[mod.id] ? fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0, 0) : '—' }}
                      </td>
                      <td colspan="2"><span class="dim" style="font-size:11px;">{{ mod.unit === 'custom' ? mod.customUnit : mod.unit }}</span></td>
                    </tr>
                  </tbody>
                </table>
                <button class="add-row-btn" @click="addRow(mod)">+ row</button>
              </template>

            </div><!-- /module-body -->
          </div><!-- /module-block -->

          <!-- Outputs Summary -->
          <div class="outputs-summary" v-if="activeOutputs.length > 0">
            <div class="outputs-summary-title">Outputs — Tag Assignment</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Output</th>
                  <th style="width:90px;" class="right">Qty</th>
                  <th style="width:50px;">Unit</th>
                  <th style="width:220px;">Tag (Pay Item)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="out in activeOutputs" :key="out.key">
                  <td style="color:var(--text2);">{{ out.label }}</td>
                  <td class="right" style="font-family:'Barlow Condensed',sans-serif; font-weight:600; color:var(--accent);">
                    {{ fmtNum(out.qty) }}
                  </td>
                  <td style="color:var(--text3); font-family:'Barlow Condensed',sans-serif;">{{ out.unit }}</td>
                  <td>
                    <input
                      class="tag-input"
                      :value="getTag(activeComp.id, out.key)"
                      @input="setTag(activeComp.id, out.key, $event.target.value)"
                      placeholder="Type pay item tag..."
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Reviewed bar -->
          <div class="reviewed-bar" :class="{ done: activeComp.reviewed }" style="margin-top:12px;">
            <input type="checkbox" v-model="activeComp.reviewed" :id="'rev-'+activeComp.id" style="accent-color:var(--green); cursor:pointer;">
            <label :for="'rev-'+activeComp.id" style="cursor:pointer; user-select:none;">
              {{ activeComp.reviewed ? '✓ Reviewed' : 'Mark as reviewed' }}
            </label>
          </div>

        </template>
      </div><!-- /component tab -->

      <!-- ── Summary Tab ────────────────────────────────── -->
      <div v-if="activeTab === 'summary'" class="tab-content">

        <!-- All components table -->
        <div class="summary-section">
          <div class="summary-section-title">All Components</div>
          <div v-if="session.components.length === 0" class="dim" style="font-size:12px;">No components yet.</div>
          <table v-else class="tag-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Modules</th>
                <th>Status</th>
                <th>Last Edited</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comp in session.components" :key="comp.id">
                <td>{{ comp.name || 'Untitled' }}</td>
                <td class="dim">{{ comp.modules.length }}</td>
                <td>
                  <span v-if="comp.reviewed" class="sidebar-item-badge badge-reviewed">Reviewed</span>
                  <span v-else class="sidebar-item-badge badge-changed">Draft</span>
                </td>
                <td class="dim" style="font-size:11px;">
                  {{ comp.lastEdited ? new Date(comp.lastEdited).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—' }}
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm" @click="selectComp(comp.id)">Open</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- By tag (master quantity list) -->
        <div class="summary-section">
          <div class="summary-section-title">Master Quantity List — by Tag</div>
          <div v-if="Object.keys(tagSummary).length === 0" class="dim" style="font-size:12px;">
            No tagged outputs yet. Assign tags in the Outputs Summary of each component.
          </div>
          <table v-else class="tag-table">
            <thead>
              <tr>
                <th>Tag / Pay Item</th>
                <th class="right">Total Qty</th>
                <th>Unit</th>
                <th class="right">Unit Cost (₱)</th>
                <th class="right">Total Cost (₱)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(data, tag) in tagSummary" :key="tag">
                <tr>
                  <td>
                    {{ tag }}
                    <span v-if="data.conflict" class="conflict-badge" style="margin-left:6px;">Unit Conflict</span>
                  </td>
                  <td class="right" style="font-family:'Barlow Condensed',sans-serif; font-weight:700; color:var(--accent);">
                    {{ fmtNum(data.qty) }}
                  </td>
                  <td style="font-family:'Barlow Condensed',sans-serif; color:var(--text3);">{{ data.unit }}</td>
                  <td class="right">
                    <input
                      class="cost-input"
                      v-model="unitCosts[tag]"
                      placeholder="0.00"
                      type="number"
                      min="0"
                    >
                  </td>
                  <td class="right" style="font-family:'Barlow Condensed',sans-serif;">
                    {{ fmtNum(data.qty * (parseFloat(unitCosts[tag]) || 0)) }}
                  </td>
                  <td></td>
                </tr>
              </template>
              <tr class="tag-total">
                <td colspan="4" style="text-align:right; color:var(--text3); font-size:11px;">PROJECT TOTAL</td>
                <td class="right" style="color:var(--accent);">{{ fmtNum(projectTotal) }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <div class="dim" style="font-size:10px; margin-top:8px; font-family:'Barlow Condensed',sans-serif;">
            ⚠ Costs are for estimator reference only — not included in PDF export.
          </div>
        </div>
      </div>

      <!-- ── Schedules Tab ──────────────────────────────── -->
      <div v-if="activeTab === 'schedules'" class="tab-content">
        <div class="placeholder-tab">
          <div class="ph-icon">📋</div>
          <div class="ph-title">Schedules</div>
          <div class="ph-desc">Schedule generation (drainage, signs, guardrails) will be built in Phase 2. Station-organized tables with per-tag columns, auto-populated from selected components.</div>
        </div>
      </div>

      <!-- ── Qty Sheets Tab ─────────────────────────────── -->
      <div v-if="activeTab === 'qtysheets'" class="tab-content">
        <div class="placeholder-tab">
          <div class="ph-icon">📊</div>
          <div class="ph-title">Qty Sheets</div>
          <div class="ph-desc">CSV quantity sheet import with column definition, Average End Area computation, and "From Qty Sheet" picker for Direct Input and Earthworks modules — Phase 2.</div>
        </div>
      </div>

    </div><!-- /workspace -->
  </div><!-- /main-body -->

  <!-- ── Project Modal ──────────────────────────────────── -->
  <div v-if="showProjectModal" class="modal-overlay" @click.self="showProjectModal = false">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Project Setup</span>
        <button class="btn btn-icon btn-sm" @click="showProjectModal = false">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <label class="form-label">Project Name</label>
          <input class="form-input" v-model="session.project.name" placeholder="e.g. Road Improvement Project">
        </div>
        <div class="form-row">
          <label class="form-label">Contract ID</label>
          <input class="form-input" v-model="session.project.contractId" placeholder="e.g. 22BA-0001">
        </div>
        <div class="form-row">
          <label class="form-label">Prepared By</label>
          <input class="form-input" v-model="session.project.preparedBy" placeholder="Name and designation">
        </div>
        <div class="form-row">
          <label class="form-label">Date</label>
          <input class="form-input" type="date" v-model="session.project.date">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="showProjectModal = false">Cancel</button>
        <button class="btn btn-primary" @click="saveProject">Save Project</button>
      </div>
    </div>
  </div>

  <!-- ── Toasts ─────────────────────────────────────────── -->
  <div class="toast-wrap">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
      {{ t.msg }}
    </div>
  </div>

</div>
  `,
}).mount('#app');
