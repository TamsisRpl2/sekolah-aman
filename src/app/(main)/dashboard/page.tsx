'use client'

import Link from "next/link"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
    const monthlyViolationsData = [
        { month: 'Jan', violations: 45, resolved: 42 },
        { month: 'Feb', violations: 52, resolved: 48 },
        { month: 'Mar', violations: 38, resolved: 35 },
        { month: 'Apr', violations: 61, resolved: 58 },
        { month: 'May', violations: 35, resolved: 33 },
        { month: 'Jun', violations: 28, resolved: 26 },
    ]

    const violationTypesData = [
        { name: 'Terlambat', value: 35, color: '#ef4444' },
        { name: 'Tidak Berseragam', value: 25, color: '#f97316' },
        { name: 'Membolos', value: 20, color: '#eab308' },
        { name: 'Gaduh di Kelas', value: 15, color: '#22c55e' },
        { name: 'Lainnya', value: 5, color: '#6366f1' },
    ]

    const processStatusData = [
        { stage: 'Anak Bermasalah', count: 12, percentage: 100 },
        { stage: 'Pelanggaran Tercatat', count: 10, percentage: 83 },
        { stage: 'Tindakan Siswa', count: 8, percentage: 67 },
        { stage: 'Pencatatan Selesai', count: 6, percentage: 50 },
    ]

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
                                <p className="text-3xl font-bold">12</p>
                                <p className="text-red-100 text-sm">Perlu perhatian</p>
                            </div>
                            <div className="text-white/80">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="card-title text-lg mb-2">Pelanggaran Tercatat</h2>
                                <p className="text-3xl font-bold">28</p>
                                <p className="text-orange-100 text-sm">Bulan ini</p>
                            </div>
                            <div className="text-white/80">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="card-title text-lg mb-2">Tindakan Siswa</h2>
                                <p className="text-3xl font-bold">15</p>
                                <p className="text-yellow-100 text-sm">Dalam proses</p>
                            </div>
                            <div className="text-white/80">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="card-title text-lg mb-2">Pencatatan Selesai</h2>
                                <p className="text-3xl font-bold">142</p>
                                <p className="text-green-100 text-sm">Total tahun ini</p>
                            </div>
                            <div className="text-white/80">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
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
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyViolationsData}>
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
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Distribusi Jenis Pelanggaran</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={violationTypesData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}%`}
                                    >
                                        {violationTypesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">Status Proses - Alur Pencatatan Pelanggaran</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {processStatusData.map((stage, index) => (
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
                        ))}
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
                    <h2 className="card-title text-xl mb-4">Aktivitas Terbaru</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="font-medium">Ahmad Ridho - XI RPL 1</p>
                                <p className="text-sm text-base-content/70">Terlambat masuk kelas - Menunggu tindakan</p>
                            </div>
                            <div className="text-xs text-base-content/60">2 menit yang lalu</div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="font-medium">Siti Aminah - X TKJ 2</p>
                                <p className="text-sm text-base-content/70">Tidak berseragam lengkap - Dalam proses tindakan</p>
                            </div>
                            <div className="text-xs text-base-content/60">15 menit yang lalu</div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                                <p className="font-medium">Budi Santoso - XII MM 1</p>
                                <p className="text-sm text-base-content/70">Membolos pelajaran - Pencatatan selesai</p>
                            </div>
                            <div className="text-xs text-base-content/60">1 jam yang lalu</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link href="/cases/list" className="btn btn-outline btn-sm">
                            Lihat Semua Aktivitas
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Dashboard