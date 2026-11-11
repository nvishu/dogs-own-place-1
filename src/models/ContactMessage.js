import mongoose from 'mongoose'

const ContactMessageSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 80 },
  email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone:   { type: String, trim: true, default: '', maxlength: 20 },
  subject: { type: String, trim: true, default: '', maxlength: 120 },
  message: { type: String, required: true, maxlength: 2000 },
  status:  { type: String, enum: ['new', 'read'], default: 'new' },
}, { timestamps: true })

ContactMessageSchema.index({ status: 1, createdAt: -1 })

export default mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema)
