import React from 'react';
import { ArrowLeft, Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
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

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-500">Have questions about our pricing, features, or need support? We're here to help.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Us</h4>
                    <p className="text-gray-600 text-sm mb-1">For general inquiries and support:</p>
                    <a href="mailto:www.witchcraft912@gmail.com" className="text-indigo-600 hover:underline font-medium">
                      www.witchcraft912@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Headquarters</h4>
                    <p className="text-gray-600">
                      Scan The Table Inc.<br />
                      Opp Nexus Mall, Seawoods,<br />
                      Navimumbai, Maharashtra, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-2xl text-white">
              <h3 className="text-xl font-bold mb-4">Merchant Support</h3>
              <p className="text-indigo-100 mb-6">
                Existing partner? Log in to your dashboard to access priority chat support and detailed documentation.
              </p>
              <a href="/login" className="inline-block bg-white text-indigo-600 font-semibold px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                Go to Dashboard
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First name</label>
                  <input 
                    id="firstName"
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last name</label>
                  <input 
                    id="lastName"
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Doe" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <input 
                  id="email"
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="john@example.com" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                <textarea 
                  id="message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="How can we help you?" 
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Send className="h-4 w-4" /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
