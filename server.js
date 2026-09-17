import express from "express";
import cors from "cors";
import dotenv from "dotenv";

/* ==========================================
TrustNet Backend
File: server/server.js

Main backend server
========================================== */

/* ==========================================
LOAD ENVIRONMENT VARIABLES
========================================== */

dotenv.config();

/* ==========================================
CREATE EXPRESS APP
========================================== */

const app = express();

/* ==========================================
SERVER CONFIGURATION
========================================== */

const PORT = process.env.PORT || 5000;

/* ==========================================
CORS CONFIGURATION
========================================== */

app.use(
cors({
origin: true,
credentials: true
})
);

/* ==========================================
BODY PARSING
========================================== */

app.use(
express.json({
limit: "10mb"
})
);

app.use(
express.urlencoded({
extended: true,
limit: "10mb"
})
);

/* ==========================================
REQUEST LOGGER
========================================== */

app.use((req, res, next) => {

const timestamp =
    new Date().toISOString();

console.log(
    `[${timestamp}] ${req.method} ${req.originalUrl}`
);

next();

});

/* ==========================================
ROOT ROUTE
========================================== */

app.get("/", (req, res) => {

res.status(200).json({

    success: true,

    name: "TrustNet API",

    message:
        "TrustNet backend is running.",

    version: "1.0.0",

    status: "online"

});

});

/* ==========================================
HEALTH CHECK
========================================== */

app.get("/api/health", (req, res) => {

res.status(200).json({

    success: true,

    service: "TrustNet Backend",

    status: "healthy",

    timestamp:
        new Date().toISOString()

});

});

/* ==========================================
API INFORMATION
========================================== */

app.get("/api", (req, res) => {

res.status(200).json({

    success: true,

    name: "TrustNet API",

    version: "1.0.0",

    endpoints: {

        health:
            "/api/health",

        auth:
            "/api/auth",

        users:
            "/api/users",

        trust:
            "/api/trust",

        ai:
            "/api/ai"

    }

});

});

/* ==========================================
FUTURE API ROUTES
========================================== */

/*
We will connect these routers after
creating the corresponding files.

Example:

import authRoutes
from "./routes/authRoutes.js";

app.use(
"/api/auth",
authRoutes
);
*/

/* ==========================================
404 HANDLER
========================================== */

app.use((req, res) => {

res.status(404).json({

    success: false,

    error: "Route not found.",

    path: req.originalUrl

});

});

/* ==========================================
GLOBAL ERROR HANDLER
========================================== */

app.use((err, req, res, next) => {

console.error(
    "TrustNet Server Error:",
    err
);

const statusCode =
    err.statusCode || 500;

res.status(statusCode).json({

    success: false,

    error:
        process.env.NODE_ENV === "production"
            ? "Internal server error."
            : err.message

});

});

/* ==========================================
START SERVER
========================================== */

app.listen(PORT, () => {

console.log("");
console.log("==========================================");
console.log("        TRUSTNET BACKEND");
console.log("==========================================");
console.log("");
console.log(`Server running on port ${PORT}`);
console.log(`Local: http://localhost:${PORT}`);
console.log("");
console.log("API:");
console.log(`http://localhost:${PORT}/api`);
console.log("");
console.log("Health:");
console.log(`http://localhost:${PORT}/api/health`);
console.log("");
console.log("==========================================");

});