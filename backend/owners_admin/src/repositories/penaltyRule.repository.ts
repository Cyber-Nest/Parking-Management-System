import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { PaginatedResponse } from "../types";

export interface PenaltyRuleQuery { page?: number; limit?: number; q?: string; status?: string }
export interface PenaltyRulePublic {
  id: string; violation: string; code: string; amount: number; grace_minutes?: number;
  description?: string | null; status: string; created_at?: string; updated_at?: string;
}
type PenaltyRuleDocument = Omit<PenaltyRulePublic, "created_at" | "updated_at"> & { _id: string; created_at: Date; updated_at: Date };
const collection = () => getMongoDatabase().collection<PenaltyRuleDocument>("penalty_rules");
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toPublic = (document: PenaltyRuleDocument): PenaltyRulePublic => {
  const { _id, created_at, updated_at, ...rule } = document;
  return { ...rule, id: _id, created_at: created_at.toISOString(), updated_at: updated_at.toISOString() };
};

export class PenaltyRuleRepository {
  async list(query: PenaltyRuleQuery): Promise<PaginatedResponse<PenaltyRulePublic>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.q?.trim()) {
      const q = { $regex: escapeRegex(query.q.trim()), $options: "i" };
      filter.$or = [{ violation: q }, { code: q }];
    }
    const [documents, total] = await Promise.all([
      collection().find(filter).sort({ created_at: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection().countDocuments(filter),
    ]);
    return { items: documents.map(toPublic), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string): Promise<PenaltyRulePublic | null> {
    const document = await collection().findOne({ _id: id });
    return document ? toPublic(document) : null;
  }

  async create(rule: Omit<PenaltyRulePublic, "created_at" | "updated_at"> & { id: string }): Promise<PenaltyRulePublic> {
    const now = new Date();
    const id = rule.id || crypto.randomUUID();
    const document: PenaltyRuleDocument = {
      _id: id, id, violation: rule.violation,
      code: rule.code, amount: rule.amount, grace_minutes: rule.grace_minutes ?? 0,
      description: rule.description ?? null, status: rule.status, created_at: now, updated_at: now,
    };
    await collection().insertOne(document);
    return toPublic(document);
  }

  async update(id: string, updates: Partial<Omit<PenaltyRulePublic, "id" | "created_at">>): Promise<number> {
    const fields: Record<string, unknown> = {};
    for (const key of ["violation", "code", "amount", "grace_minutes", "description", "status"] as const) {
      if (updates[key] !== undefined) fields[key] = updates[key];
    }
    if (!Object.keys(fields).length) return 0;
    fields.updated_at = new Date();
    return (await collection().updateOne({ _id: id }, { $set: fields })).matchedCount;
  }

  async delete(id: string): Promise<number> {
    return (await collection().deleteOne({ _id: id })).deletedCount;
  }
}

export default PenaltyRuleRepository;
