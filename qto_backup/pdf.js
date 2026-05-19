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
