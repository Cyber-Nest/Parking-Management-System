"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportExportService = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const commonErrors_1 = require("./commonErrors");
const sanitizeSheetName = (name) => {
    const cleaned = name.replace(/[:\\/?*[\]]/g, '_').slice(0, 31);
    return cleaned || 'Sheet';
};
const cellString = (value) => {
    if (value === null || value === undefined)
        return '';
    if (value instanceof Date)
        return value.toISOString();
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'boolean')
        return value ? 'true' : 'false';
    if (typeof value === 'object')
        return JSON.stringify(value);
    return String(value);
};
const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);
const tableFromArray = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0)
        return null;
    const first = rows[0];
    if (!isPlainObject(first))
        return null;
    const headers = Object.keys(first);
    const body = rows.map((row) => {
        if (!isPlainObject(row))
            return headers.map(() => '');
        return headers.map((h) => cellString(row[h]));
    });
    return { headers, body };
};
const PDF_TABLE_ROW_CAP = 200;
const ensureVerticalSpace = (doc, y, need) => {
    const bottom = doc.page.height - doc.page.margins.bottom;
    if (y + need <= bottom)
        return y;
    doc.addPage();
    return doc.page.margins.top;
};
const appendArrayTablePdf = (doc, title, rows) => {
    const table = tableFromArray(rows);
    if (!table) {
        doc.fontSize(10).text(`${title}: (no tabular data)`);
        doc.moveDown(0.5);
        return;
    }
    const left = doc.page.margins.left;
    const usable = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    let y = doc.y;
    y = ensureVerticalSpace(doc, y, 28);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#111111').text(title.replace(/_/g, ' '), left, y, {
        width: usable,
        underline: true,
    });
    y += 18;
    const { headers, body } = table;
    const capped = body.slice(0, PDF_TABLE_ROW_CAP);
    const colCount = Math.max(1, headers.length);
    const colW = usable / colCount;
    const pad = 5;
    const headerH = 22;
    y = ensureVerticalSpace(doc, y, headerH + 8);
    doc.save();
    doc.rect(left, y, usable, headerH).fill('#e5e7eb');
    doc.restore();
    doc.strokeColor('#94a3b8').lineWidth(0.4).rect(left, y, usable, headerH).stroke();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#0f172a');
    for (let c = 0; c < colCount; c += 1) {
        const x = left + c * colW;
        doc.strokeColor('#94a3b8').rect(x, y, colW, headerH).stroke();
        doc.text(String(headers[c] ?? ''), x + pad, y + 6, {
            width: colW - pad * 2,
            ellipsis: true,
        });
    }
    y += headerH;
    doc.font('Helvetica').fontSize(7.5).fillColor('#111111');
    const rowH = 22;
    for (let r = 0; r < capped.length; r += 1) {
        y = ensureVerticalSpace(doc, y, rowH + 4);
        if (r % 2 === 0) {
            doc.save();
            doc.rect(left, y, usable, rowH).fill('#f8fafc');
            doc.restore();
        }
        const row = capped[r];
        for (let c = 0; c < colCount; c += 1) {
            const x = left + c * colW;
            doc.strokeColor('#e2e8f0').rect(x, y, colW, rowH).stroke();
            const raw = String(row[c] ?? '');
            const cell = raw.length > 1200 ? `${raw.slice(0, 1200)}…` : raw;
            doc.text(cell, x + pad, y + 4, {
                width: colW - pad * 2,
                height: rowH - 8,
                ellipsis: true,
            });
        }
        y += rowH;
    }
    if (body.length > PDF_TABLE_ROW_CAP) {
        y = ensureVerticalSpace(doc, y, 16);
        doc.font('Helvetica').fontSize(8).fillColor('#64748b').text(`… ${body.length - PDF_TABLE_ROW_CAP} more rows not shown (export row cap)`, left, y);
        y += 14;
    }
    doc.fillColor('#000000');
    doc.y = y + 10;
};
const appendObjectPdf = (doc, title, obj) => {
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#111111').text(title.replace(/_/g, ' '), { underline: true });
    doc.moveDown(0.35);
    const flushScalars = (rows) => {
        if (!rows.length)
            return;
        appendArrayTablePdf(doc, `${title} — fields`, rows);
    };
    const scalarRows = [];
    Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v)) {
            flushScalars(scalarRows.splice(0, scalarRows.length));
            doc.moveDown(0.2);
            appendArrayTablePdf(doc, k, v);
        }
        else if (isPlainObject(v)) {
            flushScalars(scalarRows.splice(0, scalarRows.length));
            doc.moveDown(0.2);
            appendObjectPdf(doc, k, v);
        }
        else {
            scalarRows.push({ field: k, value: cellString(v) });
        }
    });
    flushScalars(scalarRows);
    doc.moveDown(0.25);
};
const walkDataPdf = (doc, data) => {
    if (data === null || data === undefined) {
        doc.text('No data');
        return;
    }
    if (Array.isArray(data)) {
        appendArrayTablePdf(doc, 'Rows', data);
        return;
    }
    if (isPlainObject(data)) {
        const obj = data;
        const scalarRows = [];
        const flushScalars = () => {
            if (!scalarRows.length)
                return;
            appendArrayTablePdf(doc, 'Summary', scalarRows);
            scalarRows.length = 0;
        };
        Object.entries(obj).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length && isPlainObject(value[0])) {
                flushScalars();
                appendArrayTablePdf(doc, key, value);
            }
            else if (isPlainObject(value)) {
                flushScalars();
                appendObjectPdf(doc, key, value);
            }
            else {
                scalarRows.push({ field: key, value: cellString(value) });
            }
        });
        flushScalars();
        return;
    }
    doc.fontSize(10).text(cellString(data));
};
const buildPdf = async (reportType, data) => new Promise((resolve, reject) => {
    const doc = new pdfkit_1.default({ margin: 48, size: 'LETTER' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(16).text(`Parking Management — ${reportType.replace(/-/g, ' ')}`, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#555').text(`Generated: ${new Date().toISOString()}`);
    doc.fillColor('#000');
    doc.moveDown();
    walkDataPdf(doc, data);
    doc.end();
});
const addSheetFromRows = (workbook, sheetName, rows) => {
    const table = tableFromArray(rows);
    const sheet = workbook.addWorksheet(sanitizeSheetName(sheetName));
    if (!table) {
        sheet.addRow(['(empty or non-object rows)']);
        return;
    }
    sheet.addRow(table.headers);
    const header = sheet.getRow(1);
    header.font = { bold: true };
    table.body.forEach((r) => sheet.addRow(r));
    sheet.columns.forEach((col) => {
        const column = col;
        let max = 10;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
            const len = cell.value ? String(cell.value).length : 0;
            if (len > max)
                max = Math.min(len, 40);
        });
        column.width = max + 2;
    });
};
const addKeyValueSheet = (workbook, sheetName, obj) => {
    const sheet = workbook.addWorksheet(sanitizeSheetName(sheetName));
    sheet.addRow(['Field', 'Value']);
    sheet.getRow(1).font = { bold: true };
    Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v) || isPlainObject(v))
            return;
        sheet.addRow([k, cellString(v)]);
    });
};
const buildExcel = async (reportType, data) => {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = 'Parking Management';
    workbook.created = new Date();
    const meta = workbook.addWorksheet('Info');
    meta.addRow(['Report', reportType]);
    meta.addRow(['Generated', new Date().toISOString()]);
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length && isPlainObject(value[0])) {
                addSheetFromRows(workbook, key, value);
            }
            else if (isPlainObject(value)) {
                addKeyValueSheet(workbook, `${key}_summary`, value);
            }
        });
    }
    else if (Array.isArray(data)) {
        addSheetFromRows(workbook, 'data', data);
    }
    else {
        const s = workbook.addWorksheet('data');
        s.addRow([cellString(data)]);
    }
    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
};
class ReportExportService {
    async buildBuffer(reportType, format, data) {
        const fmt = format.toLowerCase();
        if (fmt !== 'pdf' && fmt !== 'excel') {
            throw new commonErrors_1.BadRequestError('format must be pdf or excel');
        }
        if (fmt === 'pdf') {
            const buffer = await buildPdf(reportType, data);
            return { buffer, mime: 'application/pdf', ext: 'pdf' };
        }
        const buffer = await buildExcel(reportType, data);
        return {
            buffer,
            mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ext: 'xlsx',
        };
    }
}
exports.ReportExportService = ReportExportService;
//# sourceMappingURL=reportExport.service.js.map