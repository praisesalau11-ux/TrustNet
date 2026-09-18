import { adminAuth } from "../services/firebaseAdmin.js";


/* ==========================================
   TrustNet
   File: server/middleware/authMiddleware.js

   Firebase Authentication Middleware
========================================== */


/* ==========================================
   AUTHENTICATION MIDDLEWARE
========================================== */

const authMiddleware = async (req, res, next) => {

    try {

        /* ======================================
           GET AUTHORIZATION HEADER
        ====================================== */

        const authorizationHeader =
            req.headers.authorization;


        /* ======================================
           CHECK WHETHER TOKEN WAS PROVIDED
        ====================================== */

        if (
            !authorizationHeader ||
            !authorizationHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "Authentication required."

            });

        }


        /* ======================================
           EXTRACT FIREBASE ID TOKEN
        ====================================== */

        const idToken =
            authorizationHeader
                .slice(7)
                .trim();


        /* ======================================
           CHECK TOKEN
        ====================================== */

        if (!idToken) {

            return res.status(401).json({

                success: false,

                error:
                    "Authentication token is missing."

            });

        }


        /* ======================================
           VERIFY TOKEN WITH FIREBASE ADMIN
        ====================================== */

        const decodedToken =
            await adminAuth.verifyIdToken(idToken);


        /* ======================================
           SAVE USER INFORMATION
           FOR THE NEXT ROUTE
        ====================================== */

        req.user =
            decodedToken;


        /* ======================================
           CONTINUE TO REQUESTED ROUTE
        ====================================== */

        next();

    } catch (error) {

        /* ======================================
           LOG AUTHENTICATION ERROR
        ====================================== */

        console.error(
            "Authentication middleware error:",
            error
        );


        /* ======================================
           REJECT INVALID TOKEN
        ====================================== */

        return res.status(401).json({

            success: false,

            error:
                "Invalid or expired authentication token."

        });

    }

};


/* ==========================================
   EXPORT MIDDLEWARE
========================================== */

export default authMiddleware;