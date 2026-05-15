import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Pricing extends Model {
    public id!: string;
    public name!: string;
    public base_price!: number;
    public additional_fees!: number;
    public tax_id!: string | null;
    public is_active!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Pricing.init(
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        base_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        additional_fees: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        tax_id: {
            type: DataTypes.STRING(36),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'pricings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);