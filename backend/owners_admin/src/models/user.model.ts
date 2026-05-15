import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Role } from './role.model';

export class User extends Model {
    public id!: string;
    public username!: string;
    public email!: string;
    public password_hash!: string;
    public role_id!: string;
    public is_active!: boolean;
    public last_login_at!: Date | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.STRING(36),
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role_id: {
            type: DataTypes.STRING(36),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        last_login_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_login',
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);

User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });