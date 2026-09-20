export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
