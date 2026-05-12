"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ValidationError = exports.BadRequestError = exports.ForbiddenError = exports.UnauthorizedError = void 0;
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 401;
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 403;
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = 'BadRequestError';
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 422;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=commonErrors.js.map