
/* ==========================================
   TRUSTNET SIGNUP
   File: js/signup.js
   Firebase SDK: 12.1.0
========================================== */

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";
import { countries } from "../data/countries.js";
import { claimUsername } from "./username.js";

// ==========================================
// ELEMENTS
// ==========================================

const signupForm = document.getElementById("signupForm");

const countrySelect = document.getElementById("country");
const dialCodeSelect = document.getElementById("dialCode");

const messageBox = document.getElementById("signupMessage");
const createAccountButton = document.getElementById("createAccountButton");
const progressFill = document.getElementById("progressFill");

const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const genderSelect = document.getElementById("gender");

const birthDaySelect = document.getElementById("birthDay");
const birthMonthSelect = document.getElementById("birthMonth");
const birthYearSelect = document.getElementById("birthYear");

const termsCheckbox = document.getElementById("terms");

let currentStep = 1;
let isSubmitting = false;

// ==========================================
// MESSAGE HANDLING
// ==========================================

function showMessage(message, type = "error") {
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.className = `signup-message ${type}`;
}

function clearMessage() {
  if (!messageBox) return;

  messageBox.textContent = "";
  messageBox.className = "signup-message";
}

// ==========================================
// COUNTRY DATA
// ==========================================

function populateCountries() {
  if (!countrySelect || !dialCodeSelect) {
    console.error("Country or dial-code dropdown was not found.");
    return;
  }

  if (!Array.isArray(countries) || countries.length === 0) {
    showMessage("Country information could not be loaded.");
    return;
  }

  countrySelect.innerHTML =
    '<option value="">Select your country</option>';

  dialCodeSelect.innerHTML =
    '<option value="">Select dial code</option>';

  countries.forEach((country) => {
    const countryOption = document.createElement("option");

    countryOption.value = country.code;
    countryOption.textContent =
      `${country.flag} ${country.name}`;

    countrySelect.appendChild(countryOption);

    const dialOption = document.createElement("option");

    // Country code is used as the value because
    // multiple countries can share the same dial code.
    dialOption.value = country.code;

    dialOption.textContent =
      `${country.dialCode} — ${country.name}`;

    dialCodeSelect.appendChild(dialOption);
  });

  // Default country: Nigeria
  countrySelect.value = "NG";
  dialCodeSelect.value = "NG";
}

function syncCountryToDialCode() {
  dialCodeSelect.value = countrySelect.value;
}

function syncDialCodeToCountry() {
  countrySelect.value = dialCodeSelect.value;
}

countrySelect?.addEventListener(
  "change",
  syncCountryToDialCode
);

dialCodeSelect?.addEventListener(
  "change",
  syncDialCodeToCountry
);

// ==========================================
// DATE OF BIRTH
// ==========================================

function populateDateFields() {
  if (!birthDaySelect || !birthMonthSelect || !birthYearSelect) {
    console.error("Date-of-birth fields were not found.");
    return;
  }

  birthDaySelect.innerHTML =
    '<option value="">Day</option>';

  birthMonthSelect.innerHTML =
    '<option value="">Month</option>';

  birthYearSelect.innerHTML =
    '<option value="">Year</option>';

  // Days
  for (let day = 1; day <= 31; day++) {
    const option = document.createElement("option");

    option.value = String(day);
    option.textContent = String(day);

    birthDaySelect.appendChild(option);
  }

  // Months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  months.forEach((month, index) => {
    const option = document.createElement("option");

    option.value = String(index + 1);
    option.textContent = month;

    birthMonthSelect.appendChild(option);
  });

  // Years
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement("option");

    option.value = String(year);
    option.textContent = String(year);

    birthYearSelect.appendChild(option);
  }
}

// ==========================================
// STEP MANAGEMENT
// ==========================================

function showStep(step) {
  if (step < 1 || step > 3) return;

  currentStep = step;

  document.querySelectorAll(".form-step").forEach((panel) => {
    const panelStep = Number(panel.dataset.step);
    const active = panelStep === step;

    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });

  document.querySelectorAll(".progress-step").forEach((item) => {
    const itemStep = Number(item.dataset.step);

    item.classList.toggle("active", itemStep === step);
    item.classList.toggle("completed", itemStep < step);
  });

  if (progressFill) {
    progressFill.style.width = `${(step / 3) * 100}%`;
  }

  clearMessage();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ==========================================
// STEP 1 VALIDATION
// ==========================================

function validateStepOne() {
  const fullName = fullNameInput.value.trim();
  const username = usernameInput.value.trim().toLowerCase();

  if (fullName.length < 2) {
    showMessage("Enter your full name.");
    fullNameInput.focus();
    return false;
  }

  if (fullName.length > 80) {
    showMessage("Your full name must be 80 characters or fewer.");
    fullNameInput.focus();
    return false;
  }

  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

  if (!usernamePattern.test(username)) {
    showMessage(
      "Username must be 3–20 characters and contain only letters, numbers or underscores."
    );

    usernameInput.focus();
    return false;
  }

  usernameInput.value = username;

  return true;
}

// ==========================================
// STEP 2 VALIDATION
// ==========================================

function validateStepTwo() {
  const email = emailInput.value.trim();

  const country = countrySelect.value;
  const dialCode = dialCodeSelect.value;

  const phone = phoneInput.value.trim();

  if (!email || !emailInput.validity.valid) {
    showMessage("Enter a valid email address.");
    emailInput.focus();
    return false;
  }

  if (!country) {
    showMessage("Select your country.");
    countrySelect.focus();
    return false;
  }

  if (!dialCode || country !== dialCode) {
    showMessage("Select a matching international dial code.");
    dialCodeSelect.focus();
    return false;
  }

  const phoneDigits = phone.replace(/\D/g, "");

  if (phoneDigits.length < 6 || phoneDigits.length > 14) {
    showMessage("Enter a valid local phone number.");
    phoneInput.focus();
    return false;
  }

  return true;
}

// ==========================================
// DATE VALIDATION
// ==========================================

function getDateOfBirth() {
  const day = Number(birthDaySelect.value);
  const month = Number(birthMonthSelect.value);
  const year = Number(birthYearSelect.value);

  if (!day || !month || !year) {
    throw new Error("Complete your date of birth.");
  }

  const date = new Date(year, month - 1, day);

  const isValidDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!isValidDate) {
    throw new Error("Enter a valid date of birth.");
  }

  if (date > new Date()) {
    throw new Error("Your date of birth cannot be in the future.");
  }

  return [
    year,
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

// ==========================================
// STEP 3 VALIDATION
// ==========================================

function validateStepThree() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (password.length < 8) {
    showMessage("Your password must contain at least 8 characters.");
    passwordInput.focus();
    return false;
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    showMessage(
      "Your password must contain at least one letter and one number."
    );

    passwordInput.focus();
    return false;
  }

  if (password !== confirmPassword) {
    showMessage("Your passwords do not match.");
    confirmPasswordInput.focus();
    return false;
  }

  if (!genderSelect.value) {
    showMessage("Select a gender option.");
    genderSelect.focus();
    return false;
  }

  try {
    getDateOfBirth();
  } catch (error) {
    showMessage(error.message);
    return false;
  }

  if (!termsCheckbox.checked) {
    showMessage("You must accept the Terms and Conditions.");
    termsCheckbox.focus();
    return false;
  }

  return true;
}

// ==========================================
// NEXT BUTTONS
// ==========================================

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => {
    clearMessage();

    if (currentStep === 1 && !validateStepOne()) {
      return;
    }

    if (currentStep === 2 && !validateStepTwo()) {
      return;
    }

    const nextStep = Number(button.dataset.next);

    showStep(nextStep);
  });
});

// ==========================================
// BACK BUTTONS
// ==========================================

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => {
    const previousStep = Number(button.dataset.back);

    showStep(previousStep);
  });
});

// ==========================================
// PASSWORD VISIBILITY
// ==========================================

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);

    if (!input) return;

    const shouldShow = input.type === "password";

    input.type = shouldShow ? "text" : "password";

    button.textContent = shouldShow ? "Hide" : "Show";

    button.setAttribute(
      "aria-label",
      shouldShow ? "Hide password" : "Show password"
    );
  });
});

// ==========================================
// PHONE NORMALIZATION
// ==========================================

function normalizePhoneNumber() {
  const selectedCountry = countries.find(
    (country) => country.code === dialCodeSelect.value
  );

  if (!selectedCountry) {
    throw new Error("Select a valid international dial code.");
  }

  let localNumber = phoneInput.value.replace(/\D/g, "");

  // Remove a leading trunk zero.
  if (localNumber.startsWith("0")) {
    localNumber = localNumber.slice(1);
  }

  if (localNumber.length < 6 || localNumber.length > 14) {
    throw new Error("Enter a valid phone number.");
  }

  const internationalCode =
    selectedCountry.dialCode.replace(/\D/g, "");

  return `+${internationalCode}${localNumber}`;
}

// ==========================================
// PROFILE DATA
// ==========================================

function buildProfileData(user) {
  const selectedCountry = countries.find(
    (country) => country.code === countrySelect.value
  );

  if (!selectedCountry) {
    throw new Error("Select a valid country.");
  }

  const phoneNumber = normalizePhoneNumber();
  const birthDate = getDateOfBirth();

  const publicProfile = {
    uid: user.uid,

    fullName: fullNameInput.value.trim(),

    username: usernameInput.value.trim().toLowerCase(),

    photoURL: user.photoURL || null,

    country: selectedCountry.name,

    countryCode: selectedCountry.code,

    bio: "",

    profileComplete: true,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp()
  };

  const privateProfile = {
    uid: user.uid,

    email: user.email,

    phone: phoneNumber,

    dialCode: selectedCountry.dialCode,

    gender: genderSelect.value,

    dateOfBirth: birthDate,

    termsAcceptedAt: serverTimestamp(),

    updatedAt: serverTimestamp()
  };

  return {
    publicProfile,
    privateProfile
  };
}

// ==========================================
// SAVE FIRESTORE PROFILE
// ==========================================

async function saveUserProfile(user) {
  const {
    publicProfile,
    privateProfile
  } = buildProfileData(user);

  const batch = writeBatch(db);

  // Public profile
  batch.set(
    doc(db, "users", user.uid),
    publicProfile,
    { merge: true }
  );

  // Private account information
  batch.set(
    doc(db, "userPrivate", user.uid),
    privateProfile,
    { merge: true }
  );

  await batch.commit();
}

// ==========================================
// ERROR MESSAGES
// ==========================================

function getSignupErrorMessage(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email. Try logging in.";

    case "auth/invalid-email":
      return "The email address is invalid.";

    case "auth/weak-password":
      return "Your password is too weak.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/operation-not-allowed":
      return "Email and password registration is not enabled in Firebase Authentication.";

    case "auth/requires-recent-login":
      return "Please sign in again before continuing.";
      
case "username/taken":
  return "This username is already taken. Please choose another.";

    case "permission-denied":
    case "firestore/permission-denied":
      return (
        "Your Firebase account may have been created, but Firestore blocked the profile save. " +
        "Do not register again. Fix the Firestore rules and retry."
      );

    default:
      return error.message ||
        "Unable to create your account. Please try again.";
  }
}

// ==========================================
// CREATE ACCOUNT
// ==========================================

async function createAccount() {
  if (isSubmitting) return;

  if (!validateStepThree()) return;

  isSubmitting = true;

  createAccountButton.disabled = true;
  createAccountButton.textContent = "Creating account...";

  clearMessage();

  try {
    const email = emailInput.value.trim().toLowerCase();

    // Sign out any currently authenticated account.
    // This does not delete that account or its data.
    if (auth.currentUser) {
      await signOut(auth);
    }

    // Create a new Firebase Authentication account.
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      passwordInput.value
    );

    const user = credential.user;

   // Set the Firebase display name.
await updateProfile(user, {
  displayName: fullNameInput.value.trim()
});

// Reserve the username before saving the profile.
try {
  await claimUsername(usernameInput.value);
} catch (usernameError) {

  // If the username is definitely taken, remove the
  // newly-created Auth account to avoid an orphan account.
  if (usernameError.code === "username/taken") {
    try {
      await deleteUser(user);
    } catch (deleteError) {
      console.error(
        "Unable to remove incomplete Auth account:",
        deleteError
      );
    }
  }

  throw usernameError;
}

// Save public and private profile documents.
await saveUserProfile(user);
    showMessage(
      "Your TrustNet account has been created successfully.",
      "success"
    );

    createAccountButton.textContent = "Account created";

    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1000);

  } catch (error) {
    console.error("TrustNet signup error:", error);

    showMessage(getSignupErrorMessage(error));

    createAccountButton.disabled = false;
    createAccountButton.textContent = "Create account";

  } finally {
    isSubmitting = false;
  }
}

// ==========================================
// FORM SUBMISSION
// ==========================================

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createAccount();
});

// ==========================================
// INITIALIZATION
// ==========================================

function initializeSignup() {
  if (!signupForm) {
    console.error("TrustNet signup form was not found.");
    return;
  }

  if (
    !auth ||
    !db ||
    !Array.isArray(countries)
  ) {
    console.error("TrustNet signup dependencies are missing.");
    return;
  }

  populateCountries();
  populateDateFields();

  showStep(1);

  console.log("TrustNet signup initialized.");
}

initializeSignup();
