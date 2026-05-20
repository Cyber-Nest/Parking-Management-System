import { queryRows, execute } from '../config/database';
import { PaginatedResponse } from '../types';

export interface PenaltyRuleQuery {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
}

export interface PenaltyRulePublic {
    id: string;
    violation: string;
    code: string;
    amount: number;
    grace_minutes?: number;
    description?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export class PenaltyRuleRepository {
    async list(query: PenaltyRuleQuery): Promise<PaginatedResponse<PenaltyRulePublic>> {
        const page = Math.max(1, query.page || 1);
        const limit = Math.max(1, Math.min(100, query.limit || 10));
        const offset = (page - 1) * limit;

        let sql = 'SELECT * FROM penalty_rules WHERE 1=1';
        const params: any[] = [];

        if (query.status) {
            sql += ' AND status = ?';
            params.push(query.status);
        }

        if (query.q) {
            sql += ' AND (violation LIKE ? OR code LIKE ?)';
            params.push(`%${query.q}%`, `%${query.q}%`);
        }

        const countRows = await queryRows<{ total: number }>(
            `SELECT COUNT(*) AS total FROM penalty_rules WHERE 1=1 ${query.status ? 'AND status = ?' : ''} ${query.q ? 'AND (violation LIKE ? OR code LIKE ?)' : ''}`,
            query.status ? (query.q ? [query.status, `%${query.q}%`, `%${query.q}%`] : [query.status]) : query.q ? [`%${query.q}%`, `%${query.q}%`] : []
        );

        const rows = await queryRows<PenaltyRulePublic>(
            sql + ` ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const total = countRows[0]?.total ?? 0;

        return {
            items: rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getById(id: string): Promise<PenaltyRulePublic | null> {
        const rows = await queryRows<PenaltyRulePublic>('SELECT * FROM penalty_rules WHERE id = ?', [id]);
        return rows[0] ?? null;
    }

    async create(rule: Omit<PenaltyRulePublic, 'created_at' | 'updated_at'> & { id: string }): Promise<PenaltyRulePublic> {
        const { id, violation, code, amount, grace_minutes, description, status } = rule;
        await execute(
            'INSERT INTO penalty_rules (id, violation, code, amount, grace_minutes, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, violation, code, amount, grace_minutes ?? 0, description ?? null, status]
        );
        return this.getById(id) as Promise<PenaltyRulePublic>;
    }

    async update(id: string, updates: Partial<Omit<PenaltyRulePublic, 'id' | 'created_at'>>): Promise<number> {
        const fields: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (!fields.length) return 0;

        values.push(id);
        const result = await execute(
            `UPDATE penalty_rules SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows ?? 0;
    }

    async delete(id: string): Promise<number> {
        const result = await execute('DELETE FROM penalty_rules WHERE id = ?', [id]);
        return result.affectedRows ?? 0;
    }
}

export default PenaltyRuleRepository;
