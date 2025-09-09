'use client'

import Link from "next/link"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { IoWarning, IoSchool, IoCheckmarkDone, IoStatsChart, IoDocumentText, IoTimer, IoCheckmarkCircle, IoRefresh } from "react-icons/io5"
import { useDashboard } from "@/lib/hooks/useDashboard"

const DashboardContent = () => {
    const { data, loading, error, refresh } = useDashboard()

const getTimeAgo = (dateString: string) => {
        const now = new Date()
        const past = new Date(dateString)
        const diffMs = now.getTime() - past.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        
        if (diffMins < 1) return 'Baru saja'
        if (diffMins < 60) return `${diffMins} menit yang lalu`
        
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} jam yang lalu`
        
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays} hari yang lalu`
    }

const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-red-500'
            case 'PROSES': return 'bg-yellow-500'
            case 'SELESAI': return 'bg-green-500'
            case 'DIBATALKAN': return 'bg-gray-500'
            default: return 'bg-blue-500'
        }
    }

const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Menunggu tindakan'
            case 'PROSES': return 'Dalam proses tindakan'
            case 'SELESAI': return 'Pencatatan selesai'
            case 'DIBATALKAN': return 'Dibatalkan'
            default: return status
        }
    }

    if (error) {
        return (
            <main className="p-6">
                <div className="text-center py-12">
                    <IoWarning className="w-16 h-16 mx-auto text-error mb-4" />
                    <h2 className="text-xl font-semibold text-base-content mb-2">Gagal Memuat Dashboard</h2>
                    <p className="text-base-content/70 mb-4">{error}</p>
                    <button onClick={refresh} className="btn btn-primary">
                        <IoRefresh className="w-4 h-4 mr-2" />
                        Coba Lagi
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-base-content">Dashboard Sekolah Aman</h1>
                    <p className="text-base-content/70 mt-1">Sistem Pencatatan Pelanggaran SMK Taman Siswa 2 Jakarta</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-base-content/60">Hari ini</p>
                    <p className="text-lg font-semibold text-base-content">{new Date().toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="card-title text-lg mb-2">Anak Bermasalah</h2>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-white/20 rounded mb-2 w-16"></div>
                                        <div className="h-4 bg-white/20 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold">{data.summary.problematicStudents}</p>
                                        <p className="text-red-100 text-sm">Perlu perhatian</p>
                                    </>
                                )}
                            </div>
                            <div className="text-white/80">
                                <IoWarning className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="card-title text-lg mb-2">Pelanggaran Tercatat</h2>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-white/20 rounded mb-2 w-16"></div>
                                        <div className="h-4 bg-white/20 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold">{data.summary.violationsThisMonth}</p>
                                        <p className="text-orange-100 text-sm">Bulan ini</p>
                                    </>
                                )}
                            </div>
                            <div className="text-white/80">
                                <IoDocumentText className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="card-title text-lg mb-2">Tindakan Siswa</h2>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-white/20 rounded mb-2 w-16"></div>
                                        <div className="h-4 bg-white/20 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold">{data.summary.ongoingViolations}</p>
                                        <p className="text-yellow-100 text-sm">Dalam proses</p>
                                    </>
                                )}
                            </div>
                            <div className="text-white/80">
                                <IoTimer className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="card-title text-lg mb-2">Pencatatan Selesai</h2>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-white/20 rounded mb-2 w-16"></div>
                                        <div className="h-4 bg-white/20 rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold">{data.summary.completedViolations}</p>
                                        <p className="text-green-100 text-sm">Total tahun ini</p>
                                    </>
                                )}
                            </div>
                            <div className="text-white/80">
                                <IoCheckmarkCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Trend Pelanggaran vs Penyelesaian</h2>
                        <div className="h-80">
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-full bg-slate-200 rounded"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line 
                                            type="monotone" 
                                            dataKey="violations" 
                                            stroke="oklch(var(--er))" 
                                            strokeWidth={3}
                                            name="Pelanggaran"
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="resolved" 
                                            stroke="oklch(var(--su))" 
                                            strokeWidth={3}
                                            name="Selesai"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Distribusi Jenis Pelanggaran</h2>
                        <div className="h-80">
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="h-full bg-slate-200 rounded"></div>
                                </div>
                            ) : data.violationTypes.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.violationTypes}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}%`}
                                        >
                                            {data.violationTypes.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <div className="text-center">
                                        <IoStatsChart className="w-12 h-12 mx-auto mb-2" />
                                        <p>Belum ada data pelanggaran</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Status Proses - Alur Pencatatan Pelanggaran</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="text-center p-4 bg-base-200 rounded-lg animate-pulse">
                                    <div className="h-6 bg-slate-300 rounded mb-2"></div>
                                    <div className="h-8 bg-slate-300 rounded mb-1 w-12 mx-auto"></div>
                                    <div className="h-4 bg-slate-300 rounded mb-2"></div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                        <div className="bg-slate-300 h-2 rounded-full w-1/2"></div>
                                    </div>
                                    <div className="h-3 bg-slate-300 rounded w-8 mx-auto"></div>
                                </div>
                            ))
                        ) : (
                            data.processStatus.map((stage, index) => (
                                <div key={index} className="text-center p-4 bg-base-200 rounded-lg">
                                    <h3 className="font-semibold text-base-content mb-2">{stage.stage}</h3>
                                    <div className="text-3xl font-bold text-primary mb-1">{stage.count}</div>
                                    <div className="text-sm text-base-content/70">Kasus</div>
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all duration-300" 
                                                style={{ width: `${stage.percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-base-content/60 mt-1">{stage.percentage}%</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-4 p-4 bg-info/10 rounded-lg">
                        <p className="text-sm">
                            <strong>Alur Proses:</strong> Anak Bermasalah → Pencatatan Pelanggaran → Tindakan Siswa → Pencatatan Selesai
                        </p>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="card-title text-xl">Aktivitas Terbaru</h2>
                        <button 
                            onClick={refresh} 
                            className="btn btn-ghost btn-sm"
                            disabled={loading}
                        >
                            <IoRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-base-200 rounded-lg animate-pulse">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-300 rounded mb-1"></div>
                                        <div className="h-3 bg-slate-300 rounded w-2/3"></div>
                                    </div>
                                    <div className="h-3 bg-slate-300 rounded w-16"></div>
                                </div>
                            ))
                        ) : data.recentActivities.length > 0 ? (
                            data.recentActivities.slice(0, 5).map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
                                    <div className="flex-1">
                                        <p className="font-medium">{activity.studentName} - {activity.studentClass}</p>
                                        <p className="text-sm text-base-content/70">
                                            {activity.violationType} - {getStatusText(activity.status)}
                                        </p>
                                    </div>
                                    <div className="text-xs text-base-content/60">
                                        {getTimeAgo(activity.updatedAt)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <IoDocumentText className="w-12 h-12 mx-auto mb-3" />
                                <p>Belum ada aktivitas</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <Link href="/cases" className="btn btn-outline btn-sm">
                            Lihat Semua Aktivitas
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default DashboardContent
