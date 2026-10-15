import React, { useState } from 'react';
import { PlusCircle, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, ChefHat, Package, MapPin } from 'lucide-react';
import { getTimeRemaining, getDietaryBadge, getStatusBadge } from '../utils/helpers';

export default function DonorPortal({ meals = [], donors = [], userLocation, onMealCreated }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState(donors[0]?.id || 'donor-1');
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'HISTORY'

  const currentDonor = donors.find((d) => d.id === selectedDonorId) || donors[0];

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cooked Meals',
    dietaryType: 'Vegetarian',
    servings: 30,
    weightKg: 12,
    storageCondition: 'Hot Insulated',
    allergens: 'None',
    expiryHours: 3
  });

  // Filter donor's meals
  const donorMeals = meals.filter(
    (m) => m.donorId === currentDonor?.id || m.donorName === currentDonor?.name
  );
  const activeMeals = donorMeals.filter((m) => m.status !== 'DELIVERED' && m.status !== 'EXPIRED');
  const pastMeals = donorMeals.filter((m) => m.status === 'DELIVERED' || m.status === 'EXPIRED');

  // Quick fill presets for fast testing
  const applyPreset = (presetType) => {
    if (presetType === 'banquet') {
      setFormData({
        title: '75 Servings: Paneer Pulao, Dal Makhani & Tandoori Roti',
        description: 'Post-conference reception surplus. Stored in steam-warmers, pristine condition, ready for pickup in foil boxes.',
        category: 'Cooked Meals',
        dietaryType: 'Vegetarian',
        servings: 75,
        weightKg: 28,
        storageCondition: 'Hot Insulated',
        allergens: 'Dairy (Paneer, Butter), Gluten',
        expiryHours: 2.5
      });
    } else if (presetType === 'bakery') {
      setFormData({
        title: '30 Pcs: Whole Wheat Loaves, Baguettes & Cinnamon Brioche',
        description: 'End-of-day artisanal oven bakes. Packed in moisture-resistant craft paper bags.',
        category: 'Bakery & Bread',
        dietaryType: 'Vegetarian',
        servings: 35,
        weightKg: 11,
        storageCondition: 'Ambient Room Temp',
        allergens: 'Wheat Gluten, Sesame',
        expiryHours: 12
      });
    } else if (presetType === 'salad') {
      setFormData({
        title: '40 Packed Bowls: Mediterranean Falafel & Hummus Salad',
        description: 'Pre-portioned lunch bowls, dressing cups packed separately. Refrigerated since prep.',
        category: 'Fresh Produce & Salads',
        dietaryType: 'Vegan',
        servings: 40,
        weightKg: 13,
        storageCondition: 'Refrigerated (<4°C)',
        allergens: 'Sesame (Tahini)',
        expiryHours: 4
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const expiresAt = new Date(now + parseFloat(formData.expiryHours) * 3600 * 1000).toISOString();

      await onMealCreated({
        ...formData,
        donorId: currentDonor?.id || 'donor-1',
        donorName: currentDonor?.name || 'Grand Banquet Hall',
        donorPhone: currentDonor?.phone || '+91 98765 43210',
        donorAddress: currentDonor?.address || 'City Center',
        lat: currentDonor?.lat || userLocation[0],
        lng: currentDonor?.lng || userLocation[1],
        cookedAt: new Date(now - 30 * 60 * 1000).toISOString(),
        expiresAt
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Cooked Meals',
        dietaryType: 'Vegetarian',
        servings: 30,
        weightKg: 12,
        storageCondition: 'Hot Insulated',
        allergens: 'None',
        expiryHours: 3
      });
      setShowAddForm(false);
    } catch (err) {
      alert(`Error posting surplus meal: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Donor Profile Header & Switcher */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-orange-500/20">
            👨‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentDonor?.name}</h2>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                Verified Food Donor
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {currentDonor?.address} • Phone: {currentDonor?.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500">Switch Donor Profile:</div>
            <select
              value={selectedDonorId}
              onChange={(e) => setSelectedDonorId(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-300 py-1.5 px-2 bg-slate-50 text-slate-800 focus:outline-none"
            >
              {donors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.type})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Post Surplus Meal'}</span>
          </button>
        </div>
      </div>

      {/* New Surplus Meal Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-500/30 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                Post New Surplus Meal Batch
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Listing takes under 1 minute. Hyperlocal couriers & nearby shelters will be alerted immediately.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick fill:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('banquet')}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-medium border border-amber-200 transition"
              >
                Banquet Feast
              </button>
              <button
                type="button"
                onClick={() => applyPreset('bakery')}
                className="px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg font-medium border border-orange-200 transition"
              >
                Bakery Bread
              </button>
              <button
                type="button"
                onClick={() => applyPreset('salad')}
                className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg font-medium border border-teal-200 transition"
              >
                Organic Bowls
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Surplus Meal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 Meals: Vegetable Biryani & Raita Containers"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dietary Classification
                </label>
                <select
                  value={formData.dietaryType}
                  onChange={(e) => setFormData({ ...formData, dietaryType: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Vegetarian">Pure Vegetarian</option>
                  <option value="Vegan">Vegan (100% Plant-Based)</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Jain">Jain Friendly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preparation & Packaging Description
              </label>
              <textarea
                rows={2}
                placeholder="Mention storage conditions, hygiene, takeaway packing (foil boxes, steel canisters, paper bags)..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Servings *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approx Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Storage Condition
                </label>
                <select
                  value={formData.storageCondition}
                  onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Hot Insulated">Hot Insulated (&gt;60°C)</option>
                  <option value="Refrigerated">Refrigerated (&lt;4°C)</option>
                  <option value="Ambient Room Temp">Ambient Room Temp</option>
                  <option value="Frozen">Frozen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Safe Window (Hours)
                </label>
                <select
                  value={formData.expiryHours}
                  onChange={(e) => setFormData({ ...formData, expiryHours: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-700"
                >
                  <option value="1.5">⚡ 1.5 Hours (Urgent)</option>
                  <option value="3">⏱️ 3 Hours (Standard)</option>
                  <option value="6">📦 6 Hours</option>
                  <option value="12">🌙 12 Hours (Bakery/Produce)</option>
                  <option value="24">📅 24 Hours</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish Surplus Meal'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'ACTIVE'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Active Surplus Listings</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-semibold">
              {activeMeals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'HISTORY'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Donation History & Impact</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
              {pastMeals.length}
            </span>
          </button>
        </div>
      </div>

      {/* Meals Grid */}
      {activeTab === 'ACTIVE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMeals.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">No active surplus meal listings</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Have excess prepared food or baking batches? Post a listing to prevent food waste and feed nearby communities.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Post First Surplus Meal
              </button>
            </div>
          ) : (
            activeMeals.map((meal) => {
              const timeInfo = getTimeRemaining(meal.expiresAt);
              const dietBadge = getDietaryBadge(meal.dietaryType);
              const statusBadge = getStatusBadge(meal.status);
              const isUrgent = timeInfo.urgency === 'critical';

              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition relative flex flex-col justify-between"
                >
                  <div>
                    {/* Top Status & Urgency Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${dietBadge.bg}`}>
                        {dietBadge.label}
                      </span>

                      <div className="flex items-center gap-1.5">
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
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1.5">{meal.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">{meal.description}</p>

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-3">
                      <div>🍽️ <strong>{meal.servings} Servings</strong></div>
                      <div>⚖️ <strong>{meal.weightKg || '—'} kg</strong></div>
                      <div>🌡️ <strong>{meal.storageCondition}</strong></div>
                      <div>🥜 Allergens: <strong>{meal.allergens}</strong></div>
                    </div>
                  </div>

                  {/* Pickup OTP and Tracking Banner */}
                  <div className="mt-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-sm">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Donor Handover OTP
                        </div>
                        <div className="text-xs text-slate-300">
                          Provide to courier on arrival
                        </div>
                      </div>

                      <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono font-bold text-lg px-3 py-1 rounded-lg tracking-widest">
                        {meal.pickupOtp}
                      </div>
                    </div>

                    {/* Current Dispatch Stage */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-bold border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>

                      {meal.claimedByVolunteerName ? (
                        <span className="text-slate-600 font-medium">
                          Courier: <strong className="text-slate-900">{meal.claimedByVolunteerName}</strong>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold animate-pulse">
                          Broadcasting to nearby couriers...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Completed Surplus Meal Deliveries
          </h4>
          <div className="divide-y divide-slate-100">
            {pastMeals.map((meal) => (
              <div key={meal.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{meal.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Delivered to: <strong>{meal.destinationNgoName || 'Community Shelter'}</strong> • Courier: {meal.claimedByVolunteerName}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    ✅ {meal.servings} Meals Saved
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ~{Math.round((meal.weightKg || 10) * 2.5)} kg CO2 Averted
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
