import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET all markers
export async function GET() {
  try {
    const markers = await prisma.marker.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(markers)
  } catch (error) {
    console.error('Failed to fetch markers:', error)
    return NextResponse.json({ error: 'Failed to fetch markers' }, { status: 500 })
  }
}

// POST new marker
export async function POST(request: Request) {
  try {
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
        address: address || null
      }
    })

    return NextResponse.json(marker, { status: 201 })
  } catch (error) {
    console.error('Failed to create marker:', error)
    return NextResponse.json({ error: 'Failed to create marker' }, { status: 500 })
  }
}
