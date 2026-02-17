export interface MarkerUser {
  id: string
  name: string | null
  image: string | null
  role: string
}

export interface Marker {
  id: string
  title: string
  description: string | null
  latitude: number
  longitude: number
  category: string | null
  color: string
  placeId: string | null
  address: string | null
  userId: string | null
  user: MarkerUser | null
  createdAt: Date
  updatedAt: Date
}

export interface MarkerInput {
  title: string
  description?: string
  latitude: number
  longitude: number
  category?: string
  color?: string
  placeId?: string
  address?: string
}
