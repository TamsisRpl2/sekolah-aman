'use client'

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, Legend } from 'recharts'
import { 
    IoTrendingUp, 
    IoTrendingDown, 
    IoRemove, 
    IoEye, 
    IoChevronDown, 
    IoStatsChart, 
    IoSchool, 
    IoCheckmarkDone, 
    IoWarning,
    IoPerson,
    IoAlert,
    IoAlarm,
    IoDocument,
    IoTime,
    IoRefresh
} from "react-icons/io5"
import { getStatistics } from '../actions'

const StatisticsContent = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'semester' | 'year' | 'month'>('year')
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await getStatistics({ period: selectedPeriod, year: selectedYear })
            if (result.success) {
                setData(result.data)
            } else {
                setError(result.error || 'Failed to fetch statistics')
            }
        } catch (err) {
            setError('Failed to fetch statistics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [selectedPeriod, selectedYear])

    const handleRefresh = () => {
        fetchData()
    }

    const getTrendIcon = (trend: string) => {
        if (trend === 'menurun') {
            return <IoTrendingDown className="w-4 h-4 text-green-500" />
        } else if (trend === 'meningkat') {
            return <IoTrendingUp className="w-4 h-4 text-red-500" />
        } else {
            return <IoRemove className="w-4 h-4 text-gray-500" />
        }
    }

    const formatTrendText = (value: number) => {
        if (value > 0) return `↑ ${value}% dari periode lalu`
        if (value < 0) return `↓ ${Math.abs(value)}% dari periode lalu`
        return '→ Stabil'
    }

    const getTrendColor = (value: number) => {
        if (value > 0) return 'text-red-600'
        if (value < 0) return 'text-emerald-600'
        return 'text-amber-600'
    }

    if (loading) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-slate-600">Memuat data statistik...</p>
                    </div>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="alert alert-error">
                    <span>Error: {error}</span>
                    <button className="btn btn-sm" onClick={handleRefresh}>
                        <IoRefresh className="w-4 h-4" />
                        Coba Lagi
                    </button>
                </div>
            </main>
        )
    }

    if (!data) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="text-center py-12">
                    <IoStatsChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Data</h3>
                    <p className="text-gray-600">Data statistik untuk periode yang dipilih tidak tersedia.</p>
                </div>
            </main>
        )
    }

    const { overview, yearlyTrend, semesterData, violationsByType, classlevelData, monthlyData, topViolationCategories } = data
    const currentPeriodData = selectedPeriod === 'semester' ? semesterData : selectedPeriod === 'year' ? yearlyTrend : monthlyData

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Statistik Pelanggaran
                    </h1>
                    <p className="text-slate-600">Analisis mendalam data pelanggaran siswa dan trend perkembangan</p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Periode Analisis</label>
                        <select 
                            className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value as 'semester' | 'year' | 'month')}
                        >
                            <option value="month">Per Bulan</option>
                            <option value="semester">Per Semester</option>
                            <option value="year">Per Tahun</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Tahun Akademik</label>
                        <select 
                            className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            <option value={2023}>2023/2024</option>
                            <option value={2024}>2024/2025</option>
                            <option value={2025}>2025/2026</option>
                        </select>
                    </div>
                    <button 
                        className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        onClick={handleRefresh}
                    >
                        <IoRefresh className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{data?.overview.totalViolations || 0}</p>
                            <p className="text-sm text-slate-600 mt-1">Total Pelanggaran</p>
                            <p className="text-xs text-emerald-600 mt-1">
                                {data?.overview.monthlyChange !== undefined && (
                                    <>
                                        {data.overview.monthlyChange > 0 ? '↑' : '↓'} {Math.abs(data.overview.monthlyChange)}% dari periode lalu
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoWarning className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{data?.overview.activeStudents || 0}</p>
                            <p className="text-sm text-slate-600 mt-1">Siswa Bermasalah</p>
                            <p className="text-xs text-emerald-600 mt-1">dari {data?.overview.totalStudents || 0} total siswa</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoSchool className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{data?.overview.averagePerDay || 0}</p>
                            <p className="text-sm text-slate-600 mt-1">Rata-rata per Hari</p>
                            <p className="text-xs text-amber-600 mt-1">pelanggaran harian</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoStatsChart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">
                                {data?.overview.totalViolations && data?.overview.resolvedCases 
                                    ? Math.round((data.overview.resolvedCases / data.overview.totalViolations) * 100) 
                                    : 0}%
                            </p>
                            <p className="text-sm text-slate-600 mt-1">Tingkat Resolusi</p>
                            <p className="text-xs text-emerald-600 mt-1">{data?.overview.resolvedCases || 0} kasus selesai</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <IoCheckmarkDone className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Trend {selectedPeriod === 'semester' ? 'Semester' : 'Tahunan'}</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={currentPeriodData}>
                                <defs>
                                    <linearGradient id="violationsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey={selectedPeriod === 'semester' ? 'semester' : 'year'} fontSize={12} stroke="#64748b" />
                                <YAxis fontSize={12} stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="violations" stroke="#ef4444" fill="url(#violationsGradient)" strokeWidth={3} />
                                <Line type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Distribusi Jenis Pelanggaran</h3>
                            <p className="text-sm text-slate-600">Persentase kasus berdasarkan kategori pelanggaran</p>
                        </div>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.violationsByType || []}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="count"
                                    label={({ type, percentage }: any) => `${type} ${percentage}%`}
                                    fontSize={10}
                                    stroke="none"
                                >
                                    {(data?.violationsByType || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any, name: string) => [
                                        `${value} kasus`,
                                        'Jumlah Kasus'
                                    ]}
                                    labelFormatter={(label: string) => `Kategori: ${label}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {data?.violationsByType && data.violationsByType.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 px-2 font-medium text-slate-700">Kategori</th>
                                        <th className="text-center py-2 px-2 font-medium text-slate-700">Jumlah</th>
                                        <th className="text-center py-2 px-2 font-medium text-slate-700">Persentase</th>
                                        <th className="text-center py-2 px-2 font-medium text-slate-700">Warna</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.violationsByType.map((item: any, index: number) => (
                                        <tr key={index} className="border-b border-slate-100">
                                            <td className="py-2 px-2 text-slate-800">{item.type}</td>
                                            <td className="py-2 px-2 text-center text-slate-700">{item.count}</td>
                                            <td className="py-2 px-2 text-center text-slate-700">{item.percentage}%</td>
                                            <td className="py-2 px-2 text-center">
                                                <div 
                                                    className="w-4 h-4 rounded mx-auto border border-slate-300"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Statistik per Tingkat Kelas</h3>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.classlevelData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="level" 
                                fontSize={12} 
                                stroke="#64748b"
                                tick={{ fill: '#64748b' }}
                            />
                            <YAxis 
                                fontSize={12} 
                                stroke="#64748b"
                                tick={{ fill: '#64748b' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: 'none', 
                                    borderRadius: '12px', 
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                                }} 
                            />
                            <Legend />
                            <Bar 
                                dataKey="violations" 
                                name="Jumlah Pelanggaran"
                                fill="#3b82f6" 
                                radius={[4, 4, 0, 0]} 
                            />
                            <Bar 
                                dataKey="students" 
                                name="Siswa Terlibat"
                                fill="#10b981" 
                                radius={[4, 4, 0, 0]} 
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Trend Jenis Pelanggaran</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Jenis Pelanggaran</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Jumlah Kasus</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Persentase</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Trend</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(data?.violationsByType || []).map((violation: any, index: number) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors duration-200">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: violation.color }}></div>
                                            {violation.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{violation.count} kasus</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{violation.percentage}%</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(violation.trend)}
                                            <span className="text-sm text-slate-600 capitalize">{violation.trend}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            violation.trend === 'menurun' 
                                                ? 'bg-green-100 text-green-700 border border-green-200' :
                                            violation.trend === 'meningkat' 
                                                ? 'bg-red-100 text-red-700 border border-red-200'
                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}>
                                            {violation.trend === 'menurun' ? 'Membaik' :
                                             violation.trend === 'meningkat' ? 'Perlu Perhatian' : 'Stabil'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}

export default StatisticsContent
