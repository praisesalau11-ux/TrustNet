/* ==========================================
TrustNet
File: js/dashboard.js

Dashboard Controller
========================================== */

import {
auth,
db
} from "./firebase.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ==========================================
DOM READY
========================================== */

document.addEventListener(
"DOMContentLoaded",
() => {

    /* ======================================
       ELEMENTS
    ======================================= */

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const sidebarClose =
        document.getElementById(
            "sidebarClose"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const menuButton =
        document.getElementById(
            "menuButton"
        );

    const quickCheckButton =
        document.getElementById(
            "quickCheckButton"
        );

    const quickCheckModal =
        document.getElementById(
            "quickCheckModal"
        );

    const quickCheckClose =
        document.getElementById(
            "quickCheckClose"
        );

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );

    const welcomeName =
        document.getElementById(
            "welcomeName"
        );

    const sidebarUserName =
        document.getElementById(
            "sidebarUserName"
        );

    const headerUserName =
        document.getElementById(
            "headerUserName"
        );

    const sidebarAvatar =
        document.getElementById(
            "sidebarAvatar"
        );

    const headerAvatar =
        document.getElementById(
            "headerAvatar"
        );

    const accountStatus =
        document.getElementById(
            "accountStatus"
        );

    const profileStatus =
        document.getElementById(
            "profileStatus"
        );

    const activityCount =
        document.getElementById(
            "activityCount"
        );

    const alertCount =
        document.getElementById(
            "alertCount"
        );

    const notificationBadge =
        document.getElementById(
            "notificationBadge"
        );

    const messageBadge =
        document.getElementById(
            "messageBadge"
        );

    const headerNotificationDot =
        document.getElementById(
            "headerNotificationDot"
        );


    /* ======================================
       SIDEBAR
    ======================================= */

    function openSidebar() {

        if (sidebar) {
            sidebar.classList.add(
                "open"
            );
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add(
                "show"
            );
        }

        document.body.style.overflow =
            "hidden";
    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove(
                "open"
            );
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove(
                "show"
            );
        }

        document.body.style.overflow =
            "";
    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            openSidebar
        );
    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );
    }


    /* ======================================
       CLOSE SIDEBAR AFTER NAVIGATION
    ======================================= */

    const navigationItems =
        document.querySelectorAll(
            ".navigation-item"
        );

    navigationItems.forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <=
                        820
                    ) {

                        closeSidebar();
                    }
                }
            );
        }
    );


    /* ======================================
       QUICK CHECK MODAL
    ======================================= */

    function openQuickCheck() {

        if (!quickCheckModal) {
            return;
        }

        quickCheckModal.classList.add(
            "show"
        );

        quickCheckModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";
    }


    function closeQuickCheck() {

        if (!quickCheckModal) {
            return;
        }

        quickCheckModal.classList.remove(
            "show"
        );

        quickCheckModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";
    }


    if (quickCheckButton) {

        quickCheckButton.addEventListener(
            "click",
            openQuickCheck
        );
    }


    if (quickCheckClose) {

        quickCheckClose.addEventListener(
            "click",
            closeQuickCheck
        );
    }


    if (quickCheckModal) {

        quickCheckModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    quickCheckModal
                ) {

                    closeQuickCheck();
                }
            }
        );
    }


    /* ======================================
       KEYBOARD CONTROLS
    ======================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                closeQuickCheck();

                if (
                    window.innerWidth <=
                    820
                ) {

                    closeSidebar();
                }
            }


            /* ------------------------------
               "/" SEARCH SHORTCUT
            ------------------------------ */

            if (
                event.key === "/" &&
                document.activeElement !==
                    globalSearch &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {

                event.preventDefault();

                if (globalSearch) {

                    globalSearch.focus();
                }
            }
        }
    );


    /* ======================================
       GLOBAL SEARCH
    ======================================= */

    if (globalSearch) {

        globalSearch.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !==
                    "Enter"
                ) {

                    return;
                }


                const query =
                    globalSearch.value
                        .trim();


                if (!query) {
                    return;
                }


                /*
                   The full global search
                   system will be built later.

                   For now, send the user to
                   the information section,
                   where future search logic
                   can be connected.
                */

                const searchUrl =
                    `/pages/information.html?search=${encodeURIComponent(
                        query
                    )}`;

                window.location.href =
                    searchUrl;
            }
        );
    }


    /* ======================================
       AVATAR HELPER
    ======================================= */

    function getInitials(
        name,
        email
    ) {

        const source =
            name ||
            email ||
            "User";


        const words =
            source
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (
            words.length >= 2
        ) {

            return (
                words[0][0] +
                words[1][0]
            ).toUpperCase();
        }


        return source
            .substring(0, 2)
            .toUpperCase();
    }


    /* ======================================
       DISPLAY USER INFORMATION
    ======================================= */

    function displayUser(
        user,
        profileData = {}
    ) {

        if (!user) {
            return;
        }


        const fullName =
            profileData.fullName ||
            profileData.name ||
            user.displayName ||
            "";


        const username =
            profileData.username ||
            "";


        const email =
            user.email ||
            profileData.email ||
            "";


        const displayName =
            fullName ||
            username ||
            email.split("@")[0] ||
            "User";


        const initials =
            getInitials(
                fullName ||
                displayName,
                email
            );


        /* ------------------------------
           WELCOME
        ------------------------------ */

        if (welcomeName) {

            const firstName =
                displayName
                    .trim()
                    .split(/\s+/)[0] ||
                "there";

            welcomeName.textContent =
                firstName;
        }


        /* ------------------------------
           SIDEBAR
        ------------------------------ */

        if (sidebarUserName) {

            sidebarUserName.textContent =
                displayName;
        }


        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                initials;
        }


        /* ------------------------------
           HEADER
        ------------------------------ */

        if (headerUserName) {

            headerUserName.textContent =
                displayName;
        }


        if (headerAvatar) {

            headerAvatar.textContent =
                initials;
        }


        /* ------------------------------
           ACCOUNT STATUS
        ------------------------------ */

        if (accountStatus) {

            accountStatus.textContent =
                user.disabled
                    ? "Disabled"
                    : "Active";
        }


        /* ------------------------------
           PROFILE STATUS
        ------------------------------ */

        if (profileStatus) {

            const requiredFields = [
                profileData.fullName ||
                    profileData.name,
                profileData.username,
                profileData.email ||
                    user.email,
                profileData.phone,
                profileData.country,
                profileData.gender,
                profileData.dateOfBirth ||
                    profileData.dob
            ];


            const completed =
                requiredFields.filter(
                    (value) =>
                        value !==
                            undefined &&
                        value !==
                            null &&
                        String(value)
                            .trim() !== ""
                ).length;


            if (
                completed >=
                requiredFields.length
            ) {

                profileStatus.textContent =
                    "Complete";

            } else if (
                completed >= 4
            ) {

                profileStatus.textContent =
                    "Almost done";

            } else {

                profileStatus.textContent =
                    "Started";
            }
        }
    }


    /* ======================================
       LOAD FIRESTORE PROFILE
    ======================================= */

    async function loadUserProfile(
        user
    ) {

        if (!user) {
            return;
        }


        /*
           Firebase Auth information is
           available immediately.

           Display it first so the dashboard
           doesn't remain stuck on
           "Loading...".
        */

        displayUser(
            user,
            {}
        );


        try {

            const userReference =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(
                    userReference
                );


            if (
                userSnapshot.exists()
            ) {

                const profileData =
                    userSnapshot.data();


                displayUser(
                    user,
                    profileData
                );


                console.log(
                    "TrustNet: Firestore profile loaded."
                );

            } else {

                console.log(
                    "TrustNet: No Firestore profile document found."
                );
            }


        } catch (error) {

            console.error(
                "TrustNet: Unable to load user profile.",
                error
            );

            /*
               The dashboard remains usable
               with Firebase Authentication
               information even if Firestore
               temporarily fails.
            */
        }
    }


    /* ======================================
       AUTHENTICATION STATE
    ======================================= */

    onAuthStateChanged(
        auth,
        async (user) => {

            if (!user) {

                /*
                   User is not authenticated.

                   Send them back to login.
                */

                window.location.replace(
                    "/login.html"
                );

                return;
            }


            console.log(
                "TrustNet Dashboard: Authenticated user:",
                user.uid
            );


            await loadUserProfile(
                user
            );
        }
    );


    /* ======================================
       NOTIFICATION PLACEHOLDER
    ======================================= */

    function updateNotificationCount(
        count
    ) {

        const safeCount =
            Number.isFinite(
                Number(count)
            )
                ? Number(count)
                : 0;


        if (notificationBadge) {

            notificationBadge.textContent =
                safeCount > 99
                    ? "99+"
                    : String(
                        safeCount
                    );
        }


        if (headerNotificationDot) {

            headerNotificationDot.style.display =
                safeCount > 0
                    ? "block"
                    : "none";
        }


        if (alertCount) {

            alertCount.textContent =
                safeCount;
        }
    }


    /*
       Notifications will eventually
       come from Firestore.

       Start with zero until that system
       is implemented.
    */

    updateNotificationCount(
        0
    );


    /* ======================================
       MESSAGE PLACEHOLDER
    ======================================= */

    function updateMessageCount(
        count
    ) {

        const safeCount =
            Number.isFinite(
                Number(count)
            )
                ? Number(count)
                : 0;


        if (messageBadge) {

            messageBadge.textContent =
                safeCount > 99
                    ? "99+"
                    : String(
                        safeCount
                    );
        }
    }


    /*
       Messaging will eventually connect
       to the TrustNet messaging system.
    */

    updateMessageCount(
        0
    );


    /* ======================================
       ACTIVITY PLACEHOLDER
    ======================================= */

    if (activityCount) {

        activityCount.textContent =
            "0";
    }


    /* ======================================
       RESPONSIVE SIDEBAR
    ======================================= */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                820
            ) {

                closeSidebar();
            }
        }
    );


    /* ======================================
       PREVENT MODAL BACKGROUND SCROLL
    ======================================= */

    window.addEventListener(
        "beforeunload",
        () => {

            document.body.style.overflow =
                "";
        }
    );


    /* ======================================
       INITIAL LOG
    ======================================= */

    console.log(
        "TRUSTNET DASHBOARD JS LOADED"
    );

}

);