import admin from "firebase-admin";
import dotenv from "dotenv";

/* ==========================================
LOAD ENVIRONMENT VARIABLES
========================================== */

dotenv.config();

/* ==========================================
VALIDATE REQUIRED FIREBASE VARIABLES
========================================== */

const requiredVariables = [
"FIREBASE_PROJECT_ID",
"FIREBASE_CLIENT_EMAIL",
"FIREBASE_PRIVATE_KEY"
];

for (const variable of requiredVariables) {

if (!process.env[variable]) {

    throw new Error(
        `Missing required environment variable: ${variable}`
    );

}

}

/* ==========================================
PREPARE FIREBASE PRIVATE KEY
========================================== */

const privateKey =
process.env.FIREBASE_PRIVATE_KEY
.replace(/\n/g, "\n");

/* ==========================================
INITIALIZE FIREBASE ADMIN
========================================== */

const firebaseAdmin =
admin.initializeApp({

    credential:
        admin.credential.cert({

            projectId:
                process.env.FIREBASE_PROJECT_ID,

            clientEmail:
                process.env.FIREBASE_CLIENT_EMAIL,

            privateKey

        })

});

/* ==========================================
FIREBASE ADMIN SERVICES
========================================== */

const adminAuth =
admin.auth(firebaseAdmin);

const adminDb =
admin.firestore(firebaseAdmin);

const adminStorage =
admin.storage(firebaseAdmin);

/* ==========================================
EXPORT SERVICES
========================================== */

export {
firebaseAdmin,
adminAuth,
adminDb,
adminStorage
};