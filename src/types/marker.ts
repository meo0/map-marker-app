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
