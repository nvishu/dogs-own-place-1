import { str } from '@/lib/validate'

const GENDERS = ['Male', 'Female', 'Unknown']

// Image must be an https URL (it is rendered in <img>/<Image>), never javascript: or data:
function cleanImage(v) {
  const s = str(v, 500)
  if (!s) return ''
  try {
    return new URL(s).protocol === 'https:' ? s : ''
  } catch {
    return ''
  }
}

export function buildDogFields(body) {
  const f = {}
  if (body.name !== undefined) f.name = str(body.name, 60)
  if (body.breed !== undefined) f.breed = str(body.breed, 80)
  if (body.age !== undefined) f.age = str(String(body.age), 20)
  if (body.weight !== undefined) f.weight = str(String(body.weight), 20)
  if (body.gender !== undefined) f.gender = GENDERS.includes(body.gender) ? body.gender : 'Unknown'
  if (body.color !== undefined) f.color = str(body.color, 40)
  if (body.microchip !== undefined) f.microchip = str(body.microchip, 40)
  if (body.healthNotes !== undefined) f.healthNotes = str(body.healthNotes, 1000)
  if (body.image !== undefined) f.image = cleanImage(body.image)
  if (body.isVaccinated !== undefined) f.isVaccinated = body.isVaccinated === true
  if (body.isNeutered !== undefined) f.isNeutered = body.isNeutered === true
  return f
}
