import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '+9779766133831',
  defaultMessage = 'Namaste JK Mission Nepal, I need assistance regarding...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  // Clean phone number for WhatsApp link (9779766133831)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

  const getWhatsAppUrl = (msg?: string) => {
    const textToEncode = msg || customText || defaultMessage;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToEncode)}`;
  };

  const quickMessages = [
    '📦 Need help tracking my Order & Delivery',
    '🏪 Want to register my Shop on JK Mission',
    '💰 Question about Cashback & Wallet balance',
    '👥 How does the 3-Level Referral work?'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* WhatsApp Popup Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header with WhatsApp Brand Green */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-sm leading-tight">JK Mission Support</h4>
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span>Online • Quick Response</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            {/* Automated Welcome Speech Bubble */}
            <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs border border-slate-100 space-y-1">
              <p className="font-bold text-slate-900 text-xs flex items-center space-x-1">
                <span>Namaste! 🙏</span>
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Welcome to JK Mission Nepal official customer and merchant desk. How can we help you today?
              </p>
              <span className="text-[9px] text-slate-400 block text-right font-mono">Official Support Desk</span>
            </div>

            {/* Support Number Highlight */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px]">
              <span className="text-emerald-900 font-semibold">WhatsApp Line:</span>
              <span className="font-mono font-black text-emerald-800">{phoneNumber}</span>
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Inquiries:
              </span>
              <div className="space-y-1.5">
                {quickMessages.map((q, idx) => (
                  <a
                    key={idx}
                    href={getWhatsAppUrl(q)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-900 text-[11px] font-medium transition-all shadow-2xs"
                  >
                    {q}
                  </a>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      window.open(getWhatsAppUrl(), '_blank', 'noopener,noreferrer');
                    }
                  }}
                />
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white transition-colors shrink-0 shadow-sm"
                  title="Send via WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Direct Open Button */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Chat on WhatsApp ({phoneNumber})</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Action WhatsApp Button with Badge */}
      <div className="flex items-center space-x-2 group">
        <span className="hidden sm:inline-flex items-center bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-slate-700 pointer-events-none group-hover:opacity-100 transition-opacity">
          <span className="w-2 h-2 rounded-full bg-[#25D366] mr-2 animate-ping" />
          WhatsApp: {phoneNumber}
        </span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="WhatsApp Support"
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 relative"
          title={`WhatsApp Support: ${phoneNumber}`}
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <>
              {/* WhatsApp Icon */}
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border-2 border-white">
                1
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
