// app.test.js
const request = require("supertest");
const app = require("../authentication");

describe("API Tests", () => {
  it("GET /api/login - should return if user is logged in", async () => {
    const res = await request(app).get("/api/login");
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "User not logged in");
  });

  it("POST /api/login - should return successful message if login is successful", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "ss@gmail.com", password: "96" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "User logged in successfully");
  });

  it("POST /api/login - should return unsuccessful message if login is not successful", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "ff@gmail.com", password: "96" });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Login failed");
  });

  it("POST /api/login - should return unsuccessful message if login is not successful", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "ss@gmail.com", password: "16" });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message", "Login failed");
  });

  it("POST /api/register - should return successful message if register is successful", async () => {
    const res = await request(app).post("/api/register").send({
      firstname: "Jan",
      lastname: "Barnard",
      email: "jan@gmail.com",
      affiliation: "NWU",
      credential: "Prof.",
      role: "Moderator",
      password: "12345",
    });
    expect(res.statusCode).toEqual(302);
    expect(res.body).toHaveProperty("message", "user created successfully");
  });
  /*
  it("POST /api/users - should create a new user", async () => {
    const res = await request(app).post("/api/users").send({ name: "Alice" });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id", 3);
    expect(res.body).toHaveProperty("name", "Alice");
  });

  it("POST /api/users - should return 400 if name is missing", async () => {
    const res = await request(app).post("/api/users").send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Name is required");
  });*/
});
