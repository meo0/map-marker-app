'use client'

import { useEffect } from 'react'
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps'
import type { Marker } from '@/types/marker'

interface MapViewProps {
  markers: Marker[]
  onMarkerClick: (marker: Marker) => void
  selectedMarker: Marker | null
  onInfoWindowClose: () => void
  selectedPlaceLocation: { lat: number; lng: number } | null
}

export default function MapView({
  markers,
  onMarkerClick,
  selectedMarker,
  onInfoWindowClose,
  selectedPlaceLocation
}: MapViewProps) {
  const map = useMap()

  useEffect(() => {
    if (map && selectedPlaceLocation) {
      map.panTo(selectedPlaceLocation)
      map.setZoom(15)
    }
  }, [map, selectedPlaceLocation])

  return (
    <Map
      defaultCenter={{ lat: 35.6812, lng: 139.7671 }}
      defaultZoom={12}
      mapId="map-marker-app"
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
            {selectedMarker.address && (
              <p className="text-gray-500 text-xs mb-1">{selectedMarker.address}</p>
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
