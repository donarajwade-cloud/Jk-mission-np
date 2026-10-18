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
                <strong className="text-slate-900 block">Support Contact Numbers:</strong>
                <div className="space-y-0.5 font-mono">
                  <div>
                    <a href="tel:+9779766133831" className="text-amber-800 hover:underline">+977 9766133831</a>
                  </div>
                  <div>
                    <a href="tel:+9779815837905" className="text-amber-800 hover:underline">+977 9815837905</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Official WhatsApp Support Button Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <strong className="text-slate-900 block text-xs">Direct WhatsApp Helpdesk</strong>
                  <span className="font-mono text-emerald-800 font-bold">+977 9766133831</span>
                </div>
              </div>
              <a
                href="https://wa.me/9779766133831?text=Namaste%20JK%20Mission%20Nepal%2C%20I%20need%20support"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Official Support Email:</strong>
                <a href="mailto:jk5172794@gmail.com" className="font-mono text-amber-800 hover:underline">jk5172794@gmail.com</a>
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
            <strong>Official Website: </strong>
            <a href="https://jkmission.np.com" target="_blank" rel="noopener noreferrer" className="font-mono underline font-bold">
              https://jkmission.np.com
            </a>
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
