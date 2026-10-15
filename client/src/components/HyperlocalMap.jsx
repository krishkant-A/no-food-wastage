import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getTimeRemaining, getDietaryBadge } from '../utils/helpers';

export default function HyperlocalMap({
  center = [12.9716, 77.5946],
  zoom = 13,
  meals = [],
  ngos = [],
  volunteers = [],
  userLocation = [12.9716, 77.5946],
  radiusKm = 5,
  onSelectMeal,
  selectedMealId = null,
  showDonors = true,
  showNgos = true,
  showVolunteers = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);

  // Initialize map instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if component completely unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync center and radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation && userLocation[0] && userLocation[1]) {
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
      }

      if (radiusKm && radiusKm > 0) {
        radiusCircleRef.current = L.circle(userLocation, {
          radius: radiusKm * 1000,
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '4, 6'
        }).addTo(map);
      }
    }
  }, [userLocation, radiusKm]);

  // Update markers on data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. User Location Beacon Marker
    if (userLocation && userLocation[0] && userLocation[1]) {
      const userBeaconIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #1d4ed8; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const userMarker = L.marker(userLocation, { icon: userBeaconIcon });
      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; font-weight: 600; color: #1e3a8a; text-align: center;">
          📍 Your Current Location / Base
          <div style="font-size: 11px; font-weight: normal; color: #64748b; margin-top: 2px;">Radar search radius: ${radiusKm} km</div>
        </div>
      `);
      layer.addLayer(userMarker);
    }

    // 2. Surplus Meals / Donors
    if (showDonors && meals) {
      meals.forEach((meal) => {
        if (!meal.lat || !meal.lng) return;

        const timeInfo = getTimeRemaining(meal.expiresAt);
        const isUrgent = timeInfo.urgency === 'critical';
        const isAvailable = meal.status === 'AVAILABLE';
        const isClaimed = meal.status === 'CLAIMED';
        const isPickedUp = meal.status === 'PICKED_UP';

        // Marker color code based on urgency & status
        let pinColor = '#10b981'; // emerald
        let iconEmoji = '🍲';
        let badgeText = `${meal.servings} meals`;

        if (isAvailable) {
          if (isUrgent) {
            pinColor = '#ef4444'; // red
            iconEmoji = '🔥';
            badgeText = 'URGENT';
          } else if (timeInfo.urgency === 'high') {
            pinColor = '#f59e0b'; // amber
          }
        } else if (isClaimed) {
          pinColor = '#0284c7'; // sky blue
          iconEmoji = '🛵';
          badgeText = 'Claimed';
        } else if (isPickedUp) {
          pinColor = '#8b5cf6'; // purple
          iconEmoji = '📦';
          badgeText = 'In Transit';
        } else if (meal.status === 'DELIVERED') {
          pinColor = '#64748b'; // slate
          iconEmoji = '✅';
          badgeText = 'Delivered';
        }

        const isSelected = selectedMealId === meal.id;

        const customIcon = L.divIcon({
          className: 'surplus-pin',
          html: `
            <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s ease;">
              <div style="background: ${pinColor}; color: white; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap; margin-bottom: 2px; border: 1.5px solid white;">
                ${badgeText}
              </div>
              <div style="background: ${pinColor}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); ${isUrgent && isAvailable ? 'animation: pulse-urgent 1.5s infinite;' : ''}">
                ${iconEmoji}
              </div>
              <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${pinColor}; margin-top: -1px;"></div>
            </div>
          `,
          iconSize: [40, 56],
          iconAnchor: [20, 56]
        });

        const marker = L.marker([meal.lat, meal.lng], { icon: customIcon });

        const popupContent = `
          <div style="font-family: inherit; min-width: 210px; max-width: 260px; padding: 2px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <span style="background: ${pinColor}22; color: ${pinColor}; font-weight: 700; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                ${meal.status}
              </span>
              <span style="font-size: 11px; font-weight: 600; color: ${isUrgent ? '#dc2626' : '#475569'};">
                ⏱️ ${timeInfo.label}
              </span>
            </div>

            <div style="font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.25; margin-bottom: 4px;">
              ${meal.title}
            </div>

            <div style="font-size: 12px; color: #334155; margin-bottom: 6px;">
              🏢 <strong>${meal.donorName}</strong>
            </div>

            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 6px; font-size: 11px; margin-bottom: 8px;">
              <div>🍽️ <strong>${meal.servings} Servings</strong> (${meal.weightKg || '—'} kg)</div>
              <div>🌱 ${meal.dietaryType} • 📦 ${meal.storageCondition}</div>
              ${meal.distanceKm !== undefined ? `<div style="color: #2563eb; font-weight: 600; margin-top: 2px;">📍 Distance: ${meal.distanceKm} km away</div>` : ''}
            </div>

            <button id="view-meal-${meal.id}" style="width: 100%; background: #0f172a; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s;">
              ${isAvailable ? '⚡ Inspect & Claim Surplus' : 'Inspect Details'}
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-meal-${meal.id}`);
          if (btn && onSelectMeal) {
            btn.onclick = () => onSelectMeal(meal);
          }
        });

        layer.addLayer(marker);

        // Draw route line if meal is claimed or picked up and heading to a destination NGO
        if ((isClaimed || isPickedUp) && meal.destinationAddress) {
          const matchingNgo = ngos.find((n) => n.id === meal.destinationNgoId);
          if (matchingNgo && matchingNgo.lat && matchingNgo.lng) {
            const routeLine = L.polyline(
              [
                [meal.lat, meal.lng],
                [matchingNgo.lat, matchingNgo.lng]
              ],
              {
                color: isPickedUp ? '#8b5cf6' : '#0284c7',
                weight: 3,
                dashArray: '6, 8',
                opacity: 0.8
              }
            );
            layer.addLayer(routeLine);
          }
        }
      });
    }

    // 3. NGOs and Shelters
    if (showNgos && ngos) {
      ngos.forEach((ngo) => {
        if (!ngo.lat || !ngo.lng) return;

        const ngoIcon = L.divIcon({
          className: 'ngo-marker',
          html: `
            <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
              <div style="background: #9333ea; color: white; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
                🏠
              </div>
              <div style="font-size: 9px; font-weight: 700; color: #581c87; background: white; padding: 1px 4px; border-radius: 4px; margin-top: 2px; border: 1px solid #e9d5ff; white-space: nowrap; max-width: 110px; overflow: hidden; text-overflow: ellipsis;">
                ${ngo.name}
              </div>
            </div>
          `,
          iconSize: [36, 48],
          iconAnchor: [18, 24]
        });

        const ngoMarker = L.marker([ngo.lat, ngo.lng], { icon: ngoIcon });
        ngoMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
            <div style="font-weight: 700; font-size: 13px; color: #581c87; margin-bottom: 2px;">
              🏠 ${ngo.name}
            </div>
            <div style="color: #64748b; margin-bottom: 6px;">${ngo.address}</div>
            <div style="background: #faf5ff; border: 1px solid #f3e8ff; padding: 6px; border-radius: 6px; margin-bottom: 4px;">
              <div>👥 Capacity: <strong>${ngo.currentOccupants}/${ngo.capacity} Occupants</strong></div>
              <div>📞 Contact: ${ngo.contactPerson} (${ngo.phone})</div>
              ${ngo.urgentNeed ? '<div style="color: #c026d3; font-weight: 700; margin-top: 3px;">🚨 Urgent Meal Requirement Reported</div>' : ''}
            </div>
          </div>
        `);
        layer.addLayer(ngoMarker);
      });
    }

    // 4. Volunteer Couriers
    if (showVolunteers && volunteers) {
      volunteers.forEach((vol) => {
        if (!vol.lat || !vol.lng) return;

        const volIcon = L.divIcon({
          className: 'volunteer-marker',
          html: `
            <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center;">
              <div style="background: #2563eb; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
                🛵
              </div>
              <div style="font-size: 9px; font-weight: 600; color: #1e3a8a; background: white; padding: 1px 4px; border-radius: 4px; margin-top: 1px; border: 1px solid #bfdbfe;">
                ${vol.name.split(' ')[0]}
              </div>
            </div>
          `,
          iconSize: [32, 44],
          iconAnchor: [16, 22]
        });

        const volMarker = L.marker([vol.lat, vol.lng], { icon: volIcon });
        volMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px;">
            <div style="font-weight: 700; font-size: 13px; color: #1e3a8a;">
              🛵 ${vol.name}
            </div>
            <div style="color: #475569;">${vol.vehicle}</div>
            <div style="margin-top: 4px; font-size: 11px;">
              ⭐ <strong>${vol.rating}</strong> • 🏆 ${vol.rescuesCompleted} Rescues Completed
            </div>
            <div style="color: #16a34a; font-weight: 600; font-size: 11px; margin-top: 2px;">
              Status: ${vol.status}
            </div>
          </div>
        `);
        layer.addLayer(volMarker);
      });
    }
  }, [meals, ngos, volunteers, userLocation, radiusKm, showDonors, showNgos, showVolunteers, selectedMealId]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Floating Legend / Quick Controls */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-lg shadow-md border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5">
        <div className="font-semibold text-slate-900 border-b border-slate-200 pb-1 mb-0.5 flex items-center justify-between">
          <span>Live Radar Map</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Surplus Meals (Normal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Urgent Window (&lt; 1.5h)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span>Shelters / NGOs (4)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>Volunteer Couriers</span>
        </div>
      </div>
    </div>
  );
}
