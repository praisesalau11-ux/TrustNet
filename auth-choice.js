import {
auth,
db,
googleProvider
} from "./firebase.js";

import {
signInWithPopup,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
doc,
getDoc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

const googleButton =
    document.getElementById("googleSignUpButton");

const authMessage =
    document.getElementById("authMessage");


if (!googleButton) {
    return;
}


function showMessage(message, type = "info") {

    if (!authMessage) {
        return;
    }

    authMessage.textContent = message;

    authMessage.className =
        "auth-message " + type;
}


function setButtonLoading(loading) {

    googleButton.disabled = loading;

    if (loading) {

        googleButton.dataset.originalText =
            googleButton.querySelector(".button-text")?.textContent ||
            "Continue with Google";

        const text =
            googleButton.querySelector(".button-text");

        if (text) {
            text.textContent =
                "Connecting to Google...";
        }

    } else {

        const text =
            googleButton.querySelector(".button-text");

        if (text) {
            text.textContent =
                googleButton.dataset.originalText ||
                "Continue with Google";
        }
    }
}


async function createUserDocument(user) {

    if (!user) {
        return;
    }

    const userRef =
        doc(db, "users", user.uid);

    const userSnapshot =
        await getDoc(userRef);


    if (!userSnapshot.exists()) {

        await setDoc(userRef, {

            uid: user.uid,

            fullName:
                user.displayName || "",

            username:
                "",

            email:
                user.email || "",

            phone:
                user.phoneNumber || "",

            photoURL:
                user.photoURL || "",

            provider:
                "google",

            country:
                "",

            gender:
                "",

            dateOfBirth:
                "",

            age:
                null,

            accountType:
                "user",

            verified:
                true,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        });

    } else {

        await setDoc(
            userRef,
            {
                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );
    }
}


async function continueWithGoogle() {

    setButtonLoading(true);

    showMessage(
        "Opening Google sign-in..."
    );


    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            result.user;


        if (!user) {
            throw new Error(
                "Google authentication did not return a user."
            );
        }


        await createUserDocument(user);


        showMessage(
            "Account created successfully. Redirecting..."
        );


        setTimeout(() => {

            window.location.href =
                "/dashboard.html";

        }, 700);


    } catch (error) {

        console.error(
            "TrustNet Google sign-up error:",
            error
        );


        let message =
            "Unable to create your account. Please try again.";


        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            message =
                "Google sign-in was cancelled.";

        } else if (
            error.code ===
            "auth/popup-blocked"
        ) {

            message =
                "Your browser blocked the Google sign-in popup. Please allow popups and try again.";

        } else if (
            error.code ===
            "auth/cancelled-popup-request"
        ) {

            message =
                "Another Google sign-in window is already open.";

        } else if (
            error.code ===
            "auth/network-request-failed"
        ) {

            message =
                "Network error. Check your internet connection and try again.";

        } else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "Google sign-in is not enabled in Firebase Authentication.";

        } else if (
            error.code ===
            "auth/unauthorized-domain"
        ) {

            message =
                "This website domain is not authorized in Firebase Authentication.";

        } else if (
            error.code ===
            "permission-denied"
        ) {

            message =
                "Your account was authenticated, but TrustNet could not save your profile. Check Firestore rules.";

        } else if (error.message) {

            message =
                error.message;
        }


        showMessage(
            message,
            "error"
        );

    } finally {

        setButtonLoading(false);
    }
}


googleButton.addEventListener(
    "click",
    continueWithGoogle
);


onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {
            return;
        }


        const currentPath =
            window.location.pathname;


        if (
            currentPath.endsWith(
                "/auth-choice.html"
            )
        ) {

            try {

                await createUserDocument(
                    user
                );

            } catch (error) {

                console.error(
                    "Unable to sync authenticated user:",
                    error
                );
            }
        }
    }
);

});