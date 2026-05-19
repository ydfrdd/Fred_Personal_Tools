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
