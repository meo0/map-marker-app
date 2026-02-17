import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// GET single marker (公開)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const marker = await prisma.marker.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
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

// 認可チェック: 本人、member、admin のみ許可
async function checkAuthorization(markerId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { authorized: false, status: 401, error: 'Unauthorized' } as const
  }

  const marker = await prisma.marker.findUnique({ where: { id: markerId } })
  if (!marker) {
    return { authorized: false, status: 404, error: 'Marker not found' } as const
  }

  const isOwner = marker.userId === session.user.id
  const isPrivileged = session.user.role === 'member' || session.user.role === 'admin'

  if (!isOwner && !isPrivileged) {
    return { authorized: false, status: 403, error: 'Forbidden' } as const
  }

  return { authorized: true, session, marker } as const
}

// PUT update marker (認証+認可)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await checkAuthorization(id)

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

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
        address,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true },
        },
      },
    })

    return NextResponse.json(marker)
  } catch (error) {
    console.error('Failed to update marker:', error)
    return NextResponse.json({ error: 'Failed to update marker' }, { status: 500 })
  }
}

// DELETE marker (認証+認可)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await checkAuthorization(id)

    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    await prisma.marker.delete({ where: { id } })

    return NextResponse.json({ message: 'Marker deleted' })
  } catch (error) {
    console.error('Failed to delete marker:', error)
    return NextResponse.json({ error: 'Failed to delete marker' }, { status: 500 })
  }
}
