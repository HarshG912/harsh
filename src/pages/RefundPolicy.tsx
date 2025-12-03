import React from "react";
import { FileText, ArrowLeft, Shield, AlertCircle, Mail } from "lucide-react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-indigo-600 px-8 py-10 text-white">
          {/* Back Button */}
          <div className="mb-8">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-md bg-white text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 shadow-lg font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Homepage
            </a>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-indigo-200" />
            <h1 className="text-3xl font-bold tracking-tight">Refund Policy: All Sales Final</h1>
          </div>
          <p className="text-indigo-100 text-lg max-w-2xl">
            At RestaurantSTT, we strive to provide excellent service and clear billing.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-indigo-200">
            <span className="bg-indigo-700/50 px-3 py-1 rounded-full">Last updated: November 19, 2025</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-10">
          {/* Section 1: Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">1. Overview</h2>
            <p className="leading-relaxed text-gray-600">
              At RestaurantSTT, we strive to provide excellent service and clear billing.{" "}
              <strong>All payments for subscriptions are non-refundable.</strong> This policy outlines the limited
              circumstances under which a refund may be issued.
            </p>
          </section>

          {/* Section 2: Free Trial Period */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              2. Free Trial Period
            </h2>
            <p className="mb-4 text-gray-600">We offer a 14-day free trial for new users. During this period:</p>
            <ul className="space-y-3 list-disc pl-5 text-gray-600">
              <li className="pl-1">You can explore all features without any charges.</li>
              <li className="pl-1">You can cancel at any time without being charged.</li>
              <li className="pl-1">No refund is necessary as no payment has been made.</li>
              <li className="pl-1">After the trial, you will be automatically charged unless you cancel.</li>
            </ul>
          </section>

          {/* Section 3: Subscription Payments: Non-Refundable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              3. Subscription Payments: Non-Refundable
            </h2>
            <p className="mb-4 text-gray-600">
              <strong>All fees for paid subscriptions (monthly and annual) are non-refundable.</strong> This includes:
            </p>
            <ul className="space-y-3 list-disc pl-5 text-gray-600">
              <li className="pl-1">
                <span className="font-semibold text-gray-800">First-time subscribers and recurring payments:</span> No
                refunds will be issued once a payment has been processed.
              </li>
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Partial Months:</span> No refunds for partial months or
                unused time in a billing cycle upon cancellation.
              </li>
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Cancellation:</span> You may cancel your subscription at
                any time, but you will retain access until the end of the current billing period without a refund.
              </li>
            </ul>
          </section>

          {/* Section 4: Refund Eligibility (Limited Exception) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              4. Refund Eligibility (Limited Exception)
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-700">A refund will only be considered in the following limited circumstance:</p>
            </div>
            <ul className="list-disc pl-5 text-gray-600">
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Duplicate Charging:</span> You were charged incorrectly or
                multiple times for the same subscription on the same billing date.
              </li>
            </ul>
          </section>

          {/* Section 5: How to Request a Refund for Billing Errors */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              5. How to Request a Refund for Billing Errors
            </h2>
            <p className="mb-4 text-gray-600">If you believe you were charged incorrectly or multiple times:</p>
            <ol className="list-decimal pl-5 space-y-3 text-gray-600">
              <li className="pl-1">
                Contact our support team at <strong>www.witchcraft912@gmail.com</strong>.
              </li>
              <li className="pl-1">Include your account email and order/transaction ID for both charges.</li>
              <li className="pl-1">Provide a brief explanation detailing the duplicate charge.</li>
              <li className="pl-1">Our team will review your request within 3-5 business days.</li>
              <li className="pl-1">
                If a verified duplicate charge is approved, the erroneous charge will be refunded within 7-10 business
                days.
              </li>
            </ol>
          </section>

          {/* Section 6: Refund Processing (Billing Errors Only) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              6. Refund Processing (Billing Errors Only)
            </h2>
            <p className="mb-4 text-gray-600">Once a refund for a billing error is approved:</p>
            <ul className="space-y-3 list-disc pl-5 text-gray-600">
              <li className="pl-1">Refunds will be issued to the original payment method.</li>
              <li className="pl-1">Processing time depends on your payment provider (typically 5-10 business days).</li>
              <li className="pl-1">You will receive an email confirmation when the refund is processed.</li>
              <li className="pl-1">
                <strong>Your access to the service will NOT be terminated,</strong> as only the erroneous charge is
                being corrected.
              </li>
            </ul>
          </section>

          {/* Section 7: Payment Disputes */}
          <section className="bg-red-50 p-6 rounded-lg border border-red-100">
            <h2 className="text-xl font-bold text-red-800 flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5" /> 7. Payment Disputes
            </h2>
            <p className="mb-3 text-red-900/80">If you believe you were charged incorrectly:</p>
            <ul className="space-y-2 list-disc pl-5 text-red-900/80">
              <li className="pl-1">Contact us first before initiating a chargeback with your bank.</li>
              <li className="pl-1">
                We will investigate the charge and resolve any billing errors (as per Section 4).
              </li>
              <li className="pl-1">Chargebacks may result in immediate account suspension.</li>
              <li className="pl-1">We reserve the right to dispute illegitimate chargebacks.</li>
            </ul>
          </section>

          {/* Section 8: Downgrade Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">8. Downgrade Policy</h2>
            <p className="mb-4 text-gray-600">If you wish to downgrade your plan instead of requesting a refund:</p>
            <ul className="space-y-3 list-disc pl-5 text-gray-600">
              <li className="pl-1">Downgrades take effect at the next billing cycle.</li>
              <li className="pl-1">No partial refunds for the current billing period.</li>
              <li className="pl-1">Your data and settings will be preserved.</li>
              <li className="pl-1">Some features may become unavailable based on the new plan.</li>
            </ul>
          </section>

          {/* Section 9: Force Majeure */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">9. Force Majeure</h2>
            <p className="mb-4 text-gray-600">
              We are not responsible for refunds in cases of service interruption due to:
            </p>
            <ul className="space-y-3 list-disc pl-5 text-gray-600">
              <li className="pl-1">Natural disasters or acts of God</li>
              <li className="pl-1">Government restrictions or regulations</li>
              <li className="pl-1">Internet service provider issues</li>
              <li className="pl-1">Circumstances beyond our reasonable control</li>
            </ul>
          </section>

          {/* Section 10: Changes to Refund Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              10. Changes to Refund Policy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon
              posting to the website. Your continued use of RestaurantSTT after changes constitutes acceptance of the
              modified policy.
            </p>
          </section>

          {/* Section 11: Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">11. Contact Us</h2>
            <p className="mb-4 text-gray-600">
              For questions about billing, account, or to report a duplicate charge, please contact us at:
            </p>
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <Mail className="h-5 w-5" />
              <span>www.witchcraft912@gmail.com</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-6 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>© {new Date().getFullYear()} Scan The Table. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
