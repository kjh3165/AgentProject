import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthForm from './components/Auth/AuthForm'
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">로그인 성공!</h1>
      <p className="text-gray-600 mb-8">{session.user.email}님, 환영합니다.</p>
      <button 
        onClick={() => supabase.auth.signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        로그아웃
      </button>
    </div>
  )
}

export default App
