import { describe, expect, it } from "vitest";
import { normalizeApiErrorMessage } from "./api-errors";

describe("normalizeApiErrorMessage", () => {
  it("explains server HTML responses as a backend availability issue", () => {
    const message = normalizeApiErrorMessage(
      new SyntaxError('Unexpected token "<", "<!DOCTYPE ..." is not valid JSON')
    );

    expect(message).toContain("servidor");
    expect(message).toContain("indisponível");
  });

  it("keeps the original message for non-JSON application errors", () => {
    expect(normalizeApiErrorMessage(new Error("email inválido"))).toBe(
      "email inválido"
    );
  });
});
