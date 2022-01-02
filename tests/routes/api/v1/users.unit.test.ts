import express from "express";
import { MongoClient } from "mongodb";
import request from "supertest";

import { initAccounts } from "../../../../src/Entities/Accounts";
import { initDomains } from "../../../../src/Entities/Domains";
import { initPlaces } from "../../../../src/Entities/Places";
import { initSessions } from "../../../../src/Entities/Sessions";
import { initTokens } from "../../../../src/Entities/Tokens";

import { router } from "../../../../src/routes/api/v1/users";
import { setDB } from "../../../../src/Tools/Db";

async function testDatab() {
    const connectUrl = process.env.CONNECT_URL;
    const dbName = process.env.DB_NAME;

    const baseClient = await MongoClient.connect(connectUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });

    const db = baseClient.db(dbName);
    await db.dropCollection("accounts");
    await db.createCollection("accounts");

    await setDB(baseClient.db(dbName));
}

initAccounts();
initDomains();
initPlaces();
initSessions();
initTokens();

const app = express();
app.use(express.json({
    "strict": false
}));
app.use(router);

// Utility function for making a POST request with the given username, password, and email to this endpoint
async function post(username: string, password: string, email: string): Promise<request.Response> {
    const resp = await request(app)
        .post("/api/v1/users")
        .send({
            user: {
                username,
                password,
                email
            }
        });

    return resp;
}

describe("POST /api/v1/users - unit tests", function () {
    // Happy Path
    it("should allow registering multiple users with unique usernames and emails", async function () {
        await testDatab();

        // User a
        let resp = await post("a", "password", "a@example.com");
        expect(resp.body).toMatchObject({
            "status": "success"
        });

        // User b
        resp = await post("b", "password", "b@example.com");
        expect(resp.body).toMatchObject({
            "status": "success"
        });
    });

    // All existing errors

    // JSON formatting error
    it("should return an error response when sent a badly formatted response", async function () {
        await testDatab();
        const resp = await request(app)
            .post("/api/v1/users")
            .send({});

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "Badly formatted request"
        });
    });

    // username errors
    it("should return an error response with no username", async function () {
        await testDatab();
        const resp = await request(app)
            .post("/api/v1/users")
            .set("Content-Type", "application/json")
            .send({
                user: {
                    password: "password",
                    email: "email@example.com"
                }
            });

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "username must be a simple string"
        });
    });
    it("should return an error response with empty username", async function () {
        await testDatab();
        const resp = await post("", "password", "email@example.com");

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "username must be a simple string"
        });
    });
    it("should return an error response with too many characters", async function () {
        await testDatab();
        const resp = await post("1234567890abcdefghijklmnopqrstuvw", "password", "email@example.com");

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "username too long"
        });
    });
    it("should return an error response with invalid characters", async function () {
        await testDatab();
        const resp = await post("%", "password", "email@example.com");

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "username can contain only A-Za-z0-9+-_."
        });
    });
    it("should return an error response when registering a username that already exists", async function () {
        await testDatab();

        // User a one
        let resp = await post("a", "password", "a@example.com");

        expect(resp.body).toMatchObject({
            "status": "success"
        });

        // User a two
        resp = await post("a", "password", "a@example.com");

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "username already exists"
        });
    });

    // email errors
    it("should return an error response with no email", async function () {
        await testDatab();
        const resp = await request(app)
            .post("/api/v1/users")
            .set("Content-Type", "application/json")
            .send({
                user: {
                    username: "a",
                    password: "password"
                }
            });

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "email must be a simple string"
        });
    });
    it("should return an error response with empty email", async function () {
        await testDatab();
        const resp = await post("a", "password", "");

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "email must be a simple string"
        });
    });
    it("should return an error with an email with zero '@' symbols", async function () {
        await testDatab();
        const resp = await post("a", "password", "a");

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "email address needs one AT sign"
        });
    });
    it("should return an error with an email with two '@' symbols", async function () {
        await testDatab();
        const resp = await post("a", "password", "a@@");

        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "email address needs one AT sign"
        });
    });
    it("should return an error response when registering an email that already exists", async function () {
        await testDatab();

        // User a
        let resp = await post("a", "password", "a@example.com");

        expect(resp.body).toMatchObject({
            "status": "success"
        });

        // User b
        resp = await post("b", "password", "a@example.com");
        expect(resp.body).toMatchObject({
            "status": "failure",
            "error": "email already exists for another account"
        });
    });
});
