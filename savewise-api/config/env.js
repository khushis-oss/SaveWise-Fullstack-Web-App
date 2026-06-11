import dotenv from "dotenv";
dotenv.config();

export const MONGO_URL = process.env.MONGO_URL;
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY;
