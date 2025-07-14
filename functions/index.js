/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const axios = require('axios');
const crypto = require('crypto');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Environment variables (set these in your Firebase environment)
const PHONEPE_MERCHANT_ID = functions.config().phonepe.merchant_id;
const PHONEPE_SALT_KEY = functions.config().phonepe.salt_key;
const PHONEPE_SALT_INDEX = functions.config().phonepe.salt_index;
const PHONEPE_BASE_URL = functions.config().phonepe.base_url || 'https://api-preprod.phonepe.com/apis/pg-sandbox'; // Use sandbox for testing

exports.phonepePay = functions.https.onRequest(async (req, res) => {
  try {
    const { amount, merchantTransactionId, userPhone } = req.body;
    if (!amount || !merchantTransactionId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 1. Prepare payload as per PhonePe docs
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: userPhone || 'user_' + Date.now(),
      amount: Number(amount),
      redirectUrl: 'https://your-frontend-url.com/payment-success',
      redirectMode: 'REDIRECT',
      callbackUrl: 'https://your-backend-url.com/phonepe-callback',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // 2. Encode payload and generate X-VERIFY signature
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToSign = base64Payload + '/pg/v1/pay' + PHONEPE_SALT_KEY;
    const xVerify = crypto.createHash('sha256').update(stringToSign).digest('hex') + '###' + PHONEPE_SALT_INDEX;

    // 3. Make the request to PhonePe
    const phonepeRes = await axios.post(
      PHONEPE_BASE_URL + '/pg/v1/pay',
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
        },
      }
    );

    // 4. Return the redirect URL to the frontend
    const data = phonepeRes.data;
    if (data.success && data.data && data.data.instrumentResponse && data.data.instrumentResponse.redirectInfo && data.data.instrumentResponse.redirectInfo.url) {
      res.json({ success: true, data: data.data });
    } else {
      res.json({ success: false, error: data.message || 'Payment initiation failed' });
    }
  } catch (err) {
    res.json({ success: false, error: err.message || 'Payment initiation failed' });
  }
});
