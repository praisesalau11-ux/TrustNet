
/* ==========================================
   TRUSTNET DASHBOARD CONTROLLER
   File: js/dashboard.js
   Firebase SDK: 12.1.0
========================================== */

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase.js";

import {
  initializeDashboardRouter,
  setProfile,
  showToast
} from "./dashboard-router.js";

/* ==========================================
   CONFIGURATION
========================================== */

const LOGIN_PAGE = "/login.html";
const COMPLETE_PROFILE_PAGE = "/complete-profile.html";

/* ==========================================
   ELEMENTS
========================================== */

const dashboardContent = document.getElementById("dashboardContent");
const logoutButton = document.getElementById("logoutButton");

/* ==========================================
   STATE
========================================== */

let routerInitialized = false;
let signingOut = false;
let authCheckStarted = false;

/* ==========================================
   LOADING SCREEN
========================================== */

function showLoading(message = "Preparing your TrustNet workspace...") {
  if (!dashboardContent) return;

  dashboardContent.innerHTML = `
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

/* ==========================================
   ERROR DISPLAY
========================================== */

function showDashboardError(message) {
  if (!dashboardContent) return;

  dashboardContent.innerHTML = `
    <article class="module-placeholder">
      <div class="empty-state">

        <div class="empty-icon">!</div>

        <strong>Unable to load your dashboard</strong>

        <p>${escapeHTML(message)}</p>

        <button
          type="button"
          class="button button-primary"
          id="retryDashboard"
          style="margin-top:15px"
        >
          Try again
        </button>

      </div>
    </article>
  `;

  document.getElementById("retryDashboard")
    ?.addEventListener("click", () => {
      if (auth.currentUser) {
        loadDashboard(auth.currentUser);
      }
    });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return replacements[character];
  });
}

/* ==========================================
   GET FIRESTORE USER PROFILE
========================================== */

async function getUserProfile(user) {
  const userReference = doc(db, "users", user.uid);

  const snapshot = await getDoc(userReference);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

/* ==========================================
   LOAD DASHBOARD
========================================== */

async function loadDashboard(user) {
  if (!user) return;

  try {
    showLoading();

    // Make authenticated Firebase user available
    // to the dashboard router.
    window.trustNetFirebaseUser = user;

    // Retrieve the current user's own profile.
    const profile = await getUserProfile(user);

    if (!profile) {
      window.location.replace(COMPLETE_PROFILE_PAGE);
      return;
    }

    // Prevent incomplete profiles from entering
    // the dashboard.
    if (profile.profileComplete !== true) {
      window.location.replace(COMPLETE_PROFILE_PAGE);
      return;
    }

    // Load real profile information.
    setProfile(profile);

    // Initialize router once.
    if (!routerInitialized) {
      initializeDashboardRouter();
      routerInitialized = true;
    }

  } catch (error) {
    console.error("TrustNet dashboard error:", error);

    if (error.code === "permission-denied") {
      showDashboardError(
        "Firebase denied access to your profile. Check your Firestore rules and confirm that the signed-in user can read their own users document."
      );

      return;
    }

    if (error.code === "unavailable") {
      showDashboardError(
        "Firebase is temporarily unavailable. Check your internet connection and try again."
      );

      return;
    }

    if (error.code === "unauthenticated") {
      window.location.replace(LOGIN_PAGE);
      return;
    }

    showDashboardError(
      "Something went wrong while loading your account. Please try again."
    );
  }
}

/* ==========================================
   SIGN OUT
========================================== */

async function handleLogout() {
  if (signingOut) return;

  signingOut = true;

  if (logoutButton) {
    logoutButton.disabled = true;
    logoutButton.textContent = "Signing out...";
  }

  try {
    await signOut(auth);

    // onAuthStateChanged handles the redirect.

  } catch (error) {
    console.error("TrustNet sign-out error:", error);

    signingOut = false;

    if (logoutButton) {
      logoutButton.disabled = false;
      logoutButton.innerHTML = "<span>↪</span> Sign out";
    }

    showToast(
      "Unable to sign out. Please try again.",
      "error"
    );
  }
}

logoutButton?.addEventListener("click", handleLogout);

/* ==========================================
   FIREBASE AUTH STATE
========================================== */

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.trustNetFirebaseUser = null;

    if (signingOut || authCheckStarted) {
      window.location.replace(LOGIN_PAGE);
      return;
    }

    window.location.replace(LOGIN_PAGE);
    return;
  }

  authCheckStarted = true;

  await loadDashboard(user);
});

/* ==========================================
   INITIALIZATION
========================================== */

showLoading();
