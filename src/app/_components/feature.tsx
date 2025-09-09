import { 
    IoDocument, 
    IoBarChart, 
    IoCheckmarkCircle, 
    IoDocumentText, 
    IoNotifications, 
    IoShield 
} from "react-icons/io5"

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
                            <IoDocument className="w-8 h-8 text-primary" />
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
                            <IoBarChart className="w-8 h-8 text-secondary" />
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
                            <IoCheckmarkCircle className="w-8 h-8 text-accent" />
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
                            <IoDocumentText className="w-8 h-8 text-success" />
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
                            <IoNotifications className="w-8 h-8 text-warning" />
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
                            <IoShield className="w-8 h-8 text-info" />
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