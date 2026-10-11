import {
    assessTrust,
    getTrustAssessment,
    listTrustAssessments
} from "../services/trustService.js";

const router = express.Router();

/* ==========================================
   CREATE TRUST ASSESSMENT
   POST /api/trust/assess
========================================== */

router.post("/assess", authMiddleware, async (req, res) => {
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
            error.message?.startsWith("Invalid ") ||
            error.message?.includes("required") ||
            error.message?.includes("must ") ||
            error.message?.includes("Each ")
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
});


/* ==========================================
   LIST THE SIGNED-IN USER'S ASSESSMENTS
   GET /api/trust/assessments
========================================== */

router.get("/assessments", authMiddleware, async (req, res) => {
    try {
        const assessments = await listTrustAssessments({
            uid: req.user.uid,
            limit: req.query.limit
        });

        return res.status(200).json({
            success: true,
            count: assessments.length,
            assessments
        });

    } catch (error) {
        console.error("List trust assessments error:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to retrieve trust assessments."
        });
    }
});


/* ==========================================
   GET ONE PRIVATE TRUST ASSESSMENT
   GET /api/trust/assess/:id
========================================== */

router.get("/assess/:id", authMiddleware, async (req, res) => {
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
});


/* ==========================================
   REQUIRED BY server.js
========================================== */

export default router;