import { useState } from 'react'
import TransactionList, { Transaction } from '../components/Transactions/TransactionList'
import TransactionForm, { TransactionData } from '../components/Transactions/TransactionForm'

interface TransactionsProps {
  userId: string
}

export default function Transactions({ userId }: TransactionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">거래 내역</h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          내역 추가
        </button>
      </div>
      
      <TransactionList selectedMonth={selectedMonth} onEdit={handleEdit} />

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        userId={userId}
        initialData={editingTransaction}
      />
    </div>
  )
}
