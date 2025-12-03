import React from 'react';
import { ArrowLeft, CheckCircle, Users, Zap, TrendingUp } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Sticky Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="https://nccqrzxilapxlizrccnv.supabase.co/storage/v1/object/public/Images/STT%20Logo%20blue.png" 
              alt="Logo" 
              className="h-10 w-10 object-cover rounded-none" 
            />
             <span className="font-semibold text-lg text-gray-900 hidden sm:block">RestaurantSTT</span>
          </a>

          <a 
            href="/" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 h-9 px-3 text-gray-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="container mx-auto px-4 py-16 sm:py-24 max-w-5xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
            Revolutionizing the <span className="text-indigo-600">Dining Experience</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            Scan The Table (STT) bridges the gap between traditional hospitality and modern technology, empowering restaurants to operate smarter, faster, and more efficiently.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="mt-4 text-lg text-gray-600">
              To provide affordable, enterprise-grade tools to restaurants of all sizes, enabling them to focus on what they do best: creating delicious food and memorable experiences.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Empowering Staff</h3>
              <p className="text-gray-600">
                With role-based access control, we ensure that Managers, Chefs, and Waiters have the exact tools they need without clutter or security risks.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Maximizing Revenue</h3>
              <p className="text-gray-600">
                Direct payment integrations means you keep more of your earnings with faster settlements and full control over your financial data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="py-16 sm:py-24 container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Restaurants Choose STT</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            "Seamless QR Code Ordering",
            "Real-time Kitchen Display System (KDS)",
            "Secure Role-Based Staff Management",
            "Direct Payment Gateway Integration",
            "Detailed Analytics & Reporting",
            "24/7 Priority Support"
          ].map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0" />
              <span className="text-lg text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Scan The Table. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
