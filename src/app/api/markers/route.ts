import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET all markers (公開)
export async function GET() {
  try {
    const markers = await prisma.marker.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    })
    return NextResponse.json(markers)
  } catch (error) {
    console.error('Failed to fetch markers:', error)
    return NextResponse.json({ error: 'Failed to fetch markers' }, { status: 500 })
  }
}

// POST new marker (認証必須)
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, latitude, longitude, category, color, placeId, address } = body

    if (!title || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Title, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    const marker = await prisma.marker.create({
      data: {
        title,
        description: description || null,
        latitude,
        longitude,
        category: category || null,
        color: color || '#FF0000',
        placeId: placeId || null,
        address: address || null,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    })

    return NextResponse.json(marker, { status: 201 })
  } catch (error) {
    console.error('Failed to create marker:', error)
    return NextResponse.json({ error: 'Failed to create marker' }, { status: 500 })
  }
}
