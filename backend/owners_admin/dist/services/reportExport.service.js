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
const appendArrayTablePdf = (doc, title, rows) => {
    const table = tableFromArray(rows);
    if (!table) {
        doc.fontSize(10).text(`${title}: (no tabular data)`);
        doc.moveDown(0.5);
        return;
    }
    doc.fontSize(12).text(title, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9).text(table.headers.join('  |  '), { continued: false });
    doc.moveDown(0.2);
    const limit = 80;
    for (let i = 0; i < Math.min(table.body.length, limit); i += 1) {
        doc.text(table.body[i].join('  |  '));
    }
    if (table.body.length > limit) {
        doc.fontSize(8).fillColor('gray').text(`… ${table.body.length - limit} more rows not shown`);
        doc.fillColor('black');
    }
    doc.moveDown();
};
const appendObjectPdf = (doc, title, obj) => {
    doc.fontSize(12).text(title, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9);
    Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v)) {
            doc.moveDown(0.3);
            appendArrayTablePdf(doc, k, v);
        }
        else {
            doc.text(`${k}: ${cellString(v)}`);
        }
    });
    doc.moveDown();
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
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length && isPlainObject(value[0])) {
                appendArrayTablePdf(doc, key, value);
            }
            else if (isPlainObject(value)) {
                appendObjectPdf(doc, key, value);
            }
            else {
                doc.fontSize(10).text(`${key}: ${cellString(value)}`);
                doc.moveDown(0.2);
            }
        });
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