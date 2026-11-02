import crypto from "crypto";
import { getMongoDatabase } from "../config/mongodb";
import { AdminWithRoleRow, AdminRow, AuthTokenRow } from "../models/admin.model";
import { RoleName } from "../types";

type AdminDocument = AdminRow & { _id: string };
type TokenDocument = AuthTokenRow & { _id: string };

const adminFromDocument = (document: AdminDocument): AdminRow => {
  const { _id, ...admin } = document;
  return { ...admin, id: _id };
};

const adminWithRole = async (document: AdminDocument): Promise<AdminWithRoleRow> => {
  const role = await getMongoDatabase().collection<{ _id: string; name: RoleName }>("roles")
    .findOne({ _id: document.role_id });
  if (!role) throw new Error(`Admin ${document._id} references missing role ${document.role_id}`);
  return { ...adminFromDocument(document), role_name: role.name };
};

export class AdminRepository {
  private collection() {
    return getMongoDatabase().collection<AdminDocument>("admins");
  }

  async findByEmail(email: string): Promise<AdminWithRoleRow | null> {
    const document = await this.collection().findOne({ email: email.toLowerCase().trim() });
    return document ? adminWithRole(document) : null;
  }

  async findById(id: string): Promise<AdminWithRoleRow | null> {
    const document = await this.collection().findOne({ _id: id });
    return document ? adminWithRole(document) : null;
  }

  async findByResetToken(tokenHash: string, adminId: string): Promise<AdminRow | null> {
    const document = await this.collection().findOne({
      _id: adminId,
      reset_token: tokenHash,
      reset_token_expires_at: { $gt: new Date() },
    });
    return document ? adminFromDocument(document) : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.collection().updateOne({ _id: id }, { $set: { last_login_at: new Date(), updated_at: new Date() } });
  }

  async saveResetToken(id: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.collection().updateOne({ _id: id }, { $set: { reset_token: tokenHash, reset_token_expires_at: expiresAt, updated_at: new Date() } });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.collection().updateOne({ _id: id }, {
      $set: { password_hash: passwordHash, reset_token: null, reset_token_expires_at: null, updated_at: new Date() },
    });
  }

  async create(params: { email: string; passwordHash: string; fullName: string; roleId: string }): Promise<string | null> {
    const id = crypto.randomUUID();
    try {
      await this.collection().insertOne({
        _id: id,
        id,
        email: params.email.toLowerCase().trim(),
        password_hash: params.passwordHash,
        full_name: params.fullName,
        role_id: params.roleId,
        is_active: true,
        reset_token: null,
        reset_token_expires_at: null,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return id;
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) return null;
      throw error;
    }
  }

  async insertAdmin(params: { email: string; passwordHash: string; fullName: string; roleId: string; isActive?: boolean }): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    await this.collection().insertOne({
      _id: id,
      id,
      email: params.email.toLowerCase().trim(),
      password_hash: params.passwordHash,
      full_name: params.fullName,
      role_id: params.roleId,
      is_active: params.isActive !== false,
      reset_token: null,
      reset_token_expires_at: null,
      last_login_at: null,
      created_at: now,
      updated_at: now,
    });
    return id;
  }
}

export class AuthTokenRepository {
  private collection() {
    return getMongoDatabase().collection<TokenDocument>("auth_tokens");
  }

  async create(params: { userId: string; userType: string; refreshToken: string; expiresAt: Date }): Promise<void> {
    const id = crypto.randomUUID();
    await this.collection().insertOne({
      _id: id,
      id,
      user_id: params.userId,
      user_type: params.userType,
      refresh_token: params.refreshToken,
      expires_at: params.expiresAt,
      revoked: false,
      created_at: new Date(),
    });
  }

  async revoke(refreshToken: string, userId: string): Promise<number> {
    const result = await this.collection().updateOne(
      { refresh_token: refreshToken, user_id: userId, revoked: false },
      { $set: { revoked: true } },
    );
    return result.modifiedCount;
  }

  async revokeAllForUser(userId: string, userType: string): Promise<void> {
    await this.collection().updateMany({ user_id: userId, user_type: userType }, { $set: { revoked: true } });
  }

  async findValid(refreshToken: string): Promise<AuthTokenRow | null> {
    const document = await this.collection().findOne({
      refresh_token: refreshToken,
      revoked: false,
      expires_at: { $gt: new Date() },
    });
    if (!document) return null;
    const { _id, ...token } = document;
    return { ...token, id: _id };
  }
}
