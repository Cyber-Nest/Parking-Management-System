import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class SystemSetting extends Model {
    public id!: string;
    public timezone!: string;
    public language!: string;
    public date_format!: string;
    public time_format!: string;
    public week_starts_on!: string;
    public currency!: string;
    public session_expiry_display!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

SystemSetting.init(
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        timezone: {
            type: DataTypes.STRING(100),
            defaultValue: 'UTC',
        },
        language: {
            type: DataTypes.STRING(50),
            defaultValue: 'en',
        },
        date_format: {
            type: DataTypes.STRING(50),
            defaultValue: 'MM/DD/YYYY',
        },
        time_format: {
            type: DataTypes.STRING(10),
            defaultValue: '12h',
        },
        week_starts_on: {
            type: DataTypes.STRING(10),
            defaultValue: 'sunday',
        },
        currency: {
            type: DataTypes.STRING(10),
            defaultValue: 'USD',
        },
        session_expiry_display: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
        },
    },
    {
        sequelize,
        tableName: 'system_settings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default SystemSetting;
