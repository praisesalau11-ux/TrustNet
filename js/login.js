/* ==========================================
   TrustNet
   File: js/login.js

   Login Authentication
========================================== */


/* ==========================================
   FIREBASE IMPORTS
========================================== */

import {
    auth,
    googleProvider
} from "./firebase.js";


/* ==========================================
   FIREBASE AUTH FUNCTIONS
========================================== */

import {
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* ==========================================
   TRUSTNET BACKEND
========================================== */

const BACKEND_URL =
    "https://trustnet-j9oq.onrender.com";


/* ==========================================
   LOGIN REDIRECT CONTROL
========================================== */

let isLoggingIn = false;


/* ==========================================
   CONNECT FIREBASE USER TO TRUSTNET BACKEND
========================================== */

async function authenticateWithBackend(user) {

    /* ======================================
       CHECK USER
    ======================================= */

    if (!user) {

        throw new Error(
            "No authenticated Firebase user was found."
        );

    }


    /* ======================================
       GET FRESH FIREBASE ID TOKEN
    ======================================= */

    const idToken =
        await user.getIdToken(true);


    /* ======================================
       SEND TOKEN TO TRUSTNET BACKEND
    ======================================= */

    const response =
        await fetch(
            `${BACKEND_URL}/api/auth/me`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${idToken}`,

                    "Content-Type":
                        "application/json"
                }
            }
        );


    /* ======================================
       READ BACKEND RESPONSE
    ======================================= */

    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        console.error(
            "TrustNet Backend JSON Error:",
            error
        );

    }


    /* ======================================
       CHECK BACKEND RESPONSE
    ======================================= */

    if (!response.ok) {

        throw new Error(
            data?.error ||
            "TrustNet backend authentication failed."
        );

    }


    /* ======================================
       CHECK SUCCESS
    ======================================= */

    if (
        !data ||
        data.success !== true
    ) {

        throw new Error(
            data?.error ||
            "TrustNet backend could not authenticate the user."
        );

    }


    /* ======================================
       SAVE AUTHENTICATED USER DATA
    ======================================= */

    sessionStorage.setItem(
        "trustnetAuthenticated",
        "true"
    );


    sessionStorage.setItem(
        "trustnetUser",
        JSON.stringify(
            data.user
        )
    );


    /* ======================================
       RETURN BACKEND DATA
    ======================================= */

    return data;
}


/* ==========================================
   DOM READY
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ======================================
           ELEMENTS
        ======================================= */

        const loginForm =
            document.getElementById(
                "loginForm"
            );


        const emailInput =
            document.getElementById(
                "email"
            );


        const passwordInput =
            document.getElementById(
                "password"
            );


        const passwordToggle =
            document.getElementById(
                "passwordToggle"
            );


        const rememberMe =
            document.getElementById(
                "rememberMe"
            );


        const forgotPassword =
            document.getElementById(
                "forgotPassword"
            );


        const loginButton =
            document.getElementById(
                "loginButton"
            );


        const googleLoginButton =
            document.getElementById(
                "googleLoginButton"
            );


        const loginMessage =
            document.getElementById(
                "loginMessage"
            );


        const emailError =
            document.getElementById(
                "emailError"
            );


        const passwordError =
            document.getElementById(
                "passwordError"
            );


        /* ======================================
           CHECK REQUIRED ELEMENTS
        ======================================= */

        if (
            !loginForm ||
            !emailInput ||
            !passwordInput ||
            !loginButton
        ) {

            console.error(
                "TrustNet Login: Required elements are missing."
            );

            return;
        }


        /* ======================================
           MESSAGE HELPER
        ======================================= */

        function showMessage(
            message,
            type = "error"
        ) {

            if (!loginMessage) {
                return;
            }

            loginMessage.textContent =
                message;

            loginMessage.className =
                `login-message show ${type}`;
        }


        /* ======================================
           CLEAR MESSAGE
        ======================================= */

        function clearMessage() {

            if (!loginMessage) {
                return;
            }

            loginMessage.textContent =
                "";

            loginMessage.className =
                "login-message";
        }


        /* ======================================
           CLEAR FIELD ERRORS
        ======================================= */

        function clearErrors() {

            if (emailError) {

                emailError.textContent =
                    "";
            }


            if (passwordError) {

                passwordError.textContent =
                    "";
            }


            emailInput.classList.remove(
                "input-error"
            );


            passwordInput.classList.remove(
                "input-error"
            );
        }


        /* ======================================
           EMAIL VALIDATION
        ======================================= */

        function isValidEmail(email) {

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email);

        }


        /* ======================================
           PASSWORD VISIBILITY
        ======================================= */

        if (passwordToggle) {

            passwordToggle.addEventListener(
                "click",
                () => {

                    const isPassword =
                        passwordInput.type ===
                        "password";


                    passwordInput.type =
                        isPassword
                            ? "text"
                            : "password";


                    passwordToggle.textContent =
                        isPassword
                            ? "Hide"
                            : "Show";


                    passwordToggle.setAttribute(
                        "aria-label",
                        isPassword
                            ? "Hide password"
                            : "Show password"
                    );

                }
            );
        }


        /* ======================================
           REMEMBER ME
        ======================================= */

        if (rememberMe) {

            const savedEmail =
                localStorage.getItem(
                    "trustnetRememberedEmail"
                );


            if (savedEmail) {

                emailInput.value =
                    savedEmail;

                rememberMe.checked =
                    true;
            }


            rememberMe.addEventListener(
                "change",
                () => {

                    if (
                        rememberMe.checked &&
                        emailInput.value.trim()
                    ) {

                        localStorage.setItem(
                            "trustnetRememberedEmail",
                            emailInput.value.trim()
                        );

                    } else {

                        localStorage.removeItem(
                            "trustnetRememberedEmail"
                        );

                    }

                }
            );
        }


        /* ======================================
           EMAIL/PASSWORD LOGIN
        ======================================= */

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                clearErrors();

                clearMessage();


                const email =
                    emailInput.value.trim();


                const password =
                    passwordInput.value;


                /* ==================================
                   VALIDATION
                ================================== */

                let valid = true;


                if (!email) {

                    if (emailError) {

                        emailError.textContent =
                            "Enter your email address.";
                    }


                    emailInput.classList.add(
                        "input-error"
                    );


                    valid = false;


                } else if (
                    !isValidEmail(email)
                ) {

                    if (emailError) {

                        emailError.textContent =
                            "Enter a valid email address.";
                    }


                    emailInput.classList.add(
                        "input-error"
                    );


                    valid = false;
                }


                if (!password) {

                    if (passwordError) {

                        passwordError.textContent =
                            "Enter your password.";
                    }


                    passwordInput.classList.add(
                        "input-error"
                    );


                    valid = false;
                }


                if (!valid) {

                    return;
                }


                /* ==================================
                   REMEMBER EMAIL
                ================================== */

                if (
                    rememberMe &&
                    rememberMe.checked
                ) {

                    localStorage.setItem(
                        "trustnetRememberedEmail",
                        email
                    );

                } else {

                    localStorage.removeItem(
                        "trustnetRememberedEmail"
                    );
                }


                /* ==================================
                   LOADING STATE
                ================================== */

                loginButton.disabled =
                    true;


                const buttonText =
                    loginButton.querySelector(
                        ".button-text"
                    );


                const buttonArrow =
                    loginButton.querySelector(
                        ".button-arrow"
                    );


                if (buttonText) {

                    buttonText.textContent =
                        "Logging in...";
                }


                if (buttonArrow) {

                    buttonArrow.textContent =
                        "";
                }


                /* ==================================
                   PREVENT AUTH STATE REDIRECT
                   WHILE LOGIN IS PROCESSING
                ================================== */

                isLoggingIn =
                    true;


                /* ==================================
                   FIREBASE LOGIN
                ================================== */

                try {

                    const credential =
                        await signInWithEmailAndPassword(
                            auth,
                            email,
                            password
                        );


                    const user =
                        credential.user;


                    /* ==============================
                       CONNECT TO BACKEND
                    ============================== */

                    showMessage(
                        "Verifying your TrustNet account...",
                        "success"
                    );


                    await authenticateWithBackend(
                        user
                    );


                    /* ==============================
                       LOGIN COMPLETE
                    ============================== */

                    showMessage(
                        "Login successful. Redirecting...",
                        "success"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "/dashboard.html";

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        "TrustNet Login Error:",
                        error
                    );


                    let message =
                        "Unable to log in. Please try again.";


                    /* ==============================
                       FIREBASE ERRORS
                    ============================== */

                    switch (
                        error.code
                    ) {

                        case "auth/invalid-credential":

                        case "auth/wrong-password":

                        case "auth/user-not-found":

                            message =
                                "Incorrect email or password.";

                            break;


                        case "auth/invalid-email":

                            message =
                                "Please enter a valid email address.";

                            break;


                        case "auth/user-disabled":

                            message =
                                "This account has been disabled.";

                            break;


                        case "auth/too-many-requests":

                            message =
                                "Too many login attempts. Please wait and try again later.";

                            break;


                        case "auth/network-request-failed":

                            message =
                                "Network error. Check your internet connection.";

                            break;


                        default:

                            /* ==========================
                               BACKEND ERROR
                            ========================== */

                            if (
                                error.message &&
                                error.message.includes(
                                    "TrustNet backend"
                                )
                            ) {

                                message =
                                    "Your Firebase login succeeded, but TrustNet could not verify your account with the backend. Please try again.";

                            } else {

                                message =
                                    error.message ||
                                    message;
                            }

                            break;
                    }


                    showMessage(
                        message,
                        "error"
                    );


                } finally {

                    loginButton.disabled =
                        false;


                    if (buttonText) {

                        buttonText.textContent =
                            "Log in";
                    }


                    if (buttonArrow) {

                        buttonArrow.textContent =
                            "→";
                    }


                    isLoggingIn =
                        false;
                }

            }
        );


        /* ======================================
           GOOGLE SIGN-IN
        ======================================= */

        if (googleLoginButton) {

            googleLoginButton.addEventListener(
                "click",
                async () => {

                    clearErrors();

                    clearMessage();


                    googleLoginButton.disabled =
                        true;


                    const originalText =
                        googleLoginButton.innerHTML;


                    googleLoginButton.innerHTML =
                        `
                        <span class="google-icon">
                            G
                        </span>
                        <span>
                            Connecting...
                        </span>
                        `;


                    isLoggingIn =
                        true;


                    try {

                        /* ==========================
                           FIREBASE GOOGLE LOGIN
                        ========================== */

                        const result =
                            await signInWithPopup(
                                auth,
                                googleProvider
                            );


                        const user =
                            result.user;


                        /* ==========================
                           CONNECT TO BACKEND
                        ========================== */

                        showMessage(
                            "Verifying your TrustNet account...",
                            "success"
                        );


                        await authenticateWithBackend(
                            user
                        );


                        /* ==========================
                           LOGIN COMPLETE
                        ========================== */

                        showMessage(
                            "Google sign-in successful. Redirecting...",
                            "success"
                        );


                        setTimeout(
                            () => {

                                window.location.href =
                                    "/dashboard.html";

                            },
                            500
                        );


                    } catch (error) {

                        console.error(
                            "TrustNet Google Login Error:",
                            error
                        );


                        if (
                            error.code ===
                            "auth/popup-closed-by-user"
                        ) {

                            showMessage(
                                "Google sign-in was cancelled.",
                                "error"
                            );


                        } else if (
                            error.code ===
                            "auth/popup-blocked"
                        ) {

                            showMessage(
                                "Your browser blocked the Google sign-in window. Please allow popups for TrustNet.",
                                "error"
                            );


                        } else if (
                            error.code ===
                            "auth/account-exists-with-different-credential"
                        ) {

                            showMessage(
                                "An account already exists with this email using another sign-in method.",
                                "error"
                            );


                        } else if (
                            error.message &&
                            error.message.includes(
                                "TrustNet backend"
                            )
                        ) {

                            showMessage(
                                "Google sign-in succeeded, but TrustNet could not verify your account with the backend.",
                                "error"
                            );


                        } else {

                            showMessage(
                                error.message ||
                                "Google sign-in failed. Please try again.",
                                "error"
                            );

                        }


                    } finally {

                        googleLoginButton.disabled =
                            false;


                        googleLoginButton.innerHTML =
                            originalText;


                        isLoggingIn =
                            false;
                    }

                }
            );
        }


        /* ======================================
           FORGOT PASSWORD
        ======================================= */

        if (forgotPassword) {

            forgotPassword.addEventListener(
                "click",
                async (event) => {

                    event.preventDefault();


                    clearErrors();

                    clearMessage();


                    const email =
                        emailInput.value.trim();


                    if (!email) {

                        if (emailError) {

                            emailError.textContent =
                                "Enter your email first.";
                        }


                        emailInput.focus();


                        return;
                    }


                    if (
                        !isValidEmail(email)
                    ) {

                        if (emailError) {

                            emailError.textContent =
                                "Enter a valid email address.";
                        }


                        emailInput.focus();


                        return;
                    }


                    forgotPassword.textContent =
                        "Sending...";


                    forgotPassword.style.pointerEvents =
                        "none";


                    try {

                        await sendPasswordResetEmail(
                            auth,
                            email
                        );


                        showMessage(
                            "Password reset email sent. Check your inbox and follow the instructions.",
                            "success"
                        );


                    } catch (error) {

                        console.error(
                            "TrustNet Password Reset Error:",
                            error
                        );


                        let message =
                            "Unable to send the password reset email.";


                        switch (
                            error.code
                        ) {

                            case "auth/user-not-found":

                                message =
                                    "No TrustNet account was found with this email.";

                                break;


                            case "auth/invalid-email":

                                message =
                                    "Please enter a valid email address.";

                                break;


                            case "auth/too-many-requests":

                                message =
                                    "Too many requests. Please wait before trying again.";

                                break;


                            case "auth/network-request-failed":

                                message =
                                    "Network error. Check your internet connection.";

                                break;


                            default:

                                message =
                                    error.message ||
                                    message;
                        }


                        showMessage(
                            message,
                            "error"
                        );

                    } finally {

                        forgotPassword.textContent =
                            "Forgot password?";


                        forgotPassword.style.pointerEvents =
                            "";
                    }

                }
            );
        }


        /* ======================================
           AUTH STATE CHECK
           
           Redirect users who are already
           signed in.

           During a new login we wait until
           backend verification finishes.
        ======================================= */

        onAuthStateChanged(
            auth,
            (user) => {

                if (
                    user &&
                    !isLoggingIn
                ) {

                    console.log(
                        "TrustNet: User already signed in."
                    );


                    window.location.href =
                        "/dashboard.html";
                }

            }
        );


        /* ======================================
           EMAIL INPUT
        ======================================= */

        emailInput.addEventListener(
            "input",
            () => {

                if (emailError) {

                    emailError.textContent =
                        "";
                }


                emailInput.classList.remove(
                    "input-error"
                );


                if (
                    loginMessage &&
                    loginMessage.classList.contains(
                        "error"
                    )
                ) {

                    clearMessage();
                }

            }
        );


        /* ======================================
           PASSWORD INPUT
        ======================================= */

        passwordInput.addEventListener(
            "input",
            () => {

                if (passwordError) {

                    passwordError.textContent =
                        "";
                }


                passwordInput.classList.remove(
                    "input-error"
                );


                if (
                    loginMessage &&
                    loginMessage.classList.contains(
                        "error"
                    )
                ) {

                    clearMessage();
                }

            }
        );


        /* ======================================
           INITIAL LOG
        ======================================= */

        console.log(
            "TRUSTNET LOGIN JS LOADED"
        );


        console.log(
            "TrustNet Backend:",
            BACKEND_URL
        );

    }
);