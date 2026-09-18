/* ==========================================
   TrustNet
   File: js/firebase.js

   Firebase Configuration
========================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


/* ==========================================
   FIREBASE CONFIGURATION
========================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyDCOeIGalgZ7UkwUvTP1tnTSEA-avOin2c",

    authDomain:
        "trustnet-9ce48.firebaseapp.com",

    projectId:
        "trustnet-9ce48",

    storageBucket:
        "trustnet-9ce48.firebasestorage.app",

    messagingSenderId:
        "25435511027",

    appId:
        "1:25435511027:web:2f2469eaeacea045417f86"

};


/* ==========================================
   INITIALIZE FIREBASE
========================================== */

const app =
    initializeApp(firebaseConfig);


/* ==========================================
   FIREBASE AUTHENTICATION
========================================== */

const auth =
    getAuth(app);


/* ==========================================
   GOOGLE AUTH PROVIDER
========================================== */

const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* ==========================================
   FIRESTORE DATABASE
========================================== */

const db =
    getFirestore(app);


/* ==========================================
   FIREBASE STORAGE
========================================== */

const storage =
    getStorage(app);


/* ==========================================
   EXPORT FIREBASE SERVICES
========================================== */

export {
    app,
    auth,
    db,
    storage,
    googleProvider
};