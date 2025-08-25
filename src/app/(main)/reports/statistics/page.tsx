'use client'

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const StatisticsPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('semester')
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Data statistik trend tahunan
    const yearlyTrend = [
        { year: '2022', violations: 480, students: 85, resolved: 445 },
        { year: '2023', violations: 520, students: 92, resolved: 485 },
        { year: '2024', violations: 445, students: 78, resolved: 420 },
        { year: '2025', violations: 380, students: 65, resolved: 365 },
    ]

    // Data statistik per semester
    const semesterData = [
        { semester: 'Semester 1 2024', violations: 220, students: 42, resolved: 205 },
        { semester: 'Semester 2 2024', violations: 225, students: 36, resolved: 215 },
        { semester: 'Semester 1 2025', violations: 180, students: 32, resolved: 175 },
        { semester: 'Semester 2 2025', violations: 200, students: 33, resolved: 190 },
    ]

    // Data distribusi pelanggaran by type
    const violationsByType = [
        { type: 'Terlambat', count: 145, percentage: 38, color: '#ef4444', trend: 'menurun' },
        { type: 'Tidak Berseragam', count: 95, percentage: 25, color: '#f97316', trend: 'stabil' },
        { type: 'Membolos', count: 68, percentage: 18, color: '#eab308', trend: 'menurun' },
        { type: 'Gaduh di Kelas', count: 45, percentage: 12, color: '#22c55e', trend: 'meningkat' },
        { type: 'Merokok', count: 15, percentage: 4, color: '#8b5cf6', trend: 'menurun' },
        { type: 'Lainnya', count: 12, percentage: 3, color: '#6b7280', trend: 'stabil' },
    ]

    // Data tingkat kelas
    const classlevelData = [
        { level: 'Kelas X', violations: 165, students: 28, avgPerStudent: 5.9 },
        { level: 'Kelas XI', violations: 125, students: 22, avgPerStudent: 5.7 },
        { level: 'Kelas XII', violations: 90, students: 15, avgPerStudent: 6.0 },
    ]

    // Data radar chart untuk analisis mendalam
    const radarData = [
        { subject: 'Kedisiplinan', A: 65, B: 85, fullMark: 100 },
        { subject: 'Kehadiran', A: 78, B: 90, fullMark: 100 },
        { subject: 'Seragam', A: 72, B: 88, fullMark: 100 },
        { subject: 'Tingkah Laku', A: 80, B: 92, fullMark: 100 },
        { subject: 'Akademik', A: 75, B: 87, fullMark: 100 },
        { subject: 'Ekstrakurikuler', A: 85, B: 95, fullMark: 100 },
    ]

    const currentPeriodData = selectedPeriod === 'semester' ? semesterData : yearlyTrend
    const totalViolations = violationsByType.reduce((sum, item) => sum + item.count, 0)
    const totalStudents = classlevelData.reduce((sum, item) => sum + item.students, 0)

    const handleExportReport = () => {
        console.log('Export comprehensive statistics report')
    }

    const getTrendIcon = (trend: string) => {
        if (trend === 'menurun') {
            return <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
            </svg>
        } else if (trend === 'meningkat') {
            return <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
        } else {
            return <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
            </svg>
        }
    }

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Statistik Pelanggaran
                    </h1>
                    <p className="text-slate-600">Analisis mendalam data pelanggaran siswa dan trend perkembangan</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportReport} className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Export Laporan
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Periode Analisis</label>
                        <select 
                            className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
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
                    <button className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Analisis
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{totalViolations}</p>
                            <p className="text-sm text-slate-600 mt-1">Total Pelanggaran</p>
                            <p className="text-xs text-emerald-600 mt-1">↓ 12% dari periode lalu</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{totalStudents}</p>
                            <p className="text-sm text-slate-600 mt-1">Siswa Bermasalah</p>
                            <p className="text-xs text-emerald-600 mt-1">↓ 8% dari periode lalu</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{(totalViolations/totalStudents).toFixed(1)}</p>
                            <p className="text-sm text-slate-600 mt-1">Rata-rata per Siswa</p>
                            <p className="text-xs text-amber-600 mt-1">→ Stabil</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">96%</p>
                            <p className="text-sm text-slate-600 mt-1">Tingkat Resolusi</p>
                            <p className="text-xs text-emerald-600 mt-1">↑ 3% dari periode lalu</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trend Analysis Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Historis */}
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

                {/* Distribusi Jenis Pelanggaran */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Jenis Pelanggaran</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={violationsByType}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="count"
                                    label={({ type, percentage }) => `${type} ${percentage}%`}
                                    fontSize={10}
                                    stroke="none"
                                >
                                    {violationsByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analisis per Tingkat */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Statistik per Tingkat</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classlevelData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="level" fontSize={12} stroke="#64748b" />
                                <YAxis fontSize={12} stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="violations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart - Analisis Komprehensif */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Analisis Aspek Kedisiplinan</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" fontSize={10} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} />
                                <Radar name="Sebelum" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
                                <Radar name="Sesudah" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Trend Analysis Table */}
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
                            {violationsByType.map((violation, index) => (
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

            {/* Summary & Insights */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Insights & Rekomendasi</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-700">📈 Trend Positif</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Penurunan total pelanggaran 12% YoY</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Peningkatan tingkat resolusi 3%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Penurunan kasus membolos signifikan</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-700">⚠️ Area Fokus</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span>Jurusan RPL masih mendominasi kasus</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span>Kasus gaduh di kelas meningkat</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span>Kelas XII perlu perhatian khusus</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-700">🎯 Rekomendasi</h4>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Program mentoring peer-to-peer</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Workshop manajemen kelas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Sistem reward kedisiplinan</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default StatisticsPage