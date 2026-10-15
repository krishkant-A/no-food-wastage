import React, { useState } from 'react';
import { Home, Users, PlusCircle, Clock, Truck, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { getTimeRemaining, getDietaryBadge } from '../utils/helpers';

export default function NgoManager({ ngos = [], meals = [], requests = [], onPostRequest }) {
  const [selectedNgoId, setSelectedNgoId] = useState(ngos[0]?.id || 'ngo-1');
  const [showReqForm, setShowReqForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentNgo = ngos.find((n) => n.id === selectedNgoId) || ngos[0];

  const [reqData, setReqData] = useState({
    title: '',
    requiredServings: 40,
    dietaryPref: 'Vegetarian',
    urgency: 'HIGH',
    neededHours: 2,
    notes: ''
  });

  // Filter incoming deliveries routed to this shelter
  const incomingDeliveries = meals.filter(
    (m) =>
      (m.destinationNgoId === currentNgo?.id || m.destinationNgoName === currentNgo?.name) &&
      (m.status === 'CLAIMED' || m.status === 'PICKED_UP')
  );

  // Filter delivered donations to this shelter
  const completedDeliveries = meals.filter(
    (m) =>
      (m.destinationNgoId === currentNgo?.id || m.destinationNgoName === currentNgo?.name) &&
      m.status === 'DELIVERED'
  );

  const handleReqSubmit = async (e) => {
    e.preventDefault();
    if (!reqData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const neededBy = new Date(now + parseFloat(reqData.neededHours) * 3600 * 1000).toISOString();

      await onPostRequest({
        ...reqData,
        ngoId: currentNgo?.id || 'ngo-1',
        ngoName: currentNgo?.name || 'Community Shelter',
        address: currentNgo?.address || 'City Shelter',
        lat: currentNgo?.lat,
        lng: currentNgo?.lng,
        neededBy
      });

      setReqData({
        title: '',
        requiredServings: 40,
        dietaryPref: 'Vegetarian',
        urgency: 'HIGH',
        neededHours: 2,
        notes: ''
      });
      setShowReqForm(false);
    } catch (err) {
      alert(`Error posting demand: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* NGO Shelter Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shadow-purple-600/20">
            🏠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentNgo?.name}</h2>
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">
                Registered Beneficiary
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              📍 {currentNgo?.address} • Contact: {currentNgo?.contactPerson} ({currentNgo?.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500">Switch Shelter Portal:</div>
            <select
              value={selectedNgoId}
              onChange={(e) => setSelectedNgoId(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-300 py-1.5 px-2 bg-slate-50 text-slate-800 focus:outline-none"
            >
              {ngos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowReqForm(!showReqForm)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showReqForm ? 'Close' : 'Request Meals'}</span>
          </button>
        </div>
      </div>

      {/* Capacity & Demand Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {currentNgo?.currentOccupants || 85} / {currentNgo?.capacity || 120}
            </div>
            <div className="text-xs text-slate-500 font-medium">Resident Occupancy</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-600">{incomingDeliveries.length}</div>
            <div className="text-xs text-slate-500 font-medium">Rescues En Route</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-600">{completedDeliveries.length}</div>
            <div className="text-xs text-slate-500 font-medium">Meals Batches Received</div>
          </div>
        </div>
      </div>

      {/* Post Demand Form */}
      {showReqForm && (
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-500/30 animate-in fade-in duration-200">
          <div className="pb-3 mb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              Broadcast Meal Requirement to Donors & Volunteers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Letting donors know your exact headcount prevents meal mismatch and speeds up targeted surplus dispatch.
            </p>
          </div>

          <form onSubmit={handleReqSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Requirement Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner meals needed for 50 night shelter residents"
                  value={reqData.title}
                  onChange={(e) => setReqData({ ...reqData, title: e.target.value })}
                  className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Portions Needed *
                  </label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={reqData.requiredServings}
                    onChange={(e) => setReqData({ ...reqData, requiredServings: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={reqData.urgency}
                    onChange={(e) => setReqData({ ...reqData, urgency: e.target.value })}
                    className="w-full text-sm rounded-xl border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="HIGH">High (Immediate)</option>
                    <option value="MEDIUM">Medium (&lt;4 hrs)</option>
                    <option value="LOW">Low (Next Day)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dietary & Special Notes
              </label>
              <textarea
                rows={2}
                placeholder="Mention if low spice is needed for children/elderly, specific timing preferences, etc."
                value={reqData.notes}
                onChange={(e) => setReqData({ ...reqData, notes: e.target.value })}
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReqForm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-purple-600/20 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Broadcast Demand'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INCOMING RESCUES TRACKER */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-600" />
          Incoming Food Rescues ({incomingDeliveries.length})
        </h3>

        {incomingDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
            <p className="text-slate-500 text-xs">No active deliveries are currently en route to this shelter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingDeliveries.map((meal) => {
              const isPickedUp = meal.status === 'PICKED_UP';
              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl p-5 border border-purple-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                        {isPickedUp ? '📦 In Transit (Courier On The Way)' : '🛵 Courier Assigned (Collecting from Donor)'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{meal.servings} Servings</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-1">{meal.title}</h4>
                    <p className="text-xs text-slate-600 mb-3">{meal.description}</p>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div>🏢 Donor Source: <strong>{meal.donorName}</strong></div>
                      <div>🛵 Courier: <strong>{meal.claimedByVolunteerName}</strong></div>
                      <div>🌡️ Storage: <strong>{meal.storageCondition}</strong></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Expected ETA: ~15-25 mins</span>
                    <span className="text-purple-600 font-bold">Safe thermal transport verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DEMAND REQUESTS LIST */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <h4 className="font-bold text-slate-900 text-base mb-3">Active Shelter Meal Demands</h4>
        <div className="divide-y divide-slate-100">
          {requests.map((req) => (
            <div key={req.id} className="py-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 text-sm">{req.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Shelter: <strong>{req.ngoName}</strong> • {req.dietaryPref} • Needed: ~{getTimeRemaining(req.neededBy).label}
                </div>
                {req.notes && <div className="text-xs text-slate-600 mt-1 italic">"{req.notes}"</div>}
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full shrink-0">
                {req.requiredServings} Meals
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
