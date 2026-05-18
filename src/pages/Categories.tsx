import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import * as Icons from 'lucide-react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import CategoryForm from '../components/Categories/CategoryForm'

interface Category {
  id: string
  name: string
  type: 'expense' | 'income'
  color: string
  icon: string
  user_id: string | null
}

interface CategoriesProps {
  userId: string
}

export default function Categories({ userId }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()

    const channel = supabase
      .channel('public:categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          fetchCategories()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleDelete = async (category: Category) => {
    if (category.user_id === null) return // 기본 카테고리 보호

    if (!confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?\n이 카테고리를 사용하는 내역은 '미지정'으로 변경됩니다.`)) return

    try {
      setLoading(true)

      // 1. 해당 타입(지출/수입)의 '미지정' 카테고리 확인 또는 생성
      let { data: uncategorized } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('type', category.type)
        .eq('name', '미지정')
        .maybeSingle()

      let uncategorizedId = uncategorized?.id

      if (!uncategorizedId) {
        const { data: newData, error: createError } = await supabase
          .from('categories')
          .insert({
            name: '미지정',
            type: category.type,
            user_id: userId,
            color: '#9CA3AF',
            icon: 'Tag'
          })
          .select()
          .single()
        
        if (createError) throw createError
        uncategorizedId = newData.id
      }

      // 2. 관련 거래 내역들을 '미지정'으로 업데이트
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ category_id: uncategorizedId })
        .eq('category_id', category.id)

      if (updateError) throw updateError

      // 3. 카테고리 삭제
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)
      
      if (deleteError) throw deleteError
      
      fetchCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert(`카테고리 삭제 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(undefined)
    setIsModalOpen(true)
  }

  const filteredCategories = categories.filter(c => c.type === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">카테고리 관리</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
        >
          <Plus size={20} />
          <span>추가</span>
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'expense'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            지출
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'income'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            수입
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => {
                const IconComponent = (Icons as any)[category.icon] || Icons.Tag
                const colorHex = category.color || '#6B7280'
                
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group relative"
                  >
                    {/* 사용자의 제안대로 색상 박스와 아이콘을 분리함 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div 
                        className="w-3 h-10 rounded-full shadow-sm"
                        style={{ backgroundColor: colorHex }}
                        title="카테고리 색상"
                      />
                      <div className="p-2.5 rounded-lg bg-white shadow-sm text-gray-700">
                        <IconComponent size={24} strokeWidth={2} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{category.name}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                        {category.user_id ? '개인' : '기본'}
                      </p>
                    </div>

                    {category.user_id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="수정"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">등록된 카테고리가 없습니다.</p>
              <button 
                onClick={handleAdd}
                className="mt-4 text-indigo-600 font-medium hover:underline"
              >
                첫 카테고리를 추가해보세요
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CategoryForm 
          userId={userId}
          type={activeTab}
          onClose={() => {
            setIsModalOpen(false)
            fetchCategories()
          }}
          initialData={editingCategory}
        />
      )}
    </div>
  )
}
