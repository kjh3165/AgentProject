import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import * as Icons from 'lucide-react'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export interface TransactionData {
  id?: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  date: string
  description: string
}

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  initialData?: TransactionData | null
}

export default function TransactionForm({ isOpen, onClose, userId, initialData }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (initialData) {
        setAmount(initialData.amount.toString())
        setType(initialData.type)
        setCategoryId(initialData.category_id)
        setDate(initialData.date)
        setDescription(initialData.description || '')
      } else {
        setAmount('')
        setType('expense')
        setDate(new Date().toISOString().split('T')[0])
        setDescription('')
      }
    }
  }, [isOpen, initialData])

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, type, icon, color')
      .or(`user_id.eq.${userId},user_id.is.null`)
    
    if (!error && data) {
      setCategories(data)
      // 수정 모드가 아닐 때만 카테고리 기본값 설정
      if (!initialData) {
        const filtered = data.filter(c => c.type === type)
        if (filtered.length > 0) setCategoryId(filtered[0].id)
      }
    }
  }

  // 유형 변경 시 카테고리 초기값 재설정 (수정 모드가 아닐 때만)
  useEffect(() => {
    if (!initialData) {
      const filtered = categories.filter(c => c.type === type)
      if (filtered.length > 0) setCategoryId(filtered[0].id)
    }
  }, [type, categories, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const transactionData = {
      user_id: userId,
      amount: Number(amount),
      type,
      category_id: categoryId,
      date,
      description,
    }

    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('transactions').insert([transactionData])
        if (error) throw error
      }
      
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedCategory = categories.find(c => c.id === categoryId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? '내역 수정' : '새 내역 추가'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <Icons.X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex bg-gray-50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              지출
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              수입
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">금액</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                placeholder="0"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">원</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">카테고리</label>
            <div className="flex space-x-2">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-sm"
                style={{ 
                  backgroundColor: 'white',
                  borderLeft: `4px solid ${selectedCategory?.color || '#6B7280'}`
                }}
              >
                {(() => {
                  const IconComp = (Icons as any)[selectedCategory?.icon || 'Tag'] || Icons.Tag
                  return <IconComp size={22} className="text-gray-700" />
                })()}
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white font-medium"
                required
              >
                {categories
                  .filter((c) => c.type === type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">메모</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                placeholder="내용 입력"
              />
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all disabled:opacity-50 ${type === 'income' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
            >
              {loading ? '저장 중...' : initialData ? '수정' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
