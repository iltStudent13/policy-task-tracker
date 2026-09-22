import { describe, it, expect } from "vitest";
import { generateToken, type ITokenUser } from "../token";
import jwt from "jsonwebtoken";

describe("Token Utility", () => {
  it("should generate and verify a token correctly", () => {
    const user: ITokenUser = { id: "123", role: "admin" };
    const token = generateToken(user);

    expect(user.id).toBe(user.id);
    expect(jwt.decode(token.token)).toHaveProperty("iat");
    expect(jwt.decode(token.token)).toHaveProperty("exp");
  });
});

describe("Token Utility - Invalid Token", () => {
  it("should throw an error for an invalid token", () => {
    const invalidToken = "invalid.token.here";
    expect(() =>
      jwt.verify(invalidToken, process.env.JWT_SECRET || "development-secret"),
    ).toThrow();
  });
});

describe("Token returns timestamps", () => {
  it("should include iat and exp in the token payload", () => {
    const user: ITokenUser = { id: "789", role: "user" };
    const token = generateToken(user);
    const payload = jwt.verify(
      token.token,
      process.env.JWT_SECRET || "development-secret",
    ) as { iat?: number; exp?: number };

    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
  });
});
