import request from "supertest";
import app from "../index.js";

describe("OAuth2 Authentication", () => {
  it("should redirect to Google login page", async () => {
    const res = await request(app).get("/auth/google");
    expect(res.status).toBe(302);  // 302 = redirect
    expect(res.header.location).toContain("accounts.google.com");
  });

  // it("should redirect to GitHub login page", async () => {
  //   const res = await request(app).get("/auth/github");
  //   expect(res.status).toBe(302);
  //   expect(res.header.location).toContain("github.com");
  // });

  it("should redirect to Facebook login page", async () => {
    const res = await request(app).get("/auth/facebook");
    expect(res.status).toBe(302);
    expect(res.header.location).toContain("facebook.com");
  });

  it("should return 302 or 401 for fake Google callback", async () => {
    const res = await request(app).get("/auth/google/callback");
    expect([302, 401]).toContain(res.status); // depending on passport failureRedirect
  });

  // it("should return 302 or 401 for fake GitHub callback", async () => {
  //   const res = await request(app).get("/auth/github/callback?code=fakecode");
  //   expect([302, 401]).toContain(res.status);
  // });
});
