import React, { useState } from 'react';
import { Truck, MapPin, Building2, Clock, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { getTimeRemaining, getDietaryBadge } from '../utils/helpers';

export default function ClaimModal({ meal, ngos = [], volunteers = [], isOpen, onClose, onClaimSuccess }) {
  if (!isOpen || !meal) return null;

  const [selectedNgoId, setSelectedNgoId] = useState(ngos[0]?.id || 'ngo-1');
  const [selectedVolId, setSelectedVolId] = useState(volunteers[0]?.id || 'vol-1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timeInfo = getTimeRemaining(meal.expiresAt);
  const dietBadge = getDietaryBadge(meal.dietaryType);
  const selectedNgo = ngos.find((n) => n.id === selectedNgoId) || ngos[0];
  const selectedVolunteer = volunteers.find((v) => v.id === selectedVolId) || volunteers[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await onClaimSuccess(meal.id, {
        volunteerId: selectedVolunteer?.id || 'vol-1',
        volunteerName: selectedVolunteer?.name || 'Aarav Sharma',
        ngoId: selectedNgo?.id || 'ngo-1',
        ngoName: selectedNgo?.name || 'Aashray Night Shelter for Homeless',
        destinationAddress: selectedNgo?.address || 'City Shelter'
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to claim meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Claim Food Rescue</h3>
              <p className="text-emerald-100 text-xs mt-0.5">Route surplus meals directly to local shelter</p>
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
        <form onSubmit={handleSubmit} className="p-6">
          {/* Meal Overview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${dietBadge.bg}`}>
                {dietBadge.label}
              </span>
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeInfo.label}
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-base mb-1">{meal.title}</h4>
            <p className="text-xs text-slate-600 mb-3">{meal.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <div>🍽️ Servings: <strong>{meal.servings} Meals</strong></div>
              <div>⚖️ Weight: <strong>{meal.weightKg || '—'} kg</strong></div>
              <div>📦 Condition: <strong>{meal.storageCondition}</strong></div>
              <div>🏢 Donor: <strong>{meal.donorName}</strong></div>
            </div>
          </div>

          {/* Route Planning Section */}
          <div className="space-y-4 mb-5">
            {/* Courier Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Dispatching Volunteer Courier
              </label>
              <select
                value={selectedVolId}
                onChange={(e) => setSelectedVolId(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {volunteers.map((vol) => (
                  <option key={vol.id} value={vol.id}>
                    🛵 {vol.name} ({vol.vehicle}) • Rating: {vol.rating}⭐
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Shelter Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Beneficiary / NGO Shelter
              </label>
              <select
                value={selectedNgoId}
                onChange={(e) => setSelectedNgoId(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ngos.map((ngo) => (
                  <option key={ngo.id} value={ngo.id}>
                    🏠 {ngo.name} ({ngo.currentOccupants}/{ngo.capacity} occupants)
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Route Indicator */}
            {selectedNgo && (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-emerald-950 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    Pickup: {meal.donorName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{meal.donorAddress}</div>
                </div>

                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />

                <div className="flex-1">
                  <div className="font-semibold text-emerald-950 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-purple-700" />
                    Drop-off: {selectedNgo.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{selectedNgo.address}</div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg mb-4 border border-red-200">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>{isSubmitting ? 'Reserving...' : 'Confirm & Reserve Pickup'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
