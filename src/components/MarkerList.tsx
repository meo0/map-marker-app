'use client'

import type { Marker } from '@/types/marker'
import RoleBadge from '@/components/RoleBadge'

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
      <div className="text-center text-gray-700 dark:text-gray-300 py-8">
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
              ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 border'
              : 'bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: marker.color }}
            />
            <h3 className="font-medium truncate text-gray-900 dark:text-gray-100">{marker.title}</h3>
          </div>
          {marker.address && (
            <p className="text-gray-700 dark:text-gray-300 text-xs mt-1 truncate">{marker.address}</p>
          )}
          {marker.category && (
            <span className="inline-block bg-gray-200 dark:bg-slate-600 rounded px-2 py-0.5 text-xs mt-1">
              {marker.category}
            </span>
          )}
          {marker.description && (
            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 line-clamp-2">
              {marker.description}
            </p>
          )}
          {marker.user && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600 dark:text-gray-400">
              {marker.user.image ? (
                <img
                  src={marker.user.image}
                  alt=""
                  className="w-4 h-4 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-slate-600 flex items-center justify-center text-[10px] text-white">
                  {marker.user.name?.[0] || '?'}
                </div>
              )}
              <span>{marker.user.name || '匿名'}</span>
              <RoleBadge role={marker.user.role} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
