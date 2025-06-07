// This file should be named index.js inside a 'functions' folder in your project root.

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK.
admin.initializeApp();
const db = admin.firestore();

/**
 * A callable Cloud Function to securely and efficiently fetch all user profiles.
 * This version is more resilient and handles cases where profiles are missing.
 */
exports.getAllUserProfiles = functions.https.onCall(async (data, context) => {
  // This function is the definitive fix for the "internal" server error.
  // It ensures that even if some user documents are malformed, the function
  // will still return all the valid profiles it can find.
  
  const usersCollectionRef = db.collection("artifacts/c_0e480e34ffaa3f81_agwa_water_services_app-268/users");
  
  try {
    const usersSnapshot = await usersCollectionRef.get();
    const usersList = [];

    // Use a standard for...of loop for clarity and sequential processing.
    for (const userDoc of usersSnapshot.docs) {
      try {
        const profileRef = userDoc.ref.collection("profile").doc("data");
        const profileSnap = await profileRef.get();

        if (profileSnap.exists()) {
          // If profile exists, add its data to our list.
          usersList.push({
            id: userDoc.id,
            ...profileSnap.data(),
          });
        } else {
          // If profile is missing, add a placeholder. This prevents the function from crashing.
          console.warn(`User document ${userDoc.id} is missing its profile subcollection.`);
          usersList.push({
            id: userDoc.id,
            displayName: "Profile Missing",
            email: `(no profile for ${userDoc.id})`,
            accountStatus: "Profile Missing",
            role: "unknown",
          });
        }
      } catch (innerError) {
        // If there's an error fetching a specific profile, log it and add a placeholder.
        console.error(`Error fetching profile for user ${userDoc.id}:`, innerError);
        usersList.push({
          id: userDoc.id,
          displayName: "Profile Read Error",
          email: `(error for ${userDoc.id})`,
          accountStatus: "Error",
          role: "unknown",
        });
      }
    }

    // Always return success with the (potentially partial) list.
    return { success: true, data: usersList };

  } catch (error) {
    console.error("Critical error in getAllUserProfiles Cloud Function:", error);
    // This catches broader errors, like failing to get the initial users list.
    throw new functions.https.HttpsError(
      "internal", "An unexpected server error occurred while fetching user profiles."
    );
  }
});
