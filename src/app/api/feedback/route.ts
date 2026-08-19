export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendTelegramNotification } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const { type = 'suggestion', subject, message, contactInfo, telegramUsername, name, email } = body

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json({ error: 'Mavzu kiritilishi shart' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Xabar matni kiritilishi shart' }, { status: 400 })
    }

    const userName = name?.trim() || session?.user?.name || 'Anonim foydalanuvchi'
    const userEmail = email?.trim() || session?.user?.email || null
    const userId = session?.user?.id || null
    const tgUser = telegramUsername?.trim() || contactInfo?.trim() || null

    // 1. Save to Database
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        type,
        subject: subject.trim(),
        message: message.trim(),
        contactInfo: tgUser,
        userName,
        userEmail,
        status: 'pending',
      },
    })

    // 2. Send Telegram notification to 5744904641
    const tgResult = await sendTelegramNotification({
      type,
      subject: subject.trim(),
      message: message.trim(),
      userName,
      userEmail: userEmail || undefined,
      telegramUsername: tgUser || undefined,
      contactInfo: tgUser || undefined,
      userId,
    })

    if (tgResult.success) {
      await prisma.feedback.update({
        where: { id: feedback.id },
        data: { sentToTg: true },
      })
    }

    return NextResponse.json({
      success: true,
      id: feedback.id,
      sentToTelegram: tgResult.success,
      message: 'Murojaatingiz muvaffaqiyatli qabul qilindi!',
    })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ feedbacks })
  } catch (error) {
    console.error('Get feedback error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
