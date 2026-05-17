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
}

export default function TransactionList({ selectedMonth, onEdit }: TransactionListProps) {
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
  }, [selectedMonth])

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

      const { data, error } = await supabase
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
    return <div className="text-center py-10 text-gray-500">불러오는 중...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {transactions.length === 0 ? (
          <li className="px-6 py-10 text-center text-gray-500">
            거래 내역이 없습니다. 새로운 내역을 추가해보세요!
          </li>
        ) : (
          transactions.map((t) => (
            <li key={t.id} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* 카테고리 색상바와 아이콘 표시 */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-8 rounded-full shadow-sm"
                      style={{ backgroundColor: t.categories?.color || '#6B7280' }}
                    />
                    <div className="p-2 rounded-lg bg-white shadow-sm text-gray-600">
                      {(() => {
                        const IconComp = (Icons as any)[t.categories?.icon || 'Tag'] || Icons.Tag
                        return <IconComp size={18} strokeWidth={2} />
                      })()}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-400 mb-0.5">{t.date}</span>
                    <span className="font-bold text-gray-900 leading-tight">{t.description || '메모 없음'}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{t.categories?.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-lg font-bold ${t.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString()}원
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                      title="수정"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
