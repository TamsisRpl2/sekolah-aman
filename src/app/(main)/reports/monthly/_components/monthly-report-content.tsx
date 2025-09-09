'use client'

import { useState } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { IoDownload, IoRefresh, IoBarChart, IoCheckmarkCircle, IoTime, IoPeople, IoTrendingUp, IoSchool, IoStatsChart, IoDocumentText } from "react-icons/io5"
import { useMonthlyReport } from '@/lib/hooks/useMonthlyReport'
import { generateMonthlyReportPDF } from '@/lib/utils/pdf-export-new'

const MonthlyReportContent = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const { reportData, loading, error, refetch } = useMonthlyReport({
        month: selectedMonth,
        year: selectedYear
    })

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const handleRefresh = () => {
        refetch()
    }

    const handleExportPDF = async () => {
        if (reportData) {
            try {
                await generateMonthlyReportPDF(reportData)
            } catch (error) {
                console.error('Error exporting PDF:', error)
                alert('Gagal mengexport PDF. Silakan coba lagi.')
            }
        }
    }

if (loading) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="text-slate-600">Memuat data laporan bulanan...</p>
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

if (!reportData) {
        return (
            <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
                <div className="text-center py-12">
                    <IoDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Data</h3>
                    <p className="text-gray-600">Data laporan untuk periode yang dipilih tidak tersedia.</p>
                </div>
            </main>
        )
    }

    const { monthlyData, violationsByType, violationsByClass, stats } = reportData

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            {}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Laporan Bulanan
                    </h1>
                    <p className="text-slate-600">Laporan pelanggaran siswa periode {monthNames[selectedMonth]} {selectedYear}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExportPDF} 
                        className="btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        disabled={!reportData}
                    >
                        <IoDownload className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Bulan</label>
                        <select 
                            className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {monthNames.map((month, index) => (
                                <option key={index} value={index}>{month}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Tahun</label>
                        <select 
                            className="select bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-sm transition-all duration-200"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                    <button 
                        className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        onClick={handleRefresh}
                    >
                        <IoRefresh className="w-4 h-4" />
                        Update
                    </button>
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.totalViolations}</p>
                            <p className="text-sm text-slate-600 mt-1">Total Pelanggaran</p>
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
                            <p className="text-3xl font-bold text-slate-800">{stats.totalResolved}</p>
                            <p className="text-sm text-slate-600 mt-1">Terselesaikan</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.totalPending}</p>
                            <p className="text-sm text-slate-600 mt-1">Pending</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.totalProblemStudents}</p>
                            <p className="text-sm text-slate-600 mt-1">Siswa Bermasalah</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-slate-800">{stats.avgViolationsPerStudent.toFixed(1)}</p>
                            <p className="text-sm text-slate-600 mt-1">Rata-rata per Siswa</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Trend Pelanggaran per Minggu</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="violationsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                                    </linearGradient>
                                    <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="week" fontSize={12} stroke="#64748b" />
                                <YAxis fontSize={12} stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="violations" stackId="1" stroke="#ef4444" fill="url(#violationsGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#22c55e" fill="url(#resolvedGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Distribusi Jenis Pelanggaran</h3>
                            <p className="text-sm text-slate-600">Persentase dari total {stats.totalViolations} kasus pelanggaran</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {}
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={violationsByType}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="count"
                                        stroke="none"
                                    >
                                        {violationsByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                                        }}
                                        formatter={(value: any, name: any) => [
                                            `${value} kasus`,
                                            'Jumlah'
                                        ]}
                                        labelFormatter={(label: any) => `Jenis: ${label}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-800 mb-4">Keterangan:</h4>
                            {violationsByType.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full" 
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <div>
                                            <p className="font-medium text-slate-800">{item.type}</p>
                                            <p className="text-sm text-slate-600">{item.count} kasus</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-slate-800">{item.percentage}%</p>
                                        <p className="text-xs text-slate-500">dari total</p>
                                    </div>
                                </div>
                            ))}
                            
                            {violationsByType.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    <p>Tidak ada data pelanggaran untuk periode ini</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Pelanggaran per Kelas</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kelas</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Siswa Bermasalah</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Total Pelanggaran</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Rata-rata per Siswa</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kategori</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {violationsByClass.map((classData, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors duration-200">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{classData.class}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{classData.problemStudents} siswa</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{classData.violations} kasus</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{classData.avgViolationsPerStudent.toFixed(1)} kasus</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            classData.avgViolationsPerStudent >= 3.0 
                                                ? 'bg-red-100 text-red-700 border border-red-200' :
                                            classData.avgViolationsPerStudent >= 2.5 
                                                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        }`}>
                                            {classData.avgViolationsPerStudent >= 3.0 ? 'Tinggi' :
                                             classData.avgViolationsPerStudent >= 2.5 ? 'Sedang' : 'Rendah'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Kesimpulan Laporan</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Total pelanggaran pada bulan {monthNames[selectedMonth]} {selectedYear}: <span className="font-semibold text-slate-800">{stats.totalViolations} kasus</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span>Tingkat penyelesaian: <span className="font-semibold text-slate-800">{stats.resolutionRate}%</span></span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Total siswa bermasalah: <span className="font-semibold text-slate-800">{stats.totalProblemStudents} siswa</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>Kelas dengan masalah terbanyak: <span className="font-semibold text-slate-800">{stats.mostProblematicClass}</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default MonthlyReportContent
