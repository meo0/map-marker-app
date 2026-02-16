'use client'

import type { Marker } from '@/types/marker'

interface MarkerListProps {
  markers: Marker[]
  onMarkerClick: (marker: Marker) => void
  selectedMarkerId?: string
}

export default function MarkerList({
  markers,
  onMarkerClick,
  selectedMarkerId
}: MarkerListProps) {
  if (markers.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>マーカーがありません</p>
        <p className="text-sm mt-2">+ 新しいマーカーで場所を検索して追加</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {markers.map((marker) => (
        <div
          key={marker.id}
          onClick={() => onMarkerClick(marker)}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            selectedMarkerId === marker.id
              ? 'bg-blue-100 border-blue-500 border'
              : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: marker.color }}
            />
            <h3 className="font-medium truncate">{marker.title}</h3>
          </div>
          {marker.address && (
            <p className="text-gray-500 text-xs mt-1 truncate">{marker.address}</p>
          )}
          {marker.category && (
            <span className="inline-block bg-gray-200 rounded px-2 py-0.5 text-xs mt-1">
              {marker.category}
            </span>
          )}
          {marker.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {marker.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
