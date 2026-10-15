// API Client and Event Stream Service for No Food Wastage Platform

const API_BASE = '/api';

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function getMeals(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.dietary) query.append('dietary', params.dietary);
  if (params.category) query.append('category', params.category);
  if (params.lat) query.append('lat', params.lat);
  if (params.lng) query.append('lng', params.lng);
  if (params.radius) query.append('radius', params.radius);
  if (params.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/meals?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load surplus meals');
  return res.json();
}

export async function getMealById(id) {
  const res = await fetch(`${API_BASE}/meals/${id}`);
  if (!res.ok) throw new Error('Failed to load meal details');
  return res.json();
}

export async function createMeal(mealData) {
  const res = await fetch(`${API_BASE}/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mealData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to list surplus meal');
  }
  return res.json();
}

export async function claimMeal(mealId, payload) {
  const res = await fetch(`${API_BASE}/meals/${mealId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to claim surplus meal');
  }
  return res.json();
}

export async function verifyPickup(mealId, otp) {
  const res = await fetch(`${API_BASE}/meals/${mealId}/verify-pickup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invalid OTP code');
  }
  return res.json();
}

export async function completeDelivery(mealId, notes = '') {
  const res = await fetch(`${API_BASE}/meals/${mealId}/complete-delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to complete delivery');
  }
  return res.json();
}

export async function getNgoRequests() {
  const res = await fetch(`${API_BASE}/ngo-requests`);
  if (!res.ok) throw new Error('Failed to load NGO requests');
  return res.json();
}

export async function createNgoRequest(reqData) {
  const res = await fetch(`${API_BASE}/ngo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to post NGO demand request');
  }
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to load user directory');
  return res.json();
}

export async function resetDatabase(centerLat, centerLng) {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ centerLat, centerLng })
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}

export function subscribeToEvents(onEvent) {
  const eventSource = new EventSource(`${API_BASE}/events`);

  const events = [
    'CONNECTED',
    'MEAL_CREATED',
    'MEAL_CLAIMED',
    'MEAL_PICKED_UP',
    'MEAL_DELIVERED',
    'NGO_REQUEST_CREATED',
    'STATS_UPDATED',
    'RESET_SEED_DATA'
  ];

  events.forEach((evtName) => {
    eventSource.addEventListener(evtName, (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onEvent(evtName, parsed);
      } catch (err) {
        console.error('Error parsing event', err);
      }
    });
  });

  return () => {
    eventSource.close();
  };
}
