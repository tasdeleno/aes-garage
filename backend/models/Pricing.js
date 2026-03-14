const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
  basePrice: { type: Number, required: true, default: 500 },
  vehicleMultipliers: { type: mongoose.Schema.Types.Mixed, default: () => ({ Sedan: 1, SUV: 1.2, Hatchback: 0.9, Pickup: 1.3, Minivan: 1.25 }) },
  damageMultipliers: { type: mongoose.Schema.Types.Mixed, default: () => ({ 'Küçük': 1, 'Orta': 1.5, 'Büyük': 2, 'Çok Büyük': 2.5 }) },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pricing', PricingSchema);
