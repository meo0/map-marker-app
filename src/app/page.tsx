'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import MarkerForm from '@/components/MarkerForm'
import MarkerList from '@/components/MarkerList'
import type { Marker, MarkerInput } from '@/types/marker'

// Dynamic import to avoid SSR issues with Google Maps
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p>地図を読み込み中...</p>
    </div>
  )
})

type ViewMode = 'list' | 'form'

export default function Home() {
  const [markers, setMarkers] = useState<Marker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null)
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingLocation({ lat, lng })
    setEditingMarker(null)
    setViewMode('form')
  }, [])

  // Handle marker click on map
  const handleMarkerClick = useCallback((marker: Marker) => {
    setSelectedMarker(marker)
  }, [])

  // Handle marker click in list
  const handleListMarkerClick = useCallback((marker: Marker) => {
    setSelectedMarker(marker)
    setEditingMarker(marker)
    setViewMode('form')
  }, [])

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null)
  }, [])

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
        setPendingLocation(null)
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
    setPendingLocation(null)
    setViewMode('list')
  }

  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">📍 Map Marker</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-80' : 'w-0'
          } bg-white border-r flex-shrink-0 overflow-hidden transition-all duration-300 md:w-80`}
        >
          <div className="w-80 h-full flex flex-col">
            <div className="p-4 border-b">
              {viewMode === 'list' && (
                <button
                  onClick={() => {
                    setEditingMarker(null)
                    setPendingLocation(null)
                    setViewMode('form')
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  + 新しいマーカー
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <p className="text-center text-gray-500">読み込み中...</p>
              ) : viewMode === 'list' ? (
                <MarkerList
                  markers={markers}
                  onMarkerClick={handleListMarkerClick}
                  selectedMarkerId={selectedMarker?.id}
                />
              ) : (
                <MarkerForm
                  initialData={editingMarker}
                  pendingLocation={pendingLocation}
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
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            selectedMarker={selectedMarker}
            onInfoWindowClose={handleInfoWindowClose}
          />

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg text-sm">
            <p>💡 地図をクリックしてマーカーを追加</p>
          </div>
        </div>
      </div>
    </main>
  )
}
