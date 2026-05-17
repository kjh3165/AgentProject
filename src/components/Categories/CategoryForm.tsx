import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import * as Icons from 'lucide-react'
import { X, Check } from 'lucide-react'

// 명시적인 HEX 색상 코드로 변경하여 Tailwind v4 환경에서도 확실하게 표시되도록 함
const COLOR_PALETTE = [
  { label: 'Red', hex: '#EF4444' },    // red-500
  { label: 'Orange', hex: '#F97316' }, // orange-500
  { label: 'Amber', hex: '#F59E0B' },  // amber-500
  { label: 'Yellow', hex: '#EAB308' }, // yellow-500
  { label: 'Emerald', hex: '#10B981' },// emerald-500
  { label: 'Teal', hex: '#14B8A6' },   // teal-500
  { label: 'Blue', hex: '#3B82F6' },   // blue-500
  { label: 'Indigo', hex: '#6366F1' }, // indigo-500
  { label: 'Purple', hex: '#8B5CF6' }, // purple-500
  { label: 'Pink', hex: '#EC4899' },   // pink-500
  { label: 'Rose', hex: '#F43F5E' },   // rose-500
  { label: 'Gray', hex: '#6B7280' }    // gray-500
]

const ICONS = [
  'Utensils', 'Car', 'Home', 'ShoppingBag', 'HeartPulse', 
  'Gamepad2', 'Gift', 'Banknote', 'TrendingUp', 'Wallet', 
  'Plane', 'Coffee', 'Music', 'Book', 'Camera', 
  'Phone', 'Shield', 'Zap', 'Star', 'Tag'
]

interface Category {
  id?: string
  name: string
  type: 'expense' | 'income'
  color: string
  icon: string
  user_id: string | null
}

interface CategoryFormProps {
  userId: string
  onClose: () => void
  initialData?: Category
  type?: 'expense' | 'income'
}

export default function CategoryForm({ userId, onClose, initialData, type: initialType }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [type, setType] = useState<'expense' | 'income'>(initialData?.type || initialType || 'expense')
  const [selectedColor, setSelectedColor] = useState(initialData?.color || '#6366F1')
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || 'Tag')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }

    if (!userId) {
      setError('사용자 인증 정보가 없습니다.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const categoryData = {
        name: name.trim(),
        type,
        color: selectedColor,
        icon: selectedIcon,
        user_id: userId,
      }

      if (initialData?.id) {
        const { error: upsertError } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', initialData.id)
        if (upsertError) throw upsertError
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert([categoryData])
        
        // 중복 제약 조건 위반 (SQLSTATE 23505) 처리
        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error('동일한 유형에 이미 같은 이름의 카테고리가 존재합니다.')
          }
          throw insertError
        }
      }

      onClose()
    } catch (err: any) {
      console.error('Error saving category:', err)
      setError(err.message || '카테고리 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {initialData ? '카테고리 수정' : '새 카테고리'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 animate-shake font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="카테고리 이름을 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">유형</label>
              <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    type === 'expense'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  지출
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    type === 'income'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  수입
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">색상</label>
              <div className="grid grid-cols-6 gap-3">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    className={`h-9 w-9 rounded-full transition-all hover:scale-110 flex items-center justify-center text-white relative shadow-sm border border-black/5`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  >
                    {selectedColor === color.hex && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">아이콘</label>
              <div className="grid grid-cols-5 gap-3 max-h-40 overflow-y-auto p-1 bg-gray-50 rounded-xl">
                {ICONS.map((iconName) => {
                  const IconComp = (Icons as any)[iconName] || Icons.Tag
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                        selectedIcon === iconName
                          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-500'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <IconComp size={20} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
