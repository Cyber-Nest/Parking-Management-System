import { Model } from 'sequelize';
export declare class User extends Model {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    role_id: string;
    is_active: boolean;
    last_login_at: Date | null;
    readonly created_at: Date;
    readonly updated_at: Date;
}
//# sourceMappingURL=user.model.d.ts.map