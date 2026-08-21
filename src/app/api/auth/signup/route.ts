export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = signupSchema.safeParse({
      name: typeof body.name === 'string' ? body.name.trim() : body.name,
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : body.email,
      password: typeof body.password === 'string' ? body.password.trim() : body.password,
    })

    if (!result.success) {
      const firstError = result.error.errors[0]?.message || 'Validation failed'
      return NextResponse.json(
        { message: firstError, errors: result.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = name.trim()

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password.trim(), 12)

    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        settings: {
          create: {
            preferredDifficulty: 'normal',
            dailyGoal: 10,
            translationLanguage: 'uz',
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    )
  }
}
