export declare class RoleService {
    list(query: Record<string, string | undefined>): Promise<{
        items: {
            id: string;
            name: string;
            description: string | null;
            permissions: unknown;
            created_at: string;
            updated_at: string;
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
    }): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    update(id: string, body: {
        name?: string;
        description?: string;
        permissions?: string | object;
    }): Promise<{
        id: string;
    }>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=role.service.d.ts.map