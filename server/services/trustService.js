
import { adminDb } from "./firebaseAdmin.js";

/* ==========================================
   TRUSTNET
   File: server/services/trustService.js

   Evidence-Based Trust Assessment Service
========================================== */

const VALID_CATEGORIES = [
    "person",
    "business",
    "product",
    "service",
    "job",
    "opportunity",
    "website",
    "information"
];

const MAX_EVIDENCE = 30;
const MAX_CONCERNS = 20;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;


/* ==========================================
   VALIDATION ERROR
========================================== */

function validationError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}


/* ==========================================
   VALIDATE USER ID
========================================== */

function validateUid(uid) {
    if (
        typeof uid !== "string" ||
        !uid.trim()
    ) {
        throw validationError("Authenticated user is required.");
    }

    return uid.trim();
}


/* ==========================================
   VALIDATE CATEGORY
========================================== */

function validateCategory(category) {
    if (typeof category !== "string") {
        throw validationError("Invalid assessment category.");
    }

    const normalized = category.trim().toLowerCase();

    if (!VALID_CATEGORIES.includes(normalized)) {
        throw validationError(
            `Invalid assessment category. Allowed categories: ${VALID_CATEGORIES.join(", ")}.`
        );
    }

    return normalized;
}


/* ==========================================
   VALIDATE SUBJECT
========================================== */

function validateSubject(subject) {
    if (typeof subject !== "string") {
        throw validationError(
            "Subject must contain 1–200 characters."
        );
    }

    const normalized = subject.trim();

    if (
        normalized.length < 1 ||
        normalized.length > 200
    ) {
        throw validationError(
            "Subject must contain 1–200 characters."
        );
    }

    return normalized;
}


/* ==========================================
   CLEAN EVIDENCE
========================================== */

function cleanEvidence(evidence) {
    if (
        evidence === undefined ||
        evidence === null
    ) {
        return [];
    }

    if (
        !Array.isArray(evidence) ||
        evidence.length > MAX_EVIDENCE
    ) {
        throw validationError(
            `Evidence must be an array of up to ${MAX_EVIDENCE} items.`
        );
    }

    return evidence.map((item, index) => {
        if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item)
        ) {
            throw validationError(
                `Evidence item ${index + 1} must be an object.`
            );
        }

        if (
            typeof item.description !== "string" ||
            !item.description.trim() ||
            item.description.trim().length > 1000
        ) {
            throw validationError(
                "Each evidence item needs a description of up to 1000 characters."
            );
        }

        if (
            item.source !== undefined &&
            item.source !== null &&
            typeof item.source !== "string"
        ) {
            throw validationError(
                "Evidence source must be text."
            );
        }

        if (
            item.type !== undefined &&
            item.type !== null &&
            typeof item.type !== "string"
        ) {
            throw validationError(
                "Evidence type must be text."
            );
        }

        return {
            description: item.description.trim(),

            source:
                typeof item.source === "string"
                    ? item.source.trim().slice(0, 300) || null
                    : null,

            type:
                typeof item.type === "string" &&
                item.type.trim()
                    ? item.type.trim().slice(0, 50)
                    : "user-submitted"
        };
    });
}


/* ==========================================
   CLEAN REPORTED CONCERNS
========================================== */

function cleanConcerns(concerns) {
    if (
        concerns === undefined ||
        concerns === null
    ) {
        return [];
    }

    if (
        !Array.isArray(concerns) ||
        concerns.length > MAX_CONCERNS
    ) {
        throw validationError(
            `Concerns must be an array of up to ${MAX_CONCERNS} items.`
        );
    }

    return concerns.map((item) => {
        if (
            typeof item !== "string" ||
            !item.trim() ||
            item.trim().length > 500
        ) {
            throw validationError(
                "Each concern must be a description of up to 500 characters."
            );
        }

        return item.trim();
    });
}


/* ==========================================
   CREATE TRUST ASSESSMENT

   This creates an assessment record.
   It does not perform AI analysis or
   independently verify submitted evidence.
========================================== */

export async function assessTrust({
    uid,
    category,
    subject,
    evidence = [],
    concerns = []
}) {
    const authenticatedUid = validateUid(uid);

    const normalizedCategory = validateCategory(category);

    const normalizedSubject = validateSubject(subject);

    const cleanEvidenceItems = cleanEvidence(evidence);

    const cleanReportedConcerns = cleanConcerns(concerns);

    const evidenceCount = cleanEvidenceItems.length;
    const concernCount = cleanReportedConcerns.length;

    /*
     * Preliminary intake classification.
     *
     * These values are not verified trust scores.
     * They only describe the state of submitted information.
     */

    let riskLevel = "insufficient_evidence";

    let explanation =
        "There is not enough submitted evidence to assess risk reliably.";

    if (evidenceCount > 0 && concernCount === 0) {
        riskLevel = "unassessed";

        explanation =
            "Evidence was submitted, but it has not been independently verified. No conclusion about trustworthiness can yet be made.";
    }

    if (concernCount > 0) {
        riskLevel = "review_required";

        explanation =
            "Potential concerns were reported. They require verification before a reliable risk conclusion can be made.";
    }

    const now = new Date().toISOString();

    const assessment = {
        category: normalizedCategory,

        subject: normalizedSubject,

        // Kept for compatibility with existing dashboard code.
        riskLevel,

        // Explicitly separates intake from actual analysis.
        status: "submitted",

        assessmentStatus: "not_assessed",

        explanation,

        evidence: cleanEvidenceItems,

        reportedConcerns: cleanReportedConcerns,

        evidenceCount,

        concernCount,

        confidence: "not_yet_calculated",

        independentlyVerified: false,

        createdBy: authenticatedUid,

        createdAt: now,

        updatedAt: now,

        modelVersion: "1.1.0"
    };

    const documentRef = await adminDb
        .collection("trustAssessments")
        .add(assessment);

    return {
        id: documentRef.id,
        ...assessment
    };
}


/* ==========================================
   GET ONE PRIVATE TRUST ASSESSMENT

   Only its creator can retrieve it.
========================================== */

export async function getTrustAssessment({
    uid,
    assessmentId
}) {
    const authenticatedUid = validateUid(uid);

    if (
        typeof assessmentId !== "string" ||
        !assessmentId.trim() ||
        assessmentId.includes("/")
    ) {
        throw validationError("Invalid assessment ID.");
    }

    const documentRef = adminDb
        .collection("trustAssessments")
        .doc(assessmentId.trim());

    const snapshot = await documentRef.get();

    if (!snapshot.exists) {
        return null;
    }

    const assessment = snapshot.data();

    // Only the creator can read this private assessment.
    if (assessment.createdBy !== authenticatedUid) {
        return null;
    }

    return {
        id: snapshot.id,
        ...assessment
    };
}


/* ==========================================
   LIST PRIVATE TRUST ASSESSMENTS

   Returns only assessments created by the
   signed-in user, newest first.

   Default limit: 50
   Maximum limit: 100

   Firestore performs the filtering, sorting
   and limiting instead of loading every record.
========================================== */

export async function listTrustAssessments({
    uid,
    limit = DEFAULT_LIMIT
}) {
    const authenticatedUid = validateUid(uid);

    const parsedLimit = Number.parseInt(limit, 10);

    const safeLimit = Math.min(
        Math.max(
            Number.isFinite(parsedLimit) && parsedLimit > 0
                ? parsedLimit
                : DEFAULT_LIMIT,
            1
        ),
        MAX_LIMIT
    );

    const snapshot = await adminDb
        .collection("trustAssessments")
        .where("createdBy", "==", authenticatedUid)
        .orderBy("createdAt", "desc")
        .limit(safeLimit)
        .get();

    return snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
    }));
}
