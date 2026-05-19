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

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  fmtStation(val) {
    if (val === '' || val === null || val === undefined) return '';
    const n = parseFloat(val);
    if (isNaN(n)) return String(val);
    const km = Math.floor(n / 1000);
    const m = n - km * 1000;
    const mStr = m % 1 === 0
      ? String(Math.round(m)).padStart(3, '0')
      : m.toFixed(1).padStart(5, '0');
    return `${km}+${mStr}`;
  },

  parseStation(str) {
    if (str === '' || str === null || str === undefined) return null;
    const s = String(str).trim();
    if (!s.includes('+')) return parseFloat(s) || null;
    const parts = s.split('+');
    return parseFloat(parts[0]) * 1000 + parseFloat(parts[1]);
  },

  fmtNum(val, decimals = 2) {
    if (val === '' || val === null || val === undefined) return '';
    const n = parseFloat(val);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  round(val, decimals = 4) {
    return Math.round(val * 10 ** decimals) / 10 ** decimals;
  },

  num(val) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  },

  now() {
    return new Date().toISOString();
  },

  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Returns sorted valid segments array
  validSegments(segments) {
    if (!segments || !segments.length) return [];
    return segments
      .map(s => ({ from: parseFloat(s.from), to: parseFloat(s.to) }))
      .filter(s => !isNaN(s.from) && !isNaN(s.to) && s.to > s.from)
      .sort((a, b) => a.from - b.from);
  },

  // Intersect [a1,a2] with segments, return clipped portions + total length
  intersectSegments(a1, a2, segments) {
    const portions = [];
    for (const seg of segments) {
      const f = Math.max(a1, seg.from);
      const t = Math.min(a2, seg.to);
      if (t > f) portions.push({ from: f, to: t });
    }
    const total = portions.reduce((s, p) => s + (p.to - p.from), 0);
    return { portions, total };
  },

  // Evaluate a row range against active limits
  // Returns { status, trimmedPortions, trimmedTotal }
  evaluateRange(a1, a2, limits) {
    if (!limits.applied) return { status: 'normal', trimmedPortions: null, trimmedTotal: null };
    const segs = this.validSegments(limits.segments);
    if (!segs.length) return { status: 'normal', trimmedPortions: null, trimmedTotal: null };

    const fullLen = a2 - a1;
    const { portions, total } = this.intersectSegments(a1, a2, segs);

    if (portions.length === 0) return { status: 'excluded', trimmedPortions: [], trimmedTotal: 0 };

    const isExact = Math.abs(total - fullLen) < 0.0001 &&
      portions.length === 1 &&
      Math.abs(portions[0].from - a1) < 0.0001 &&
      Math.abs(portions[0].to - a2) < 0.0001;

    if (isExact) return { status: 'normal', trimmedPortions: null, trimmedTotal: null };

    if (limits.autoTrim) {
      return { status: 'trimmed', trimmedPortions: portions, trimmedTotal: this.round(total) };
    } else {
      return { status: 'flagged', trimmedPortions: portions, trimmedTotal: this.round(total) };
    }
  },

  // Format trimmed portions for display
  fmtTrimmedPortions(portions) {
    if (!portions || !portions.length) return '';
    return portions.map(p => `${this.fmtStation(p.from)}–${this.fmtStation(p.to)}`).join('  +  ');
  },

  UNITS: ['lm', 'm', 'm²', 'm³', 'kg', 'ton', 'ea', 'pcs', 'sets', 'lot', 'bag', 'l.s.', 'custom'],

  MODULE_LABELS: {
    length:     'Length',
    area:       'Area',
    volume:     'Volume',
    count:      'Count',
    rebar:      'Rebar Weight',
    direct:     'Direct Input',
    earthworks: 'Earthworks',
    crossdrain: 'Cross Drain',
    signs:      'Traffic Signs',
    guardrail:  'Guardrails',
    markings:   'Pavement Markings',
  },
};
// ============================================================
// QTO BACKUP TOOL — STATE MANAGEMENT
// ============================================================

const State = {

  projectDefaults() {
    return {
      name:        '',
      contractId:  '',
      preparedBy:  '',
      date:        new Date().toISOString().slice(0, 10),
    };
  },

  limitsDefaults() {
    return {
      segments:  [{ id: Utils.uid(), from: '', to: '' }],
      autoTrim:  false,
      applied:   false,
    };
  },

  newSegment() {
    return { id: Utils.uid(), from: '', to: '' };
  },

  // ── Module row factories ─────────────────────────────────

  newLengthRow() {
    return { id: Utils.uid(), staFrom: '', staTo: '', ref: '', excludeFromTrim: false,
             _status: 'normal', _trimmedPortions: null, _trimmedTotal: null, _expanded: false };
  },

  newLengthModule() {
    return { id: Utils.uid(), type: 'length', label: '', showLabel: false, rows: [this.newLengthRow()] };
  },

  newAreaRow() {
    return {
      id: Utils.uid(), description: '', staFrom: '', staTo: '',
      width: '', thickness: '', directArea: '',
      useSpacing: false,
      spacing_totalLen: '', spacing_segLen: '', spacing_spacing: '', spacing_width: '',
      ref: '', excludeFromTrim: false,
      _status: 'normal', _trimmedPortions: null, _trimmedTotal: null, _expanded: false,
    };
  },

  newAreaDeduction() {
    return { id: Utils.uid(), description: '', area: '' };
  },

  newAreaModule() {
    return { id: Utils.uid(), type: 'area', label: '', showLabel: false,
             rows: [this.newAreaRow()], deductions: [] };
  },

  newVolumeComponent() {
    return { id: Utils.uid(), name: '', method: 'dimensional',
             L: '', W: '', H: '', count: '', csArea: '', length: '', deductions: [] };
  },

  newVolumeDeduction() {
    return { id: Utils.uid(), L: '', W: '', H: '', count: '' };
  },

  newVolumeModule() {
    return { id: Utils.uid(), type: 'volume', label: '', showLabel: false,
             components: [this.newVolumeComponent()] };
  },

  newCountRow() {
    return { id: Utils.uid(), description: '', location: '', qty: '', ref: '' };
  },

  newCountModule() {
    return { id: Utils.uid(), type: 'count', label: '', showLabel: false,
             unit: 'ea', customUnit: '', rows: [this.newCountRow()] };
  },

  newComponent(name = '') {
    return {
      id:         Utils.uid(),
      name:       name,
      note:       '',
      showNote:   false,
      modules:    [],
      lastEdited: Utils.now(),
    };
  },

  newSession() {
    return {
      version:    1,
      project:    this.projectDefaults(),
      limits:     this.limitsDefaults(),
      components: [],
      schedules:  [],
      qtySheets:  [],
      tagOrder:   [],
      savedAt:    null,
    };
  },

  // ── localStorage ─────────────────────────────────────────

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

  loadLatest() {
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
        callback(null, JSON.parse(e.target.result));
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
      let trimmedPortions = null, trimmedTotal = null;

      if (row.staFrom !== '' && row.staTo !== '') {
        if (row.excludeFromTrim) {
          len = to - from;
        } else {
          const ev = Utils.evaluateRange(from, to, limits);
          status = ev.status;
          trimmedPortions = ev.trimmedPortions;
          trimmedTotal    = ev.trimmedTotal;
          if (status === 'excluded') {
            len = 0;
          } else if (status === 'trimmed' && trimmedTotal !== null) {
            len = trimmedTotal;
          } else {
            len = to - from;
          }
        }
      }

      if (status !== 'excluded') total += len;
      return { ...row, _computed: Utils.round(len), _status: status,
               _trimmedPortions: trimmedPortions, _trimmedTotal: trimmedTotal };
    });

    return {
      rows,
      outputs: [{ label: module.label || 'Length', qty: Utils.round(total), unit: 'lm' }]
    };
  },

  // ── Area ─────────────────────────────────────────────────
  area(module, limits) {
    let total = 0;

    const rows = module.rows.map(row => {
      let area = 0;
      let status = 'normal';
      let trimmedPortions = null, trimmedTotal = null;

      if (row.directArea !== '') {
        area = Utils.num(row.directArea);
      } else if (row.useSpacing) {
        const totalLen = Utils.num(row.spacing_totalLen);
        const segLen   = Utils.num(row.spacing_segLen);
        const spacing  = Utils.num(row.spacing_spacing);
        const width    = Utils.num(row.spacing_width);
        const count    = (segLen + spacing) > 0 ? Math.floor(totalLen / (segLen + spacing)) : 0;
        area = count * segLen * width;
      } else if (row.staFrom !== '' && row.staTo !== '') {
        const from = Utils.num(row.staFrom);
        const to   = Utils.num(row.staTo);
        let len = 0;

        if (row.excludeFromTrim) {
          len = to - from;
        } else {
          const ev = Utils.evaluateRange(from, to, limits);
          status = ev.status;
          trimmedPortions = ev.trimmedPortions;
          trimmedTotal    = ev.trimmedTotal;
          if (status === 'excluded') { len = 0; }
          else if (status === 'trimmed' && trimmedTotal !== null) { len = trimmedTotal; }
          else { len = to - from; }
        }
        area = status !== 'excluded' ? len * Utils.num(row.width) : 0;
      }

      total += area;
      return { ...row, _computed: Utils.round(area), _status: status,
               _trimmedPortions: trimmedPortions, _trimmedTotal: trimmedTotal };
    });

    let deductTotal = 0;
    const deductions = module.deductions.map(d => {
      const val = Utils.num(d.area);
      deductTotal += val;
      return { ...d, _computed: val };
    });

    const net = Utils.round(total - deductTotal);
    return {
      rows, deductions,
      outputs: [{ label: module.label || 'Area', qty: net, unit: 'm²' }]
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
      outputs: [{ label: module.label || 'Volume', qty: Utils.round(total), unit: 'm³' }]
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
      outputs: [{ label: module.label || 'Count', qty: total, unit }]
    };
  },

  // ── Run all modules ──────────────────────────────────────
  runComponent(component, limits) {
    const results = {};
    for (const mod of component.modules) {
      switch (mod.type) {
        case 'length':  results[mod.id] = this.length(mod, limits);  break;
        case 'area':    results[mod.id] = this.area(mod, limits);    break;
        case 'volume':  results[mod.id] = this.volume(mod);          break;
        case 'count':   results[mod.id] = this.count(mod);           break;
        default:        results[mod.id] = { outputs: [] };           break;
      }
    }
    return results;
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
      { text: '', margin: [0, 16, 0, 0] },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, color: '#2a3548' }] },
      { text: '', margin: [0, 8, 0, 0] },
      { text: `COMPONENT: ${component.name || 'Untitled'}`, style: 'componentTitle' },
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
    const activeTab        = ref('component');
    const activeCompId     = ref(null);
    const showProjectModal = ref(false);
    const showSegmentsPanel = ref(false);
    const toasts           = ref([]);
    const outputTags       = reactive({});
    const unitCosts        = reactive({});
    const tagOrder         = ref([]); // ordered list of tag strings for summary

    // ── Init ─────────────────────────────────────────────
    onMounted(() => {
      const saved = State.loadLatest();
      if (saved) {
        // Migrate old limits format (from/to) to segments array
        if (saved.limits && !Array.isArray(saved.limits.segments)) {
          saved.limits.segments = [{
            id: Utils.uid(),
            from: saved.limits.from || '',
            to:   saved.limits.to   || '',
          }];
          delete saved.limits.from;
          delete saved.limits.to;
        }
        if (!saved.limits) saved.limits = State.limitsDefaults();
        if (!saved.limits.segments || !saved.limits.segments.length)
          saved.limits.segments = [State.newSegment()];
        Object.assign(session, saved);
        if (saved._outputTags) Object.assign(outputTags, saved._outputTags);
        if (saved._unitCosts)  Object.assign(unitCosts, saved._unitCosts);
        if (saved.tagOrder)    tagOrder.value = saved.tagOrder;
        toast('Session restored', 'success');
      } else {
        showProjectModal.value = true;
      }
    });

    // ── Auto-save ────────────────────────────────────────
    let _saveTimer = null;
    function scheduleSave() {
      if (_saveTimer) clearTimeout(_saveTimer);
      _saveTimer = setTimeout(() => {
        session._outputTags = JSON.parse(JSON.stringify(outputTags));
        session._unitCosts  = JSON.parse(JSON.stringify(unitCosts));
        session.tagOrder    = tagOrder.value;
        State.save(session);
      }, 800);
    }
    watch(session,    scheduleSave, { deep: true });
    watch(outputTags, scheduleSave, { deep: true });
    watch(tagOrder,   scheduleSave, { deep: true });

    // ── Active component ─────────────────────────────────
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
      nextTick(() => { const el = document.querySelector('.comp-name-input'); if (el) el.focus(); });
    }

    function deleteComponent(id) {
      const idx = session.components.findIndex(c => c.id === id);
      if (idx === -1) return;
      session.components.splice(idx, 1);
      delete outputTags[id];
      activeCompId.value = session.components.length > 0
        ? session.components[Math.max(0, idx - 1)].id : null;
      toast('Component deleted');
    }

    // ── Module management ────────────────────────────────
    function addModule(comp, type) {
      let mod;
      switch (type) {
        case 'length': mod = State.newLengthModule(); break;
        case 'area':   mod = State.newAreaModule();   break;
        case 'volume': mod = State.newVolumeModule(); break;
        case 'count':  mod = State.newCountModule();  break;
        default: return;
      }
      comp.modules.push(mod);
      comp.lastEdited = Utils.now();
    }

    function deleteModule(comp, modId) {
      const idx = comp.modules.findIndex(m => m.id === modId);
      if (idx > -1) comp.modules.splice(idx, 1);
    }

    // ── Row management ───────────────────────────────────
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

    function addVolComp(mod) { mod.components.push(State.newVolumeComponent()); }
    function deleteVolComp(mod, id) {
      const idx = mod.components.findIndex(c => c.id === id);
      if (idx > -1) mod.components.splice(idx, 1);
    }
    function addVolDeduct(vc) { vc.deductions.push(State.newVolumeDeduction()); }
    function deleteVolDeduct(vc, id) {
      const idx = vc.deductions.findIndex(d => d.id === id);
      if (idx > -1) vc.deductions.splice(idx, 1);
    }
    function addAreaDeduct(mod) { mod.deductions.push(State.newAreaDeduction()); }
    function deleteAreaDeduct(mod, id) {
      const idx = mod.deductions.findIndex(d => d.id === id);
      if (idx > -1) mod.deductions.splice(idx, 1);
    }

    // ── Segments ─────────────────────────────────────────
    function addSegment() {
      if (!Array.isArray(session.limits.segments)) session.limits.segments = [];
      session.limits.segments.push(State.newSegment());
    }
    function deleteSegment(id) {
      const idx = session.limits.segments.findIndex(s => s.id === id);
      if (idx > -1 && session.limits.segments.length > 1)
        session.limits.segments.splice(idx, 1);
    }
    function applyLimits() {
      session.limits.applied = true;
      showSegmentsPanel.value = false;
      toast('Station limits applied', 'success');
    }
    function clearLimits() {
      session.limits.applied = false;
      toast('Station limits cleared');
    }

    const segmentsSummary = computed(() => {
      const segs = Utils.validSegments(session.limits.segments);
      if (!segs.length) return 'No segments';
      return segs.map(s => `${Utils.fmtStation(s.from)}–${Utils.fmtStation(s.to)}`).join(', ');
    });

    // ── Computed results ─────────────────────────────────
    const activeResults = computed(() => {
      if (!activeComp.value) return {};
      return Compute.runComponent(activeComp.value, session.limits);
    });

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

    function getTag(compId, key) { return (outputTags[compId] || {})[key] || ''; }
    function setTag(compId, key, val) {
      if (!outputTags[compId]) outputTags[compId] = {};
      outputTags[compId][key] = val;
      // Add to tagOrder if new
      const tag = val.trim();
      if (tag && !tagOrder.value.includes(tag)) tagOrder.value.push(tag);
    }

    // ── Summary — aggregate by tag ───────────────────────
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

    // Ordered tags for display — respects tagOrder, adds any new ones at end
    const orderedTags = computed(() => {
      const all = Object.keys(tagSummary.value);
      const ordered = tagOrder.value.filter(t => all.includes(t));
      const remaining = all.filter(t => !ordered.includes(t));
      return [...ordered, ...remaining];
    });

    const projectTotal = computed(() => {
      let total = 0;
      for (const [tag, data] of Object.entries(tagSummary.value)) {
        total += data.qty * (parseFloat(unitCosts[tag]) || 0);
      }
      return total;
    });

    // ── Tag drag reorder ─────────────────────────────────
    const dragTag = ref(null);
    function onTagDragStart(tag) { dragTag.value = tag; }
    function onTagDragOver(e) { e.preventDefault(); }
    function onTagDrop(targetTag) {
      if (!dragTag.value || dragTag.value === targetTag) return;
      const arr = [...orderedTags.value];
      const from = arr.indexOf(dragTag.value);
      const to   = arr.indexOf(targetTag);
      if (from === -1 || to === -1) return;
      arr.splice(from, 1);
      arr.splice(to, 0, dragTag.value);
      tagOrder.value = arr;
      dragTag.value = null;
    }

    // ── Project ──────────────────────────────────────────
    function saveProject() {
      showProjectModal.value = false;
      State.save(session);
      toast('Project saved', 'success');
    }

    // ── Save / Load ──────────────────────────────────────
    function exportJSON() {
      session._outputTags = JSON.parse(JSON.stringify(outputTags));
      session._unitCosts  = JSON.parse(JSON.stringify(unitCosts));
      session.tagOrder    = tagOrder.value;
      State.exportJSON(session);
      toast('Checkpoint exported', 'success');
    }

    function triggerImport() { document.getElementById('import-file-input').click(); }
    function onImport(e) {
      const file = e.target.files[0];
      if (!file) return;
      State.importJSON(file, (err, loaded) => {
        if (err) { toast(err, 'error'); return; }
        Object.assign(session, loaded);
        if (loaded._outputTags) Object.assign(outputTags, loaded._outputTags);
        if (loaded._unitCosts)  Object.assign(unitCosts, loaded._unitCosts);
        if (loaded.tagOrder)    tagOrder.value = loaded.tagOrder;
        toast('Session loaded', 'success');
      });
      e.target.value = '';
    }

    // ── PDF ──────────────────────────────────────────────
    function exportPDF() {
      if (session.components.length === 0) { toast('No components to export', 'warn'); return; }
      toast('Preparing PDF...', '');
      const compsForPDF = session.components.map(c => ({ ...c, _outputTags: outputTags[c.id] || {} }));
      window._loadPdfmake(() => {
        try {
          PDF.export(session, compsForPDF, tagSummary.value, orderedTags.value);
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

    const fmtSta  = Utils.fmtStation.bind(Utils);
    const fmtNum  = Utils.fmtNum.bind(Utils);
    const fmtTP   = Utils.fmtTrimmedPortions.bind(Utils);
    const MODULE_LABELS = Utils.MODULE_LABELS;
    const UNITS   = Utils.UNITS;

    return {
      session, activeTab, activeCompId, activeComp, activeResults,
      activeOutputs, showProjectModal, showSegmentsPanel,
      toasts, outputTags, unitCosts, tagOrder, orderedTags,
      tagSummary, projectTotal, segmentsSummary,
      dragTag,
      selectComp, addComponent, deleteComponent,
      addModule, deleteModule,
      addRow, deleteRow,
      addVolComp, deleteVolComp, addVolDeduct, deleteVolDeduct,
      addAreaDeduct, deleteAreaDeduct,
      addSegment, deleteSegment, applyLimits, clearLimits,
      getTag, setTag,
      onTagDragStart, onTagDragOver, onTagDrop,
      saveProject, exportJSON, triggerImport, onImport, exportPDF,
      toast, fmtSta, fmtNum, fmtTP, MODULE_LABELS, UNITS,
    };
  },

  template: `
<div id="app">

  <!-- ── Topbar ─────────────────────────────────────────── -->
  <div class="topbar">
    <a href="../index.html" class="topbar-back">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 3L5 8l5 5"/></svg>
      FA Work Tools
    </a>
    <div class="topbar-divider"></div>
    <div class="topbar-logo">FA</div>
    <div class="topbar-title">QTO Backup Computation</div>
    <div class="topbar-divider"></div>

    <!-- Segments control -->
    <div style="position:relative; flex-shrink:0;">
      <button class="btn btn-ghost btn-sm" @click="showSegmentsPanel = !showSegmentsPanel"
        :style="session.limits.applied ? 'color:var(--warn);border-color:rgba(243,156,18,0.4);' : ''">
        ⊙ Segments
        <span v-if="session.limits.applied" style="font-size:10px; margin-left:4px; color:var(--warn);">● Active</span>
      </button>

      <!-- Segments dropdown panel -->
      <div v-if="showSegmentsPanel" class="segments-panel">
        <div class="segments-panel-header">
          <span class="segments-panel-title">Station Segments</span>
          <button class="btn-close" @click="showSegmentsPanel = false">✕</button>
        </div>
        <div class="segments-list">
          <div v-for="seg in session.limits.segments" :key="seg.id" class="segment-row">
            <input class="sta-input" v-model="seg.from" placeholder="From">
            <span class="dim" style="font-size:12px;">—</span>
            <input class="sta-input" v-model="seg.to" placeholder="To">
            <button class="btn btn-icon btn-sm" @click="deleteSegment(seg.id)"
              :disabled="session.limits.segments.length <= 1">✕</button>
          </div>
        </div>
        <button class="add-row-btn" style="margin:4px 0 8px;" @click="addSegment">+ segment</button>
        <div style="display:flex; align-items:center; gap:8px; padding-top:8px; border-top:1px solid var(--border);">
          <label class="toggle-label">
            <input type="checkbox" v-model="session.limits.autoTrim"> Auto-trim
          </label>
          <div style="flex:1;"></div>
          <button v-if="session.limits.applied" class="btn btn-ghost btn-sm" @click="clearLimits">Clear</button>
          <button class="btn btn-primary btn-sm" @click="applyLimits">Apply</button>
        </div>
        <div v-if="session.limits.applied" class="segments-summary-text">
          {{ segmentsSummary }}
        </div>
      </div>
    </div>

    <div class="topbar-spacer"></div>

    <div class="topbar-actions">
      <button class="btn btn-ghost btn-sm" @click="showProjectModal = true">⚙ Project</button>
      <button class="btn btn-ghost btn-sm" @click="exportJSON">↓ Save</button>
      <button class="btn btn-ghost btn-sm" @click="triggerImport">↑ Load</button>
      <button class="btn btn-primary btn-sm" @click="exportPDF">⬡ PDF</button>
      <input type="file" id="import-file-input" accept=".json" @change="onImport">
    </div>
  </div>

  <!-- ── Main body ─────────────────────────────────────── -->
  <div class="main-body">

    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>Components</h3>
        <button class="btn btn-accent-ghost btn-sm" @click="addComponent">+ Add</button>
      </div>
      <div class="sidebar-list">
        <div v-if="session.components.length === 0" class="sidebar-empty">
          No components yet.<br>Click + Add to start.
        </div>
        <div v-for="comp in session.components" :key="comp.id"
          class="sidebar-item" :class="{ active: activeCompId === comp.id }"
          @click="selectComp(comp.id)">
          <div class="sidebar-item-name">{{ comp.name || 'Untitled' }}</div>
        </div>
      </div>
    </div>

    <!-- Workspace -->
    <div class="workspace">

      <!-- Tab bar -->
      <div class="tabbar">
        <button class="tab-btn" :class="{ active: activeTab === 'component' }" @click="activeTab = 'component'">Component</button>
        <button class="tab-btn" :class="{ active: activeTab === 'summary' }"   @click="activeTab = 'summary'">Summary</button>
        <button class="tab-btn" :class="{ active: activeTab === 'schedules' }" @click="activeTab = 'schedules'">Schedules</button>
        <button class="tab-btn" :class="{ active: activeTab === 'qtysheets' }" @click="activeTab = 'qtysheets'">Qty Sheets</button>
      </div>

      <!-- ── Component Tab ─────────────────────────────── -->
      <div v-if="activeTab === 'component'" class="tab-content">

        <div v-if="!activeComp" class="empty-state">
          <div class="empty-icon">📐</div>
          <div class="empty-title">No component selected</div>
          <div class="empty-desc">Select a component from the sidebar or click + Add to create one.</div>
        </div>

        <template v-else>
          <!-- Component header -->
          <div class="comp-header">
            <div style="flex:1; min-width:0;">
              <input class="comp-name-input bc" v-model="activeComp.name" placeholder="Component name...">
              <div class="comp-meta">
                {{ activeComp.modules.length }} module{{ activeComp.modules.length !== 1 ? 's' : '' }}
                · {{ activeComp.lastEdited ? new Date(activeComp.lastEdited).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '' }}
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="btn btn-ghost btn-sm" @click="activeComp.showNote = !activeComp.showNote">
                {{ activeComp.showNote ? '− Note' : '+ Note' }}
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteComponent(activeComp.id)">Delete</button>
            </div>
          </div>

          <textarea v-if="activeComp.showNote" class="comp-note-area"
            v-model="activeComp.note" placeholder="Notes, references, assumptions..."></textarea>

          <!-- Add module bar -->
          <div class="add-module-bar">
            <span class="add-module-label">+ Module:</span>
            <button class="module-type-btn" v-for="type in ['length','area','volume','count']" :key="type"
              @click="addModule(activeComp, type)">{{ MODULE_LABELS[type] }}</button>
            <span class="dim" style="font-size:11px; font-family:'Barlow Condensed',sans-serif;">
              Rebar · Direct · Earthworks · Cross Drain · Signs · Guardrails · Markings — Phase 2
            </span>
          </div>

          <!-- Modules -->
          <div v-for="mod in activeComp.modules" :key="mod.id" class="module-block">
            <div class="module-block-header">
              <span class="module-type-badge">{{ MODULE_LABELS[mod.type] || mod.type }}</span>
              <input v-if="mod.showLabel" class="module-label-input" v-model="mod.label" placeholder="Label...">
              <span v-else class="dim" style="font-size:12px; flex:1; font-family:'Barlow Condensed',sans-serif; padding-left:6px;">{{ mod.label }}</span>
              <button class="toggle-btn" @click="mod.showLabel = !mod.showLabel" style="margin-right:8px;">
                {{ mod.showLabel ? 'hide label' : 'label' }}
              </button>
              <span class="module-result-inline" v-if="activeResults[mod.id]">
                <template v-for="(out, i) in activeResults[mod.id].outputs" :key="i">
                  <span>{{ fmtNum(out.qty) }}</span> {{ out.unit }}
                  <span v-if="i < activeResults[mod.id].outputs.length - 1">, </span>
                </template>
              </span>
              <button class="btn btn-danger btn-sm" style="margin-left:8px;" @click="deleteModule(activeComp, mod.id)">✕</button>
            </div>

            <div class="module-body">

              <!-- LENGTH MODULE -->
              <template v-if="mod.type === 'length'">
                <table class="data-table">
                  <thead><tr>
                    <th style="width:95px;">Sta. From</th>
                    <th style="width:95px;">Sta. To</th>
                    <th style="width:85px;" class="right">Length (lm)</th>
                    <th>Reference</th>
                    <th style="width:30px;" title="Exclude from trim">Ex.</th>
                    <th style="width:90px;">Status</th>
                    <th style="width:28px;"></th>
                  </tr></thead>
                  <tbody>
                    <template v-for="row in mod.rows" :key="row.id">
                      <tr :class="{ 'row-excluded': row._status==='excluded', 'row-trimmed': row._status==='trimmed', 'row-flagged': row._status==='flagged' }">
                        <td><input class="cell-input" v-model="row.staFrom" placeholder="0"></td>
                        <td><input class="cell-input" v-model="row.staTo" placeholder="0"></td>
                        <td>
                          <div class="cell-computed" v-if="activeResults[mod.id]">
                            {{ fmtNum(activeResults[mod.id].rows?.find(r=>r.id===row.id)?._computed ?? 0) }}
                          </div>
                        </td>
                        <td><input class="cell-input" v-model="row.ref" placeholder="Ref..."></td>
                        <td style="text-align:center;">
                          <input type="checkbox" v-model="row.excludeFromTrim" title="Exclude this row from trim" style="accent-color:var(--accent); cursor:pointer;">
                        </td>
                        <td>
                          <div v-if="!row.excludeFromTrim">
                            <span v-if="row._status==='trimmed'" class="status-flag flag-trimmed trim-expandable"
                              @click="row._expanded = !row._expanded">
                              Trimmed {{ row._expanded ? '▲' : '▼' }}
                            </span>
                            <span v-else-if="row._status==='flagged'" class="status-flag flag-flagged trim-expandable"
                              @click="row._expanded = !row._expanded">
                              ⚠ Review {{ row._expanded ? '▲' : '▼' }}
                            </span>
                            <span v-else-if="row._status==='excluded'" class="status-flag flag-excluded">Excluded</span>
                          </div>
                          <span v-else class="dim" style="font-size:11px;">—</span>
                        </td>
                        <td><button class="btn btn-icon btn-sm" @click="deleteRow(mod, row.id)">✕</button></td>
                      </tr>
                      <!-- Trim detail row -->
                      <tr v-if="row._expanded && (row._status==='trimmed' || row._status==='flagged')" class="trim-detail-row">
                        <td colspan="7">
                          <div class="trim-detail">
                            <div class="trim-detail-line">
                              <span class="trim-label">Original:</span>
                              <span class="trim-value">{{ fmtSta(row.staFrom) }} — {{ fmtSta(row.staTo) }}
                                ({{ fmtNum(Utils.num(row.staTo) - Utils.num(row.staFrom)) }} lm)</span>
                            </div>
                            <div class="trim-detail-line" v-if="row._trimmedPortions && row._trimmedPortions.length">
                              <span class="trim-label">{{ row._status==='trimmed' ? 'Trimmed:' : 'Would trim:' }}</span>
                              <span class="trim-value accent">{{ fmtTP(row._trimmedPortions) }}
                                = {{ fmtNum(row._trimmedTotal) }} lm</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                    <tr class="total-row">
                      <td colspan="2" style="color:var(--text3); font-size:12px;">TOTAL</td>
                      <td style="text-align:right; color:var(--accent);">
                        {{ activeResults[mod.id] ? fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0) : '—' }}
                      </td>
                      <td colspan="4"><span class="dim" style="font-size:12px;">lm</span></td>
                    </tr>
                  </tbody>
                </table>
                <button class="add-row-btn" @click="addRow(mod)">+ row</button>
              </template>

              <!-- AREA MODULE -->
              <template v-if="mod.type === 'area'">
                <table class="data-table">
                  <thead><tr>
                    <th>Description</th>
                    <th style="width:90px;">Sta. From</th>
                    <th style="width:90px;">Sta. To</th>
                    <th style="width:65px;">W (m)</th>
                    <th style="width:65px;">Thk (m)</th>
                    <th style="width:75px;">Direct m²</th>
                    <th style="width:80px;" class="right">Area (m²)</th>
                    <th>Ref</th>
                    <th style="width:30px;" title="Exclude from trim">Ex.</th>
                    <th style="width:28px;"></th>
                  </tr></thead>
                  <tbody>
                    <template v-for="row in mod.rows" :key="row.id">
                      <tr>
                        <td><input class="cell-input" v-model="row.description" placeholder="e.g. Main Lane"></td>
                        <td><input class="cell-input" v-model="row.staFrom" placeholder="0"></td>
                        <td><input class="cell-input" v-model="row.staTo" placeholder="0"></td>
                        <td><input class="cell-input right" v-model="row.width" placeholder="0"></td>
                        <td><input class="cell-input right" v-model="row.thickness" placeholder="ref"></td>
                        <td><input class="cell-input right" v-model="row.directArea" placeholder="override"></td>
                        <td>
                          <div class="cell-computed" v-if="activeResults[mod.id]">
                            {{ fmtNum(activeResults[mod.id].rows?.find(r=>r.id===row.id)?._computed ?? 0) }}
                          </div>
                        </td>
                        <td><input class="cell-input" v-model="row.ref" placeholder="Ref..."></td>
                        <td style="text-align:center;">
                          <input type="checkbox" v-model="row.excludeFromTrim" style="accent-color:var(--accent); cursor:pointer;">
                        </td>
                        <td><button class="btn btn-icon btn-sm" @click="deleteRow(mod, row.id)">✕</button></td>
                      </tr>
                      <!-- Trim detail -->
                      <tr v-if="row._expanded && (row._status==='trimmed'||row._status==='flagged')" class="trim-detail-row">
                        <td colspan="10">
                          <div class="trim-detail">
                            <div class="trim-detail-line">
                              <span class="trim-label">Original:</span>
                              <span class="trim-value">{{ fmtSta(row.staFrom) }} — {{ fmtSta(row.staTo) }}</span>
                            </div>
                            <div class="trim-detail-line" v-if="row._trimmedPortions && row._trimmedPortions.length">
                              <span class="trim-label">Trimmed:</span>
                              <span class="trim-value accent">{{ fmtTP(row._trimmedPortions) }} = {{ fmtNum(row._trimmedTotal) }} lm</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                    <tr class="total-row">
                      <td colspan="6" style="color:var(--text3); font-size:12px;">NET AREA</td>
                      <td style="text-align:right; color:var(--accent);">
                        {{ activeResults[mod.id] ? fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0) : '—' }}
                      </td>
                      <td colspan="3"></td>
                    </tr>
                  </tbody>
                </table>
                <button class="add-row-btn" @click="addRow(mod)">+ row</button>
                <div class="sub-section" style="margin-top:10px;">
                  <div class="sub-label">Deductions (−)</div>
                  <div v-for="d in mod.deductions" :key="d.id" class="deduct-row">
                    <input class="cell-input" v-model="d.description" placeholder="Description" style="flex:1;">
                    <input class="cell-input right" v-model="d.area" placeholder="m²" style="width:80px;">
                    <button class="btn btn-icon btn-sm" @click="deleteAreaDeduct(mod, d.id)">✕</button>
                  </div>
                  <button class="add-row-btn" @click="addAreaDeduct(mod)">+ deduction</button>
                </div>
              </template>

              <!-- VOLUME MODULE -->
              <template v-if="mod.type === 'volume'">
                <div v-for="vc in mod.components" :key="vc.id" class="vol-component-block">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                    <input class="cell-input" v-model="vc.name" placeholder="Component name (e.g. Footing)"
                      style="flex:1; font-family:'Barlow Condensed',sans-serif; font-weight:600; font-size:14px;">
                    <button class="btn btn-danger btn-sm" @click="deleteVolComp(mod, vc.id)">✕</button>
                  </div>
                  <div class="method-toggle">
                    <button class="method-btn" :class="{active: vc.method==='dimensional'}" @click="vc.method='dimensional'">L × W × H × n</button>
                    <button class="method-btn" :class="{active: vc.method==='area'}"        @click="vc.method='area'">Area × Length</button>
                  </div>
                  <div v-if="vc.method==='dimensional'" class="dim-grid">
                    <div class="dim-field"><label>L (m)</label><input class="cell-input right" v-model="vc.L" placeholder="0"></div>
                    <div class="dim-field"><label>W (m)</label><input class="cell-input right" v-model="vc.W" placeholder="0"></div>
                    <div class="dim-field"><label>H (m)</label><input class="cell-input right" v-model="vc.H" placeholder="0"></div>
                    <div class="dim-field"><label>Count</label><input class="cell-input right" v-model="vc.count" placeholder="1"></div>
                  </div>
                  <div v-else style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                    <div class="dim-field"><label>Cross-section Area (m²)</label><input class="cell-input right" v-model="vc.csArea" placeholder="0"></div>
                    <div class="dim-field"><label>Length (m)</label><input class="cell-input right" v-model="vc.length" placeholder="0"></div>
                  </div>
                  <div v-if="activeResults[mod.id]" style="font-size:13px; color:var(--text2); margin-bottom:6px; font-family:'Barlow Condensed',sans-serif;">
                    Gross: <span>{{ fmtNum(activeResults[mod.id].components?.find(c=>c.id===vc.id)?._gross ?? 0) }} m³</span>
                  </div>
                  <div class="sub-section">
                    <div class="sub-label">Deductions (−)</div>
                    <div v-for="d in vc.deductions" :key="d.id" class="deduct-row">
                      <div class="dim-grid" style="flex:1;">
                        <div class="dim-field"><label>L</label><input class="cell-input right" v-model="d.L" placeholder="0"></div>
                        <div class="dim-field"><label>W</label><input class="cell-input right" v-model="d.W" placeholder="0"></div>
                        <div class="dim-field"><label>H</label><input class="cell-input right" v-model="d.H" placeholder="0"></div>
                        <div class="dim-field"><label>n</label><input class="cell-input right" v-model="d.count" placeholder="1"></div>
                      </div>
                      <button class="btn btn-icon btn-sm" @click="deleteVolDeduct(vc, d.id)">✕</button>
                    </div>
                    <button class="add-row-btn" @click="addVolDeduct(vc)">+ deduction</button>
                  </div>
                  <div v-if="activeResults[mod.id]" style="text-align:right; margin-top:6px;">
                    <span class="dim" style="font-size:12px;">Net: </span>
                    <span style="font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:16px; color:var(--text);">
                      {{ fmtNum(activeResults[mod.id].components?.find(c=>c.id===vc.id)?._net ?? 0) }} m³
                    </span>
                  </div>
                </div>
                <button class="add-row-btn" @click="addVolComp(mod)">+ component</button>
                <div v-if="activeResults[mod.id]" style="display:flex; justify-content:flex-end; margin-top:10px; gap:8px; align-items:baseline; border-top:1px solid var(--border2); padding-top:8px;">
                  <span class="dim" style="font-size:12px;">TOTAL VOLUME</span>
                  <span style="font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:700; color:var(--accent);">
                    {{ fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0) }}
                  </span>
                  <span class="dim" style="font-size:13px;">m³</span>
                </div>
              </template>

              <!-- COUNT MODULE -->
              <template v-if="mod.type === 'count'">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                  <span class="dim" style="font-size:13px; font-family:'Barlow Condensed',sans-serif;">Unit:</span>
                  <select class="cell-select" v-model="mod.unit">
                    <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
                  </select>
                  <input v-if="mod.unit === 'custom'" class="cell-input" v-model="mod.customUnit" placeholder="Custom unit..." style="width:120px;">
                </div>
                <table class="data-table">
                  <thead><tr>
                    <th>Description</th>
                    <th style="width:130px;">Location</th>
                    <th style="width:80px;" class="right">Qty</th>
                    <th>Reference</th>
                    <th style="width:28px;"></th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="row in mod.rows" :key="row.id">
                      <td><input class="cell-input" v-model="row.description" placeholder="Item description..."></td>
                      <td><input class="cell-input" v-model="row.location" placeholder="Station / zone..."></td>
                      <td><input class="cell-input right" v-model="row.qty" placeholder="0"></td>
                      <td><input class="cell-input" v-model="row.ref" placeholder="Sheet ref..."></td>
                      <td><button class="btn btn-icon btn-sm" @click="deleteRow(mod, row.id)">✕</button></td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="2" style="color:var(--text3); font-size:12px;">TOTAL</td>
                      <td style="text-align:right; color:var(--accent); font-family:'Barlow Condensed',sans-serif;">
                        {{ activeResults[mod.id] ? fmtNum(activeResults[mod.id].outputs[0]?.qty ?? 0, 0) : '—' }}
                      </td>
                      <td colspan="2"><span class="dim" style="font-size:12px;">{{ mod.unit === 'custom' ? mod.customUnit : mod.unit }}</span></td>
                    </tr>
                  </tbody>
                </table>
                <button class="add-row-btn" @click="addRow(mod)">+ row</button>
              </template>

            </div>
          </div>

          <!-- Outputs Summary -->
          <div class="outputs-summary" v-if="activeOutputs.length > 0">
            <div class="outputs-summary-title">Outputs — Tag Assignment</div>
            <table class="data-table">
              <thead><tr>
                <th>Output</th>
                <th style="width:95px;" class="right">Qty</th>
                <th style="width:55px;">Unit</th>
                <th style="width:230px;">Tag (Pay Item)</th>
              </tr></thead>
              <tbody>
                <tr v-for="out in activeOutputs" :key="out.key">
                  <td style="color:var(--text2);">{{ out.label }}</td>
                  <td class="right" style="font-family:'Barlow Condensed',sans-serif; font-weight:600; color:var(--accent); font-size:14px;">
                    {{ fmtNum(out.qty) }}
                  </td>
                  <td style="color:var(--text3); font-family:'Barlow Condensed',sans-serif; font-size:14px;">{{ out.unit }}</td>
                  <td>
                    <input class="tag-input"
                      :value="getTag(activeComp.id, out.key)"
                      @input="setTag(activeComp.id, out.key, $event.target.value)"
                      placeholder="Type pay item tag...">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </template>
      </div>

      <!-- ── Summary Tab ────────────────────────────────── -->
      <div v-if="activeTab === 'summary'" class="tab-content">

        <div class="summary-section">
          <div class="summary-section-title">All Components</div>
          <div v-if="session.components.length === 0" class="dim" style="font-size:13px;">No components yet.</div>
          <table v-else class="tag-table">
            <thead><tr>
              <th>Component</th><th>Modules</th><th>Last Edited</th><th></th>
            </tr></thead>
            <tbody>
              <tr v-for="comp in session.components" :key="comp.id">
                <td>{{ comp.name || 'Untitled' }}</td>
                <td class="dim">{{ comp.modules.length }}</td>
                <td class="dim" style="font-size:12px;">
                  {{ comp.lastEdited ? new Date(comp.lastEdited).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—' }}
                </td>
                <td><button class="btn btn-ghost btn-sm" @click="selectComp(comp.id)">Open</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="summary-section">
          <div class="summary-section-title">Master Quantity List
            <span class="dim" style="font-size:11px; font-weight:400; margin-left:8px;">drag rows to reorder</span>
          </div>
          <div v-if="orderedTags.length === 0" class="dim" style="font-size:13px;">
            No tagged outputs yet. Assign tags in the Outputs Summary of each component.
          </div>
          <table v-else class="tag-table">
            <thead><tr>
              <th style="width:24px;"></th>
              <th>Tag / Pay Item</th>
              <th class="right">Total Qty</th>
              <th>Unit</th>
              <th class="right">Unit Cost (₱)</th>
              <th class="right">Total Cost (₱)</th>
            </tr></thead>
            <tbody>
              <tr v-for="tag in orderedTags" :key="tag"
                draggable="true"
                @dragstart="onTagDragStart(tag)"
                @dragover="onTagDragOver"
                @drop="onTagDrop(tag)"
                :class="{ 'drag-over': dragTag === tag }"
                style="cursor:grab;">
                <td style="color:var(--text3); font-size:13px; text-align:center; user-select:none;">⠿</td>
                <td>
                  {{ tag }}
                  <span v-if="tagSummary[tag]?.conflict" class="conflict-badge" style="margin-left:6px;">Unit Conflict</span>
                </td>
                <td class="right" style="font-family:'Barlow Condensed',sans-serif; font-weight:700; color:var(--accent); font-size:15px;">
                  {{ fmtNum(tagSummary[tag]?.qty ?? 0) }}
                </td>
                <td style="font-family:'Barlow Condensed',sans-serif; color:var(--text2); font-size:14px;">{{ tagSummary[tag]?.unit }}</td>
                <td class="right">
                  <input class="cost-input" v-model="unitCosts[tag]" placeholder="0.00" type="number" min="0">
                </td>
                <td class="right" style="font-family:'Barlow Condensed',sans-serif; font-size:14px;">
                  {{ fmtNum((tagSummary[tag]?.qty ?? 0) * (parseFloat(unitCosts[tag]) || 0)) }}
                </td>
              </tr>
              <tr class="tag-total">
                <td></td>
                <td colspan="3" style="text-align:right; color:var(--text3); font-size:12px;">PROJECT TOTAL</td>
                <td class="right" style="color:var(--accent);">{{ fmtNum(projectTotal) }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <div class="dim" style="font-size:11px; margin-top:8px; font-family:'Barlow Condensed',sans-serif;">
            ⚠ Costs are for estimator reference only — not included in PDF export.
          </div>
        </div>
      </div>

      <!-- Schedules / Qty Sheets placeholders -->
      <div v-if="activeTab === 'schedules'" class="tab-content">
        <div class="placeholder-tab">
          <div class="ph-icon">📋</div>
          <div class="ph-title">Schedules</div>
          <div class="ph-desc">Schedule generation — Phase 2.</div>
        </div>
      </div>
      <div v-if="activeTab === 'qtysheets'" class="tab-content">
        <div class="placeholder-tab">
          <div class="ph-icon">📊</div>
          <div class="ph-title">Qty Sheets</div>
          <div class="ph-desc">CSV quantity sheet import — Phase 2.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- Project Modal -->
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

  <!-- Toasts -->
  <div class="toast-wrap">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.msg }}</div>
  </div>

</div>
  `,
}).mount('#app');
