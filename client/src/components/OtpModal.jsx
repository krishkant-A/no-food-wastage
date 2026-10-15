import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OtpModal({ meal, isOpen, onClose, onVerifySuccess }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setError('');
      setIsSuccess(false);
      setTimeout(() => {
        if (inputRefs[0].current) inputRefs[0].current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !meal) return null;

  const handleDigitChange = (index, value) => {
    // Only accept numeric
    const clean = value.replace(/\D/g, '');
    if (!clean && value !== '') return;

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1); // Take latest single digit
    setDigits(newDigits);
    setError('');

    // Auto-focus next input
    if (clean && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const otpCode = digits.join('');
    if (otpCode.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onVerifySuccess(meal.id, otpCode);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Incorrect verification OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Verify Physical Handover</h3>
              <p className="text-blue-100 text-xs mt-0.5">Secure Donor-to-Courier Pickup OTP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-5 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700">
            <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
              <span>{meal.title}</span>
              <span className="text-blue-600 font-bold">{meal.servings} Servings</span>
            </div>
            <div className="text-slate-500">
              Donor: <strong className="text-slate-800">{meal.donorName}</strong>
            </div>
            <div className="text-slate-500 truncate">
              📍 {meal.donorAddress}
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-slate-600">
              Ask the food donor for the <strong>4-digit handover OTP</strong> shown on their screen:
            </p>
            {/* Helpful demo hint */}
            <div className="inline-block mt-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] text-amber-800 font-medium">
              💡 Demo Reference: Donor OTP is <strong className="font-mono text-amber-900">{meal.pickupOtp}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-6">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isSubmitting || isSuccess}
                  className={`w-14 h-16 text-center text-2xl font-bold font-mono rounded-xl border-2 transition focus:outline-none ${
                    error
                      ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500'
                      : isSuccess
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg mb-4 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg mb-4 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Handover Verified! Meal is now safely in transit.</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : 'Confirm Pickup'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
