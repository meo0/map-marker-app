'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMapsLibrary } from '@vis.gl/react-google-maps'

export interface SelectedPlace {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
}

interface PlaceSearchProps {
  onPlaceSelect: (place: SelectedPlace) => void
}

export default function PlaceSearch({ onPlaceSelect }: PlaceSearchProps) {
  const placesLib = useMapsLibrary('places')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (placesLib) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken()
    }
  }, [placesLib])

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!placesLib || !input.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const { suggestions: results } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: sessionTokenRef.current!,
        language: 'ja',
        region: 'jp'
      })
      setSuggestions(results)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [placesLib])

  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleSelect = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!placesLib) return

    const placePrediction = suggestion.placePrediction
    if (!placePrediction) return

    try {
      const place = placePrediction.toPlace()
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] })

      const location = place.location
      if (!location) return

      onPlaceSelect({
        placeId: placePrediction.placeId,
        name: place.displayName || '',
        address: place.formattedAddress || '',
        latitude: location.lat(),
        longitude: location.lng()
      })

      // Reset for next search
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken()
      setQuery('')
      setSuggestions([])
    } catch (error) {
      console.error('Failed to fetch place details:', error)
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1 dark:text-gray-300">場所を検索 *</label>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="店名・施設名を入力..."
        className="w-full border dark:border-slate-600 rounded px-3 py-2 text-gray-900 dark:text-gray-100 dark:bg-slate-700"
      />
      {isLoading && (
        <div className="absolute right-3 top-9 text-gray-600 dark:text-gray-400 text-sm">検索中...</div>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-b shadow-lg dark:shadow-slate-900/50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction
            if (!prediction) return null
            return (
              <li
                key={prediction.placeId || index}
                onClick={() => handleSelect(suggestion)}
                className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b dark:border-slate-700 last:border-b-0"
              >
                <div className="font-medium text-sm dark:text-gray-100">
                  {prediction.mainText?.toString() || ''}
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-400">
                  {prediction.secondaryText?.toString() || ''}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
