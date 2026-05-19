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
