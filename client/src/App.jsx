import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HyperlocalMap from './components/HyperlocalMap';
import DonorPortal from './components/DonorPortal';
import VolunteerHub from './components/VolunteerHub';
import NgoManager from './components/NgoManager';
import ImpactDashboard from './components/ImpactDashboard';
import ClaimModal from './components/ClaimModal';
import OtpModal from './components/OtpModal';
import {
  getMeals,
  getUsers,
  getStats,
  getNgoRequests,
  createMeal,
  claimMeal,
  verifyPickup,
  completeDelivery,
  createNgoRequest,
  resetDatabase,
  subscribeToEvents
} from './services/api';
import { getTimeRemaining, getDietaryBadge } from './utils/helpers';
import { MapPin, Clock, Truck, ShieldAlert, Sparkles, Filter, Navigation, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('RADAR');
  const [meals, setMeals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Geolocation & Radar radius
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]);
  const [radiusKm, setRadiusKm] = useState(5);

  // Selected meal for map / modal
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  // Live Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Load initial data
  const loadData = async () => {
    try {
      const [mealsData, usersData, statsData, reqsData] = await Promise.all([
        getMeals({ lat: userLocation[0], lng: userLocation[1], radius: radiusKm }),
        getUsers(),
        getStats(),
        getNgoRequests()
      ]);

      setMeals(mealsData);
      setDonors(usersData.donors || []);
      setNgos(usersData.ngos || []);
      setVolunteers(usersData.volunteers || []);
      setStats(statsData);
      setRequests(reqsData);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Try obtaining browser's actual geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Keep default if user prefers Bangalore demo or update
          console.log('GPS acquired:', pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.log('Using default reference coordinates for demo');
        }
      );
    }

    // Subscribe to Server-Sent Events (SSE)
    const unsubscribe = subscribeToEvents((eventType, data) => {
      setIsConnected(true);

      if (eventType === 'CONNECTED') {
        setIsConnected(true);
      } else if (eventType === 'MEAL_CREATED') {
        setMeals((prev) => [data, ...prev]);
        showToast(`🎉 New Surplus Meal Listed: "${data.title}" by ${data.donorName}`, 'success');
      } else if (eventType === 'MEAL_CLAIMED') {
        setMeals((prev) => prev.map((m) => (m.id === data.id ? data : m)));
        showToast(`🛵 Courier Claimed: "${data.title}" heading to ${data.destinationNgoName}`, 'info');
      } else if (eventType === 'MEAL_PICKED_UP') {
        setMeals((prev) => prev.map((m) => (m.id === data.id ? data : m)));
        showToast(`📦 Handover Verified via OTP: "${data.title}" is now in transit!`, 'info');
      } else if (eventType === 'MEAL_DELIVERED') {
        setMeals((prev) => prev.map((m) => (m.id === data.id ? data : m)));
        showToast(`✅ Delivered & Served: ${data.servings} meals saved at ${data.destinationNgoName}!`, 'success');
      } else if (eventType === 'STATS_UPDATED') {
        setStats(data);
      } else if (eventType === 'NGO_REQUEST_CREATED') {
        setRequests((prev) => [data, ...prev]);
        showToast(`🚨 New Shelter Need: ${data.requiredServings} meals needed by ${data.ngoName}`, 'warning');
      } else if (eventType === 'RESET_SEED_DATA') {
        loadData();
        showToast('🔄 Demo environment reloaded with fresh seed data', 'info');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Refresh meals whenever radius changes
  useEffect(() => {
    getMeals({ lat: userLocation[0], lng: userLocation[1], radius: radiusKm })
      .then(setMeals)
      .catch(console.error);
  }, [radiusKm, userLocation]);

  // Handler: Donor creates surplus meal
  const handleMealCreated = async (mealData) => {
    const newMeal = await createMeal(mealData);
    setMeals((prev) => [newMeal, ...prev.filter((m) => m.id !== newMeal.id)]);
    const updatedStats = await getStats();
    setStats(updatedStats);
    showToast(`Surplus meal "${newMeal.title}" posted successfully!`, 'success');
  };

  // Handler: Volunteer claims meal
  const handleClaimSuccess = async (mealId, payload) => {
    const res = await claimMeal(mealId, payload);
    setMeals((prev) => prev.map((m) => (m.id === mealId ? res.meal : m)));
    showToast('Rescue route confirmed! Proceed to the donor for food collection.', 'success');
  };

  // Handler: Handover OTP verified
  const handleVerifyOtpSuccess = async (mealId, otp) => {
    const res = await verifyPickup(mealId, otp);
    setMeals((prev) => prev.map((m) => (m.id === mealId ? res.meal : m)));
    showToast('Handover confirmed! Deliver to the shelter.', 'success');
  };

  // Handler: Delivery completed
  const handleCompleteDelivery = async (mealId, notes) => {
    const res = await completeDelivery(mealId, notes);
    setMeals((prev) => prev.map((m) => (m.id === mealId ? res.meal : m)));
    const updatedStats = await getStats();
    setStats(updatedStats);
    showToast(`Mission Accomplished! ${res.impact.mealsSaved} meals successfully saved!`, 'success');
  };

  // Handler: NGO posts demand
  const handlePostRequest = async (reqData) => {
    const newReq = await createNgoRequest(reqData);
    setRequests((prev) => [newReq, ...prev]);
    showToast('Meal requirement broadcasted to nearby food donors and couriers.', 'success');
  };

  // Handler: Reset seed data
  const handleResetDemo = async () => {
    if (window.confirm('Reset all demo data back to clean initial state?')) {
      await resetDatabase(userLocation[0], userLocation[1]);
      await loadData();
      showToast('Environment reseeded with realistic donations and volunteers.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[3000] animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-500/50'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-500/50'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/60 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        isConnected={isConnected}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="font-bold text-slate-700 text-sm">Initializing No_Food_Wastage Platform...</div>
          </div>
        ) : (
          <>
            {/* TAB 1: RADAR & HYPERLOCAL MAP (DEFAULT) */}
            {activeTab === 'RADAR' && (
              <div className="space-y-6">
                {/* Radar Top Bar */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-blue-600" />
                      Hyperlocal Food Rescue Radar
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live GPS-indexed surplus meal detection, proximity route matching, and real-time safe consumption timers.
                    </p>
                  </div>

                  {/* Radius and Role Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Proximity Radius:</span>
                    {[2, 5, 10, 20].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRadiusKm(r)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${
                          radiusKm === r
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split View: Map + Live Surplus Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Interactive Map (7 cols on large screens) */}
                  <div className="lg:col-span-7 h-[540px] sticky top-24">
                    <HyperlocalMap
                      center={userLocation}
                      zoom={13}
                      meals={meals}
                      ngos={ngos}
                      volunteers={volunteers}
                      userLocation={userLocation}
                      radiusKm={radiusKm}
                      onSelectMeal={(meal) => {
                        setSelectedMeal(meal);
                        if (meal.status === 'AVAILABLE') {
                          setClaimModalOpen(true);
                        } else if (meal.status === 'CLAIMED') {
                          setOtpModalOpen(true);
                        }
                      }}
                      selectedMealId={selectedMeal?.id}
                    />
                  </div>

                  {/* Right Column: Active Surplus Feed (5 cols on large screens) */}
                  <div className="lg:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Detected Surplus Batches ({meals.filter((m) => m.status === 'AVAILABLE').length} Available)
                      </span>
                      <button
                        onClick={() => setActiveTab('DONOR')}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        + Post as Donor
                      </button>
                    </div>

                    {meals.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-xs text-slate-500">
                        No active meals found within {radiusKm} km. Try increasing the search radius!
                      </div>
                    ) : (
                      meals.map((meal) => {
                        const timeInfo = getTimeRemaining(meal.expiresAt);
                        const isUrgent = timeInfo.urgency === 'critical';
                        const dietBadge = getDietaryBadge(meal.dietaryType);
                        const isAvailable = meal.status === 'AVAILABLE';

                        return (
                          <div
                            key={meal.id}
                            onClick={() => setSelectedMeal(meal)}
                            className={`bg-white rounded-2xl p-4 shadow-sm border transition cursor-pointer ${
                              selectedMeal?.id === meal.id
                                ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dietBadge.bg}`}>
                                {dietBadge.label}
                              </span>

                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                  isUrgent
                                    ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                {timeInfo.label}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                              {meal.title}
                            </h4>

                            <div className="text-xs text-slate-500 flex items-center justify-between mb-2">
                              <span>🏢 {meal.donorName}</span>
                              {meal.distanceKm !== undefined && (
                                <span className="text-blue-600 font-semibold">📍 {meal.distanceKm} km away</span>
                              )}
                            </div>

                            <div className="bg-slate-50 p-2 rounded-xl text-xs flex justify-between items-center text-slate-700 mb-3">
                              <span>🍽️ <strong>{meal.servings} Servings</strong> ({meal.weightKg} kg)</span>
                              <span className="text-[11px] text-slate-500">🌡️ {meal.storageCondition}</span>
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-between pt-1">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  meal.status === 'AVAILABLE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : meal.status === 'CLAIMED'
                                    ? 'bg-sky-100 text-sky-800'
                                    : meal.status === 'PICKED_UP'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {meal.status}
                              </span>

                              {isAvailable ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMeal(meal);
                                    setClaimModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Claim Rescue</span>
                                </button>
                              ) : meal.status === 'CLAIMED' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMeal(meal);
                                    setOtpModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                                >
                                  Verify Pickup OTP
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DONOR PORTAL */}
            {activeTab === 'DONOR' && (
              <DonorPortal
                meals={meals}
                donors={donors}
                userLocation={userLocation}
                onMealCreated={handleMealCreated}
              />
            )}

            {/* TAB 3: VOLUNTEER COURIER HUB */}
            {activeTab === 'VOLUNTEER' && (
              <VolunteerHub
                meals={meals}
                ngos={ngos}
                volunteers={volunteers}
                userLocation={userLocation}
                radiusKm={radiusKm}
                onRadiusChange={setRadiusKm}
                onOpenClaimModal={(meal) => {
                  setSelectedMeal(meal);
                  setClaimModalOpen(true);
                }}
                onOpenOtpModal={(meal) => {
                  setSelectedMeal(meal);
                  setOtpModalOpen(true);
                }}
                onCompleteDelivery={handleCompleteDelivery}
              />
            )}

            {/* TAB 4: NGO SHELTER HUB */}
            {activeTab === 'NGO' && (
              <NgoManager
                ngos={ngos}
                meals={meals}
                requests={requests}
                onPostRequest={handlePostRequest}
              />
            )}

            {/* TAB 5: IMPACT ANALYTICS */}
            {activeTab === 'IMPACT' && (
              <ImpactDashboard
                stats={stats}
                meals={meals}
                donors={donors}
                volunteers={volunteers}
                ngos={ngos}
              />
            )}
          </>
        )}
      </main>

      {/* Claim Modal */}
      <ClaimModal
        meal={selectedMeal}
        ngos={ngos}
        volunteers={volunteers}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onClaimSuccess={handleClaimSuccess}
      />

      {/* Handover OTP Modal */}
      <OtpModal
        meal={selectedMeal}
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerifySuccess={handleVerifyOtpSuccess}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-semibold text-slate-700">
            No_Food_Wastage • Hyperlocal Surplus Redistribution Engine
          </div>
          <div>
            Built with React, Node.js Express, Leaflet & OpenStreetMap • Real-time Food Rescue
          </div>
        </div>
      </footer>
    </div>
  );
}
