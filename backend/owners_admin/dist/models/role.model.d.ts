import { Model } from 'sequelize';
export declare class Role extends Model {
    id: string;
    name: string;
    description: string | null;
    permissions: string;
    readonly created_at: Date;
    readonly updated_at: Date;
}
//# sourceMappingURL=role.model.d.ts.map