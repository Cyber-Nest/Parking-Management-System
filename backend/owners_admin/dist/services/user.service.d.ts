import { User } from '../models/user.model';
export declare class UserService {
    list(query: Record<string, string | undefined>): Promise<{
        items: {
            id: any;
            username: any;
            email: any;
            role_id: any;
            role_name: any;
            is_active: boolean;
            last_login_at: any;
            created_at: any;
            updated_at: any;
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
    }): Promise<User>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=user.service.d.ts.map