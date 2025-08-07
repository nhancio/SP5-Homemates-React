const admin = require('firebase-admin');

// Replace with the path to your downloaded service account key JSON file
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function resetCredits() {
  const usersRef = db.collection('u');
  const snapshot = await usersRef.get();
  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.update(doc.ref, { credits: 5 });
  });

  await batch.commit();
  console.log('All user credits reset to 5!');
}

resetCredits().catch(console.error);
