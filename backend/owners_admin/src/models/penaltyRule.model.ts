import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class PenaltyRule extends Model {
    public id!: string;
    public violation!: string;
    public code!: string;
    public amount!: number;
    public grace_minutes?: number;
    public description?: string;
    public status!: 'Active' | 'Inactive';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

PenaltyRule.init(
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        violation: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        grace_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        description: {
            type: DataTypes.TEXT,
        },
        status: {
            type: DataTypes.ENUM('Active', 'Inactive'),
            defaultValue: 'Active',
        },
    },
    {
        sequelize,
        tableName: 'penalty_rules',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default PenaltyRule;
