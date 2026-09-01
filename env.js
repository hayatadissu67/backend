import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_pmo_jwt_secret_key_2026_super_secure';
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';
export const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
export const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 10);
