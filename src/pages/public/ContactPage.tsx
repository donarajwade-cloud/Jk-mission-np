import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
          Official Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950">
          Contact JK Mission Nepal
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Reach our dedicated support team in Kathmandu for merchant inquiries, customer cashback questions, or settlement help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg">Central Operations Office</h3>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Kathmandu Headquarters:</strong>
                <span>New Road, Ward No. 22, Kathmandu, Bagmati Province, Nepal</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Phone Support:</strong>
                <span>+977-1-4220000 / +977 9800000000</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Official Email:</strong>
                <span>support@jkmissionnp.com • admin@jkmissionnp.com</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Business Hours:</strong>
                <span>Sunday - Friday: 9:30 AM to 5:30 PM (Asia/Kathmandu)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Portal Website: </strong>
            <span className="font-mono">www.jkmissionnp.com</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <h3 className="font-bold text-slate-900 text-base">Inquiry Submitted</h3>
              <p className="text-xs text-slate-500">
                Thank you! Our support officer in Kathmandu will reach out to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-amber-800 font-bold underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="font-extrabold text-slate-900 text-base mb-1">Send Us an Inquiry</h3>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nepali Mobile Number (+977)</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+977 98XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message / Question</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about merchant onboarding, cashback, or orders..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
