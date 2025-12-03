import React from "react";
import { FileText, Shield, ExternalLink, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const PaymentProcessingPolicy = () => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-indigo-600 px-8 py-10 text-white">
          {/* Back Button - Reverted to Anchor tag with simple positioning */}
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
            <h1 className="text-3xl font-bold tracking-tight">Payment Processing Policy</h1>
          </div>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Terms and conditions governing the processing of payments through the Scan The Table platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-indigo-200">
            <span className="bg-indigo-700/50 px-3 py-1 rounded-full">Effective Date: {currentDate}</span>
            <span className="bg-indigo-700/50 px-3 py-1 rounded-full">Last Updated: {currentDate}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-10">
          {/* Section 1: Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">1. Overview</h2>
            <p className="leading-relaxed text-gray-600">
              This Payment Processing Policy ("Policy") outlines the terms and conditions governing the processing of
              payments through <strong>Scan The Table</strong> ("Platform"). By connecting a payment gateway to your
              account, you ("The Merchant" or "Restaurant") agree to be bound by this Policy.
            </p>
          </section>

          {/* Section 2: Third-Party Payment Gateway */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              2. Third-Party Payment Gateway
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-blue-700">
                <strong>Scan The Table</strong> does not process payments, hold funds, or act as a banking institution.
                We utilize third-party payment gateways to facilitate transactions between your customers and your
                business.
              </p>
            </div>
            <ul className="space-y-4 list-disc pl-5 text-gray-600">
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Supported Gateway:</span> The Platform currently supports
                integration with <span className="text-blue-600 font-medium">Razorpay</span>.
              </li>
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Direct Integration:</span> You are required to connect
                your own Razorpay Merchant Account to the Platform using your API Key ID and Key Secret.
              </li>
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Relationship:</span> Your relationship regarding the
                processing of funds is directly with Razorpay. You are subject to Razorpay’s{" "}
                <a
                  href="https://razorpay.com/terms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
                >
                  Terms of Service <ExternalLink className="h-3 w-3" />
                </a>{" "}
                and{" "}
                <a
                  href="https://razorpay.com/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
                >
                  Privacy Policy <ExternalLink className="h-3 w-3" />
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Section 3: Merchant Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              3. Merchant Responsibilities
            </h2>
            <p className="mb-4 text-gray-600">To use the payment features on the Platform, you agree to:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">1. Valid Account</h3>
                <p className="text-sm text-gray-600">
                  Maintain an active, verified, and good-standing account with Razorpay.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">2. KYC Compliance</h3>
                <p className="text-sm text-gray-600">
                  Complete all KYC requirements mandated by Razorpay directly. We are not responsible for delays due to
                  incomplete KYC.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">3. Accuracy</h3>
                <p className="text-sm text-gray-600">
                  Ensure that the API Keys (Key ID and Key Secret) provided to the Platform are accurate and kept
                  secure.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2">4. Prohibited Activities</h3>
                <p className="text-sm text-gray-600">
                  Use services only for lawful sales. You must not use the Platform for any business types prohibited by
                  Razorpay.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Settlements and Payouts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              4. Settlements and Payouts
            </h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-1">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Direct Settlement:</span> All funds collected are
                  processed by Razorpay and settled directly into your verified bank account.{" "}
                  <span className="font-bold text-gray-900">
                    Scan The Table never takes possession of your transaction funds.
                  </span>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-1">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Timelines:</span> Settlement timelines are determined
                  solely by Razorpay (typically T+2 business days). We have no control over delays in payouts.
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="flex-shrink-0 mt-1">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Withheld Funds:</span> If Razorpay withholds funds due
                  to suspected fraud, high chargeback rates, or compliance issues, you must resolve this directly with
                  Razorpay’s support team.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 5: Transaction Fees */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">5. Transaction Fees</h2>
            <div className="text-gray-600 space-y-4">
              <p>
                <span className="font-semibold text-gray-800">Gateway Fees:</span> You are responsible for all
                transaction fees, Merchant Discount Rates (MDR), and taxes charged by Razorpay. These are deducted
                automatically by Razorpay at the time of the transaction or settlement.
              </p>
              <p className="text-sm italic text-gray-500 bg-gray-50 p-3 rounded border border-gray-100">
                <span className="font-semibold">Platform Fees:</span> Scan The Table reserves the right to charge a
                separate platform fee per transaction, which will be invoiced separately or deducted where applicable.
              </p>
            </div>
          </section>

          {/* Section 6: Refunds and Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              6. Refunds and Cancellations
            </h2>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Merchant Liability:</span> You are solely responsible for
                handling customer refund requests and cancellations.
              </li>
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Process:</span> Refunds can be initiated via your Razorpay
                Dashboard.
              </li>
              <li className="pl-1">
                <span className="font-semibold text-gray-800">Fee Reversal:</span> Be aware that in many cases, the
                original transaction fee charged by the payment gateway is{" "}
                <span className="font-bold text-red-600">not returned</span> to you when you issue a refund.
              </li>
            </ul>
          </section>

          {/* Section 7: Disputes and Chargebacks */}
          <section className="bg-red-50 p-6 rounded-lg border border-red-100">
            <h2 className="text-xl font-bold text-red-800 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5" /> 7. Disputes and Chargebacks
            </h2>
            <div className="space-y-3 text-red-900/80">
              <p>
                <span className="font-semibold">Definition:</span> A chargeback occurs when a cardholder disputes a
                transaction with their bank.
              </p>
              <p>
                <span className="font-semibold">Liability:</span> You are fully liable for all chargebacks, disputes,
                and associated penalties.
              </p>
              <p>
                <span className="font-semibold">Resolution:</span> If a chargeback is received, Razorpay will deduct the
                disputed amount from your settlement. You must provide evidence (e.g., order logs, invoices) directly to
                Razorpay to contest the dispute.{" "}
                <span className="font-bold">Scan The Table cannot contest chargebacks on your behalf.</span>
              </p>
            </div>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="mb-4 text-gray-600">
              To the maximum extent permitted by law, <strong>Scan The Table</strong> shall not be liable for:
            </p>
            <ol className="list-decimal pl-5 space-y-3 text-gray-600">
              <li className="pl-1">
                Any direct, indirect, incidental, or consequential damages arising from the use or inability to use the
                Razorpay integration.
              </li>
              <li className="pl-1">
                Any failure of the payment gateway to process a transaction due to technical issues, downtime, or
                maintenance.
              </li>
              <li className="pl-1">Any loss of funds, settlement delays, or frozen accounts caused by Razorpay.</li>
              <li className="pl-1">
                Unauthorized access to your Razorpay account resulting from your failure to secure your API keys.
              </li>
            </ol>
          </section>

          {/* Section 9: Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">9. Modifications</h2>
            <p className="text-gray-600">
              We reserve the right to update this Policy at any time. Continued use of the Razorpay integration after
              any changes constitutes your acceptance of the new terms.
            </p>
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

export default PaymentProcessingPolicy;
