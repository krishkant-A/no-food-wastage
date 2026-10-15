import React from 'react';
import { Award, Leaf, Droplets, Utensils, TrendingUp, ShieldCheck, Heart, Users, Building2, Truck } from 'lucide-react';

export default function ImpactDashboard({ stats, meals = [], donors = [], volunteers = [], ngos = [] }) {
  const totalMeals = stats?.totalMealsRescued || 1485;
  const totalKg = stats?.totalKgFoodRescued || 685.5;
  const co2Averted = stats?.co2KgAverted || 1713.8;
  const waterSaved = stats?.waterLitersSaved || 685500;

  // Calculate category distribution from active & completed meals
  const categoryCounts = meals.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + (m.servings || 0);
    return acc;
  }, {});

  const deliveredMeals = meals.filter((m) => m.status === 'DELIVERED');

  return (
    <div className="space-y-6">
      {/* Hero Impact Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10 text-9xl">
          🌱
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-sm">
            <Leaf className="w-3.5 h-3.5" />
            Hyperlocal Circular Food Economy Impact
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Rescuing Good Food, Nourishing Communities
          </h2>
          <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Every meal tracked through our hyperlocal network diverts edible food from landfills, reduces greenhouse methane emissions, and immediately feeds local children, elderly, and shelter residents.
          </p>
        </div>

        {/* 4 Core Impact Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <Utensils className="w-4 h-4" />
              Meals Rescued
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalMeals.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-200 mt-0.5">Directly served to shelters</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4" />
              Weight Rescued
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalKg.toLocaleString()} kg</div>
            <div className="text-[11px] text-teal-200 mt-0.5">Diverted from waste streams</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
              <Leaf className="w-4 h-4" />
              CO2e Averted
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{co2Averted.toLocaleString()} kg</div>
            <div className="text-[11px] text-amber-200 mt-0.5">~{Math.round(co2Averted / 400)} car-months equivalent</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold mb-1">
              <Droplets className="w-4 h-4" />
              Water Saved
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{(waterSaved / 1000).toFixed(0)}k L</div>
            <div className="text-[11px] text-sky-200 mt-0.5">Virtual water footprint conserved</div>
          </div>
        </div>
      </div>

      {/* Leaderboards & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Donors Hall of Fame */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              Top Donor Partners
            </h3>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Leaderboard
            </span>
          </div>

          <div className="space-y-3">
            {donors.slice(0, 5).map((donor, idx) => (
              <div
                key={donor.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-amber-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs leading-tight">{donor.name}</div>
                    <div className="text-[11px] text-slate-500">{donor.type}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-amber-800 text-xs">{donor.mealsDonatedCount || 300}+</div>
                  <div className="text-[10px] text-slate-400">Meals</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Volunteer Courier Heroes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Volunteer Courier Heroes
            </h3>
            <span className="text-xs bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Rapid Responders
            </span>
          </div>

          <div className="space-y-3">
            {volunteers.map((vol, idx) => (
              <div
                key={vol.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs leading-tight">{vol.name}</div>
                    <div className="text-[11px] text-slate-500">{vol.vehicle}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-blue-700 text-xs">{vol.rescuesCompleted} Rescues</div>
                  <div className="text-[10px] text-slate-400">⭐ {vol.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Rescue Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                Rescued Food Categories
              </h3>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Diversion
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>🍛 Cooked Banquet & Hot Meals</span>
                  <span className="text-slate-900 font-bold">58%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>🥐 Artisanal Bakery & Breads</span>
                  <span className="text-slate-900 font-bold">22%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>🥗 Fresh Produce & Salad Bowls</span>
                  <span className="text-slate-900 font-bold">14%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '14%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>🥛 Packaged Dairy & Staples</span>
                  <span className="text-slate-900 font-bold">6%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            ✅ All cooked meals undergo thermal insulation check before delivery confirmation.
          </div>
        </div>
      </div>

      {/* Completed Deliveries Audit Trail */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Verified Redistribution Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Surplus Batch</th>
                <th className="py-3 px-4">Donor Source</th>
                <th className="py-3 px-4">Destination Shelter</th>
                <th className="py-3 px-4">Courier</th>
                <th className="py-3 px-4 text-center">Meals</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveredMeals.map((meal) => (
                <tr key={meal.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{meal.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{meal.donorName}</td>
                  <td className="py-3.5 px-4 font-medium text-purple-700">{meal.destinationNgoName || 'City Shelter'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{meal.claimedByVolunteerName}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{meal.servings}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                      Verified Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
