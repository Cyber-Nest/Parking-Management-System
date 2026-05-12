import { ReportsRepository } from '../repositories/reports.repository';
import { ValidationError } from './commonErrors';

const reportRepo = new ReportsRepository();

export class ReportsService {
    async getReport(type: string, query: Record<string, string | undefined>): Promise<any> {
        const from = query.from;
        const to = query.to;

        switch (type) {
            case 'revenue':
                return reportRepo.getRevenue(from, to);
            case 'usage':
                return reportRepo.getUsage(from, to);
            case 'penalty':
                return reportRepo.getPenalty(from, to);
            case 'performance':
                return reportRepo.getPerformance(from, to);
            case 'payment-reconciliation':
                return reportRepo.getPaymentReconciliation(from, to);
            case 'due':
                return reportRepo.getDue(from, to);
            case 'location':
                return reportRepo.getLocationPerformance(from, to);
            case 'occupancy':
                return reportRepo.getOccupancy(from, to);
            case 'plan':
                return reportRepo.getPlanPerformance(from, to);
            case 'audit':
                return reportRepo.getAuditReport(Number(query.limit ?? '50'));
            case 'vehicle-history':
                if (!query.license_plate) {
                    throw new ValidationError('license_plate query parameter is required for vehicle history');
                }
                return reportRepo.getVehicleHistory(query.license_plate);
            case 'refunds':
                return reportRepo.getRefunds(Number(query.limit ?? '50'));
            default:
                throw new ValidationError(`Unsupported report type: ${type}`);
        }
    }
}
