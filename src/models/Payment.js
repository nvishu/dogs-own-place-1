import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment:    { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  amount:         { type: Number, required: true },
  currency:       { type: String, default: 'INR' },
  method:         { type: String, enum: ['upi', 'card', 'net_banking', 'wallet', 'cash', 'mock'], default: 'mock' },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  // Razorpay fields (filled when live keys are added)
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  // Mock / demo
  txnId:     { type: String, default: '' },
  paidAt:    { type: Date },
  refundedAt:{ type: Date },
  notes:     { type: String, default: '' },
}, { timestamps: true })

PaymentSchema.index({ user: 1 })
PaymentSchema.index({ appointment: 1 })
PaymentSchema.index({ status: 1 })

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
