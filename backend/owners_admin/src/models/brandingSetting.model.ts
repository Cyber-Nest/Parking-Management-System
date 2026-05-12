import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class BrandingSetting extends Model {
    public id!: string;
    public system_name!: string;
    public theme_color!: string;
    public dark_mode!: string;
    public logo_url?: string;
    public favicon_url?: string;
    public sidebar_collapsed?: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

BrandingSetting.init(
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        system_name: {
            type: DataTypes.STRING(150),
            defaultValue: 'ParkSmart',
        },
        theme_color: {
            type: DataTypes.STRING(20),
            defaultValue: '#0F766E',
        },
        dark_mode: {
            type: DataTypes.STRING(20),
            defaultValue: 'system',
        },
        logo_url: {
            type: DataTypes.TEXT,
        },
        favicon_url: {
            type: DataTypes.TEXT,
        },
        sidebar_collapsed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'branding_settings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default BrandingSetting;
