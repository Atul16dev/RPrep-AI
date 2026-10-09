const assert = require("node:assert/strict")
const { after, before, test } = require("node:test")
const bcrypt = require("bcryptjs")
const userModel = require("../src/models/user.model")
const app = require("../src/app")

let server
let baseUrl

before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once("listening", resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
    })
})

test("health endpoint reports MongoDB readiness", async () => {
    const response = await fetch(`${baseUrl}/health`)
    const body = await response.json()

    assert.equal(response.status, 503)
    assert.deepEqual(body, {
        status: "unavailable",
        database: "disconnected"
    })
})

test("unknown API routes return JSON 404 responses", async () => {
    const response = await fetch(`${baseUrl}/api/not-found`)
    const body = await response.json()

    assert.equal(response.status, 404)
    assert.deepEqual(body, { message: "API route not found" })
})

test("malformed JSON returns a client error as JSON", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{"
    })
    const body = await response.json()

    assert.equal(response.status, 400)
    assert.equal(typeof body.message, "string")
})

test("login normalizes the email address before looking up the account", async () => {
    const originalFindOne = userModel.findOne
    const originalJwtSecret = process.env.JWT_SECRET
    const password = "ValidPassword123"

    userModel.findOne = async ({ email }) => {
        assert.equal(email, "user@example.com")
        return {
            _id: "test-user-id",
            username: "test-user",
            email,
            displayName: "",
            photoURL: "",
            password: await bcrypt.hash(password, 4)
        }
    }
    process.env.JWT_SECRET = "test-only-secret"

    try {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: " User@Example.com ", password })
        })

        assert.equal(response.status, 201)
        assert.equal((await response.json()).user.email, "user@example.com")
    } finally {
        userModel.findOne = originalFindOne
        if (originalJwtSecret === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = originalJwtSecret
        }
    }
})
