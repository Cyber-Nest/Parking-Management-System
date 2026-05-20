export declare class ReportExportService {
    buildBuffer(reportType: string, format: string, data: unknown): Promise<{
        buffer: Buffer;
        mime: string;
        ext: string;
    }>;
}
//# sourceMappingURL=reportExport.service.d.ts.map