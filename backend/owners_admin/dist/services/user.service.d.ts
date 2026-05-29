export declare class UserService {
    list(query: Record<string, string | undefined>): Promise<{
        items: {
            id: string;
            username: string;
            email: string;
            role_id: string;
            role_name: string;
            is_active: boolean;
            last_login_at: string | null;
            created_at: string;
            updated_at: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(body: {
        username: string;
        email: string;
        password: string;
        role_id: string;
        is_active?: boolean;
    }): Promise<{
        id: string;
    }>;
    update(id: string, body: {
        username?: string;
        email?: string;
        role_id?: string;
        is_active?: boolean;
    }): Promise<{
        id: string;
        username: string;
        email: string;
        role_id: string;
        role_name: import("../types").RoleName;
        is_active: boolean;
        last_login_at: string | null;
        created_at: string;
        updated_at: string;
    }>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map