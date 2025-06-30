import React from 'react';

const RefundPolicyPage = () => (
  <div className="container py-8 max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Cancellation &amp; Refund Policy</h1>
    <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
      <p>This Cancellation &amp; Refund Policy outlines the terms under which you may cancel an order or seek a refund for any product or service purchased through our platform at <a href="https://www.homematesapp.in" className="text-primary-600 underline">www.homematesapp.in</a>, operated by Nhancio Technologies Pvt. Ltd. ("Company", "we", "us", or "our").</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Cancellations</h2>
      <p>Cancellations will only be considered if the request is made within [X] days of placing the order.</p>
      <p>However, a cancellation request may not be accepted if:</p>
      <ul className="list-disc ml-6 mb-2 text-gray-700">
        <li>The order has already been processed and communicated to the seller or merchant.</li>
        <li>Shipping has already been initiated.</li>
        <li>The product is already out for delivery.</li>
      </ul>
      <p>In such cases, you may choose to reject the product at the time of delivery.</p>
      <p>Perishable goods such as food, flowers, or other consumables are not eligible for cancellation once the order is placed.</p>
      <p>However, refunds or replacements may be offered if the delivered item is found to be of poor quality or defective, subject to verification.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Damaged or Defective Items</h2>
      <p>If you receive a damaged or defective item, please report the issue to our customer service team within [X] days of receiving the product.</p>
      <p>Your complaint will be reviewed and validated by the seller/merchant. Refunds or replacements will be processed only after proper verification.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Mismatch or Quality Concerns</h2>
      <p>If you believe the product received is not as described, or it does not meet your expectations, please contact our customer service within [X] days of receiving the product.</p>
      <p>After reviewing your concern, our team will decide the appropriate resolution, which may include a refund or replacement.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Warranty Products</h2>
      <p>For items that come with a manufacturer's warranty, any complaints or service requests should be directed to the manufacturer as per the warranty terms.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Refunds</h2>
      <p>In cases where a refund is approved by Nhancio Technologies Pvt. Ltd., it may take [X] business days for the refund to be processed and credited to your original payment method.</p>
    </div>
  </div>
);

export default RefundPolicyPage;
