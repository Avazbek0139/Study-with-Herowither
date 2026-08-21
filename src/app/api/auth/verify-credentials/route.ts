export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'EmailOrUsernameRequired', message: 'Email or username is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json({ error: 'PasswordRequired', message: 'Password is required' }, { status: 400 })
    }

    const input = email.trim().toLowerCase()
    const rawPassword = password.trim()

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input },
          { name: email.trim() },
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'UserNotFound', message: 'No account found with this email or username' },
        { status: 404 }
      )
    }

    const isPasswordValid = await compare(rawPassword, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'InvalidPassword', message: 'Incorrect password' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    console.error('Verify credentials error:', error)
    return NextResponse.json(
      { error: 'ServerError', message: 'Server error verifying credentials' },
      { status: 500 }
    )
  }
}
