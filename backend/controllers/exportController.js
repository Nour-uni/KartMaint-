const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Kart = require('../models/Kart');

async function exportPdf(req, res) {
  const karts = await Kart.findAll({ order: [['kartNumber', 'ASC']] });

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="kartmaint-fleet-report.pdf"');
  doc.pipe(res);

  doc.fontSize(18).text('KartMaint — Fleet Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  karts.forEach((kart) => {
    doc
      .fontSize(12)
      .text(`Kart #${kart.kartNumber} — ${kart.status.replace('_', ' ').toUpperCase()}`);
    if (kart.reportedIssue) {
      doc.fontSize(10).fillColor('gray').text(`Issue: ${kart.reportedIssue}`);
      doc.fillColor('black');
    }
    doc.moveDown(0.5);
  });

  doc.end();
}

async function exportExcel(req, res) {
  const karts = await Kart.findAll({ order: [['kartNumber', 'ASC']] });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Fleet');

  sheet.columns = [
    { header: 'Kart Number', key: 'kartNumber', width: 15 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Reported Issue', key: 'reportedIssue', width: 30 },
    { header: 'Last Updated', key: 'updatedAt', width: 22 },
  ];

  karts.forEach((kart) => {
    sheet.addRow({
      kartNumber: kart.kartNumber,
      status: kart.status,
      reportedIssue: kart.reportedIssue || '',
      updatedAt: kart.updatedAt,
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="kartmaint-fleet-report.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportPdf, exportExcel };