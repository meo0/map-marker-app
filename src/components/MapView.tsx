'use client'

import { useEffect } from 'react'
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps'
import { useTheme } from '@/components/ThemeProvider'
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
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (map && selectedPlaceLocation) {
      map.panTo(selectedPlaceLocation)
      map.setZoom(15)
    }
  }, [map, selectedPlaceLocation])

  const infoStyles = {
    bg: isDark ? '#1e293b' : '#ffffff',
    text: isDark ? '#e2e8f0' : '#111827',
    subText: isDark ? '#94a3b8' : '#374151',
    mutedText: isDark ? '#94a3b8' : '#6b7280',
    border: isDark ? '#334155' : '#e5e7eb',
    badge: isDark ? '#334155' : '#e5e7eb',
  }

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
          <div style={{ padding: '8px', maxWidth: '280px', color: infoStyles.text, background: infoStyles.bg, margin: '-13px -13px', borderRadius: '8px' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{selectedMarker.title}</h3>
            {selectedMarker.category && (
              <span style={{ display: 'inline-block', backgroundColor: infoStyles.badge, borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', marginBottom: '8px' }}>
                {selectedMarker.category}
              </span>
            )}
            {selectedMarker.address && (
              <p style={{ color: infoStyles.subText, fontSize: '0.75rem', marginBottom: '4px' }}>{selectedMarker.address}</p>
            )}
            {selectedMarker.description && (
              <p style={{ color: infoStyles.subText, fontSize: '0.875rem' }}>{selectedMarker.description}</p>
            )}
            {selectedMarker.user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${infoStyles.border}`, fontSize: '0.75rem', color: infoStyles.mutedText }}>
                {selectedMarker.user.image ? (
                  <img
                    src={selectedMarker.user.image}
                    alt=""
                    style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: infoStyles.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>
                    {selectedMarker.user.name?.[0] || '?'}
                  </div>
                )}
                <span>{selectedMarker.user.name || '匿名'}</span>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  )
}
