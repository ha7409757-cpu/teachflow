import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  X,
  Sparkles,
  Download,
  QrCode,
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { language } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'apk'>('share');

  if (!isOpen) return null;

  // Use the shared production/preview URL
  const shareUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('ais-dev-')
        ? window.location.origin.replace('ais-dev-', 'ais-pre-')
        : window.location.origin)
    : 'https://ais-pre-wslbzrp3w76oyhu3oykf4l-561112832426.asia-southeast1.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `টিচফ্লো (TeachFlow) — স্কুল ও ক্লাস টেস্ট ম্যানেজমেন্ট অ্যাপ!\n\nসরাসরি মোবাইলে ব্যবহার বা ইনস্টল করতে নিচের লিংকে ক্লিক করুন:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TeachFlow - School Management System',
          text: 'TeachFlow — স্কুল ও ক্লাস টেস্ট ম্যানেজমেন্ট অ্যাপ!',
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-800">
        {/* Header with Emerald Gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Share2 className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {language === 'bn' ? 'বন্ধুদের সাথে শেয়ার ও মোবাইল ইনস্টল' : 'Share App & Install on Mobile'}
              </h3>
              <p className="text-xs text-emerald-200">
                {language === 'bn' ? 'যেকোনো স্মার্টফোনে সরাসরি ব্যবহারযোগ্য' : 'Accessible on any smartphone instant'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'share'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'লিংক ও মোবাইলে ইনস্টল' : 'Share Link & Install'}</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>{language === 'bn' ? 'APK ফাইল জেনারেট' : 'Generate APK File'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {activeTab === 'share' ? (
            <>
              {/* Share URL Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'আপনার অ্যাপের লাইভ শেয়ার লিংক:' : 'Your Live App Share Link:'}
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full text-xs bg-transparent text-slate-800 font-mono outline-none truncate"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'WhatsApp-এ পাঠান' : 'Share to WhatsApp'}</span>
                </button>
                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{language === 'bn' ? 'মোবাইলে শেয়ার' : 'Mobile Share'}</span>
                </button>
              </div>

              {/* How to install on mobile without APK banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'বন্ধুরা কীভাবে মোবাইলে ইনস্টল করবে?' : 'How your friends install it on mobile:'}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার বন্ধুরা এই লিংকটিতে ঢুকলে কোনো APK ডাউনলোড করার ঝামেলা বা ভাইরাস ওয়ার্নিং ছাড়াই ১-ক্লিকেই তাদের ফোনে আসল অ্যাপের মতো ইনস্টল করে নিতে পারবে:'
                    : 'Your friends can install this directly like a native app without security warnings or APK downloads:'}
                </p>
                <ol className="text-xs text-emerald-900 space-y-1.5 list-decimal list-inside pl-1 font-medium">
                  <li>{language === 'bn' ? 'লিংকটি মোবাইলের Google Chrome বা Safari ব্রাউজারে খুলবে।' : 'Open the link in mobile Chrome or Safari.'}</li>
                  <li>{language === 'bn' ? 'ব্রাউজারের ৩-ডট (⋮) মেনুতে চাপ দেবে।' : 'Tap the 3-dot (⋮) or Share menu.'}</li>
                  <li>
                    <strong>{language === 'bn' ? '"Install app"' : '"Install app"'}</strong>{' '}
                    {language === 'bn' ? 'অথবা' : 'or'}{' '}
                    <strong>{language === 'bn' ? '"Add to Home screen"' : '"Add to Home Screen"'}</strong>{' '}
                    {language === 'bn' ? 'সিলেক্ট করলেই ফোনের ডিসপ্লেতে TeachFlow অ্যাপ চলে আসবে!' : 'and it appears directly on their phone home screen!'}
                  </li>
                </ol>
              </div>
            </>
          ) : (
            <>
              {/* APK Explanation & Free Online Builder */}
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                    <span>💡</span>
                    <span>{language === 'bn' ? 'কোড থেকে সরাসরি APK ফাইল কেন তৈরি হয় না?' : 'Why no direct APK download in code?'}</span>
                  </p>
                  {language === 'bn'
                    ? 'Google AI Studio একটি ক্লাউড ওয়েব কন্টেইনার (Node.js/React)। অ্যান্ড্রয়েড বাইনারি (.apk) তৈরি করার জন্য Android SDK এবং Java/Gradle বিল্ড সার্ভার প্রয়োজন হয়।'
                    : 'Google AI Studio runs in a cloud web container. Creating raw Android .apk binaries requires Android SDK and Gradle compilers.'}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Download className="w-4 h-4 text-rose-600" />
                    <span>{language === 'bn' ? 'ফ্রি অনলাইন APK বিল্ডার (PWABuilder)' : 'Free Online APK Builder (PWABuilder)'}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'bn'
                      ? 'মাইক্রোসফটের অফিসিয়াল PWABuilder টুল দিয়ে আপনার এই অ্যাপের লিংকটি ইনপুট করে সরাসরি অ্যান্ড্রয়েড APK ফাইল ও গুগল প্লে স্টোর প্যাকেজ ডাউনলোড করে নিতে পারবেন:'
                      : 'You can use the official PWABuilder to generate and download a ready-to-install Android APK file for this app in seconds:'}
                  </p>
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>{language === 'bn' ? 'PWABuilder-এ APK জেনারেট করুন' : 'Generate APK with PWABuilder'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1.5">
                  <p className="font-bold text-slate-900">
                    {language === 'bn' ? 'অথবা আপনার কম্পিউটারে APK তৈরি করার নিয়ম:' : 'Or Build APK on your PC:'}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {language === 'bn'
                      ? 'AI Studio-র উপরের মেনু থেকে প্রজেক্টটি Export to ZIP করে আপনার কম্পিউটারে Android Studio অথবা Capacitor দিয়ে বিল্ড করতে পারেন।'
                      : 'Export project as ZIP from AI Studio menu and build using Capacitor / Android Studio.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
