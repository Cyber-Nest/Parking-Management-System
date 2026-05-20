export declare const env: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly db: {
        readonly host: string;
        readonly port: number;
        readonly name: string;
        readonly user: string;
        readonly password: string;
    };
    readonly jwt: {
        readonly accessSecret: string;
        readonly refreshSecret: string;
        readonly accessExpiresIn: string;
        readonly refreshExpiresIn: string;
    };
    readonly smtp: {
        readonly host: string;
        readonly port: number;
        readonly secure: boolean;
        readonly user: string;
        readonly pass: string;
        readonly from: string;
    };
    readonly frontendUrl: string;
    readonly bcryptSaltRounds: number;
};
//# sourceMappingURL=env.d.ts.map