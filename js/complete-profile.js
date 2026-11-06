
/* ==========================================
   TRUSTNET COMPLETE PROFILE
   File: js/complete-profile.js
   Firebase SDK: 12.1.0
========================================== */

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";
import { countries } from "../data/countries.js";
import { claimUsername } from "./username.js";

// ==========================================
// ELEMENTS
// ==========================================

const form = document.getElementById("completeProfileForm");

const profilePhoto = document.getElementById("profilePhoto");
const googleName = document.getElementById("googleName");
const googleEmail = document.getElementById("googleEmail");

const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");

const countrySelect = document.getElementById("country");
const dialCodeSelect = document.getElementById("dialCode");
const phoneInput = document.getElementById("phone");

const genderSelect = document.getElementById("gender");

const birthDaySelect = document.getElementById("birthDay");
const birthMonthSelect = document.getElementById("birthMonth");
const birthYearSelect = document.getElementById("birthYear");

const termsCheckbox = document.getElementById("terms");

const submitButton = document.getElementById("completeProfileButton");
const messageBox = document.getElementById("profileMessage");

let currentUser = null;
let isSubmitting = false;
let authReady = false;

// ==========================================
// MESSAGES
// ==========================================

function showMessage(message, type = "error") {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message";
}

// ==========================================
// BUTTON STATE
// ==========================================

function setLoading(loading) {
  submitButton.disabled = loading || !authReady;

  submitButton.innerHTML = loading
    ? "Saving profile..."
    : 'Complete profile <span aria-hidden="true">→</span>';
}

// ==========================================
// COUNTRY DROPDOWNS
// ==========================================

function populateCountries() {
  if (!Array.isArray(countries) || countries.length === 0) {
    throw new Error("Country information could not be loaded.");
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

    // Use country code as the option value because
    // multiple countries may share a calling code.
    dialOption.value = country.code;

    dialOption.textContent =
      `${country.dialCode} — ${country.name}`;

    dialCodeSelect.appendChild(dialOption);
  });

  countrySelect.value = "NG";
  dialCodeSelect.value = "NG";
}

countrySelect.addEventListener("change", () => {
  dialCodeSelect.value = countrySelect.value;
});

dialCodeSelect.addEventListener("change", () => {
  countrySelect.value = dialCodeSelect.value;
});

// ==========================================
// DATE FIELDS
// ==========================================

function populateDateFields() {
  birthDaySelect.innerHTML =
    '<option value="">Day</option>';

  birthMonthSelect.innerHTML =
    '<option value="">Month</option>';

  birthYearSelect.innerHTML =
    '<option value="">Year</option>';

  for (let day = 1; day <= 31; day++) {
    const option = document.createElement("option");

    option.value = String(day);
    option.textContent = String(day);

    birthDaySelect.appendChild(option);
  }

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  months.forEach((month, index) => {
    const option = document.createElement("option");

    option.value = String(index + 1);
    option.textContent = month;

    birthMonthSelect.appendChild(option);
  });

  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= 1900; year--) {
    const option = document.createElement("option");

    option.value = String(year);
    option.textContent = String(year);

    birthYearSelect.appendChild(option);
  }
}

// ==========================================
// LOAD GOOGLE ACCOUNT DETAILS
// ==========================================

function loadAccountDetails(user, profile = {}) {
  const name =
    profile.fullName ||
    user.displayName ||
    "";

  fullNameInput.value = name;

  googleName.textContent = name || "TrustNet user";
  googleEmail.textContent = user.email || "";

  if (user.photoURL) {
    profilePhoto.src = user.photoURL;
  }

  profilePhoto.onerror = () => {
    profilePhoto.src =
      "https://placehold.co/80x80/111c32/ffffff?text=T";
  };
}

// ==========================================
// LOAD EXISTING PROFILE
// ==========================================

async function loadExistingProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return {};
  }

  const profile = snapshot.data();

  if (profile.profileComplete === true) {
    window.location.replace("/dashboard.html");
    return null;
  }

  return profile;
}

// ==========================================
// VALIDATION
// ==========================================

function validateFullName() {
  const fullName = fullNameInput.value.trim();

  if (fullName.length < 2 || fullName.length > 80) {
    showMessage("Enter a full name between 2 and 80 characters.");
    fullNameInput.focus();
    return false;
  }

  return true;
}

function validateUsername() {
  const username = usernameInput.value.trim().toLowerCase();

  const pattern = /^[a-z0-9_]{3,20}$/;

  if (!pattern.test(username)) {
    showMessage(
      "Username must be 3–20 characters and contain only letters, numbers or underscores."
    );

    usernameInput.focus();
    return false;
  }

  usernameInput.value = username;

  return true;
}

function validateCountry() {
  if (!countrySelect.value) {
    showMessage("Select your country.");
    countrySelect.focus();
    return false;
  }

  if (countrySelect.value !== dialCodeSelect.value) {
    showMessage("Select the matching country dial code.");
    dialCodeSelect.focus();
    return false;
  }

  return true;
}

function validatePhone() {
  const digits = phoneInput.value.replace(/\D/g, "");

  if (digits.length < 6 || digits.length > 14) {
    showMessage("Enter a valid phone number.");
    phoneInput.focus();
    return false;
  }

  return true;
}

function getDateOfBirth() {
  const day = Number(birthDaySelect.value);
  const month = Number(birthMonthSelect.value);
  const year = Number(birthYearSelect.value);

  if (!day || !month || !year) {
    throw new Error("Complete your date of birth.");
  }

  const date = new Date(year, month - 1, day);

  const validDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  if (!validDate) {
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

function validateForm() {
  if (!validateFullName()) return false;
  if (!validateUsername()) return false;
  if (!validateCountry()) return false;
  if (!validatePhone()) return false;

  if (!genderSelect.value) {
    showMessage("Select your gender.");
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
    showMessage("You must accept the Terms and Privacy Policy.");
    termsCheckbox.focus();
    return false;
  }

  return true;
}

// ==========================================
// PHONE NUMBER
// ==========================================

function getInternationalPhone() {
  const selectedCountry = countries.find(
    (country) => country.code === countrySelect.value
  );

  if (!selectedCountry) {
    throw new Error("Select a valid country.");
  }

  let localNumber = phoneInput.value.replace(/\D/g, "");

  // Remove a leading national trunk zero.
  if (localNumber.startsWith("0")) {
    localNumber = localNumber.slice(1);
  }

  if (localNumber.length < 6 || localNumber.length > 14) {
    throw new Error("Enter a valid phone number.");
  }

  const callingCode =
    selectedCountry.dialCode.replace(/\D/g, "");

  return `+${callingCode}${localNumber}`;
}

// ==========================================
// SAVE PROFILE
// ==========================================

async function saveProfile(user) {
  const selectedCountry = countries.find(
    (country) => country.code === countrySelect.value
  );

  if (!selectedCountry) {
    throw new Error("The selected country is invalid.");
  }

  const phone = getInternationalPhone();
  const dateOfBirth = getDateOfBirth();

  const userRef = doc(db, "users", user.uid);
  const privateRef = doc(db, "userPrivate", user.uid);

  // Do not overwrite an already completed profile.
  const existingSnapshot = await getDoc(userRef);

  if (
    existingSnapshot.exists() &&
    existingSnapshot.data().profileComplete === true
  ) {
    window.location.replace("/dashboard.html");
    return false;
  }

  const batch = writeBatch(db);

  batch.set(userRef, {
    uid: user.uid,

    fullName: fullNameInput.value.trim(),

    username: usernameInput.value.trim().toLowerCase(),

    photoURL: user.photoURL || null,

    country: selectedCountry.name,

    countryCode: selectedCountry.code,

    bio: "",

    profileComplete: true,

    updatedAt: serverTimestamp()
  }, { merge: true });

  batch.set(privateRef, {
    uid: user.uid,

    email: user.email || "",

    phone,

    dialCode: selectedCountry.dialCode,

    gender: genderSelect.value,

    dateOfBirth,

    termsAcceptedAt: serverTimestamp(),

    updatedAt: serverTimestamp()
  }, { merge: true });

  await batch.commit();

  return true;
}

// ==========================================
// FORM SUBMISSION
// ==========================================

async function handleSubmit(event) {
  event.preventDefault();

  if (isSubmitting || !currentUser || !authReady) {
    return;
  }

  clearMessage();

  if (!validateForm()) {
    return;
  }

  isSubmitting = true;
  setLoading(true);

  try {
    // Reserve the username on the backend first.
// If another account owns it, the profile is not completed.
await claimUsername(usernameInput.value);

const saved = await saveProfile(currentUser);

    if (!saved) return;

    showMessage(
      "Your profile has been completed. Redirecting to TrustNet...",
      "success"
    );

    setTimeout(() => {
      window.location.replace("/dashboard.html");
    }, 1000);

  } catch (error) {
    console.error("TrustNet profile completion error:", error);

    if (
      error.code === "permission-denied" ||
      error.code === "firestore/permission-denied"
    ) {
      showMessage(
        "Firebase blocked the profile save. Check your Firestore security rules."
      );
    } else {
      showMessage(
        error.message || "Unable to save your profile. Please try again."
      );
    }

    isSubmitting = false;
    setLoading(false);
  }
}

// ==========================================
// AUTHENTICATION CHECK
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/login.html");
    return;
  }

  if (authReady) return;

  try {
    currentUser = user;

    const profile = await loadExistingProfile(user);

    if (profile === null) return;

    loadAccountDetails(user, profile);

    // Restore existing incomplete profile information.
    if (profile.username) {
      usernameInput.value = profile.username;
    }

    if (profile.countryCode) {
      countrySelect.value = profile.countryCode;
      dialCodeSelect.value = profile.countryCode;
    }

    // Load private fields if available.
    const privateSnapshot = await getDoc(
      doc(db, "userPrivate", user.uid)
    );

    if (privateSnapshot.exists()) {
      const privateData = privateSnapshot.data();

      if (privateData.phone) {
        // Remove calling code from the displayed local number
        // only when it matches the selected country.
        const callingCode = countries.find(
          (country) => country.code === countrySelect.value
        )?.dialCode;

        if (callingCode && privateData.phone.startsWith(callingCode)) {
          phoneInput.value =
            privateData.phone.slice(callingCode.length);
        }
      }

      if (privateData.gender) {
        genderSelect.value = privateData.gender;
      }

      if (privateData.dateOfBirth) {
        const [year, month, day] =
          privateData.dateOfBirth.split("-");

        birthYearSelect.value = String(Number(year));
        birthMonthSelect.value = String(Number(month));
        birthDaySelect.value = String(Number(day));
      }
    }

    authReady = true;
    submitButton.disabled = false;

  } catch (error) {
    console.error("TrustNet profile loading error:", error);

    showMessage(
      "Unable to load your profile. Refresh the page or try again."
    );

    currentUser = null;
  }
});

// ==========================================
// EVENT LISTENERS
// ==========================================

form.addEventListener("submit", handleSubmit);

document.getElementById("currentYear").textContent =
  new Date().getFullYear();

// ==========================================
// INITIALIZATION
// ==========================================

try {
  populateCountries();
  populateDateFields();

  submitButton.disabled = true;

  console.log("TrustNet complete-profile initialized.");

} catch (error) {
  console.error("TrustNet initialization error:", error);
  showMessage(error.message);
}
