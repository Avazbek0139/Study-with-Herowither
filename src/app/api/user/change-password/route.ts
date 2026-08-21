export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Tizimga kirilmagan. Iltimos qayta kiring.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { currentPassword, newPassword, confirmPassword } = body

    if (!currentPassword || typeof currentPassword !== 'string' || !currentPassword.trim()) {
      return NextResponse.json(
        { error: 'CurrentPasswordRequired', message: 'Joriy parolni kiriting' },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string' || !newPassword.trim()) {
      return NextResponse.json(
        { error: 'NewPasswordRequired', message: 'Yangi parolni kiriting' },
        { status: 400 }
      )
    }

    const cleanNewPassword = newPassword.trim()

    if (cleanNewPassword.length < 8) {
      return NextResponse.json(
        { error: 'PasswordTooShort', message: 'Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak' },
        { status: 400 }
      )
    }

    if (confirmPassword && cleanNewPassword !== confirmPassword.trim()) {
      return NextResponse.json(
        { error: 'PasswordMismatch', message: 'Yangi parollar bir-biriga mos kelmadi' },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const userEmail = session.user.email?.toLowerCase().trim()

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'UserNotFound', message: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentValid = await compare(currentPassword.trim(), user.passwordHash)

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'InvalidCurrentPassword', message: 'Joriy parol xato kiritildi' },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hash(cleanNewPassword, 12)

    // Update user password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    return NextResponse.json({
      success: true,
      message: 'Parolingiz muvaffaqiyatli o\'zgartirildi!',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'ServerError', message: 'Parolni o\'zgartirishda kutilmagan xatolik yuz berdi' },
      { status: 500 }
    )
  }
}
