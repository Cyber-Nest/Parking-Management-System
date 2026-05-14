import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { BadRequestError } from './commonErrors';

type ExportFormat = 'pdf' | 'excel';
type PdfDoc = InstanceType<typeof PDFDocument>;

const sanitizeSheetName = (name: string): string => {
    const cleaned = name.replace(/[:\\/?*[\]]/g, '_').slice(0, 31);
    return cleaned || 'Sheet';
};

const cellString = (value: unknown): string | number => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);

const tableFromArray = (rows: unknown[]): { headers: string[]; body: (string | number)[][] } | null => {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const first = rows[0];
    if (!isPlainObject(first)) return null;
    const headers = Object.keys(first);
    const body = rows.map((row) => {
        if (!isPlainObject(row)) return headers.map(() => '');
        return headers.map((h) => cellString(row[h]));
    });
    return { headers, body };
};

const appendArrayTablePdf = (doc: PdfDoc, title: string, rows: unknown[]): void => {
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

const appendObjectPdf = (doc: PdfDoc, title: string, obj: Record<string, unknown>): void => {
    doc.fontSize(12).text(title, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(9);
    Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v)) {
            doc.moveDown(0.3);
            appendArrayTablePdf(doc, k, v);
        } else {
            doc.text(`${k}: ${cellString(v)}`);
        }
    });
    doc.moveDown();
};

const walkDataPdf = (doc: PdfDoc, data: unknown): void => {
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
            } else if (isPlainObject(value)) {
                appendObjectPdf(doc, key, value);
            } else {
                doc.fontSize(10).text(`${key}: ${cellString(value)}`);
                doc.moveDown(0.2);
            }
        });
        return;
    }
    doc.fontSize(10).text(cellString(data) as string);
};

const buildPdf = async (reportType: string, data: unknown): Promise<Buffer> =>
    new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
        const chunks: Buffer[] = [];
        doc.on('data', (c: Buffer) => chunks.push(c));
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

const addSheetFromRows = (workbook: ExcelJS.Workbook, sheetName: string, rows: unknown[]): void => {
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
    sheet.columns.forEach((col: ExcelJS.Column) => {
        let max = 10;
        col.eachCell?.({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
            const len = cell.value ? String(cell.value).length : 0;
            if (len > max) max = Math.min(len, 40);
        });
        col.width = max + 2;
    });
};

const addKeyValueSheet = (workbook: ExcelJS.Workbook, sheetName: string, obj: Record<string, unknown>): void => {
    const sheet = workbook.addWorksheet(sanitizeSheetName(sheetName));
    sheet.addRow(['Field', 'Value']);
    sheet.getRow(1).font = { bold: true };
    Object.entries(obj).forEach(([k, v]) => {
        if (Array.isArray(v) || isPlainObject(v)) return;
        sheet.addRow([k, cellString(v)]);
    });
};

const buildExcel = async (reportType: string, data: unknown): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Parking Management';
    workbook.created = new Date();
    const meta = workbook.addWorksheet('Info');
    meta.addRow(['Report', reportType]);
    meta.addRow(['Generated', new Date().toISOString()]);

    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
        Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length && isPlainObject(value[0])) {
                addSheetFromRows(workbook, key, value);
            } else if (isPlainObject(value)) {
                addKeyValueSheet(workbook, `${key}_summary`, value);
            }
        });
    } else if (Array.isArray(data)) {
        addSheetFromRows(workbook, 'data', data);
    } else {
        const s = workbook.addWorksheet('data');
        s.addRow([cellString(data)]);
    }

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
};

export class ReportExportService {
    async buildBuffer(reportType: string, format: string, data: unknown): Promise<{ buffer: Buffer; mime: string; ext: string }> {
        const fmt = format.toLowerCase() as ExportFormat;
        if (fmt !== 'pdf' && fmt !== 'excel') {
            throw new BadRequestError('format must be pdf or excel');
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
