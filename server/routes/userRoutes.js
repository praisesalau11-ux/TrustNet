
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    adminDb
} from "../services/firebaseAdmin.js";


/* ==========================================
   TrustNet
   File: server/routes/userRoutes.js

   User API
========================================== */

const router =
    express.Router();


/* ==========================================
   ALLOWED PROFILE UPDATE FIELDS
========================================== */

const allowedUpdateFields = [

    "fullName",
    "gender",
    "dateOfBirth",
    "country",
    "dialCode",
    "phone",
    "photoURL",
    "bio"

];


/* ==========================================
   CLAIM UNIQUE USERNAME
   POST /api/users/username/claim

   Uses a Firestore transaction so two
   accounts cannot claim the same username.
========================================== */

router.post(
    "/username/claim",
    authMiddleware,
    async (req, res) => {

        try {
            const uid = req.user.uid;

            const username = String(
                req.body?.username || ""
            ).trim().toLowerCase();

            const usernamePattern = /^[a-z0-9_]{3,20}$/;

            if (!usernamePattern.test(username)) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Username must be 3–20 characters and contain only letters, numbers or underscores."
                });
            }

            const userRef = adminDb
                .collection("users")
                .doc(uid);

            const newUsernameRef = adminDb
                .collection("usernameRegistry")
                .doc(username);

            const result = await adminDb.runTransaction(
                async (transaction) => {

                    // Read the user's existing profile.
                    const userSnapshot =
                        await transaction.get(userRef);

                    const existingUsername = userSnapshot.exists
                        ? String(
                            userSnapshot.data().username || ""
                        ).trim().toLowerCase()
                        : "";

                    // Read the requested username reservation.
                    const newUsernameSnapshot =
                        await transaction.get(newUsernameRef);

                    // Read the old reservation if the username changes.
                    let oldUsernameRef = null;
                    let oldUsernameSnapshot = null;

                    if (
                        existingUsername &&
                        existingUsername !== username
                    ) {
                        oldUsernameRef = adminDb
                            .collection("usernameRegistry")
                            .doc(existingUsername);

                        oldUsernameSnapshot =
                            await transaction.get(oldUsernameRef);
                    }

                    // Another account already owns this username.
                    if (
                        newUsernameSnapshot.exists &&
                        newUsernameSnapshot.data().uid !== uid
                    ) {
                        return {
                            claimed: false
                        };
                    }

                    const now = new Date();

                    // Reserve the new username.
                    transaction.set(
                        newUsernameRef,
                        {
                            uid,
                            username,
                            createdAt:
                                newUsernameSnapshot.exists
                                    ? newUsernameSnapshot.data().createdAt || now
                                    : now,
                            updatedAt: now
                        },
                        { merge: true }
                    );

                    // Update the user's public profile.
                    transaction.set(
                        userRef,
                        {
                            username,
                            updatedAt: now
                        },
                        { merge: true }
                    );

                    // Release the previous username only if
                    // it is still owned by this same account.
                    if (
                        oldUsernameRef &&
                        oldUsernameSnapshot?.exists &&
                        oldUsernameSnapshot.data().uid === uid
                    ) {
                        transaction.delete(oldUsernameRef);
                    }

                    return {
                        claimed: true,
                        username
                    };
                }
            );

            if (!result.claimed) {
                return res.status(409).json({
                    success: false,
                    error:
                        "This username is already taken. Please choose another."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Username reserved successfully.",
                username: result.username
            });

        } catch (error) {

            console.error(
                "Username reservation error:",
                error
            );

            return res.status(500).json({
                success: false,
                error: "Unable to reserve username right now."
            });
        }
    }
);


/* ==========================================
   GET CURRENT USER
========================================== */

router.get(
    "/me",
    authMiddleware,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;


            const userRecord =
                await adminDb
                    .collection("users")
                    .doc(uid)
                    .get();


            if (!userRecord.exists) {

                return res.status(404).json({

                    success: false,

                    error:
                        "User profile not found."

                });

            }


            const profile =
                userRecord.data();


            return res.status(200).json({

                success: true,

                user: {

                    uid,

                    email:
                        req.user.email ||
                        profile.email ||
                        null,

                    emailVerified:
                        req.user.email_verified ||
                        false,

                    profile

                }

            });

        } catch (error) {

            console.error(
                "Get current user error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Unable to retrieve user profile."

            });

        }

    }
);


/* ==========================================
   GET USER BY UID
========================================== */

router.get(
    "/:uid",
    authMiddleware,
    async (req, res) => {

        try {

            const requestedUid =
                req.params.uid;


            if (!requestedUid) {

                return res.status(400).json({

                    success: false,

                    error:
                        "User ID is required."

                });

            }


            const userRecord =
                await adminDb
                    .collection("users")
                    .doc(requestedUid)
                    .get();


            if (!userRecord.exists) {

                return res.status(404).json({

                    success: false,

                    error:
                        "User profile not found."

                });

            }


            const profile =
                userRecord.data();


            /*
             * Do not expose private account
             * information through public
             * profile requests.
             */

            const publicProfile = {

                uid:
                    requestedUid,

                fullName:
                    profile.fullName ||
                    null,

                username:
                    profile.username ||
                    null,

                gender:
                    profile.gender ||
                    null,

                country:
                    profile.country ||
                    null,

                photoURL:
                    profile.photoURL ||
                    null,

                bio:
                    profile.bio ||
                    null,

                createdAt:
                    profile.createdAt ||
                    null

            };


            return res.status(200).json({

                success: true,

                user:
                    publicProfile

            });

        } catch (error) {

            console.error(
                "Get user by UID error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Unable to retrieve user profile."

            });

        }

    }
);


/* ==========================================
   UPDATE CURRENT USER
========================================== */

router.patch(
    "/me",
    authMiddleware,
    async (req, res) => {

        try {

            const uid =
                req.user.uid;


            const incomingData =
                req.body;


            if (
                !incomingData ||
                typeof incomingData !== "object" ||
                Array.isArray(incomingData)
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Invalid update data."

                });

            }


            /*
             * USERNAME PROTECTION
             *
             * Usernames must be changed through
             * POST /api/users/username/claim.
             */

            if (
                Object.prototype.hasOwnProperty.call(
                    incomingData,
                    "username"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Use the username reservation endpoint to change your username."

                });

            }


            const updateData = {};


            for (
                const field
                of allowedUpdateFields
            ) {

                if (
                    Object.prototype.hasOwnProperty.call(
                        incomingData,
                        field
                    )
                ) {

                    updateData[field] =
                        incomingData[field];

                }

            }


            if (
                Object.keys(updateData).length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "No valid profile fields were provided."

                });

            }


            /*
             * Prevent empty usernames and names.
             */

            if (
                "fullName" in updateData &&
                typeof updateData.fullName === "string" &&
                !updateData.fullName.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Full name cannot be empty."

                });

            }


            /*
             * Clean string values.
             */

            for (
                const field
                of Object.keys(updateData)
            ) {

                if (
                    typeof updateData[field] === "string"
                ) {

                    updateData[field] =
                        updateData[field].trim();

                }

            }


            /*
             * Add update timestamp.
             */

            updateData.updatedAt =
                new Date();


            await adminDb
                .collection("users")
                .doc(uid)
                .set(
                    updateData,
                    {
                        merge: true
                    }
                );


            const updatedRecord =
                await adminDb
                    .collection("users")
                    .doc(uid)
                    .get();


            return res.status(200).json({

                success: true,

                message:
                    "User profile updated successfully.",

                user: {

                    uid,

                    email:
                        req.user.email ||
                        null,

                    emailVerified:
                        req.user.email_verified ||
                        false,

                    profile:
                        updatedRecord.data()

                }

            });

        } catch (error) {

            console.error(
                "Update current user error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Unable to update user profile."

            });

        }

    }
);


/* ==========================================
   EXPORT ROUTER
========================================== */

export default router;
