import Image from "next/image"
import dynamic from "next/dynamic"
import { Metadata } from "next"
import { IoCheckmarkCircle } from "react-icons/io5"
import { AuthGuard } from "@/components/auth-guard"

export const metadata: Metadata = {
    title: "Sign In - Sekolah Aman",
    description: "Sign in to your Sekolah Aman account",
}

const SigninForm = dynamic(() => import('./_components/form'))
const page = () => {
    return (
        <AuthGuard requireAuth={false}>
            <main className="min-h-screen bg-white">
                <div className="grid lg:grid-cols-2 min-h-screen">
                    <div className="flex items-center justify-center px-8 py-12 lg:px-16 lg:py-20">
                        <div className="w-full max-w-md">
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-8">
                                    <Image 
                                        src="/logo.png" 
                                        alt="Logo Sekolah Aman" 
                                        width={40} 
                                        height={40} 
                                        className="w-10 h-10"
                                    />
                                    <span className="text-2xl font-bold text-primary">Sekolah Aman</span>
                                </div>
                                
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in</h1>
                            </div>

                            <SigninForm />
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-16">
                        <div className="text-center text-white max-w-md">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                        <IoCheckmarkCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Sistem Pencatatan Terintegrasi</h3>
                                    <p className="text-white/90 text-sm leading-relaxed">
                                        Kelola data pelanggaran siswa dengan mudah dan akurat. 
                                        Dashboard yang user-friendly untuk monitoring real-time.
                                    </p>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="flex">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                        <div className="w-2 h-2 bg-white/60 rounded-full ml-1"></div>
                                        <div className="w-2 h-2 bg-white/30 rounded-full ml-1"></div>
                                    </div>
                                    <span className="text-2xl font-bold">SMK Taman Siswa 2</span>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h2 className="text-2xl font-bold mb-4">Platform Digital Terdepan</h2>
                                <p className="text-white/80 leading-relaxed">
                                    Sistem pencatatan pelanggaran yang modern, aman, dan terpercaya 
                                    untuk mendukung kedisiplinan siswa di era digital.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </AuthGuard>
    )
}

export default page