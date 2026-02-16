'use client'

import { useState, useEffect } from 'react'
import PlaceSearch from '@/components/PlaceSearch'
import type { SelectedPlace } from '@/components/PlaceSearch'
import type { Marker, MarkerInput } from '@/types/marker'

interface MarkerFormProps {
  initialData?: Marker | null
  selectedPlace?: SelectedPlace | null
  onPlaceSelect: (place: SelectedPlace) => void
  onSubmit: (data: MarkerInput) => void
  onCancel: () => void
  onDelete?: () => void
}

const COLORS = [
  { name: '赤', value: '#FF0000' },
  { name: '青', value: '#0066FF' },
  { name: '緑', value: '#00CC00' },
  { name: '黄', value: '#FFCC00' },
  { name: '紫', value: '#9900FF' },
  { name: 'オレンジ', value: '#FF6600' },
  { name: 'ピンク', value: '#FF66CC' },
  { name: '水色', value: '#00CCFF' },
]

const CATEGORIES = [
  'お店',
  'レストラン',
  'カフェ',
  '観光スポット',
  '公園',
  '駅',
  'ホテル',
  'その他',
]

export default function MarkerForm({
  initialData,
  selectedPlace,
  onPlaceSelect,
  onSubmit,
  onCancel,
  onDelete
}: MarkerFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('#FF0000')

  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || '')
      setCategory(initialData.category || '')
      setColor(initialData.color)
    }
  }, [initialData])

  useEffect(() => {
    if (selectedPlace && !isEditing) {
      setTitle(selectedPlace.name)
    }
  }, [selectedPlace, isEditing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    if (isEditing && initialData) {
      onSubmit({
        title,
        description: description || undefined,
        category: category || undefined,
        color,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        placeId: initialData.placeId || undefined,
        address: initialData.address || undefined
      })
    } else if (selectedPlace) {
      onSubmit({
        title,
        description: description || undefined,
        category: category || undefined,
        color,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        placeId: selectedPlace.placeId,
        address: selectedPlace.address
      })
    }
  }

  const canSubmit = isEditing || !!selectedPlace

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">
        {isEditing ? 'マーカーを編集' : '新しいマーカー'}
      </h2>

      {!isEditing && (
        <PlaceSearch onPlaceSelect={onPlaceSelect} />
      )}

      {selectedPlace && !isEditing && (
        <div className="bg-blue-50 rounded p-3 text-sm">
          <p className="font-medium">{selectedPlace.name}</p>
          <p className="text-gray-600 text-xs mt-1">{selectedPlace.address}</p>
        </div>
      )}

      {isEditing && initialData?.address && (
        <div className="bg-gray-50 rounded p-3 text-sm">
          <p className="text-gray-600 text-xs">{initialData.address}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">タイトル *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">説明</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">カテゴリ</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">選択してください</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">色</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === c.value ? 'border-black' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? '更新' : '作成'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 py-2 px-4 rounded hover:bg-gray-300"
        >
          キャンセル
        </button>
      </div>

      {isEditing && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          削除
        </button>
      )}
    </form>
  )
}
