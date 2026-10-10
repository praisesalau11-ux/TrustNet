import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
assessTrust,
getTrustAssessment
} from "../services/trustService.js";

const router = express.Router();

/* ==========================================
CREATE TRUST ASSESSMENT
POST /api/trust/assess
========================================== */

router.post(
"/assess",
authMiddleware,
async (req, res) => {
try {
const {
category,
subject,
evidence,
concerns
} = req.body || {};

        const assessment = await assessTrust({
            uid: req.user.uid,
            category,
            subject,
            evidence,
            concerns
        });

        return res.status(201).json({
            success: true,
            message: "Trust assessment created.",
            assessment
        });
    } catch (error) {
        if (
            error.message.startsWith("Invalid ") ||
            error.message.includes("required") ||
            error.message.includes("must ") ||
            error.message.includes("Each ")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        console.error("Trust assessment error:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to create trust assessment."
        });
    }
}

);

/* ==========================================
GET A PRIVATE TRUST ASSESSMENT
GET /api/trust/assess/
========================================== */

router.get(
"/assess/",
authMiddleware,
async (req, res) => {
try {
const assessment = await getTrustAssessment({
uid: req.user.uid,
assessmentId: req.params.id
});

        if (!assessment) {
            return res.status(404).json({
                success: false,
                error: "Assessment not found."
            });
        }

        return res.status(200).json({
            success: true,
            assessment
        });
    } catch (error) {
        console.error("Get trust assessment error:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to retrieve trust assessment."
        });
    }
}

);

export default router;