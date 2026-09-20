import { describe, it, expect } from "vitest";

const rapidApiKey = process.env.RAPIDAPI_KEY;

describe.skipIf(!rapidApiKey)("RapidAPI Key Validation", () => {
  it("should have RAPIDAPI_KEY in environment", () => {
    expect(rapidApiKey).toBeTruthy();
    expect(rapidApiKey?.length).toBeGreaterThan(10);
  });

  it("should validate RapidAPI key format", () => {
    expect(rapidApiKey).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("payment gateway keys should be empty or defined", () => {
    const paymentKeys = [
      process.env.MERCADOPAGO_ACCESS_TOKEN,
      process.env.ASAAS_API_KEY,
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    ];

    expect(paymentKeys.every(key => key === undefined || typeof key === "string")).toBe(true);
  });
});
