import React from 'react';
import { UtensilsCrossed, Map, ChefHat, Truck, Home, BarChart3, RefreshCw, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, isConnected, onResetDemo }) {
  const navItems = [
    { id: 'RADAR', label: 'Hyperlocal Radar & Map', icon: Map, color: 'text-blue-600' },
    { id: 'DONOR', label: 'Donor Portal', icon: ChefHat, color: 'text-amber-600' },
    { id: 'VOLUNTEER', label: 'Volunteer Couriers', icon: Truck, color: 'text-indigo-600' },
    { id: 'NGO', label: 'NGO Shelter Hub', icon: Home, color: 'text-purple-600' },
    { id: 'IMPACT', label: 'Impact Analytics', icon: BarChart3, color: 'text-emerald-600' }
  ];

  return (
    <header className="sticky top-0 z-[1500] bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-lg tracking-tight">No_Food_Wastage</span>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                  Hyperlocal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Surplus Meal Tracking & Redistribution Network
              </p>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Live Sync Status & Reset */}
          <div className="flex items-center gap-3">
            {/* Live SSE indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{isConnected ? 'Live Sync' : 'Connecting...'}</span>
            </div>

            {/* Quick Stats Pill */}
            <div className="hidden sm:flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs">
              <div>
                <span className="text-slate-500">Rescued: </span>
                <strong className="text-emerald-700 font-bold">{stats?.totalMealsRescued || 1485}</strong>
              </div>
              <div className="h-3 w-px bg-emerald-200" />
              <div>
                <span className="text-slate-500">CO2 Saved: </span>
                <strong className="text-emerald-700 font-bold">~{Math.round(stats?.co2KgAverted || 1713)} kg</strong>
              </div>
            </div>

            {/* Reset Seed Data Button */}
            <button
              onClick={onResetDemo}
              title="Reset Demo Data"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 gap-1 border-t border-slate-100 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap font-bold text-[11px] ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
