import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Role extends Model {
    public id!: string;
    public name!: string;
    public description!: string | null;
    public permissions!: string; // JSON string of permissions
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Role.init(
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        permissions: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '[]',
        },
    },
    {
        sequelize,
        tableName: 'roles',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);