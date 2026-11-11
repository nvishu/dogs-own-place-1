import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  phone:    { type: String, trim: true, default: '' },
  city:     { type: String, trim: true, default: '' },
  address:  { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  avatar:   { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  loyaltyPoints: { type: Number, default: 0 },
}, { timestamps: true })

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Remove password from JSON output
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
