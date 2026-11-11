'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const DogsContext = createContext(null)

const SAMPLE_DOGS = [
  {
    id: '1',
    name: 'Bruno',
    breed: 'Labrador Retriever',
    age: 3,
    weight: 28,
    gender: 'Male',
    color: 'Golden Yellow',
    microchip: 'MC123456',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=80',
    vaccinations: [
      { name: 'Rabies', date: '2024-01-15', next: '2025-01-15', status: 'up-to-date' },
      { name: 'DHPP', date: '2024-03-20', next: '2025-03-20', status: 'up-to-date' },
    ],
    appointments: [],
    healthNotes: 'Healthy dog, no known allergies. Slightly overweight, on diet plan.',
    createdAt: '2024-01-01',
  },
]

export function DogsProvider({ children }) {
  const [dogs, setDogs] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('dop_dogs')
    setDogs(stored ? JSON.parse(stored) : SAMPLE_DOGS)
  }, [])

  const save = (updated) => {
    localStorage.setItem('dop_dogs', JSON.stringify(updated))
    setDogs(updated)
  }

  const addDog = (dog) => {
    const newDog = { ...dog, id: Date.now().toString(), vaccinations: [], appointments: [], createdAt: new Date().toISOString() }
    save([...dogs, newDog])
    return newDog
  }

  const updateDog = (id, data) => {
    const updated = dogs.map(d => d.id === id ? { ...d, ...data } : d)
    save(updated)
  }

  const deleteDog = (id) => save(dogs.filter(d => d.id !== id))

  const addAppointment = (dogId, appointment) => {
    const updated = dogs.map(d => d.id === dogId
      ? { ...d, appointments: [...(d.appointments || []), { ...appointment, id: Date.now().toString() }] }
      : d)
    save(updated)
  }

  return (
    <DogsContext.Provider value={{ dogs, addDog, updateDog, deleteDog, addAppointment }}>
      {children}
    </DogsContext.Provider>
  )
}

export function useDogs() {
  return useContext(DogsContext)
}
