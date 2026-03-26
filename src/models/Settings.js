import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  isRegistrationOpen: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
