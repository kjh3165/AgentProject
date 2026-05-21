import { useState, useEffect } from 'react'
import TransactionList, { Transaction } from '../components/Transactions/TransactionList'
import TransactionForm, { TransactionData } from '../components/Transactions/TransactionForm'
import { supabase } from '../lib/supabase'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'

interface TransactionsProps {
  userId: string
}

interface Category {
  id: string
  name: string
  type: 'expense' | 'income'
}

export default function Transactions({ userId }: TransactionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // 필터 상태값
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState({
    keyword: '',
    type: 'all' as 'all' | 'expense' | 'income',
    categoryId: 'all'
  })

  // 필터링 적용을 위한 최종 상태값 (Apply 버튼 클릭 시 업데이트)
  const [appliedFilters, setAppliedFilters] = useState(filters)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('id, name, type')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order('name')
    
    if (data) setCategories(data)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      category_id: transaction.category_id,
      date: transaction.date,
      description: transaction.description,
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTransaction(null)
  }

  const handleApplyFilter = () => {
    setAppliedFilters(filters)
  }

  const handleResetFilter = () => {
    const resetValues = {
      keyword: '',
      type: 'all' as const,
      categoryId: 'all'
    }
    setFilters(resetValues)
    setAppliedFilters(resetValues)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-black text-gray-800">거래 내역</h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-bold focus:border-indigo-500 focus:ring-0 outline-none transition-colors bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all border-2 ${
              isFilterOpen 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
            }`}
          >
            <Filter size={18} />
            필터
            {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
          >
            내역 추가
          </button>
        </div>
      </div>
      
      {/* 필터 섹션 (아코디언) */}
      {isFilterOpen && (
        <div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 키워드 검색 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">검색어</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="메모 내용 검색..."
                  value={filters.keyword}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* 유형 필터 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">거래 유형</label>
              <div className="flex bg-gray-50 p-1 rounded-xl border-2 border-transparent focus-within:border-indigo-500 transition-all">
                {(['all', 'expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters({ ...filters, type: t })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                      filters.type === t 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {t === 'all' ? '전체' : t === 'expense' ? '지출' : '수입'}
                  </button>
                ))}
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">카테고리</label>
              <select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">모든 카테고리</option>
                {categories
                  .filter(c => filters.type === 'all' || c.type === filters.type)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={handleResetFilter}
              className="flex items-center gap-2 px-4 py-2 text-sm font-black text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
              초기화
            </button>
            <button 
              onClick={handleApplyFilter}
              className="bg-gray-900 text-white px-8 py-2 rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
              검색 적용
            </button>
          </div>
        </div>
      )}
      
      <TransactionList 
        selectedMonth={selectedMonth} 
        onEdit={handleEdit}
        filters={appliedFilters}
      />

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        userId={userId}
        initialData={editingTransaction}
      />
    </div>
  )
}
