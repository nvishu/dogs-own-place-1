import mongoose from 'mongoose'

const HealthRecordSchema = new mongoose.Schema({
  type:        { type: String, enum: ['vaccination', 'checkup', 'medication', 'note'], required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  date:        { type: Date, default: Date.now },
  nextDueDate: { type: Date },
  vet:         { type: String, default: '' },
}, { _id: true, timestamps: true })

const DogSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  breed:       { type: String, required: true },
  age:         { type: String, default: '' },
  weight:      { type: String, default: '' },
  gender:      { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Male' },
  color:       { type: String, default: '' },
  microchip:   { type: String, default: '' },
  healthNotes: { type: String, default: '' },
  image:       { type: String, default: '' },
  isVaccinated:{ type: Boolean, default: false },
  isNeutered:  { type: Boolean, default: false },
  healthRecords: [HealthRecordSchema],
}, { timestamps: true })

export default mongoose.models.Dog || mongoose.model('Dog', DogSchema)
