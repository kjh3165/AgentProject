import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import * as Icons from 'lucide-react'

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  description: string
  date: string
  category_id: string
  categories: {
    name: string
    icon: string
    color: string
  }
}

interface TransactionListProps {
  selectedMonth: string // 'YYYY-MM' 형식
  onEdit: (transaction: Transaction) => void
  filters?: {
    keyword: string
    type: 'all' | 'expense' | 'income'
    categoryId: string
  }
}

export default function TransactionList({ selectedMonth, onEdit, filters }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()

    const subscription = supabase
      .channel('transactions_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [selectedMonth, filters])

  async function fetchTransactions() {
    try {
      setLoading(true)
      
      const startDate = `${selectedMonth}-01`
      const lastDay = new Date(
        parseInt(selectedMonth.split('-')[0]),
        parseInt(selectedMonth.split('-')[1]),
        0
      ).getDate()
      const endDate = `${selectedMonth}-${lastDay}`

      let query = supabase
        .from('transactions')
        .select(`
          id,
          amount,
          type,
          description,
          date,
          category_id,
          categories (
            name,
            icon,
            color
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)

      if (filters) {
        if (filters.keyword) {
          query = query.ilike('description', `%${filters.keyword}%`)
        }
        if (filters.type !== 'all') {
          query = query.eq('type', filters.type)
        }
        if (filters.categoryId !== 'all') {
          query = query.eq('category_id', filters.categoryId)
        }
      }

      const { data, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data as any)
    } catch (error: any) {
      console.error('Error fetching transactions:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('이 내역을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
      fetchTransactions()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400 font-bold animate-pulse">불러오는 중...</div>
  }

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-[2rem] overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {transactions.length === 0 ? (
          <li className="px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-full text-gray-300">
              <Icons.SearchX size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="font-black text-gray-400">
                {filters && (filters.keyword || filters.type !== 'all' || filters.categoryId !== 'all')
                  ? '검색 결과가 없습니다.'
                  : '거래 내역이 없습니다.'}
              </p>
              <p className="text-xs font-bold text-gray-300">다른 필터를 적용하거나 새로운 내역을 추가해보세요.</p>
            </div>
          </li>
        ) : (
          transactions.map((t) => (
            <li key={t.id} className="px-6 py-5 hover:bg-gray-50/50 transition-all group relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div 
                      className="w-2 h-10 rounded-full shadow-sm"
                      style={{ backgroundColor: t.categories?.color || '#6B7280' }}
                    />
                    <div className="p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-600 group-hover:scale-110 transition-transform">
                      {(() => {
                        const IconComp = (Icons as any)[t.categories?.icon || 'Tag'] || Icons.Tag
                        return <IconComp size={22} strokeWidth={2.5} />
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{t.date}</span>
                    <span className="font-black text-gray-900 leading-tight text-lg">{t.description || '메모 없음'}</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 uppercase">{t.categories?.name}</span>
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${t.type === 'income' ? 'bg-blue-50 text-blue-500' : 'bg-rose-50 text-rose-500'} uppercase`}>
                        {t.type === 'income' ? '수입' : '지출'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className={`text-xl font-black ${t.type === 'income' ? 'text-indigo-600' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString()}
                    <span className="text-sm ml-0.5">원</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="수정"
                    >
                      <Icons.Pencil size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="삭제"
                    >
                      <Icons.Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
