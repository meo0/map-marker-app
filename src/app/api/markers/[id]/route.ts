import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET single marker
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const marker = await prisma.marker.findUnique({
      where: { id }
    })

    if (!marker) {
      return NextResponse.json({ error: 'Marker not found' }, { status: 404 })
    }

    return NextResponse.json(marker)
  } catch (error) {
    console.error('Failed to fetch marker:', error)
    return NextResponse.json({ error: 'Failed to fetch marker' }, { status: 500 })
  }
}

// PUT update marker
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, latitude, longitude, category, color, placeId, address } = body

    const marker = await prisma.marker.update({
      where: { id },
      data: {
        title,
        description,
        latitude,
        longitude,
        category,
        color,
        placeId,
        address
      }
    })

    return NextResponse.json(marker)
  } catch (error) {
    console.error('Failed to update marker:', error)
    return NextResponse.json({ error: 'Failed to update marker' }, { status: 500 })
  }
}

// DELETE marker
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.marker.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Marker deleted' })
  } catch (error) {
    console.error('Failed to delete marker:', error)
    return NextResponse.json({ error: 'Failed to delete marker' }, { status: 500 })
  }
}
