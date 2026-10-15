import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Server-Sent Events (SSE) Client Registry for Real-Time Live Radar
let sseClients = [];

function broadcastEvent(type, data) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(payload);
    } catch (e) {
      console.error('Failed to write SSE to client:', e.message);
    }
  });
}

// SSE endpoint
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial connection packet
  res.write(`event: CONNECTED\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'No_Food_Wastage_API', uptime: process.uptime() });
});

// Impact Metrics & Statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Meals with Hyperlocal Geofiltering & Attributes
app.get('/api/meals', (req, res) => {
  try {
    const { status, dietary, category, lat, lng, radius, search } = req.query;
    const meals = db.getMeals({
      status,
      dietary,
      category,
      userLat: lat,
      userLng: lng,
      radiusKm: radius,
      search
    });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Meal
app.get('/api/meals/:id', (req, res) => {
  try {
    const meal = db.getMealById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.json(meal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create New Surplus Meal Listing (Donor)
app.post('/api/meals', (req, res) => {
  try {
    const {
      title,
      description,
      donorId,
      donorName,
      donorPhone,
      donorAddress,
      lat,
      lng,
      category,
      dietaryType,
      servings,
      weightKg,
      storageCondition,
      allergens,
      cookedAt,
      expiresAt
    } = req.body;

    if (!title || !servings) {
      return res.status(400).json({ error: 'Title and number of servings are required' });
    }

    const newMeal = db.createMeal({
      title,
      description,
      donorId,
      donorName,
      donorPhone,
      donorAddress,
      lat,
      lng,
      category,
      dietaryType,
      servings,
      weightKg,
      storageCondition,
      allergens,
      cookedAt,
      expiresAt
    });

    broadcastEvent('MEAL_CREATED', newMeal);
    broadcastEvent('STATS_UPDATED', db.getStats());

    res.status(201).json(newMeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim Meal for Pickup (Volunteer Courier)
app.post('/api/meals/:id/claim', (req, res) => {
  try {
    const { volunteerId, volunteerName, ngoId, ngoName, destinationAddress } = req.body;
    const updatedMeal = db.claimMeal(
      req.params.id,
      volunteerId,
      volunteerName,
      ngoId,
      ngoName,
      destinationAddress
    );

    broadcastEvent('MEAL_CLAIMED', updatedMeal);
    broadcastEvent('STATS_UPDATED', db.getStats());

    res.json({
      success: true,
      message: 'Meal successfully claimed! Head to the donor location to collect the food.',
      meal: updatedMeal
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify Handover with OTP (Donor -> Volunteer)
app.post('/api/meals/:id/verify-pickup', (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ error: 'Please enter the 4-digit handover OTP' });
    }

    const updatedMeal = db.verifyPickup(req.params.id, otp);

    broadcastEvent('MEAL_PICKED_UP', updatedMeal);
    broadcastEvent('STATS_UPDATED', db.getStats());

    res.json({
      success: true,
      message: 'Handover verified! Food is now safely in transit to the destination shelter.',
      meal: updatedMeal
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete Delivery at Beneficiary / NGO
app.post('/api/meals/:id/complete-delivery', (req, res) => {
  try {
    const { notes } = req.body;
    const updatedMeal = db.completeDelivery(req.params.id, notes);

    broadcastEvent('MEAL_DELIVERED', updatedMeal);
    broadcastEvent('STATS_UPDATED', db.getStats());

    res.json({
      success: true,
      message: 'Redistribution completed! Meals successfully served to beneficiaries.',
      meal: updatedMeal,
      impact: {
        mealsSaved: updatedMeal.servings,
        co2SavedKg: Math.round((updatedMeal.weightKg || 10) * 2.5 * 10) / 10
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// NGO Requests
app.get('/api/ngo-requests', (req, res) => {
  try {
    const requests = db.getNgoRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ngo-requests', (req, res) => {
  try {
    const { title, requiredServings, dietaryPref, urgency, neededBy, address, lat, lng, notes, ngoId, ngoName } = req.body;
    if (!title || !requiredServings) {
      return res.status(400).json({ error: 'Title and required servings are mandatory' });
    }

    const newReq = db.createNgoRequest({
      title,
      requiredServings,
      dietaryPref,
      urgency,
      neededBy,
      address,
      lat,
      lng,
      notes,
      ngoId,
      ngoName
    });

    broadcastEvent('NGO_REQUEST_CREATED', newReq);
    res.status(201).json(newReq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Directory of Users (Donors, NGOs, Volunteers)
app.get('/api/users', (req, res) => {
  try {
    res.json({
      donors: db.getDonors(),
      ngos: db.getNgos(),
      volunteers: db.getVolunteers()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset / Seed Demo Data (optionally centered on custom coordinates)
app.post('/api/reset', (req, res) => {
  try {
    const { centerLat, centerLng } = req.body || {};
    const lat = centerLat ? parseFloat(centerLat) : 12.9716;
    const lng = centerLng ? parseFloat(centerLng) : 77.5946;

    const freshData = db.reset(lat, lng);
    broadcastEvent('RESET_SEED_DATA', { timestamp: new Date().toISOString() });
    broadcastEvent('STATS_UPDATED', db.getStats());

    res.json({ success: true, message: 'Database reset to fresh realistic seed data', data: freshData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`No_Food_Wastage backend API running at http://localhost:${PORT}`);
});
