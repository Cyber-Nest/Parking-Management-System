export declare class UnauthorizedError extends Error {
    readonly statusCode = 401;
    constructor(message: string);
}
export declare class ForbiddenError extends Error {
    readonly statusCode = 403;
    constructor(message: string);
}
export declare class BadRequestError extends Error {
    readonly statusCode = 400;
    constructor(message: string);
}
export declare class ValidationError extends Error {
    readonly statusCode = 422;
    constructor(message: string);
}
export declare class NotFoundError extends Error {
    readonly statusCode = 404;
    constructor(message: string);
}
//# sourceMappingURL=commonErrors.d.ts.map