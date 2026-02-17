'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { APIProvider } from '@vis.gl/react-google-maps'
import dynamic from 'next/dynamic'
import MarkerForm from '@/components/MarkerForm'
import MarkerList from '@/components/MarkerList'
import UserMenu from '@/components/UserMenu'
import ThemeToggle from '@/components/ThemeToggle'
import type { SelectedPlace } from '@/components/PlaceSearch'
import type { Marker, MarkerInput } from '@/types/marker'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <p className="dark:text-gray-300">地図を読み込み中...</p>
    </div>
  )
})

type ViewMode = 'list' | 'form'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [markers, setMarkers] = useState<Marker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // 認可チェック: マーカーを編集/削除できるか
  const canEditMarker = useCallback((marker: Marker) => {
    if (!session?.user) return false
    if (session.user.role === 'admin' || session.user.role === 'member') return true
    return marker.userId === session.user.id
  }, [session])

  // Fetch markers
  const fetchMarkers = useCallback(async () => {
    try {
      const res = await fetch('/api/markers')
      if (res.ok) {
        const data = await res.json()
        setMarkers(data)
      }
    } catch (error) {
      console.error('Failed to fetch markers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarkers()
  }, [fetchMarkers])

  // Handle marker click on map
  const handleMarkerClick = useCallback((marker: Marker) => {
    setSelectedMarker(marker)
  }, [])

  // Handle marker click in list
  const handleListMarkerClick = useCallback((marker: Marker) => {
    setSelectedMarker(marker)
    if (canEditMarker(marker)) {
      setEditingMarker(marker)
      setViewMode('form')
    }
  }, [canEditMarker])

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null)
  }, [])

  // Handle place selection
  const handlePlaceSelect = useCallback((place: SelectedPlace) => {
    setSelectedPlace(place)
  }, [])

  // Handle new marker button
  const handleNewMarker = () => {
    if (!session) {
      router.push('/login')
      return
    }
    setEditingMarker(null)
    setSelectedPlace(null)
    setViewMode('form')
  }

  // Create marker
  const handleCreateMarker = async (data: MarkerInput) => {
    try {
      const res = await fetch('/api/markers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        await fetchMarkers()
        setSelectedPlace(null)
        setViewMode('list')
      }
    } catch (error) {
      console.error('Failed to create marker:', error)
    }
  }

  // Update marker
  const handleUpdateMarker = async (data: MarkerInput) => {
    if (!editingMarker) return

    try {
      const res = await fetch(`/api/markers/${editingMarker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        await fetchMarkers()
        setEditingMarker(null)
        setSelectedMarker(null)
        setViewMode('list')
      }
    } catch (error) {
      console.error('Failed to update marker:', error)
    }
  }

  // Delete marker
  const handleDeleteMarker = async () => {
    if (!editingMarker) return

    if (!confirm('このマーカーを削除しますか？')) return

    try {
      const res = await fetch(`/api/markers/${editingMarker.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchMarkers()
        setEditingMarker(null)
        setSelectedMarker(null)
        setViewMode('list')
      }
    } catch (error) {
      console.error('Failed to delete marker:', error)
    }
  }

  // Cancel form
  const handleCancel = () => {
    setEditingMarker(null)
    setSelectedPlace(null)
    setViewMode('list')
  }

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Google Maps API Key Required</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file
          </p>
        </div>
      </div>
    )
  }

  const selectedPlaceLocation = selectedPlace
    ? { lat: selectedPlace.latitude, lng: selectedPlace.longitude }
    : null

  return (
    <APIProvider apiKey={apiKey}>
      <main className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-blue-600 dark:bg-slate-800 dark:border-b dark:border-slate-700 text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Map Marker</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'w-80' : 'w-0'
            } bg-white dark:bg-slate-800 border-r dark:border-slate-700 flex-shrink-0 overflow-hidden transition-all duration-300 md:w-80`}
          >
            <div className="w-80 h-full flex flex-col">
              <div className="p-4 border-b dark:border-slate-700">
                {viewMode === 'list' && (
                  <button
                    onClick={handleNewMarker}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    + 新しいマーカー
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <p className="text-center text-gray-700 dark:text-gray-300">読み込み中...</p>
                ) : viewMode === 'list' ? (
                  <MarkerList
                    markers={markers}
                    onMarkerClick={handleListMarkerClick}
                    selectedMarkerId={selectedMarker?.id}
                  />
                ) : (
                  <MarkerForm
                    initialData={editingMarker}
                    selectedPlace={selectedPlace}
                    onPlaceSelect={handlePlaceSelect}
                    onSubmit={editingMarker ? handleUpdateMarker : handleCreateMarker}
                    onCancel={handleCancel}
                    onDelete={editingMarker ? handleDeleteMarker : undefined}
                  />
                )}
              </div>
            </div>
          </aside>

          {/* Map */}
          <div className="flex-1 relative">
            <MapView
              markers={markers}
              onMarkerClick={handleMarkerClick}
              selectedMarker={selectedMarker}
              onInfoWindowClose={handleInfoWindowClose}
              selectedPlaceLocation={selectedPlaceLocation}
            />
          </div>
        </div>
      </main>
    </APIProvider>
  )
}
