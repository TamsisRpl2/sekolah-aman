const Feature = () => {
    return <div className="py-20 bg-base-200">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-base-content mb-4">Fitur Unggulan</h2>
                <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                    Solusi komprehensif untuk mengelola kedisiplinan siswa dengan teknologi modern
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body">
                        <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <h3 className="card-title text-xl mb-2">Pencatatan Cepat</h3>
                        <p className="text-base-content/70">
                            Input pelanggaran dengan mudah dan cepat melalui form yang user-friendly dan responsif.
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body">
                        <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 className="card-title text-xl mb-2">Dashboard Interaktif</h3>
                        <p className="text-base-content/70">
                            Visualisasi data yang informatif dengan grafik dan statistik real-time untuk monitoring yang efektif.
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body">
                        <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 className="card-title text-xl mb-2">Verifikasi BK</h3>
                        <p className="text-base-content/70">
                            Sistem persetujuan berlapis dengan verifikasi dari Bimbingan Konseling untuk akurasi data.
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body">
                        <div className="w-16 h-16 bg-success/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM7 7h.01M7 3h5l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
                            </svg>
                        </div>
                        <h3 className="card-title text-xl mb-2">Laporan Otomatis</h3>
                        <p className="text-base-content/70">
                            Generate laporan komprehensif secara otomatis dengan format yang dapat disesuaikan.
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body">
                        <div className="w-16 h-16 bg-warning/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19l2-7 7 2-7 7-2-2z"></path>
                            </svg>
                        </div>
                        <h3 className="card-title text-xl mb-2">Notifikasi Real-time</h3>
                        <p className="text-base-content/70">
                            Sistem notifikasi otomatis untuk wali kelas, orang tua, dan pihak terkait.
                        </p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="card-body">
                        <div className="w-16 h-16 bg-info/20 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <h3 className="card-title text-xl mb-2">Keamanan Data</h3>
                        <p className="text-base-content/70">
                            Proteksi data siswa dengan enkripsi tingkat tinggi dan sistem backup otomatis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default Feature