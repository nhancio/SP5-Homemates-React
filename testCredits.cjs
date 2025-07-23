const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./homemates-app-firebase-adminsdk-nbjyj-22b2187e92.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testCredits() {
  try {
    console.log('Testing credit system...');
    
    // Test user ID (replace with actual user ID)
    const testUserId = 'test-user-id';
    
    // 1. Initialize credits for a test user
    console.log('1. Initializing credits for test user...');
    await db.collection('u').doc(testUserId).set({
      userId: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      credits: 5,
      creditsLastUpdated: new Date().toISOString()
    }, { merge: true });
    
    // 2. Get user credits
    console.log('2. Getting user credits...');
    const userDoc = await db.collection('u').doc(testUserId).get();
    const userData = userDoc.data();
    console.log('Current credits:', userData.credits);
    
    // 3. Use a credit
    console.log('3. Using a credit...');
    await db.collection('u').doc(testUserId).update({
      credits: admin.firestore.FieldValue.increment(-1),
      creditsLastUpdated: new Date().toISOString()
    });
    
    // 4. Check credits again
    console.log('4. Checking credits after use...');
    const updatedDoc = await db.collection('u').doc(testUserId).get();
    const updatedData = updatedDoc.data();
    console.log('Credits after use:', updatedData.credits);
    
    // 5. Add more credits
    console.log('5. Adding more credits...');
    await db.collection('u').doc(testUserId).update({
      credits: admin.firestore.FieldValue.increment(10),
      creditsLastUpdated: new Date().toISOString()
    });
    
    // 6. Final check
    console.log('6. Final credit check...');
    const finalDoc = await db.collection('u').doc(testUserId).get();
    const finalData = finalDoc.data();
    console.log('Final credits:', finalData.credits);
    
    console.log('✅ Credit system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing credit system:', error);
  }
}

// Run the test
testCredits(); 