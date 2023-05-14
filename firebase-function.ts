import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.removeExpiredLinks = functions.pubsub.schedule('every 3 minutes').onRun(async () => {
  try {
    const currentDate = new Date();

    // Get all the expired links from Firestore
    const snapshot = await admin.firestore().collection('links').where('expirationDate', '<=', currentDate).get();

    // Delete each expired link
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete().then(() => {}));
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    console.log('Expired links removed successfully');
    return null;
  } catch (error) {
    console.error('Error removing expired links:', error);
    throw new functions.https.HttpsError('internal', 'Internal server error');
  }
});
