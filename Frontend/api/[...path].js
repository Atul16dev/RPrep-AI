import http from "node:http"
import https from "node:https"

const hopByHopHeaders = new Set([
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade"
])

function sendJson(res, statusCode, body) {
    res.statusCode = statusCode
    res.setHeader("content-type", "application/json; charset=utf-8")
    res.end(JSON.stringify(body))
}

export default function proxyApiRequest(req, res) {
    const backendApiUrl = process.env.BACKEND_API_URL

    if (!backendApiUrl) {
        return sendJson(res, 503, {
            message: "The API is not configured. Set BACKEND_API_URL in the deployment environment."
        })
    }

    let target

    try {
        target = new URL(req.url, backendApiUrl.endsWith("/") ? backendApiUrl : `${backendApiUrl}/`)
        const backend = new URL(backendApiUrl)

        if (!["http:", "https:"].includes(backend.protocol) || target.origin !== backend.origin) {
            throw new Error("BACKEND_API_URL must be an HTTP or HTTPS origin")
        }
    } catch (error) {
        console.error("Invalid BACKEND_API_URL:", error.message)
        return sendJson(res, 500, { message: "The API deployment configuration is invalid." })
    }

    if (!target.pathname.startsWith("/api/")) {
        return sendJson(res, 404, { message: "API route not found" })
    }

    const headers = { ...req.headers }

    for (const header of hopByHopHeaders) {
        delete headers[header]
    }
    delete headers.host

    const transport = target.protocol === "https:" ? https : http
    const upstreamRequest = transport.request(target, {
        method: req.method,
        headers
    }, (upstreamResponse) => {
        res.statusCode = upstreamResponse.statusCode || 502

        for (const [header, value] of Object.entries(upstreamResponse.headers)) {
            if (value !== undefined && !hopByHopHeaders.has(header.toLowerCase())) {
                res.setHeader(header, value)
            }
        }

        upstreamResponse.pipe(res)
    })

    upstreamRequest.on("error", (error) => {
        console.error("API proxy request failed:", error.message)

        if (!res.headersSent) {
            sendJson(res, 502, { message: "The API is temporarily unavailable." })
        } else {
            res.destroy(error)
        }
    })

    req.pipe(upstreamRequest)
}

export const config = {
    api: {
        bodyParser: false
    }
}
