'use client'

import { useCallback } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  MapMouseEvent
} from '@vis.gl/react-google-maps'
import type { Marker } from '@/types/marker'

interface MapViewProps {
  markers: Marker[]
  onMapClick: (lat: number, lng: number) => void
  onMarkerClick: (marker: Marker) => void
  selectedMarker: Marker | null
  onInfoWindowClose: () => void
}

function MapContent({
  markers,
  onMapClick,
  onMarkerClick,
  selectedMarker,
  onInfoWindowClose
}: MapViewProps) {
  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const detail = e.detail
      if (detail.latLng) {
        onMapClick(detail.latLng.lat, detail.latLng.lng)
      }
    },
    [onMapClick]
  )

  return (
    <Map
      defaultCenter={{ lat: 35.6812, lng: 139.7671 }} // Tokyo
      defaultZoom={12}
      mapId="map-marker-app"
      onClick={handleMapClick}
      className="w-full h-full"
      gestureHandling="greedy"
    >
      {markers.map((marker) => (
        <AdvancedMarker
          key={marker.id}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          onClick={() => onMarkerClick(marker)}
        >
          <Pin
            background={marker.color}
            borderColor="#000"
            glyphColor="#fff"
          />
        </AdvancedMarker>
      ))}

      {selectedMarker && (
        <InfoWindow
          position={{
            lat: selectedMarker.latitude,
            lng: selectedMarker.longitude
          }}
          onCloseClick={onInfoWindowClose}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-bold text-lg">{selectedMarker.title}</h3>
            {selectedMarker.category && (
              <span className="inline-block bg-gray-200 rounded px-2 py-1 text-xs mb-2">
                {selectedMarker.category}
              </span>
            )}
            {selectedMarker.description && (
              <p className="text-gray-600 text-sm">{selectedMarker.description}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  )
}

export default function MapView(props: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-red-600 mb-2">Google Maps API Key Required</h2>
          <p className="text-gray-600">
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file
          </p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <MapContent {...props} />
    </APIProvider>
  )
}
