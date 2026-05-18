import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Wallet } from 'lucide-react'

interface HeaderProps {
  userEmail?: string
}

export default function Header({ userEmail }: HeaderProps) {
  const location = useLocation()
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) alert(error.message)
  }

  const navItems = [
    { name: '대시보드', href: '/' },
    { name: '내역', href: '/transactions' },
    { name: '카테고리', href: '/categories' },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          <div className="flex items-center space-x-10">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                Money<span className="text-indigo-600 group-hover:text-gray-900">Flow</span>
              </span>
            </Link>
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === item.href
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">사용자</span>
              <span className="text-xs font-bold text-gray-700">
                {userEmail}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-black rounded-xl text-white bg-rose-500 hover:bg-rose-600 hover:scale-105 active:scale-95 shadow-md shadow-rose-100 focus:outline-none transition-all"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
