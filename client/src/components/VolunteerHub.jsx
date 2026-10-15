import React, { useState } from 'react';
import { Truck, MapPin, Clock, ShieldCheck, CheckCircle2, AlertCircle, Navigation, Award, Filter, Sparkles } from 'lucide-react';
import { getTimeRemaining, getDietaryBadge, getStatusBadge } from '../utils/helpers';
import confetti from 'canvas-confetti';

export default function VolunteerHub({
  meals = [],
  ngos = [],
  volunteers = [],
  userLocation,
  radiusKm,
  onRadiusChange,
  onOpenClaimModal,
  onOpenOtpModal,
  onCompleteDelivery
}) {
  const [selectedVolId, setSelectedVolId] = useState(volunteers[0]?.id || 'vol-1');
  const [dietaryFilter, setDietaryFilter] = useState('ALL');
  const [urgencyOnly, setUrgencyOnly] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  const currentVolunteer = volunteers.find((v) => v.id === selectedVolId) || volunteers[0];

  // Meals claimed by this volunteer currently in progress
  const myActiveDeliveries = meals.filter(
    (m) =>
      (m.claimedByVolunteerId === currentVolunteer?.id ||
        m.claimedByVolunteerName?.includes(currentVolunteer?.name?.split(' ')[0])) &&
      (m.status === 'CLAIMED' || m.status === 'PICKED_UP')
  );

  // Available meals ready for pickup
  let availableMeals = meals.filter((m) => m.status === 'AVAILABLE');

  if (dietaryFilter !== 'ALL') {
    availableMeals = availableMeals.filter(
      (m) => m.dietaryType.toLowerCase() === dietaryFilter.toLowerCase()
    );
  }

  if (urgencyOnly) {
    availableMeals = availableMeals.filter((m) => {
      const timeInfo = getTimeRemaining(m.expiresAt);
      return timeInfo.urgency === 'critical';
    });
  }

  const handleDeliver = async (mealId) => {
    setCompletingId(mealId);
    try {
      await onCompleteDelivery(mealId, 'Delivered fresh and in safe thermal condition to shelter staff.');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert(`Error completing delivery: ${err.message}`);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Volunteer Hero Profile Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{currentVolunteer?.name}</h2>
              <span className="text-xs bg-amber-400 text-amber-950 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                {currentVolunteer?.badge || 'Food Rescue Hero'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Vehicle: <strong>{currentVolunteer?.vehicle}</strong> • Rating: ⭐ {currentVolunteer?.rating}
            </p>
          </div>
        </div>

        {/* Profile Switcher & Stats */}
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <div className="text-lg font-extrabold text-white">{currentVolunteer?.rescuesCompleted || 64}</div>
            <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Rescues Done</div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-blue-200 mb-1">Switch Courier Profile:</div>
            <select
              value={selectedVolId}
              onChange={(e) => setSelectedVolId(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-white/30 py-1.5 px-2 bg-white/10 text-white focus:outline-none backdrop-blur-sm"
            >
              {volunteers.map((v) => (
                <option key={v.id} value={v.id} className="text-slate-900">
                  {v.name} ({v.vehicle})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVE RESCUE MISSIONS IN PROGRESS */}
      {myActiveDeliveries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600 animate-pulse" />
              Active Rescue Tasks ({myActiveDeliveries.length})
            </h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Immediate Priority
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActiveDeliveries.map((meal) => {
              const isClaimed = meal.status === 'CLAIMED';
              const isPickedUp = meal.status === 'PICKED_UP';
              const timeInfo = getTimeRemaining(meal.expiresAt);

              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl p-5 shadow-md border-2 border-blue-500/30 flex flex-col justify-between"
                >
                  <div>
                    {/* Stage badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isClaimed
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {isClaimed ? 'Step 1: Head to Donor for Pickup' : 'Step 2: In Transit to Shelter'}
                      </span>
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeInfo.label}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1">{meal.title}</h4>
                    <div className="text-xs text-slate-600 mb-3">
                      🍽️ <strong>{meal.servings} Servings</strong> • ⚖️ {meal.weightKg} kg • 🌡️ {meal.storageCondition}
                    </div>

                    {/* Routing Cards */}
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-800">1. Pickup: {meal.donorName}</div>
                          <div className="text-slate-500 text-[11px]">{meal.donorAddress}</div>
                          <div className="text-emerald-700 font-medium text-[11px]">Contact: {meal.donorPhone}</div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-800">2. Drop-off: {meal.destinationNgoName}</div>
                          <div className="text-slate-500 text-[11px]">{meal.destinationAddress}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons based on Stage */}
                  <div>
                    {isClaimed && (
                      <button
                        onClick={() => onOpenOtpModal(meal)}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Arrived at Donor: Enter Pickup OTP</span>
                      </button>
                    )}

                    {isPickedUp && (
                      <button
                        onClick={() => handleDeliver(meal.id)}
                        disabled={completingId === meal.id}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{completingId === meal.id ? 'Recording Handover...' : 'Arrived at Shelter: Confirm Delivery'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SURPLUS RADAR FEED */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Surplus Meal Radar</h3>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {availableMeals.length} Available for Rescue
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Radius selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-slate-500 px-1 font-medium">Radius:</span>
              {[2, 5, 10, 20].map((r) => (
                <button
                  key={r}
                  onClick={() => onRadiusChange(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    radiusKm === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            {/* Dietary Filter */}
            <select
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
              className="rounded-xl border border-slate-300 py-1.5 px-2 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Diets</option>
              <option value="Vegetarian">Pure Veg</option>
              <option value="Vegan">Vegan</option>
              <option value="Non-Vegetarian">Non-Veg</option>
            </select>

            {/* Urgent Toggle */}
            <button
              onClick={() => setUrgencyOnly(!urgencyOnly)}
              className={`py-1.5 px-3 rounded-xl font-bold border transition flex items-center gap-1 ${
                urgencyOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>🔥 Urgent (&lt;1.5h)</span>
            </button>
          </div>
        </div>

        {/* Available Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableMeals.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700">No surplus meals match the selected filters</h4>
              <p className="text-xs text-slate-500 mt-1">Try expanding the radar search radius or switching dietary preferences.</p>
            </div>
          ) : (
            availableMeals.map((meal) => {
              const timeInfo = getTimeRemaining(meal.expiresAt);
              const dietBadge = getDietaryBadge(meal.dietaryType);
              const isUrgent = timeInfo.urgency === 'critical';

              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dietBadge.bg}`}>
                        {dietBadge.label}
                      </span>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isUrgent
                            ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {timeInfo.label}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug mb-1">{meal.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{meal.description}</p>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>🍽️ Servings:</span>
                        <strong className="text-slate-900">{meal.servings} Portions</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>⚖️ Weight:</span>
                        <strong>{meal.weightKg} kg</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>🏢 Donor:</span>
                        <strong className="truncate max-w-[150px]">{meal.donorName}</strong>
                      </div>
                      {meal.distanceKm !== undefined && (
                        <div className="flex justify-between text-blue-600 font-semibold pt-1 border-t border-slate-200/60">
                          <span>📍 Distance:</span>
                          <span>{meal.distanceKm} km away</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenClaimModal(meal)}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Claim & Route Rescue</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
