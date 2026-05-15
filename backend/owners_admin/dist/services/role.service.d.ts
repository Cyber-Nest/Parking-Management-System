import { Role } from '../models/role.model';
export declare class RoleService {
    list(query: Record<string, string | undefined>): Promise<{
        items: {
            id: any;
            name: any;
            description: any;
            permissions: unknown;
            created_at: any;
            updated_at: any;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(body: {
        name: string;
        description?: string;
        permissions?: string | object;
    }): Promise<Role>;
    update(id: string, body: {
        name?: string;
        description?: string;
        permissions?: string | object;
    }): Promise<Role>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=role.service.d.ts.map