
/* ==========================================
   TRUSTNET LOGIN
   File: js/login.js
   Firebase SDK: 12.1.0
========================================== */

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail
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

// ==========================================
// ELEMENTS
// ==========================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("loginButton");
const googleLoginButton = document.getElementById("googleLoginButton");

const forgotPasswordButton =
  document.getElementById("forgotPasswordButton");

const togglePasswordButton =
  document.getElementById("togglePassword");

const messageBox = document.getElementById("loginMessage");

let isSubmitting = false;

// ==========================================
// MESSAGE HANDLING
// ==========================================

function showMessage(message, type = "error") {
  messageBox.textContent = message;
  messageBox.className = `login-message ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "login-message";
}

// ==========================================
// BUTTON STATE
// ==========================================

function setLoading(loading, message = "Please wait...") {
  isSubmitting = loading;

  loginButton.disabled = loading;
  googleLoginButton.disabled = loading;
  forgotPasswordButton.disabled = loading;

  loginButton.textContent = loading ? message : "Log in";

  googleLoginButton.querySelector("span").textContent =
    loading ? "Please wait..." : "Continue with Google";
}

// ==========================================
// FIREBASE ERROR HANDLING
// ==========================================

function getLoginErrorMessage(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";

    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/wrong-password":
      return "Incorrect email or password.";

    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";

    case "auth/too-many-requests":
      return "Too many login attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup.";

    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication.";

    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using another sign-in method.";

    case "permission-denied":
    case "firestore/permission-denied":
      return "TrustNet could not access your profile. Check your Firestore security rules.";

    default:
      return error.message || "Login failed. Please try again.";
  }
}

// ==========================================
// PROFILE CHECK AND ROUTING
// ==========================================

async function getLoginDestination(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  // Create a minimal profile if an authenticated
  // account does not yet have a Firestore user document.
  if (!userSnapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      fullName: user.displayName || "",
      username: "",
      photoURL: user.photoURL || null,
      email: user.email || "",
      profileComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return "/complete-profile.html";
  }

  const profile = userSnapshot.data();

  // Incomplete profiles must finish setup first.
  if (profile.profileComplete !== true) {
    return "/complete-profile.html";
  }

  return "/dashboard.html";
}

// ==========================================
// EMAIL LOGIN
// ==========================================

async function loginWithEmail(event) {
  event.preventDefault();

  if (isSubmitting) return;

  clearMessage();

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !emailInput.validity.valid) {
    showMessage("Enter a valid email address.");
    emailInput.focus();
    return;
  }

  if (!password) {
    showMessage("Enter your password.");
    passwordInput.focus();
    return;
  }

  try {
    setLoading(true, "Logging in...");

    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    const destination = await getLoginDestination(user);

    showMessage("Login successful. Redirecting...", "success");

    window.location.href = destination;

  } catch (error) {
    console.error("TrustNet email login error:", error);

    showMessage(getLoginErrorMessage(error));

    setLoading(false);
  }
}

// ==========================================
// GOOGLE LOGIN
// ==========================================

async function loginWithGoogle() {
  if (isSubmitting) return;

  clearMessage();

  try {
    setLoading(true, "Connecting...");

    googleProvider.setCustomParameters({
      prompt: "select_account"
    });

    const credential = await signInWithPopup(
      auth,
      googleProvider
    );

    const user = credential.user;

    const destination = await getLoginDestination(user);

    showMessage("Google login successful. Redirecting...", "success");

    window.location.href = destination;

  } catch (error) {
    console.error("TrustNet Google login error:", error);

    showMessage(getLoginErrorMessage(error));

    setLoading(false);
  }
}

// ==========================================
// PASSWORD RESET
// ==========================================

async function resetPassword() {
  if (isSubmitting) return;

  clearMessage();

  const email = emailInput.value.trim().toLowerCase();

  if (!email || !emailInput.validity.valid) {
    showMessage(
      "Enter your registered email address in the email field first."
    );

    emailInput.focus();
    return;
  }

  try {
    forgotPasswordButton.disabled = true;
    forgotPasswordButton.textContent = "Sending...";

    await sendPasswordResetEmail(auth, email);

    showMessage(
      "If an account exists for this email, a password reset email will be sent. Check your inbox and spam folder.",
      "success"
    );

  } catch (error) {
    console.error("TrustNet password reset error:", error);

    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-credential"
    ) {
      showMessage(
        "If an account exists for this email, a password reset email will be sent. Check your inbox and spam folder.",
        "success"
      );
    } else {
      showMessage(getLoginErrorMessage(error));
    }

  } finally {
    forgotPasswordButton.disabled = false;
    forgotPasswordButton.textContent = "Forgot password?";
  }
}

// ==========================================
// PASSWORD VISIBILITY
// ==========================================

function togglePasswordVisibility() {
  const shouldShow = passwordInput.type === "password";

  passwordInput.type = shouldShow ? "text" : "password";

  togglePasswordButton.textContent =
    shouldShow ? "Hide" : "Show";

  togglePasswordButton.setAttribute(
    "aria-label",
    shouldShow ? "Hide password" : "Show password"
  );
}

// ==========================================
// EVENT LISTENERS
// ==========================================

loginForm.addEventListener("submit", loginWithEmail);

googleLoginButton.addEventListener("click", loginWithGoogle);

forgotPasswordButton.addEventListener("click", resetPassword);

togglePasswordButton.addEventListener(
  "click",
  togglePasswordVisibility
);

// ==========================================
// INITIALIZATION
// ==========================================

document.getElementById("currentYear").textContent =
  new Date().getFullYear();

console.log("TrustNet login initialized.");
