import { Model } from 'sequelize';
export declare class BrandingSetting extends Model {
    id: string;
    system_name: string;
    theme_color: string;
    dark_mode: string;
    logo_url?: string;
    favicon_url?: string;
    sidebar_collapsed?: boolean;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export default BrandingSetting;
//# sourceMappingURL=brandingSetting.model.d.ts.map