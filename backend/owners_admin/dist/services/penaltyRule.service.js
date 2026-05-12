"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyRuleService = void 0;
const penaltyRule_repository_1 = require("../repositories/penaltyRule.repository");
const crypto_1 = require("crypto");
const repository = new penaltyRule_repository_1.PenaltyRuleRepository();
class PenaltyRuleService {
    async list(query) {
        const parsedQuery = {
            page: query.page ? parseInt(query.page, 10) : 1,
            limit: query.limit ? parseInt(query.limit, 10) : 10,
            q: query.q,
            status: query.status,
        };
        return repository.list(parsedQuery);
    }
    async getById(id) {
        return repository.getById(id);
    }
    async create(data) {
        const rule = {
            id: (0, crypto_1.randomUUID)(),
            ...data,
        };
        return repository.create(rule);
    }
    async update(id, data) {
        await repository.update(id, data);
        return repository.getById(id);
    }
    async delete(id) {
        const result = await repository.delete(id);
        return result > 0;
    }
}
exports.PenaltyRuleService = PenaltyRuleService;
exports.default = PenaltyRuleService;
//# sourceMappingURL=penaltyRule.service.js.map