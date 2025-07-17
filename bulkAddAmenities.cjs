const admin = require('firebase-admin');
const serviceAccount = require('./homemates-app-firebase-adminsdk-nbjyj-22b2187e92.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const allAmenities = [
  'Car Parking',
  'Security',
  'Power Backup',
  'Lift',
  'Swimming Pool',
  'Gym',
  "Children's Play Area",
  'Club House',
  'Intercom',
  'Fire Safety',
  'Fridge',
  'Washing',
  'Bed'
];

async function setAllAmenitiesToAllProperties() {
  const snapshot = await db.collection('r').get();
  const docs = snapshot.docs;
  const BATCH_SIZE = 500;
  let batch = db.batch();
  let count = 0;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    batch.update(doc.ref, { amenities: allAmenities });
    count++;
    if (count % BATCH_SIZE === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  if (count % BATCH_SIZE !== 0) {
    await batch.commit();
  }
  console.log(`Updated ${count} properties with all amenities.`);
}

setAllAmenitiesToAllProperties().catch(console.error); 