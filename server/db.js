import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Haversine formula to compute distance between two lat/lng points in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Rounded to 1 decimal place
}

// Generate realistic initial seed data centered around a reference geo-point
export function generateSeedData(centerLat = 12.9716, centerLng = 77.5946) {
  const now = Date.now();
  const hours = (h) => h * 60 * 60 * 1000;

  const donors = [
    {
      id: 'donor-1',
      name: 'Grand Royal Banquet Hall',
      type: 'Banquet & Events',
      contactPerson: 'Vikram Sethi',
      phone: '+91 98765 43210',
      address: 'Plot 42, Outer Ring Road, Tech Corridor',
      lat: centerLat + 0.012,
      lng: centerLng + 0.015,
      rating: 4.9,
      mealsDonatedCount: 420
    },
    {
      id: 'donor-2',
      name: 'Green Leaf Organic Bistro',
      type: 'Restaurant',
      contactPerson: 'Meera Krishnan',
      phone: '+91 98123 45678',
      address: '14/B, 100 Feet Road, Indiranagar',
      lat: centerLat - 0.008,
      lng: centerLng + 0.018,
      rating: 4.8,
      mealsDonatedCount: 290
    },
    {
      id: 'donor-3',
      name: 'Artisan Crust Bakery',
      type: 'Bakery & Cafe',
      contactPerson: 'Farhan Akhtar',
      phone: '+91 98234 56789',
      address: '88, 5th Block, Koramangala',
      lat: centerLat - 0.019,
      lng: centerLng + 0.006,
      rating: 4.9,
      mealsDonatedCount: 175
    },
    {
      id: 'donor-4',
      name: 'Spice Symphony Caterers',
      type: 'Corporate Catering',
      contactPerson: 'Anita Rao',
      phone: '+91 98345 67890',
      address: 'Tower 3 Canteen, Embassy Golf Links',
      lat: centerLat - 0.014,
      lng: centerLng + 0.024,
      rating: 4.7,
      mealsDonatedCount: 380
    },
    {
      id: 'donor-5',
      name: 'FreshMart Supermarket Deli',
      type: 'Supermarket Deli',
      contactPerson: 'Suresh Kumar',
      phone: '+91 98456 78901',
      address: 'Brigade Road, Central District',
      lat: centerLat + 0.005,
      lng: centerLng - 0.007,
      rating: 4.6,
      mealsDonatedCount: 140
    }
  ];

  const ngos = [
    {
      id: 'ngo-1',
      name: 'Aashray Night Shelter for Homeless',
      contactPerson: 'Brother Thomas',
      phone: '+91 99001 12233',
      address: 'Community Hall 4, Near City Railway Station',
      lat: centerLat + 0.016,
      lng: centerLng - 0.012,
      capacity: 120,
      currentOccupants: 85,
      urgentNeed: true
    },
    {
      id: 'ngo-2',
      name: 'Hope Children Home & Care Foundation',
      contactPerson: 'Sister Mary',
      phone: '+91 99112 23344',
      address: '22, Sunrise Avenue, Austin Town',
      lat: centerLat - 0.005,
      lng: centerLng + 0.011,
      capacity: 65,
      currentOccupants: 55,
      urgentNeed: false
    },
    {
      id: 'ngo-3',
      name: 'Karuna Elderly Care & Relief Sanctuary',
      contactPerson: 'Dr. Ramesh Chandra',
      phone: '+91 99223 34455',
      address: '77, Green Park Road, Victoria Layout',
      lat: centerLat - 0.011,
      lng: centerLng - 0.014,
      capacity: 90,
      currentOccupants: 70,
      urgentNeed: true
    },
    {
      id: 'ngo-4',
      name: 'Annapurna Community Kitchen Hub',
      contactPerson: 'Gurpreet Singh',
      phone: '+91 99334 45566',
      address: 'Gurudwara Complex, Ulsoor Lake Road',
      lat: centerLat + 0.014,
      lng: centerLng + 0.009,
      capacity: 300,
      currentOccupants: 190,
      urgentNeed: false
    }
  ];

  const volunteers = [
    {
      id: 'vol-1',
      name: 'Aarav Sharma',
      vehicle: 'Motorcycle with Insulated Carrier',
      phone: '+91 97711 22334',
      lat: centerLat + 0.004,
      lng: centerLng + 0.008,
      status: 'AVAILABLE',
      rating: 4.95,
      rescuesCompleted: 64,
      badge: 'Gold Food Hero'
    },
    {
      id: 'vol-2',
      name: 'Priya Patel',
      vehicle: 'Eco Delivery Van (Air Conditioned)',
      phone: '+91 97822 33445',
      lat: centerLat - 0.009,
      lng: centerLng + 0.014,
      status: 'AVAILABLE',
      rating: 4.88,
      rescuesCompleted: 112,
      badge: 'Platinum Food Hero'
    },
    {
      id: 'vol-3',
      name: 'Rahul Varma',
      vehicle: 'Electric Cargo Scooter',
      phone: '+91 97933 44556',
      lat: centerLat - 0.015,
      lng: centerLng - 0.005,
      status: 'BUSY',
      rating: 4.9,
      rescuesCompleted: 48,
      badge: 'Silver Food Hero'
    }
  ];

  const meals = [
    {
      id: 'meal-101',
      title: '50 Servings: Royal Veg Dum Biryani & Mirchi Ka Salan',
      description: 'Prepared for evening banquet reception. Kept strictly hot in heavy insulated containers. Packed in food-grade takeaway foils.',
      donorId: 'donor-1',
      donorName: 'Grand Royal Banquet Hall',
      donorPhone: '+91 98765 43210',
      donorAddress: 'Plot 42, Outer Ring Road, Tech Corridor',
      lat: centerLat + 0.012,
      lng: centerLng + 0.015,
      category: 'Cooked Meals',
      dietaryType: 'Vegetarian',
      servings: 50,
      weightKg: 22.5,
      storageCondition: 'Hot Insulated (>60°C)',
      allergens: 'Dairy (Ghee, Paneer), Cashews',
      cookedAt: new Date(now - hours(2)).toISOString(),
      expiresAt: new Date(now + hours(1.5)).toISOString(), // Urgent: 1.5h left!
      status: 'AVAILABLE',
      pickupOtp: '4821',
      claimedByVolunteerId: null,
      claimedByVolunteerName: null,
      destinationNgoId: null,
      destinationNgoName: null,
      destinationAddress: null,
      claimedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(now - hours(2)).toISOString()
    },
    {
      id: 'meal-102',
      title: '35 Servings: Paneer Butter Masala & 70 Fresh Rotis',
      description: 'Corporate catering overflow. Hygienically sealed foil meal boxes, unserved and fresh from kitchen.',
      donorId: 'donor-4',
      donorName: 'Spice Symphony Caterers',
      donorPhone: '+91 98345 67890',
      donorAddress: 'Tower 3 Canteen, Embassy Golf Links',
      lat: centerLat - 0.014,
      lng: centerLng + 0.024,
      category: 'Cooked Meals',
      dietaryType: 'Vegetarian',
      servings: 35,
      weightKg: 16.0,
      storageCondition: 'Warm Insulated',
      allergens: 'Dairy, Wheat Gluten',
      cookedAt: new Date(now - hours(1.5)).toISOString(),
      expiresAt: new Date(now + hours(3)).toISOString(),
      status: 'AVAILABLE',
      pickupOtp: '7392',
      claimedByVolunteerId: null,
      claimedByVolunteerName: null,
      destinationNgoId: null,
      destinationNgoName: null,
      destinationAddress: null,
      claimedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(now - hours(1.5)).toISOString()
    },
    {
      id: 'meal-103',
      title: '25 Artisanal Multigrain Sourdough & Croissants',
      description: 'Surplus evening bake from artisan bakery. Excellent condition, fresh crumb, packed in paper bags.',
      donorId: 'donor-3',
      donorName: 'Artisan Crust Bakery',
      donorPhone: '+91 98234 56789',
      donorAddress: '88, 5th Block, Koramangala',
      lat: centerLat - 0.019,
      lng: centerLng + 0.006,
      category: 'Bakery & Bread',
      dietaryType: 'Vegan',
      servings: 30,
      weightKg: 12.0,
      storageCondition: 'Ambient Room Temp',
      allergens: 'Wheat Gluten, Sesame Seeds',
      cookedAt: new Date(now - hours(4)).toISOString(),
      expiresAt: new Date(now + hours(14)).toISOString(),
      status: 'AVAILABLE',
      pickupOtp: '1904',
      claimedByVolunteerId: null,
      claimedByVolunteerName: null,
      destinationNgoId: null,
      destinationNgoName: null,
      destinationAddress: null,
      claimedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(now - hours(3)).toISOString()
    },
    {
      id: 'meal-104',
      title: '40 Quinoa Harvest Bowls & Green Salads with Dressing',
      description: 'Pre-packaged cold organic lunch bowls from healthy cafe. Chilled in commercial refrigerator.',
      donorId: 'donor-2',
      donorName: 'Green Leaf Organic Bistro',
      donorPhone: '+91 98123 45678',
      donorAddress: '14/B, 100 Feet Road, Indiranagar',
      lat: centerLat - 0.008,
      lng: centerLng + 0.018,
      category: 'Fresh Produce & Salads',
      dietaryType: 'Vegan',
      servings: 40,
      weightKg: 14.0,
      storageCondition: 'Refrigerated (<4°C)',
      allergens: 'Nuts (Walnuts)',
      cookedAt: new Date(now - hours(3)).toISOString(),
      expiresAt: new Date(now + hours(5)).toISOString(),
      status: 'CLAIMED',
      pickupOtp: '6155',
      claimedByVolunteerId: 'vol-1',
      claimedByVolunteerName: 'Aarav Sharma (Motorcycle)',
      destinationNgoId: 'ngo-2',
      destinationNgoName: 'Hope Children Home & Care Foundation',
      destinationAddress: '22, Sunrise Avenue, Austin Town',
      claimedAt: new Date(now - hours(0.5)).toISOString(),
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date(now - hours(3)).toISOString()
    },
    {
      id: 'meal-105',
      title: '60 Portions: Homestyle Dal Tadka & Jeera Rice',
      description: 'Fresh midday corporate canteen surplus. Currently in transit with volunteer courier Priya.',
      donorId: 'donor-5',
      donorName: 'FreshMart Supermarket Deli',
      donorPhone: '+91 98456 78901',
      donorAddress: 'Brigade Road, Central District',
      lat: centerLat + 0.005,
      lng: centerLng - 0.007,
      category: 'Cooked Meals',
      dietaryType: 'Vegetarian',
      servings: 60,
      weightKg: 28.0,
      storageCondition: 'Hot Insulated',
      allergens: 'None',
      cookedAt: new Date(now - hours(4)).toISOString(),
      expiresAt: new Date(now + hours(2)).toISOString(),
      status: 'PICKED_UP',
      pickupOtp: '8520',
      claimedByVolunteerId: 'vol-2',
      claimedByVolunteerName: 'Priya Patel (Eco Van)',
      destinationNgoId: 'ngo-1',
      destinationNgoName: 'Aashray Night Shelter for Homeless',
      destinationAddress: 'Community Hall 4, Near City Railway Station',
      claimedAt: new Date(now - hours(1)).toISOString(),
      pickedUpAt: new Date(now - hours(0.3)).toISOString(),
      deliveredAt: null,
      createdAt: new Date(now - hours(4)).toISOString()
    },
    {
      id: 'meal-106',
      title: '80 Portions: Mixed Veg Noodles & Manchurian',
      description: 'Wedding dinner surplus from yesterday. Successfully redistributed and served to night shelter residents.',
      donorId: 'donor-1',
      donorName: 'Grand Royal Banquet Hall',
      donorPhone: '+91 98765 43210',
      donorAddress: 'Plot 42, Outer Ring Road, Tech Corridor',
      lat: centerLat + 0.012,
      lng: centerLng + 0.015,
      category: 'Cooked Meals',
      dietaryType: 'Vegetarian',
      servings: 80,
      weightKg: 34.0,
      storageCondition: 'Delivered',
      allergens: 'Soy, Gluten',
      cookedAt: new Date(now - hours(16)).toISOString(),
      expiresAt: new Date(now - hours(8)).toISOString(),
      status: 'DELIVERED',
      pickupOtp: '9143',
      claimedByVolunteerId: 'vol-2',
      claimedByVolunteerName: 'Priya Patel (Eco Van)',
      destinationNgoId: 'ngo-3',
      destinationNgoName: 'Karuna Elderly Care & Relief Sanctuary',
      destinationAddress: '77, Green Park Road, Victoria Layout',
      claimedAt: new Date(now - hours(14)).toISOString(),
      pickedUpAt: new Date(now - hours(13.5)).toISOString(),
      deliveredAt: new Date(now - hours(12)).toISOString(),
      createdAt: new Date(now - hours(16)).toISOString()
    }
  ];

  const ngoRequests = [
    {
      id: 'req-1',
      ngoId: 'ngo-1',
      ngoName: 'Aashray Night Shelter for Homeless',
      title: 'Urgent Dinner Meals needed for 45 Night Shelter residents',
      requiredServings: 45,
      dietaryPref: 'Any (Vegetarian preferred)',
      urgency: 'HIGH',
      neededBy: new Date(now + hours(2)).toISOString(),
      address: 'Community Hall 4, Near City Railway Station',
      lat: centerLat + 0.016,
      lng: centerLng - 0.012,
      status: 'OPEN',
      notes: 'Evening arrivals increase after 8 PM. Any nutritious hot meal is warmly appreciated.'
    },
    {
      id: 'req-2',
      ngoId: 'ngo-3',
      ngoName: 'Karuna Elderly Care & Relief Sanctuary',
      title: 'Mild, Soft Cooked Meals & Soups for 30 Elderly Inmates',
      requiredServings: 30,
      dietaryPref: 'Vegetarian (Low Spice)',
      urgency: 'MEDIUM',
      neededBy: new Date(now + hours(4)).toISOString(),
      address: '77, Green Park Road, Victoria Layout',
      lat: centerLat - 0.011,
      lng: centerLng - 0.014,
      status: 'OPEN',
      notes: 'Please avoid excessive chili and hard nuts. Khichdi, soft rice, or stew is ideal.'
    }
  ];

  const impactSummary = {
    totalMealsRescued: 1485,
    totalKgFoodRescued: 685.5,
    co2KgAverted: 1713.8, // 2.5 kg CO2e per kg food saved
    waterLitersSaved: 685500, // ~1000 liters water footprint per kg food
    activeDonorsCount: 18,
    activeVolunteersCount: 32,
    partnerNgosCount: 12
  };

  return {
    meta: {
      centerLat,
      centerLng,
      lastUpdated: new Date().toISOString()
    },
    donors,
    ngos,
    volunteers,
    meals,
    ngoRequests,
    impactSummary
  };
}

class Database {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.reset();
      }
    } catch (err) {
      console.error('Failed to load database file, generating fresh seed data:', err);
      this.reset();
    }
  }

  save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  reset(centerLat = 12.9716, centerLng = 77.5946) {
    this.data = generateSeedData(centerLat, centerLng);
    this.save();
    return this.data;
  }

  getDonors() {
    return this.data.donors || [];
  }

  getNgos() {
    return this.data.ngos || [];
  }

  getVolunteers() {
    return this.data.volunteers || [];
  }

  getMeals(options = {}) {
    const { status, dietary, category, userLat, userLng, radiusKm, search } = options;
    let results = [...(this.data.meals || [])];

    // Status filter
    if (status && status !== 'ALL') {
      results = results.filter((m) => m.status === status);
    }

    // Dietary filter
    if (dietary && dietary !== 'ALL') {
      results = results.filter((m) => m.dietaryType.toLowerCase() === dietary.toLowerCase());
    }

    // Category filter
    if (category && category !== 'ALL') {
      results = results.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }

    // Keyword search
    if (search && search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.donorName.toLowerCase().includes(q)
      );
    }

    // Geospatial distance computation
    if (userLat && userLng) {
      const lat = parseFloat(userLat);
      const lng = parseFloat(userLng);
      results = results.map((m) => {
        const distanceKm = calculateDistanceKm(lat, lng, m.lat, m.lng);
        return { ...m, distanceKm };
      });

      if (radiusKm) {
        const rad = parseFloat(radiusKm);
        results = results.filter((m) => m.distanceKm <= rad);
      }

      // Sort by closest distance first
      results.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      // Default sort by created timestamp descending
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return results;
  }

  getMealById(id) {
    return (this.data.meals || []).find((m) => m.id === id);
  }

  createMeal(mealData) {
    // Generate 4-digit verification OTP
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newMeal = {
      id: `meal-${uuidv4().slice(0, 8)}`,
      title: mealData.title,
      description: mealData.description || '',
      donorId: mealData.donorId || 'donor-1',
      donorName: mealData.donorName || 'Custom Donor',
      donorPhone: mealData.donorPhone || '+91 99999 88888',
      donorAddress: mealData.donorAddress || 'Local Address',
      lat: parseFloat(mealData.lat) || this.data.meta.centerLat,
      lng: parseFloat(mealData.lng) || this.data.meta.centerLng,
      category: mealData.category || 'Cooked Meals',
      dietaryType: mealData.dietaryType || 'Vegetarian',
      servings: parseInt(mealData.servings, 10) || 20,
      weightKg: parseFloat(mealData.weightKg) || 8.0,
      storageCondition: mealData.storageCondition || 'Hot Insulated',
      allergens: mealData.allergens || 'None stated',
      cookedAt: mealData.cookedAt || new Date().toISOString(),
      expiresAt: mealData.expiresAt || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      status: 'AVAILABLE',
      pickupOtp,
      claimedByVolunteerId: null,
      claimedByVolunteerName: null,
      destinationNgoId: null,
      destinationNgoName: null,
      destinationAddress: null,
      claimedAt: null,
      pickedUpAt: null,
      deliveredAt: null,
      createdAt: new Date().toISOString()
    };

    this.data.meals.unshift(newMeal);
    this.save();
    return newMeal;
  }

  claimMeal(mealId, volunteerId, volunteerName, ngoId, ngoName, destinationAddress) {
    const meal = this.getMealById(mealId);
    if (!meal) {
      throw new Error('Meal not found');
    }
    if (meal.status !== 'AVAILABLE') {
      throw new Error(`Meal is already ${meal.status}`);
    }

    meal.status = 'CLAIMED';
    meal.claimedByVolunteerId = volunteerId || 'vol-1';
    meal.claimedByVolunteerName = volunteerName || 'Aarav Sharma';
    meal.destinationNgoId = ngoId || 'ngo-1';
    meal.destinationNgoName = ngoName || 'Aashray Night Shelter for Homeless';
    meal.destinationAddress = destinationAddress || 'Community Hall 4';
    meal.claimedAt = new Date().toISOString();

    this.save();
    return meal;
  }

  verifyPickup(mealId, enteredOtp) {
    const meal = this.getMealById(mealId);
    if (!meal) {
      throw new Error('Meal not found');
    }
    if (meal.status !== 'CLAIMED') {
      throw new Error(`Cannot pickup a meal that is currently ${meal.status}`);
    }
    if (String(meal.pickupOtp).trim() !== String(enteredOtp).trim()) {
      throw new Error('Invalid OTP! Please check the 4-digit code provided by the donor.');
    }

    meal.status = 'PICKED_UP';
    meal.pickedUpAt = new Date().toISOString();
    this.save();
    return meal;
  }

  completeDelivery(mealId, notes = '') {
    const meal = this.getMealById(mealId);
    if (!meal) {
      throw new Error('Meal not found');
    }
    if (meal.status !== 'PICKED_UP') {
      throw new Error(`Cannot deliver a meal that has not been picked up yet (current status: ${meal.status})`);
    }

    meal.status = 'DELIVERED';
    meal.deliveredAt = new Date().toISOString();
    meal.deliveryNotes = notes;

    // Update global impact stats
    const weight = meal.weightKg || 10;
    const servings = meal.servings || 25;
    this.data.impactSummary.totalMealsRescued += servings;
    this.data.impactSummary.totalKgFoodRescued += weight;
    this.data.impactSummary.co2KgAverted = Math.round((this.data.impactSummary.co2KgAverted + weight * 2.5) * 10) / 10;
    this.data.impactSummary.waterLitersSaved += Math.round(weight * 1000);

    this.save();
    return meal;
  }

  getNgoRequests() {
    return this.data.ngoRequests || [];
  }

  createNgoRequest(reqData) {
    const newReq = {
      id: `req-${uuidv4().slice(0, 8)}`,
      ngoId: reqData.ngoId || 'ngo-1',
      ngoName: reqData.ngoName || 'City Shelter',
      title: reqData.title,
      requiredServings: parseInt(reqData.requiredServings, 10) || 30,
      dietaryPref: reqData.dietaryPref || 'Vegetarian',
      urgency: reqData.urgency || 'HIGH',
      neededBy: reqData.neededBy || new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      address: reqData.address || 'Local Shelter Address',
      lat: parseFloat(reqData.lat) || this.data.meta.centerLat,
      lng: parseFloat(reqData.lng) || this.data.meta.centerLng,
      status: 'OPEN',
      notes: reqData.notes || '',
      createdAt: new Date().toISOString()
    };

    this.data.ngoRequests.unshift(newReq);
    this.save();
    return newReq;
  }

  getStats() {
    const meals = this.data.meals || [];
    const availableMeals = meals.filter((m) => m.status === 'AVAILABLE');
    const activeRescues = meals.filter((m) => m.status === 'CLAIMED' || m.status === 'PICKED_UP');
    const deliveredCount = meals.filter((m) => m.status === 'DELIVERED').length;

    return {
      ...this.data.impactSummary,
      availableCount: availableMeals.length,
      activeRescueCount: activeRescues.length,
      deliveredRescueCount: deliveredCount,
      totalListedCount: meals.length
    };
  }
}

export const db = new Database();
