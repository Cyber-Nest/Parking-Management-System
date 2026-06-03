import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Tax extends Model {
    public id!: string;
    public name!: string;
    public rate!: number;
    public type!: 'percentage' | 'fixed';
    public is_active!: boolean;
    public parking_lot_id!: string | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Tax.init(
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            defaultValue: 'percentage',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        parking_lot_id: {
            type: DataTypes.STRING(60),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'taxes',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);