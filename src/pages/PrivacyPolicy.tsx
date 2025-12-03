import React from "react";
import { FileText, Shield, ArrowLeft, AlertCircle } from "lucide-react";

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-indigo-200">
            <span className="bg-indigo-700/50 px-3 py-1 rounded-full">Last updated: November 19, 2025</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">1. Introduction</h2>
            <p className="leading-relaxed text-gray-600">
              Welcome to RestaurantSTT ("we," "our," or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our restaurant management platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">2. Information We Collect</h2>
            <p className="mb-4 text-gray-600">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">Account information (name, email address, phone number)</li>
              <li className="pl-1">Restaurant details (name, address, business information)</li>
              <li className="pl-1">Payment information (processed securely through third-party payment processors)</li>
              <li className="pl-1">Order and transaction data</li>
              <li className="pl-1">Usage data and analytics</li>
              <li className="pl-1">Communications with our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4 text-gray-600">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">Provide, maintain, and improve our services</li>
              <li className="pl-1">Process transactions and send related information</li>
              <li className="pl-1">Send administrative information and updates</li>
              <li className="pl-1">Respond to your comments and questions</li>
              <li className="pl-1">Analyze usage patterns and optimize user experience</li>
              <li className="pl-1">Detect, prevent, and address technical issues</li>
              <li className="pl-1">Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">4. Information Sharing</h2>
            <p className="mb-4 text-gray-600">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">Service providers who perform services on our behalf</li>
              <li className="pl-1">Payment processors for transaction processing</li>
              <li className="pl-1">Legal authorities when required by law</li>
              <li className="pl-1">Business partners with your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">5. Data Security</h2>
            <p className="leading-relaxed text-gray-600">
              We implement appropriate technical and organizational measures to protect your personal information. This
              includes encryption, secure servers, and regular security assessments. However, no method of transmission
              over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">6. Your Rights</h2>
            <p className="mb-4 text-gray-600">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-3 text-gray-600">
              <li className="pl-1">Access your personal information</li>
              <li className="pl-1">Correct inaccurate data</li>
              <li className="pl-1">Request deletion of your data</li>
              <li className="pl-1">Object to processing of your data</li>
              <li className="pl-1">Request data portability</li>
              <li className="pl-1">Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">7. Cookies and Tracking</h2>
            <p className="leading-relaxed text-gray-600">
              We use cookies and similar tracking technologies to track activity on our platform and hold certain
              information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
              sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">8. Children's Privacy</h2>
            <p className="leading-relaxed text-gray-600">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">9. Changes to This Policy</h2>
            <p className="leading-relaxed text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">10. Contact Us</h2>
            <p className="mb-4 text-gray-600">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
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

export default PrivacyPolicy;
