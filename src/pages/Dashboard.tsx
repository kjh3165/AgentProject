import { useEffect, useState, ChangeEvent, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts'
import { 
  Wallet, TrendingUp, TrendingDown, LayoutDashboard, Tag,
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface StatData {
  id: string
  name: string
  value: number
  color: string
  icon: string
}

const IconRenderer = ({ iconName, className }: { iconName: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[iconName] || Tag;
  return <IconComponent className={className} />;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  })
  const [chartData, setChartData] = useState<StatData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(-1)
  const monthInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()

    const subscription = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentDate])

  async function fetchData() {
    try {
      setLoading(true)
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const startDate = `${year}-${month}-01`
      const lastDay = new Date(year, currentDate.getMonth() + 1, 0).getDate()
      const endDate = `${year}-${month}-${lastDay}`

      const { data: transactions, error: tError } = await supabase
        .from('transactions')
        .select(`
          amount, 
          type, 
          category_id,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)

      if (tError) throw tError

      if (transactions) {
        const income = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const expense = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        setStats({
          income,
          expense,
          balance: income - expense,
        })

        const categoryMap = new Map<string, StatData>()
        
        transactions
          .filter(t => t.type === 'expense' && t.categories)
          .forEach(t => {
            const cat = t.categories as any
            const existing = categoryMap.get(cat.id) || {
              id: cat.id,
              name: cat.name,
              value: 0,
              color: cat.color || '#94a3b8',
              icon: cat.icon || 'Tag'
            }
            existing.value += Number(t.amount)
            categoryMap.set(cat.id, existing)
          })

        setChartData(Array.from(categoryMap.values()).sort((a, b) => b.value - a.value))
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error.message)
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  }

  const handleMonthChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month] = e.target.value.split('-').map(Number);
      setCurrentDate(new Date(year, month - 1, 1));
    }
  }

  const triggerPicker = () => {
    if (monthInputRef.current) {
      try {
        (monthInputRef.current as any).showPicker();
      } catch (e) {
        monthInputRef.current.click();
      }
    }
  }

  const totalFlow = stats.income + stats.expense;
  const incomePercent = totalFlow > 0 ? Math.round((stats.income / totalFlow) * 100) : 0;
  const expensePercent = totalFlow > 0 ? Math.round((stats.expense / totalFlow) * 100) : 0;

  const monthValue = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-indigo-600" />
          자산 대시보드
        </h2>
        
        <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-indigo-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            onClick={triggerPicker}
            className="relative px-4 py-1 group cursor-pointer hover:bg-indigo-50/50 rounded-xl transition-colors min-w-[160px] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* '날짜 선택' 안내 문구 유지 */}
            <p className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-400 transition-colors uppercase tracking-widest pointer-events-none">날짜 선택</p>
            <div className="flex items-center gap-2 pointer-events-none">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <p className="text-sm font-black text-gray-700 group-hover:text-indigo-700 transition-colors">
                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
              </p>
            </div>
            {/* title 속성에서 오해의 소지가 있는 단어 제거 및 한국어 최적화 */}
            <input 
              ref={monthInputRef}
              type="month" 
              value={monthValue}
              onChange={handleMonthChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
              title="닫기" 
            />
          </div>

          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-indigo-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">총 수입</p>
          </div>
          <p className="text-2xl font-black text-blue-600">₩ {stats.income.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <TrendingDown className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">총 지출</p>
          </div>
          <p className="text-2xl font-black text-rose-600">₩ {stats.expense.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">순 잔액</p>
          </div>
          <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-gray-800' : 'text-rose-500'}`}>₩ {stats.balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">자산 흐름 비율</h3>
          <div className="flex gap-4 text-xs font-black">
            <span className="text-blue-600">수입 {incomePercent}%</span>
            <span className="text-rose-600">지출 {expensePercent}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden flex shadow-inner">
          <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${incomePercent}%` }} />
          <div className="bg-rose-600 h-full transition-all duration-1000" style={{ width: `${expensePercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px] transition-all ${loading ? 'pointer-events-none opacity-60' : ''}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-left">카테고리별 지출 비중</h3>
          {loading ? (
             <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-400 text-sm font-bold">분석 중...</p>
             </div>
          ) : chartData.length > 0 ? (
            <div className="relative w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    {...({ activeIndex } as any)}
                    activeShape={renderActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(-1)}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ opacity: activeIndex === -1 || activeIndex === index ? 1 : 0.6, transition: 'opacity 0.2s' }} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₩ ${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">총 지출</span>
                <span className="text-2xl font-black text-gray-800">₩ {stats.expense.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 flex flex-col items-center py-10 italic">데이터가 없습니다.</div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">지출 상세 내역</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {chartData.length > 0 ? (
              chartData.map((item, index) => {
                const percentage = ((item.value / stats.expense) * 100).toFixed(1);
                const isActive = activeIndex === index;
                return (
                  <div 
                    key={item.id} 
                    onMouseEnter={() => !loading && setActiveIndex(index)}
                    onMouseLeave={() => !loading && setActiveIndex(-1)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 border ${
                      isActive ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-white border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div 
                          className="w-2.5 h-10 rounded-full shadow-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 shadow-sm text-gray-700">
                          <IconRenderer iconName={item.icon} className="w-6 h-6" />
                        </div>
                      </div>

                      <div>
                        <p className="font-black text-gray-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">비중 {percentage}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-lg">₩ {item.value.toLocaleString()}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-300 font-bold py-20 italic">내역이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
