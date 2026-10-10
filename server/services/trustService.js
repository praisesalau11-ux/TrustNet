import { adminDb } from "./firebaseAdmin.js";

/* ==========================================
TrustNet
File: server/services/trustService.js

Initial Evidence-Based Trust Assessment
========================================== */

const VALID_CATEGORIES = [
"person",
"business",
"product",
"service",
"opportunity",
"information"
];

const VALID_RISK_LEVELS = [
"low",
"moderate",
"high"
];

/**

Evaluates supplied evidence.



This initial version does not independently

verify claims. It records evidence and flags

explicit concerns for further review.
*/
export async function assessTrust({
uid,
category,
subject,
evidence = [],
concerns = []
}) {
if (!uid) {
throw new Error("Authenticated user is required.");
}

if (!VALID_CATEGORIES.includes(category)) {
throw new Error("Invalid assessment category.");
}

if (
typeof subject !== "string" ||
!subject.trim() ||
subject.length > 200
) {
throw new Error("Subject must contain 1–200 characters.");
}

if (
!Array.isArray(evidence) ||
evidence.length > 30
) {
throw new Error("Evidence must be an array of up to 30 items.");
}

if (
!Array.isArray(concerns) ||
concerns.length > 20
) {
throw new Error("Concerns must be an array of up to 20 items.");
}

const cleanEvidence = evidence.map((item) => {
if (
!item ||
typeof item.description !== "string" ||
!item.description.trim() ||
item.description.length > 1000
) {
throw new Error("Each evidence item needs a description of up to 1000 characters.");
}

 return {
     description: item.description.trim(),
     source: typeof item.source === "string"
         ? item.source.trim().slice(0, 300)
         : null,
     type: typeof item.type === "string"
         ? item.type.trim().slice(0, 50)
         : "user-submitted"
 };

});

const cleanConcerns = concerns.map((item) => {
if (
typeof item !== "string" ||
!item.trim() ||
item.length > 500
) {
throw new Error("Each concern must be a description of up to 500 characters.");
}

 return item.trim();

});

const evidenceCount = cleanEvidence.length;
const concernCount = cleanConcerns.length;

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

const assessment = {
category,
subject: subject.trim(),
riskLevel,
explanation,
evidence: cleanEvidence,
reportedConcerns: cleanConcerns,
evidenceCount,
concernCount,
confidence: "not_yet_calculated",
independentlyVerified: false,
createdBy: uid,
createdAt: new Date().toISOString(),
modelVersion: "1.0.0"
};

const documentRef = await adminDb
.collection("trustAssessments")
.add(assessment);

return {
id: documentRef.id,
...assessment
};
}

export async function getTrustAssessment({
uid,
assessmentId
}) {
if (!uid || !assessmentId) {
throw new Error("User and assessment IDs are required.");
}

const documentRef = adminDb
    .collection("trustAssessments")
    .doc(assessmentId);

const snapshot = await documentRef.get();

if (!snapshot.exists) {
    return null;
}

const assessment = snapshot.data();

// Only the creator can read this initial private assessment.
if (assessment.createdBy !== uid) {
    return null;
}

return {
    id: snapshot.id,
    ...assessment
};

}