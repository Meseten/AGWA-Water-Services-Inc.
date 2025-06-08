
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * A callable Cloud Function to securely and efficiently fetch all user profiles.
 * This version is more resilient and handles cases where profiles are missing.
 */
exports.getAllUserProfiles = functions.https.onCall(async (data, context) => {
  
  const usersCollectionRef = db.collection("artifacts/c_0e480e34ffaa3f81_agwa_water_services_app-268/users");
  
  try {
    const usersSnapshot = await usersCollectionRef.get();
    const usersList = [];

    for (const userDoc of usersSnapshot.docs) {
      try {
        const profileRef = userDoc.ref.collection("profile").doc("data");
        const profileSnap = await profileRef.get();

        if (profileSnap.exists()) {
          usersList.push({
            id: userDoc.id,
            ...profileSnap.data(),
          });
        } else {
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

    return { success: true, data: usersList };

  } catch (error) {
    console.error("Critical error in getAllUserProfiles Cloud Function:", error);
    throw new functions.https.HttpsError(
      "internal", "An unexpected server error occurred while fetching user profiles."
    );
  }
});
