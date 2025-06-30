import React from 'react';

const RefundPolicyPage = () => (
  <div className="container py-8 max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Cancellation &amp; Refund Policy</h1>
    <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
      <p><strong>Effective for:</strong> Homemates AI, operated by Nhancio Technologies Pvt. Ltd.<br/>
      <strong>Website:</strong> <a href="https://www.homematesapp.in" className="text-primary-600 underline">homematesapp.in</a></p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Nature of Service</h2>
      <p>Homemates AI offers digital products and subscription-based services, which are delivered electronically and accessed instantly upon successful purchase or registration.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Cancellation Policy</h2>
      <p>Users may cancel their subscription at any time via their account settings or by contacting our support team.</p>
      <p>Cancellations will stop any future billing but do not guarantee a refund for the current billing cycle once the service has been accessed or used.</p>
      <p>If you cancel before your next billing cycle, you will not be charged again.</p>
      <p>For time-bound subscriptions (e.g., monthly or yearly plans), access will continue until the end of the current period after cancellation.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Refund Policy</h2>
      <p>Due to the digital and non-returnable nature of our services, we do not offer refunds once access to the service has been granted.</p>
      <p>Refunds may be considered only under exceptional circumstances, such as:</p>
      <ul className="list-disc ml-6 mb-2 text-gray-700">
        <li>You were charged incorrectly due to a billing error.</li>
        <li>You were unable to access the service due to a verified technical issue on our end.</li>
        <li>You have not used or accessed the service at all after payment, and your refund request is raised within 7 days of purchase.</li>
      </ul>
      <p>All refund requests will be reviewed case-by-case and the final decision rests with Nhancio Technologies Pvt. Ltd.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Free Trials (if applicable)</h2>
      <p>If we offer a free trial, you may cancel before the trial ends to avoid being charged. Once the trial converts into a paid subscription, the above refund policy applies.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Contact Us</h2>
      <p>If you have questions about cancellations or need assistance, contact our support team at:<br/>
      <span role="img" aria-label="email">📧</span> <a href="mailto:hello@nhancio.com" className="text-primary-600 underline">hello@nhancio.com</a><br/>
      <span role="img" aria-label="phone">📞</span> 7095288950
      </p>
    </div>
  </div>
);

export default RefundPolicyPage;
