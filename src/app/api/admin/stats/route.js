import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Dog from '@/models/Dog'
import Appointment from '@/models/Appointment'
import Payment from '@/models/Payment'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()

    const [totalUsers, totalDogs, totalBookings, payments] = await Promise.all([
      User.countDocuments(),
      Dog.countDocuments(),
      Appointment.countDocuments(),
      Payment.find({ status: 'success' }).select('amount createdAt'),
    ])

    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0)

    // Recent bookings
    const recentBookings = await Appointment.find()
      .populate('user', 'name email city')
      .populate('dog', 'name breed')
      .sort({ createdAt: -1 })
      .limit(8)

    // Revenue by service
    const revenueByService = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $lookup: { from: 'appointments', localField: 'appointment', foreignField: '_id', as: 'appt' } },
      { $unwind: '$appt' },
      { $group: { _id: '$appt.serviceName', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ])

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$amount' }, count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    return NextResponse.json({
      stats: { totalUsers, totalDogs, totalBookings, totalRevenue },
      recentBookings, revenueByService, monthlyRevenue,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
