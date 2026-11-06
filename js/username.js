
/* ==========================================
   TRUSTNET USERNAME RESERVATION
   File: js/username.js
========================================== */

import { auth } from "./firebase.js";

const API_BASE_URL = "https://trustnet-j9oq.onrender.com";

export async function claimUsername(value) {
  const username = String(value || "").trim().toLowerCase();

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new Error(
      "Username must contain 3–20 letters, numbers or underscores."
    );
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to reserve a username.");
  }

  const token = await user.getIdToken();

  const response = await fetch(
    `${API_BASE_URL}/api/users/username/claim`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ username })
    }
  );

  const result = await response.json().catch(() => ({}));

  if (response.status === 409) {
    const error = new Error(
      result.error ||
      "This username is already taken. Please choose another."
    );

    error.code = "username/taken";
    throw error;
  }

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.error || "Unable to reserve this username. Try again."
    );
  }

  return result;
}
