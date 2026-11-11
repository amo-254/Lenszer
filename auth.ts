import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { createHash, scryptSync, timingSafeEqual, randomBytes } from "crypto";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "CHANGE_THIS_SECRET_BEFORE_DEPLOYMENT");
function legacySha256(password: string) {
  return createHash("sha256").update(password).digest("hex");
}
function newHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${key}`;
}
function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("scrypt:")) {
    const [, salt, key] = stored.split(":");
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(key, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
  const actual = Buffer.from(legacySha256(password), "hex");
  const expected = Buffer.from(stored, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function authenticate(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  if (!user.passwordHash.startsWith("scrypt:")) {
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash(password) } });
  }
  return { id: user.id, username: user.username, role: user.role };
}
export async function createSession(user: {id:number; username:string; role:string}) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("12h").sign(secret);
  const jar = await cookies();
  jar.set("lenszer_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
}
export async function currentUser() {
  const jar = await cookies();
  const token = jar.get("lenszer_session")?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret)).payload as {id:number; username:string; role:string}; }
  catch { return null; }
}
export async function requireUser(admin = false) {
  const user = await currentUser();
  if (!user || (admin && user.role !== "Administrator")) return null;
  return user;
}
export async function logout() {
  const jar = await cookies();
  jar.delete("lenszer_session");
}
