import { Model } from 'sequelize';
export declare class SystemSetting extends Model {
    id: string;
    timezone: string;
    language: string;
    date_format: string;
    time_format: string;
    week_starts_on: string;
    currency: string;
    session_expiry_display: number;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default SystemSetting;
//# sourceMappingURL=systemSetting.model.d.ts.map