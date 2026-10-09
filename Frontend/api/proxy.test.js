import assert from "node:assert/strict"
import http from "node:http"
import { after, before, test } from "node:test"
import proxyApiRequest from "./[...path].js"

let backend
let backendUrl
let frontend
let frontendUrl

before(async () => {
    backend = http.createServer((req, res) => {
        const chunks = []
        req.on("data", (chunk) => chunks.push(chunk))
        req.on("end", () => {
            res.setHeader("content-type", "application/json")
            res.setHeader("set-cookie", "token=test-token; HttpOnly; SameSite=None; Secure")
            res.statusCode = 201
            res.end(JSON.stringify({
                method: req.method,
                url: req.url,
                cookie: req.headers.cookie || "",
                contentType: req.headers["content-type"],
                body: Buffer.concat(chunks).toString()
            }))
        })
    })

    backend.listen(0, "127.0.0.1")
    await new Promise((resolve) => backend.once("listening", resolve))
    backendUrl = `http://127.0.0.1:${backend.address().port}`

    frontend = http.createServer((req, res) => proxyApiRequest(req, res))
    frontend.listen(0, "127.0.0.1")
    await new Promise((resolve) => frontend.once("listening", resolve))
    frontendUrl = `http://127.0.0.1:${frontend.address().port}`
})

after(async () => {
    await Promise.all([backend, frontend].map((server) => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
    })))
})

test("proxy forwards API requests and preserves session cookies", async () => {
    const previousBackendUrl = process.env.BACKEND_API_URL
    process.env.BACKEND_API_URL = backendUrl

    try {
        const response = await fetch(`${frontendUrl}/api/auth/get-me?source=dashboard`, {
            headers: { cookie: "token=existing-token" }
        })
        const body = await response.json()

        assert.equal(response.status, 201)
        assert.equal(body.url, "/api/auth/get-me?source=dashboard")
        assert.equal(body.cookie, "token=existing-token")
        assert.match(response.headers.get("set-cookie"), /token=test-token/)
    } finally {
        if (previousBackendUrl === undefined) {
            delete process.env.BACKEND_API_URL
        } else {
            process.env.BACKEND_API_URL = previousBackendUrl
        }
    }
})

test("proxy streams multipart uploads without changing their body", async () => {
    const previousBackendUrl = process.env.BACKEND_API_URL
    const boundary = "test-boundary"
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="resume.pdf"\r\n\r\nPDF-CONTENT\r\n--${boundary}--\r\n`
    process.env.BACKEND_API_URL = backendUrl

    try {
        const response = await fetch(`${frontendUrl}/api/interview`, {
            method: "POST",
            headers: {
                "content-type": `multipart/form-data; boundary=${boundary}`
            },
            body
        })
        const responseBody = await response.json()

        assert.equal(response.status, 201)
        assert.equal(responseBody.body, body)
    } finally {
        if (previousBackendUrl === undefined) {
            delete process.env.BACKEND_API_URL
        } else {
            process.env.BACKEND_API_URL = previousBackendUrl
        }
    }
})

test("proxy rejects non-API paths", async () => {
    const previousBackendUrl = process.env.BACKEND_API_URL
    process.env.BACKEND_API_URL = backendUrl

    try {
        const response = await fetch(`${frontendUrl}/dashboard`)

        assert.equal(response.status, 404)
        assert.deepEqual(await response.json(), { message: "API route not found" })
    } finally {
        if (previousBackendUrl === undefined) {
            delete process.env.BACKEND_API_URL
        } else {
            process.env.BACKEND_API_URL = previousBackendUrl
        }
    }
})
