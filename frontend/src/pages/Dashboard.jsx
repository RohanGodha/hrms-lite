import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX, TrendingUp, BarChart3, Activity } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getDashboard } from '../api'
import { useTheme } from '../context/ThemeContext'
import s from './Dashboard.module.css'

const COLORS = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#6366f1']

function StatCard({ label, value, icon:Icon, color, delay=0 }) {
  return (
    <motion.div className={`${s.card} ${s[color]}`}
      initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay,duration:.4,ease:[.16,1,.3,1]}}>
      <div className={s.cardTop}>
        <span className={s.cardLabel}>{label}</span>
        <div className={s.cardIcon}><Icon size={16}/></div>
      </div>
      <div className={s.cardValue}>{value ?? <span className={s.skeleton}/>}</div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{background:'var(--bg-3)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px',fontSize:13}}>
      <p style={{color:'var(--text-2)',marginBottom:6,fontWeight:500}}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color,margin:'3px 0'}}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [err,  setErr]  = useState(null)
  const { theme } = useTheme()
  const axisColor = theme === 'dark' ? '#4a5a7a' : '#8896b8'

  const load = useCallback(async () => {
    try { setData(await getDashboard()) }
    catch(e) { setErr(e.message) }
  }, [])

  useEffect(() => { load() }, [load])

  if (err) return <div className={s.page}><div className={s.err}>⚠️ {err} <button onClick={load}>Retry</button></div></div>

  return (
    <div className={s.page}>
      <motion.div className={s.header} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:.4}}>
        <div>
          <h1 className={s.title}>Dashboard</h1>
          <p className={s.sub}>Real-time workforce analytics & KPIs</p>
        </div>
        <div className={s.rateBadge}>
          <Activity size={14}/>
          <span>{data?.attendance_rate_30 ?? '—'}% attendance (30d)</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className={s.stats}>
        <StatCard label="Total Employees"      value={data?.total_employees}        icon={Users}      color="blue"   delay={0}   />
        <StatCard label="Present Today"        value={data?.present_today}          icon={UserCheck}  color="green"  delay={0.08}/>
        <StatCard label="Absent Today"         value={data?.absent_today}           icon={UserX}      color="red"    delay={0.16}/>
        <StatCard label="Attendance Records"   value={data?.total_attendance_records} icon={BarChart3} color="purple" delay={0.24}/>
      </div>

      {/* Charts row 1 */}
      <div className={s.charts}>
        {/* 7-day area trend */}
        <motion.div className={s.chartBox} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.3}}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>7-Day Attendance Trend</h3>
            <TrendingUp size={16} style={{color:'var(--accent)'}}/>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.trend_7days || []} margin={{top:10,right:10,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.2}/>
              <XAxis dataKey="date" tick={{fill:axisColor,fontSize:11}} tickFormatter={d=>d.slice(5)} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:axisColor,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={2} fill="url(#gPresent)" name="Present"/>
              <Area type="monotone" dataKey="absent"  stroke="#ef4444" strokeWidth={2} fill="url(#gAbsent)"  name="Absent"/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut - Department breakdown */}
        <motion.div className={s.chartBox} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.38}}>
          <div className={s.chartHeader}>
            <h3 className={s.chartTitle}>By Department</h3>
            <Users size={16} style={{color:'var(--purple)'}}/>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data?.department_breakdown||[]} cx="50%" cy="50%"
                innerRadius={55} outerRadius={90} paddingAngle={3}
                dataKey="count" nameKey="department">
                {(data?.department_breakdown||[]).map((_,i)=>(
                  <Cell key={i} fill={COLORS[i%COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12,color:'var(--text-2)'}}/>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 6-month bar chart */}
      <motion.div className={s.chartBoxFull} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.46}}>
        <div className={s.chartHeader}>
          <h3 className={s.chartTitle}>Monthly Attendance (Last 6 Months)</h3>
          <BarChart3 size={16} style={{color:'var(--green)'}}/>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data?.monthly_chart||[]} margin={{top:10,right:10,left:-20,bottom:0}} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.2}/>
            <XAxis dataKey="month" tick={{fill:axisColor,fontSize:12}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:axisColor,fontSize:12}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12,color:'var(--text-2)'}}/>
            <Bar dataKey="present" fill="#3b82f6" radius={[6,6,0,0]} name="Present"/>
            <Bar dataKey="absent"  fill="#ef4444" radius={[6,6,0,0]} name="Absent"/>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Employee present-days table */}
      <motion.div className={s.tableBox} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.54}}>
        <div className={s.chartHeader}>
          <h3 className={s.chartTitle}>Employee Summary</h3>
          <span className={s.tableCount}>{data?.employee_present_days?.length || 0} employees</span>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th className={s.right}>Present Days</th></tr></thead>
            <tbody>
              {(data?.employee_present_days||[]).map(emp=>(
                <tr key={emp.id} className={s.row}>
                  <td>
                    <div className={s.empCell}>
                      <div className={s.empAvatar} style={{background:emp.avatar_color+'22',color:emp.avatar_color}}>
                        {emp.full_name[0]}
                      </div>
                      <span className={s.empName}>{emp.full_name}</span>
                    </div>
                  </td>
                  <td><span className={s.empId}>{emp.employee_id}</span></td>
                  <td><span className={s.dept}>{emp.department}</span></td>
                  <td className={s.right}>
                    <div className={s.daysBar}>
                      <div className={s.daysBarFill} style={{width:`${Math.min((emp.present_days/30)*100,100)}%`}}/>
                      <span className={s.daysNum}>{emp.present_days}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.employee_present_days?.length) && (
                <tr><td colSpan={4} className={s.empty}>No employees yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
