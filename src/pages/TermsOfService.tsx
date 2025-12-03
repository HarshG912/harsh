import React from "react";
import { FileText, ArrowLeft, Scale } from "lucide-react";

const TermsOfService = () => {
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
            <Scale className="h-8 w-8 text-indigo-200" />
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Please read these terms carefully before using RestaurantSTT platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-indigo-200">
            <span className="bg-indigo-700/50 px-3 py-1 rounded-full">Last updated: November 19, 2025</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">1. Agreement to Terms</h2>
            <p className="leading-relaxed text-gray-600">
              By accessing or using RestaurantSTT, you agree to be bound by these Terms of Service and all applicable
              laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
              accessing this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">2. Use License</h2>
            <p className="mb-4 text-gray-600">
              We grant you a limited, non-exclusive, non-transferable license to use RestaurantSTT for your restaurant
              management needs, subject to these Terms of Service.
            </p>
            <p className="mb-4 text-gray-600">You may not:</p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">Modify or copy the materials</li>
              <li className="pl-1">Use the materials for commercial purposes outside your restaurant operations</li>
              <li className="pl-1">Attempt to reverse engineer any software</li>
              <li className="pl-1">Remove any copyright or proprietary notations</li>
              <li className="pl-1">Transfer the materials to another person</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">3. Account Registration</h2>
            <p className="mb-4 text-gray-600">
              To use certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">Provide accurate, current, and complete information</li>
              <li className="pl-1">Maintain the security of your account credentials</li>
              <li className="pl-1">Notify us immediately of any unauthorized access</li>
              <li className="pl-1">Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">4. Payment Terms</h2>
            <p className="mb-4 text-gray-600">If you subscribe to a paid plan:</p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">You agree to pay all fees associated with your chosen plan</li>
              <li className="pl-1">Fees are billed in advance on a recurring basis</li>
              <li className="pl-1">All payments are non-refundable except as described in our Refund Policy</li>
              <li className="pl-1">We may change fees with 30 days' notice</li>
              <li className="pl-1">You authorize us to charge your payment method automatically</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">5. User Content</h2>
            <p className="mb-4 text-gray-600">
              You retain ownership of content you upload to RestaurantSTT. By uploading content, you grant us a
              worldwide, non-exclusive, royalty-free license to use, reproduce, and display the content solely for
              providing our services.
            </p>
            <p className="mb-4 text-gray-600">You represent that:</p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">You own or have rights to all content you upload</li>
              <li className="pl-1">Your content does not violate any laws or third-party rights</li>
              <li className="pl-1">Your content does not contain harmful or offensive material</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">6. Prohibited Uses</h2>
            <p className="mb-4 text-gray-600">You may not use RestaurantSTT to:</p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">Violate any laws or regulations</li>
              <li className="pl-1">Infringe on intellectual property rights</li>
              <li className="pl-1">Transmit harmful code or malware</li>
              <li className="pl-1">Interfere with platform security features</li>
              <li className="pl-1">Engage in fraudulent activities</li>
              <li className="pl-1">Harass or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">7. Service Availability</h2>
            <p className="leading-relaxed text-gray-600">
              We strive to maintain high availability but do not guarantee uninterrupted service. We may temporarily
              suspend service for maintenance, updates, or due to circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">8. Limitation of Liability</h2>
            <p className="leading-relaxed text-gray-600">
              RestaurantSTT and its affiliates shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages resulting from your use or inability to use the service, even if we have been advised
              of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">9. Termination</h2>
            <p className="leading-relaxed text-gray-600">
              We may terminate or suspend your account immediately, without prior notice, for conduct that we believe
              violates these Terms of Service or is harmful to other users, us, or third parties, or for any other
              reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">10. Changes to Terms</h2>
            <p className="leading-relaxed text-gray-600">
              We reserve the right to modify these terms at any time. We will notify you of material changes via email
              or through the platform. Your continued use after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">11. Governing Law</h2>
            <p className="leading-relaxed text-gray-600">
              These Terms shall be governed by and construed in accordance with applicable laws, without
              regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">12. Contact Information</h2>
            <p className="mb-4 text-gray-600">For questions about these Terms of Service, please contact us at:</p>
            <ul className="list-none space-y-2 text-gray-600">
              <li>Email: www.witchcraft912@gmail.com</li>
            </ul>
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

export default TermsOfService;
