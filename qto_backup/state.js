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
