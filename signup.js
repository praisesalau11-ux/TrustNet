import {
auth,
db
} from "./firebase.js";

import {
createUserWithEmailAndPassword,
updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
collection,
query,
where,
limit,
getDocs,
doc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
countries
} from "../data/countries.js";

/* ==========================================
TrustNet
File: js/signup.js

Email Signup

Country loading
Dial code loading
Date of birth selectors
Age calculation
13+ validation
Username availability
Firebase Authentication
Firestore user profile
========================================== */

document.addEventListener(
"DOMContentLoaded",
() => {

    /* ==========================================
       ELEMENTS
    ========================================== */

    const form =
        document.getElementById(
            "signupForm"
        );

    const steps =
        document.querySelectorAll(
            ".form-step"
        );

    const progressFill =
        document.getElementById(
            "progressFill"
        );

    const progressSteps =
        document.querySelectorAll(
            ".progress-step"
        );

    const signupMessage =
        document.getElementById(
            "signupMessage"
        );

    const createAccountButton =
        document.getElementById(
            "createAccountButton"
        );

    const fullNameInput =
        document.getElementById(
            "fullName"
        );

    const usernameInput =
        document.getElementById(
            "username"
        );

    const emailInput =
        document.getElementById(
            "email"
        );

    const countrySelect =
        document.getElementById(
            "country"
        );

    const dialCodeSelect =
        document.getElementById(
            "dialCode"
        );

    const phoneInput =
        document.getElementById(
            "phone"
        );

    const passwordInput =
        document.getElementById(
            "password"
        );

    const confirmPasswordInput =
        document.getElementById(
            "confirmPassword"
        );

    const genderSelect =
        document.getElementById(
            "gender"
        );

    const birthDaySelect =
        document.getElementById(
            "birthDay"
        );

    const birthMonthSelect =
        document.getElementById(
            "birthMonth"
        );

    const birthYearSelect =
        document.getElementById(
            "birthYear"
        );

    const termsCheckbox =
        document.getElementById(
            "terms"
        );


    if (!form) {
        console.error(
            "TrustNet signup form was not found."
        );

        return;
    }


    /* ==========================================
       STATE
    ========================================== */

    let currentStep = 1;

    const totalSteps = 3;


    /* ==========================================
       MESSAGE
    ========================================== */

    function showMessage(
        message,
        type = "info"
    ) {

        if (!signupMessage) {
            return;
        }

        signupMessage.textContent =
            message;

        signupMessage.className =
            "signup-message " +
            type;
    }


    function clearMessage() {

        if (!signupMessage) {
            return;
        }

        signupMessage.textContent =
            "";

        signupMessage.className =
            "signup-message";
    }


    /* ==========================================
       LOADING STATE
    ========================================== */

    function setLoading(
        loading
    ) {

        if (!createAccountButton) {
            return;
        }

        createAccountButton.disabled =
            loading;

        const buttonText =
            createAccountButton.querySelector(
                ".button-text"
            );


        if (loading) {

            createAccountButton.dataset.originalText =
                buttonText?.textContent ||
                "Create Account";

            if (buttonText) {

                buttonText.textContent =
                    "Creating account...";
            }

        } else {

            if (buttonText) {

                buttonText.textContent =
                    createAccountButton
                        .dataset
                        .originalText ||
                    "Create Account";
            }
        }
    }


    /* ==========================================
       PROGRESS
    ========================================== */

    function updateProgress(
        step
    ) {

        if (
            step < 1 ||
            step > totalSteps
        ) {
            return;
        }

        currentStep =
            step;


        steps.forEach(
            (formStep) => {

                const stepNumber =
                    Number(
                        formStep.dataset.step
                    );

                formStep.classList.toggle(
                    "active",
                    stepNumber === step
                );
            }
        );


        progressSteps.forEach(
            (progressStep) => {

                const stepNumber =
                    Number(
                        progressStep.dataset.step
                    );

                progressStep.classList.toggle(
                    "active",
                    stepNumber === step
                );

                progressStep.classList.toggle(
                    "completed",
                    stepNumber < step
                );
            }
        );


        if (progressFill) {

            const percentage =
                (
                    (step - 1) /
                    (totalSteps - 1)
                ) * 100;

            progressFill.style.width =
                percentage + "%";
        }


        clearMessage();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* ==========================================
       STEP 1 VALIDATION
    ========================================== */

    function validateStepOne() {

        const fullName =
            fullNameInput?.value
                .trim() ||
            "";

        const username =
            usernameInput?.value
                .trim() ||
            "";


        if (!fullName) {

            showMessage(
                "Please enter your full name.",
                "error"
            );

            fullNameInput?.focus();

            return false;
        }


        if (
            fullName.length < 2
        ) {

            showMessage(
                "Your full name must contain at least 2 characters.",
                "error"
            );

            fullNameInput?.focus();

            return false;
        }


        if (!username) {

            showMessage(
                "Please choose a username.",
                "error"
            );

            usernameInput?.focus();

            return false;
        }


        if (
            !/^[a-zA-Z0-9._-]+$/.test(
                username
            )
        ) {

            showMessage(
                "Username can only contain letters, numbers, dots, underscores, and hyphens.",
                "error"
            );

            usernameInput?.focus();

            return false;
        }


        if (
            username.length < 3 ||
            username.length > 30
        ) {

            showMessage(
                "Username must be between 3 and 30 characters.",
                "error"
            );

            usernameInput?.focus();

            return false;
        }


        return true;
    }


    /* ==========================================
       STEP 2 VALIDATION
    ========================================== */

    function validateStepTwo() {

        const email =
            emailInput?.value
                .trim() ||
            "";

        const country =
            countrySelect?.value ||
            "";

        const dialCode =
            dialCodeSelect?.value ||
            "";

        const phone =
            phoneInput?.value
                .trim() ||
            "";


        if (!email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            emailInput?.focus();

            return false;
        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput?.focus();

            return false;
        }


        if (!country) {

            showMessage(
                "Please select your country.",
                "error"
            );

            countrySelect?.focus();

            return false;
        }


        if (!dialCode) {

            showMessage(
                "Please select your country dial code.",
                "error"
            );

            dialCodeSelect?.focus();

            return false;
        }


        if (!phone) {

            showMessage(
                "Please enter your phone number.",
                "error"
            );

            phoneInput?.focus();

            return false;
        }


        const cleanedPhone =
            phone.replace(
                /\D/g,
                ""
            );


        if (
            cleanedPhone.length < 6 ||
            cleanedPhone.length > 15
        ) {

            showMessage(
                "Please enter a valid phone number.",
                "error"
            );

            phoneInput?.focus();

            return false;
        }


        return true;
    }


    /* ==========================================
       DATE OF BIRTH
    ========================================== */

    function populateBirthDate() {

        if (
            !birthDaySelect ||
            !birthMonthSelect ||
            !birthYearSelect
        ) {
            return;
        }


        /* ---------- DAYS ---------- */

        birthDaySelect.innerHTML =
            '<option value="">Day</option>';


        for (
            let day = 1;
            day <= 31;
            day++
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(day);

            option.textContent =
                String(day);

            birthDaySelect.appendChild(
                option
            );
        }


        /* ---------- MONTHS ---------- */

        birthMonthSelect.innerHTML =
            '<option value="">Month</option>';


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


        months.forEach(
            (
                month,
                index
            ) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(
                        index + 1
                    );

                option.textContent =
                    month;

                birthMonthSelect.appendChild(
                    option
                );
            }
        );


        /* ---------- YEARS ---------- */

        birthYearSelect.innerHTML =
            '<option value="">Year</option>';


        const currentYear =
            new Date()
                .getFullYear();


        for (
            let year =
                currentYear;
            year >=
                currentYear - 120;
            year--
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(year);

            option.textContent =
                String(year);

            birthYearSelect.appendChild(
                option
            );
        }
    }


    /* ==========================================
       UPDATE DAYS BASED ON MONTH/YEAR
    ========================================== */

    function updateBirthDays() {

        if (
            !birthDaySelect ||
            !birthMonthSelect ||
            !birthYearSelect
        ) {
            return;
        }


        const month =
            Number(
                birthMonthSelect.value
            );

        const year =
            Number(
                birthYearSelect.value
            );


        if (
            !month ||
            !year
        ) {
            return;
        }


        const previousDay =
            Number(
                birthDaySelect.value
            );


        const daysInMonth =
            new Date(
                year,
                month,
                0
            ).getDate();


        birthDaySelect.innerHTML =
            '<option value="">Day</option>';


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(day);

            option.textContent =
                String(day);

            birthDaySelect.appendChild(
                option
            );
        }


        if (
            previousDay >= 1 &&
            previousDay <=
                daysInMonth
        ) {

            birthDaySelect.value =
                String(previousDay);
        }
    }


    /* ==========================================
       GET DATE OF BIRTH
    ========================================== */

    function getDateOfBirth() {

        if (
            !birthDaySelect ||
            !birthMonthSelect ||
            !birthYearSelect
        ) {
            return null;
        }


        const day =
            Number(
                birthDaySelect.value
            );

        const month =
            Number(
                birthMonthSelect.value
            );

        const year =
            Number(
                birthYearSelect.value
            );


        if (
            !day ||
            !month ||
            !year
        ) {
            return null;
        }


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        if (
            date.getFullYear() !==
                year ||
            date.getMonth() !==
                month - 1 ||
            date.getDate() !==
                day
        ) {
            return null;
        }


        /* Prevent future birthdays */

        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        if (date > today) {
            return null;
        }


        return date;
    }


    /* ==========================================
       CALCULATE AGE
    ========================================== */

    function calculateAge(
        dateOfBirth
    ) {

        if (!dateOfBirth) {
            return null;
        }


        const today =
            new Date();


        let age =
            today.getFullYear() -
            dateOfBirth.getFullYear();


        const monthDifference =
            today.getMonth() -
            dateOfBirth.getMonth();


        if (
            monthDifference < 0 ||
            (
                monthDifference === 0 &&
                today.getDate() <
                    dateOfBirth.getDate()
            )
        ) {

            age--;
        }


        return age;
    }


    /* ==========================================
       STEP 3 VALIDATION
    ========================================== */

    function validateStepThree() {

        const password =
            passwordInput?.value ||
            "";

        const confirmPassword =
            confirmPasswordInput?.value ||
            "";

        const gender =
            genderSelect?.value ||
            "";

        const dateOfBirth =
            getDateOfBirth();


        /* ---------- PASSWORD ---------- */

        if (!password) {

            showMessage(
                "Please create a password.",
                "error"
            );

            passwordInput?.focus();

            return false;
        }


        if (
            password.length < 8
        ) {

            showMessage(
                "Your password must contain at least 8 characters.",
                "error"
            );

            passwordInput?.focus();

            return false;
        }


        if (
            !/[A-Za-z]/.test(
                password
            )
        ) {

            showMessage(
                "Your password must contain at least one letter.",
                "error"
            );

            passwordInput?.focus();

            return false;
        }


        if (
            !/\d/.test(
                password
            )
        ) {

            showMessage(
                "Your password must contain at least one number.",
                "error"
            );

            passwordInput?.focus();

            return false;
        }


        /* ---------- CONFIRM PASSWORD ---------- */

        if (!confirmPassword) {

            showMessage(
                "Please confirm your password.",
                "error"
            );

            confirmPasswordInput?.focus();

            return false;
        }


        if (
            password !==
            confirmPassword
        ) {

            showMessage(
                "Your passwords do not match.",
                "error"
            );

            confirmPasswordInput?.focus();

            return false;
        }


        /* ---------- GENDER ---------- */

        if (!gender) {

            showMessage(
                "Please select your gender.",
                "error"
            );

            genderSelect?.focus();

            return false;
        }


        /* ---------- DOB ---------- */

        if (!dateOfBirth) {

            showMessage(
                "Please select a valid date of birth.",
                "error"
            );

            birthDaySelect?.focus();

            return false;
        }


        const age =
            calculateAge(
                dateOfBirth
            );


        if (
            age === null ||
            age < 13
        ) {

            showMessage(
                "You must be at least 13 years old to create a TrustNet account.",
                "error"
            );

            return false;
        }


        if (
            age > 120
        ) {

            showMessage(
                "Please enter a valid date of birth.",
                "error"
            );

            return false;
        }


        /* ---------- AGREEMENT ---------- */

        if (
            termsCheckbox &&
            !termsCheckbox.checked
        ) {

            showMessage(
                "Please confirm that you agree to create a TrustNet account and provide accurate information.",
                "error"
            );

            termsCheckbox.focus();

            return false;
        }


        return true;
    }


    /* ==========================================
       LOAD COUNTRIES
    ========================================== */

    function populateCountries() {

        if (
            !countrySelect ||
            !dialCodeSelect
        ) {
            return;
        }


        countrySelect.innerHTML =
            '<option value="">Select your country</option>';

        dialCodeSelect.innerHTML =
            '<option value="">Code</option>';


        if (
            !Array.isArray(
                countries
            ) ||
            countries.length === 0
        ) {

            console.error(
                "TrustNet countries.js did not provide a valid countries array."
            );

            showMessage(
                "Unable to load the country list. Check data/countries.js.",
                "error"
            );

            return;
        }


        countries.forEach(
            (country) => {

                if (!country) {
                    return;
                }


                const name =
                    String(
                        country.name ||
                        ""
                    ).trim();

                const code =
                    String(
                        country.code ||
                        ""
                    ).trim();

                const dialCode =
                    String(
                        country.dialCode ||
                        ""
                    ).trim();

                const flag =
                    String(
                        country.flag ||
                        ""
                    ).trim();


                if (
                    !name ||
                    !code
                ) {
                    return;
                }


                /* ---------- Country option ---------- */

                const countryOption =
                    document.createElement(
                        "option"
                    );

                countryOption.value =
                    code;

                countryOption.textContent =
                    flag
                        ? `${flag} ${name}`
                        : name;

                countryOption.dataset.dialCode =
                    dialCode;

                countryOption.dataset.countryName =
                    name;

                countrySelect.appendChild(
                    countryOption
                );


                /* ---------- Dial code option ---------- */

                if (dialCode) {

                    const dialOption =
                        document.createElement(
                            "option"
                        );

                    dialOption.value =
                        dialCode;

                    dialOption.textContent =
                        flag
                            ? `${flag} ${dialCode}`
                            : dialCode;

                    dialOption.dataset.countryCode =
                        code;

                    dialOption.dataset.countryName =
                        name;

                    dialCodeSelect.appendChild(
                        dialOption
                    );
                }
            }
        );
    }


    /* ==========================================
       COUNTRY → DIAL CODE
    ========================================== */

    function syncDialCodeWithCountry() {

        if (
            !countrySelect ||
            !dialCodeSelect
        ) {
            return;
        }


        const selectedOption =
            countrySelect.options[
                countrySelect.selectedIndex
            ];


        if (!selectedOption) {
            return;
        }


        const dialCode =
            selectedOption.dataset
                .dialCode ||
            "";


        if (!dialCode) {

            dialCodeSelect.value =
                "";

            return;
        }


        const matchingOption =
            Array.from(
                dialCodeSelect.options
            ).find(
                (option) =>
                    option.value ===
                    dialCode
            );


        if (matchingOption) {

            dialCodeSelect.value =
                dialCode;
        }
    }


    /* ==========================================
       DIAL CODE → COUNTRY
    ========================================== */

    function syncCountryWithDialCode() {

        if (
            !countrySelect ||
            !dialCodeSelect
        ) {
            return;
        }


        const selectedDialCode =
            dialCodeSelect.value;


        if (!selectedDialCode) {
            return;
        }


        const currentCountry =
            countrySelect.options[
                countrySelect.selectedIndex
            ];


        if (
            currentCountry &&
            currentCountry.dataset
                .dialCode ===
                selectedDialCode
        ) {
            return;
        }


        const matchingCountry =
            Array.from(
                countrySelect.options
            ).find(
                (option) =>
                    option.dataset
                        .dialCode ===
                    selectedDialCode
            );


        if (matchingCountry) {

            countrySelect.value =
                matchingCountry.value;
        }
    }


    /* ==========================================
       USERNAME NORMALIZATION
    ========================================== */

    if (usernameInput) {

        usernameInput.addEventListener(
            "input",
            () => {

                usernameInput.value =
                    usernameInput.value
                        .replace(
                            /\s+/g,
                            ""
                        );
            }
        );
    }


    /* ==========================================
       PHONE NORMALIZATION
    ========================================== */

    if (phoneInput) {

        phoneInput.addEventListener(
            "input",
            () => {

                phoneInput.value =
                    phoneInput.value
                        .replace(
                            /[^\d\s()+-]/g,
                            ""
                        );
            }
        );
    }


    /* ==========================================
       PASSWORD VISIBILITY
    ========================================== */

    document
        .querySelectorAll(
            "[data-target]"
        )
        .forEach(
            (toggleButton) => {

                toggleButton.addEventListener(
                    "click",
                    () => {

                        const targetId =
                            toggleButton.dataset
                                .target;

                        const target =
                            document.getElementById(
                                targetId
                            );


                        if (!target) {
                            return;
                        }


                        const showing =
                            target.type ===
                            "password";


                        target.type =
                            showing
                                ? "text"
                                : "password";


                        toggleButton.classList.toggle(
                            "active",
                            showing
                        );


                        toggleButton.setAttribute(
                            "aria-label",
                            showing
                                ? "Hide password"
                                : "Show password"
                        );
                    }
                );
            }
        );


    /* ==========================================
       PASSWORD MATCH
    ========================================== */

    if (
        confirmPasswordInput
    ) {

        confirmPasswordInput.addEventListener(
            "input",
            () => {

                if (
                    passwordInput &&
                    confirmPasswordInput.value &&
                    passwordInput.value !==
                        confirmPasswordInput.value
                ) {

                    confirmPasswordInput.setCustomValidity(
                        "Passwords do not match."
                    );

                } else {

                    confirmPasswordInput.setCustomValidity(
                        ""
                    );
                }
            }
        );
    }


    /* ==========================================
       COUNTRY SELECT
    ========================================== */

    if (countrySelect) {

        countrySelect.addEventListener(
            "change",
            syncDialCodeWithCountry
        );
    }


    /* ==========================================
       DIAL CODE SELECT
    ========================================== */

    if (dialCodeSelect) {

        dialCodeSelect.addEventListener(
            "change",
            syncCountryWithDialCode
        );
    }


    /* ==========================================
       DOB SELECTS
    ========================================== */

    if (birthMonthSelect) {

        birthMonthSelect.addEventListener(
            "change",
            updateBirthDays
        );
    }


    if (birthYearSelect) {

        birthYearSelect.addEventListener(
            "change",
            updateBirthDays
        );
    }


    /* ==========================================
       NEXT BUTTONS
    ========================================== */

    document
        .querySelectorAll(
            "[data-next]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    (event) => {

                        event.preventDefault();

                        const nextStep =
                            Number(
                                button.dataset
                                    .next
                            );


                        if (
                            nextStep !==
                            currentStep + 1
                        ) {
                            return;
                        }


                        if (
                            currentStep === 1
                        ) {

                            if (
                                validateStepOne()
                            ) {

                                updateProgress(
                                    2
                                );
                            }

                            return;
                        }


                        if (
                            currentStep === 2
                        ) {

                            if (
                                validateStepTwo()
                            ) {

                                updateProgress(
                                    3
                                );
                            }
                        }
                    }
                );
            }
        );


    /* ==========================================
       BACK BUTTONS
    ========================================== */

    document
        .querySelectorAll(
            "[data-back]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    (event) => {

                        event.preventDefault();

                        const previousStep =
                            Number(
                                button.dataset
                                    .back
                            );


                        if (
                            previousStep ===
                            currentStep - 1
                        ) {

                            updateProgress(
                                previousStep
                            );
                        }
                    }
                );
            }
        );


    /* ==========================================
       CHECK USERNAME AVAILABILITY
    ========================================== */

    async function isUsernameAvailable(
        username
    ) {

        const normalizedUsername =
            username
                .trim()
                .toLowerCase();


        const usersCollection =
            collection(
                db,
                "users"
            );


        const usernameQuery =
            query(
                usersCollection,
                where(
                    "username",
                    "==",
                    normalizedUsername
                ),
                limit(1)
            );


        const snapshot =
            await getDocs(
                usernameQuery
            );


        return snapshot.empty;
    }


    /* ==========================================
       FIREBASE ERROR MESSAGE
    ========================================== */

    function getFirebaseErrorMessage(
        error
    ) {

        if (!error) {

            return (
                "Unable to create your account. Please try again."
            );
        }


        switch (error.code) {

            case "auth/email-already-in-use":

                return (
                    "An account already exists with this email address. Please log in instead."
                );


            case "auth/invalid-email":

                return (
                    "Please enter a valid email address."
                );


            case "auth/weak-password":

                return (
                    "Your password is too weak. Please choose a stronger password."
                );


            case "auth/network-request-failed":

                return (
                    "Network error. Check your internet connection and try again."
                );


            case "auth/operation-not-allowed":

                return (
                    "Email and password authentication is not enabled in Firebase Authentication."
                );


            case "auth/too-many-requests":

                return (
                    "Too many attempts were made. Please wait and try again later."
                );


            case "auth/invalid-api-key":

                return (
                    "Firebase configuration is invalid. Check your Firebase project configuration."
                );


            case "auth/unauthorized-domain":

                return (
                    "This website domain is not authorized in Firebase Authentication."
                );


            case "permission-denied":

                return (
                    "Firebase permission was denied while saving your profile."
                );


            default:

                return (
                    error.message ||
                    "Unable to create your account. Please try again."
                );
        }
    }


    /* ==========================================
       CREATE ACCOUNT
    ========================================== */

    async function createAccount() {

        if (
            !validateStepThree()
        ) {
            return;
        }


        setLoading(true);


        try {

            const fullName =
                fullNameInput.value
                    .trim();

            const username =
                usernameInput.value
                    .trim()
                    .toLowerCase();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const countryCode =
                countrySelect.value;

            const selectedCountry =
                countrySelect.options[
                    countrySelect.selectedIndex
                ];

            const countryName =
                selectedCountry?.dataset
                    ?.countryName ||
                "";

            const dialCode =
                dialCodeSelect.value;

            const phone =
                phoneInput.value
                    .trim();

            const gender =
                genderSelect.value;

            const dateOfBirth =
                getDateOfBirth();

            const age =
                calculateAge(
                    dateOfBirth
                );

            const password =
                passwordInput.value;


            /* ==========================================
               CHECK USERNAME
            ========================================== */

            showMessage(
                "Checking username..."
            );


            const available =
                await isUsernameAvailable(
                    username
                );


            if (!available) {

                showMessage(
                    "That username is already taken. Please choose another one.",
                    "error"
                );

                updateProgress(1);

                setTimeout(
                    () => {
                        usernameInput?.focus();
                    },
                    100
                );

                return;
            }


            /* ==========================================
               CREATE FIREBASE AUTH ACCOUNT
            ========================================== */

            showMessage(
                "Creating your TrustNet account..."
            );


            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            if (!user) {

                throw new Error(
                    "Firebase did not return a user."
                );
            }


            /* ==========================================
               UPDATE AUTH PROFILE
            ========================================== */

            await updateProfile(
                user,
                {
                    displayName:
                        fullName
                }
            );


            /* ==========================================
               SAVE FIRESTORE PROFILE
            ========================================== */

            showMessage(
                "Saving your TrustNet profile..."
            );


            const userReference =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const dateOfBirthString =
                dateOfBirth
                    .toISOString()
                    .split("T")[0];


            await setDoc(
                userReference,
                {

                    uid:
                        user.uid,

                    fullName:
                        fullName,

                    username:
                        username,

                    email:
                        email,

                    phone:
                        phone,

                    dialCode:
                        dialCode,

                    country:
                        countryName,

                    countryCode:
                        countryCode,

                    gender:
                        gender,

                    dateOfBirth:
                        dateOfBirthString,

                    age:
                        age,

                    photoURL:
                        user.photoURL ||
                        "",

                    provider:
                        "password",

                    accountType:
                        "user",

                    verified:
                        false,

                    emailVerified:
                        user.emailVerified,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            /* ==========================================
               SUCCESS
            ========================================== */

            showMessage(
                "Account created successfully. Redirecting...",
                "success"
            );


            if (
                createAccountButton
            ) {

                const buttonText =
                    createAccountButton.querySelector(
                        ".button-text"
                    );

                if (buttonText) {

                    buttonText.textContent =
                        "Account Created";
                }
            }


            setTimeout(
                () => {

                    window.location.href =
                        "/dashboard.html";

                },
                900
            );


        } catch (error) {

            console.error(
                "TrustNet signup error:",
                error
            );


            showMessage(
                getFirebaseErrorMessage(
                    error
                ),
                "error"
            );

        } finally {

            setLoading(
                false
            );
        }
    }


    /* ==========================================
       FORM SUBMIT
    ========================================== */

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            if (
                currentStep !== 3
            ) {

                if (
                    currentStep === 1 &&
                    validateStepOne()
                ) {

                    updateProgress(
                        2
                    );

                } else if (
                    currentStep === 2 &&
                    validateStepTwo()
                ) {

                    updateProgress(
                        3
                    );
                }

                return;
            }


            createAccount();
        }
    );


    /* ==========================================
       INITIALIZE COUNTRY DATA
    ========================================== */

    populateCountries();


    /* ==========================================
       INITIALIZE DATE OF BIRTH
    ========================================== */

    populateBirthDate();


    /* ==========================================
       INITIALIZE PROGRESS
    ========================================== */

    updateProgress(
        1
    );

}

);