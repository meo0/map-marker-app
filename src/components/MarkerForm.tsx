'use client'

import { useState, useEffect } from 'react'
import type { Marker, MarkerInput } from '@/types/marker'

interface MarkerFormProps {
  initialData?: Marker | null
  pendingLocation?: { lat: number; lng: number } | null
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
  pendingLocation,
  onSubmit,
  onCancel,
  onDelete
}: MarkerFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('#FF0000')
  const [latitude, setLatitude] = useState<number | ''>('')
  const [longitude, setLongitude] = useState<number | ''>('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || '')
      setCategory(initialData.category || '')
      setColor(initialData.color)
      setLatitude(initialData.latitude)
      setLongitude(initialData.longitude)
    } else if (pendingLocation) {
      setLatitude(pendingLocation.lat)
      setLongitude(pendingLocation.lng)
    }
  }, [initialData, pendingLocation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || latitude === '' || longitude === '') return

    onSubmit({
      title,
      description: description || undefined,
      category: category || undefined,
      color,
      latitude: Number(latitude),
      longitude: Number(longitude)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">
        {initialData ? 'マーカーを編集' : '新しいマーカー'}
      </h2>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">緯度 *</label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">経度 *</label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : '')}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {initialData ? '更新' : '作成'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 py-2 px-4 rounded hover:bg-gray-300"
        >
          キャンセル
        </button>
      </div>

      {initialData && onDelete && (
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
