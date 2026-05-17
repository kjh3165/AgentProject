import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AuthForm from './components/Auth/AuthForm'
import Header from './components/Layout/Header'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import { Session } from '@supabase/supabase-js'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>
  }

  if (!session) {
    return <AuthForm />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header userEmail={session.user.email || ''} />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/transactions" element={<Transactions userId={session.user.id} />} />
            <Route path="/categories" element={<Categories userId={session.user.id} />} />
            <Route path="/" element={<Navigate to="/transactions" replace />} />
            <Route path="*" element={<Navigate to="/transactions" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
