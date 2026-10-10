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
        console.error(
            "Get trust assessment error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Unable to retrieve trust assessment."
        });
    }
}

);