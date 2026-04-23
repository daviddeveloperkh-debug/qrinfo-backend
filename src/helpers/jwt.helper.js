import jwt from "jsonwebtoken";
import redisClient from "../db/redis.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret-access-key";

export const generateAccessToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const generateRefreshToken = (payload, expiresIn = "30d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const blockUserAccessToken = async (accessToken, expiresAt = 3600) => {
  const key = `blocked_user_:${accessToken}`;
  await redisClient.set(key, "blocked", { EX: expiresAt }); // is blocked for 1 hour in 3600 seconds
};

export const getBlockedAccessToken = async (accessToken) => {
  const key = `blocked_user_:${accessToken}`;
  return await redisClient.get(key); // Blocked token or null
};
