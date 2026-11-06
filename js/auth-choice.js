
import {
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    auth,
    db,
    googleProvider
} from "./firebase.js";


const googleSignUpButton = document.getElementById(
    "googleSignUpButton"
);

const authMessage = document.getElementById("authMessage");


function showMessage(message, type = "info") {
    authMessage.textContent = message;
    authMessage.className = `auth-message show ${type}`;
}


function clearMessage() {
    authMessage.textContent = "";
    authMessage.className = "auth-message";
}


function setLoading(isLoading) {
    googleSignUpButton.disabled = isLoading;

    const buttonText = googleSignUpButton.querySelector(
        ".button-text"
    );

    if (isLoading) {
        buttonText.textContent = "Connecting to Google...";
    } else {
        buttonText.textContent = "Continue with Google";
    }
}


function getFirebaseErrorMessage(error) {
    switch (error.code) {
        case "auth/popup-closed-by-user":
            return "Google sign-in was cancelled. You can try again.";

        case "auth/popup-blocked":
            return "Your browser blocked the Google sign-in window. Allow popups and try again.";

        case "auth/unauthorized-domain":
            return "This website domain is not authorized in your Firebase Authentication settings.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection and try again.";

        case "auth/account-exists-with-different-credential":
            return "An account with this email already exists using another sign-in method. Log in using that method first.";

        default:
            return error.message || "Something went wrong. Please try again.";
    }
}


async function handleGoogleSignUp() {
    clearMessage();
    setLoading(true);

    try {
        googleProvider.setCustomParameters({
            prompt: "select_account"
        });

        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;

        if (!user) {
            throw new Error("Firebase did not return a user account.");
        }

        const userRef = doc(db, "users", user.uid);

        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            const newProfile = {
                uid: user.uid,
                fullName: user.displayName || "",
                email: user.email || "",
                photoURL: user.photoURL || "",
                username: "",
                country: "",
                phone: "",
                bio: "",
                profileComplete: false,
                accountProvider: "google",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(userRef, newProfile);

        } else {
            await setDoc(
                userRef,
                {
                    email: user.email || "",
                    photoURL: user.photoURL || "",
                    lastLoginAt: serverTimestamp()
                },
                {
                    merge: true
                }
            );
        }

        showMessage(
            "Google authentication successful. Redirecting...",
            "success"
        );

        window.location.replace("/dashboard.html");

    } catch (error) {
        console.error("TrustNet Google authentication error:", error);

        showMessage(
            getFirebaseErrorMessage(error),
            "error"
        );

        setLoading(false);
    }
}


googleSignUpButton.addEventListener(
    "click",
    handleGoogleSignUp
);
