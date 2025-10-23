'use client'

import { useState, useEffect, useTransition } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"
import DynamicAvatar from "@/components/dynamic-avatar"
import { getUserStats } from "../actions"
import { 
    IoPerson, 
    IoMail, 
    IoShield, 
    IoSave, 
    IoCamera,
    IoCalendar,
    IoTime,
    IoEye,
    IoCheckmarkCircle,
    IoWarning
} from "react-icons/io5"

interface UserStats {
    totalCasesReviewed: number
    totalCasesResolved: number
    activeDays: number
    recentCases: Array<{
        id: string
        title: string
        status: string
        createdAt: string
        student: {
            name: string
        }
    }>
}

const ProfileContent = () => {
    const { data: session, status, update } = useSession()
    const [isPending, startTransition] = useTransition()
    const [stats, setStats] = useState<UserStats>({
        totalCasesReviewed: 0,
        totalCasesResolved: 0,
        activeDays: 0,
        recentCases: []
    })
    const [statsLoading, setStatsLoading] = useState(true)
    const [statsError, setStatsError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
    const [profileImage, setProfileImage] = useState('')
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    })

    useEffect(() => {
        if (session?.user?.image) {
            setProfileImage(session.user.image)
        }
    }, [session])

    useEffect(() => {
        if (!session?.user?.id) {
            setStatsLoading(false)
            return
        }

        const loadProfileAndStats = async () => {
            try {
                setStatsLoading(true)
                setStatsError(null)
                
                const { getUserProfile, getUserStats } = await import('../actions')
                
                const [userProfile, userStats] = await Promise.all([
                    getUserProfile(session.user.id),
                    getUserStats(session.user.id)
                ])

                setFormData({
                    name: userProfile.name || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                    address: userProfile.address || ''
                })

                setStats(userStats)
            } catch (error) {
                console.error('Error loading profile and stats:', error)
                setStatsError(error instanceof Error ? error.message : 'Gagal memuat data')
            } finally {
                setStatsLoading(false)
            }
        }

        startTransition(() => {
            loadProfileAndStats()
        })
    }, [session?.user?.id])

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Silakan pilih file gambar yang valid')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB')
            return
        }

        setIsUploadingPhoto(true)
        
        try {
            const formData = new FormData()
            formData.append('photo', file)

            startTransition(async () => {
                try {
                    const { updateProfilePhoto } = await import('../actions')
                    const result = await updateProfilePhoto(formData)
                    
                    if (result.success && result.photoUrl) {
                        setProfileImage(result.photoUrl)
                        setUploadSuccess(true)
                        setTimeout(() => setUploadSuccess(false), 3000)

                        await update({ 
                            ...session, 
                            user: { 
                                ...session?.user, 
                                image: result.photoUrl 
                            } 
                        })

                        setTimeout(() => {
                            window.location.reload()
                        }, 500)
                    }
                } catch (error) {
                    console.error('Error uploading photo:', error)
                    alert(error instanceof Error ? error.message : 'Gagal mengupload foto. Silakan coba lagi.')
                } finally {
                    setIsUploadingPhoto(false)
                }
            })
        } catch (error) {
            console.error('Error preparing upload:', error)
            alert('Gagal mengupload foto. Silakan coba lagi.')
            setIsUploadingPhoto(false)
        }
    }

    const triggerPhotoUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement
            if (target.files?.[0]) {
                handlePhotoUpload(e as any)
            }
        }
        input.click()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = async () => {
        try {
            if (!formData.name.trim()) {
                alert('Nama tidak boleh kosong')
                return
            }

            setIsSaving(true)
            
            startTransition(async () => {
                try {
                    const { updateUserProfile } = await import('../actions')
                    const result = await updateUserProfile({
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address
                    })

                    if (result.success) {
                        setIsEditing(false)
                        setSaveSuccess(true)
                        setTimeout(() => setSaveSuccess(false), 3000)

                        await update({
                            ...session,
                            user: {
                                ...session?.user,
                                name: result.user.name,
                                phone: result.user.phone,
                                address: result.user.address
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error updating profile:', error)
                    alert(error instanceof Error ? error.message : 'Gagal mengupdate profil. Silakan coba lagi.')
                } finally {
                    setIsSaving(false)
                }
            })
        } catch (error) {
            console.error('Error preparing update:', error)
            alert('Gagal mengupdate profil. Silakan coba lagi.')
            setIsSaving(false)
        }
    }

    const getRoleBadge = (role: string) => {
        const roleConfig = {
            'ADMIN': { label: 'Administrator', color: 'bg-red-100 text-red-700 border-red-200' },
            'TEACHER': { label: 'Guru', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            'STAFF': { label: 'Staff', color: 'bg-green-100 text-green-700 border-green-200' }
        }
        
        const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'bg-gray-100 text-gray-700 border-gray-200' }
        
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                {config.label}
            </span>
        )
    }

    if (status === 'loading' || statsLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="text-center py-16">
                <p className="text-lg mb-4">Anda belum login</p>
                <button 
                    onClick={() => signIn()} 
                    className="btn btn-primary"
                >
                    Login
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Profile Pengguna
                        </h1>
                        <p className="text-slate-600">Kelola informasi profil dan preferensi akun Anda</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                        <div className="text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative">
                                    <DynamicAvatar
                                        userId={session?.user?.id}
                                        name={session?.user?.name || ''}
                                        image={profileImage || session?.user?.image}
                                        size="xl"
                                        className="border-0"
                                    />
                                    {isUploadingPhoto && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                                            <div className="loading loading-spinner loading-sm text-white"></div>
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={triggerPhotoUpload}
                                    disabled={isUploadingPhoto}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                                    title="Ganti foto profile"
                                >
                                    {isUploadingPhoto ? (
                                        <div className="loading loading-spinner loading-xs text-white"></div>
                                    ) : (
                                        <IoCamera className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">{session?.user?.name}</h3>
                            
                            {}
                            {uploadSuccess && (
                                <div className="mb-3 p-2 bg-green-100 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-700 flex items-center gap-2">
                                        <IoCheckmarkCircle className="w-4 h-4" />
                                        Foto profile berhasil diupdate!
                                    </p>
                                </div>
                            )}
                            
                            <div className="mb-3">
                                {getRoleBadge(session?.user?.role || '')}
                            </div>
                            <p className="text-sm text-slate-600 mb-4">{session?.user?.email}</p>
                            
                            {}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Status</span>
                                    <span className="flex items-center gap-1 text-green-600">
                                        <IoCheckmarkCircle className="w-4 h-4" />
                                        Aktif
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Bergabung</span>
                                    <span className="text-slate-700">Jan 2024</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Last Login</span>
                                    <span className="text-slate-700">Hari ini</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <IoPerson className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800">Informasi Personal</h3>
                            </div>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className="btn btn-sm bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 border-0 text-white rounded-lg"
                            >
                                {isEditing ? 'Batal' : 'Edit'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                                <div className="relative">
                                    <IoPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="input w-full pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl disabled:bg-slate-50"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <IoMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="input w-full pl-10 bg-slate-50 border-slate-200 rounded-xl text-slate-600"
                                        placeholder="Masukkan email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">No. Telepon</label>
                                <input 
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="input w-full bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl disabled:bg-slate-50"
                                    placeholder="Masukkan nomor telepon"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <div className="relative">
                                    <IoShield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        value={session?.user?.role === 'ADMIN' ? 'Administrator' : 'Guru'}
                                        disabled
                                        className="input w-full pl-10 bg-slate-50 border-slate-200 rounded-xl text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Alamat</label>
                                <textarea 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="textarea w-full bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl disabled:bg-slate-50"
                                    placeholder="Masukkan alamat lengkap"
                                />
                            </div>
                        </div>

                        {saveSuccess && (
                            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700 flex items-center gap-2">
                                    <IoCheckmarkCircle className="w-4 h-4" />
                                    Profil berhasil diupdate!
                                </p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                    className="btn bg-slate-200 hover:bg-slate-300 border-0 text-slate-700 rounded-xl disabled:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white rounded-xl disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <IoSave className="w-4 h-4" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <IoTime className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Statistik Aktivitas</h3>
                </div>

                {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center p-4 bg-slate-100 rounded-xl animate-pulse">
                                <div className="w-12 h-12 bg-slate-300 rounded-lg mx-auto mb-3"></div>
                                <div className="h-8 bg-slate-300 rounded mb-2"></div>
                                <div className="h-4 bg-slate-300 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : statsError ? (
                    <div className="text-center p-8 text-slate-500">
                        <IoWarning className="w-12 h-12 mx-auto mb-3 text-amber-500" />
                        <p>Gagal memuat statistik</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                    <IoEye className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{stats.totalCasesReviewed}</div>
                                <div className="text-sm text-slate-600">Kasus Ditangani</div>
                            </div>

                            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                                <div className="w-12 h-12 bg-emerald-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                    <IoCheckmarkCircle className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">{stats.totalCasesResolved}</div>
                                <div className="text-sm text-slate-600">Kasus Diselesaikan</div>
                            </div>

                            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                                <div className="w-12 h-12 bg-amber-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                    <IoCalendar className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-amber-600">{stats.activeDays}</div>
                                <div className="text-sm text-slate-600">Hari Aktif</div>
                            </div>
                        </div>

                        {}
                        {stats.recentCases.length > 0 && (
                            <div className="border-t border-slate-200 pt-6">
                                <h4 className="text-md font-semibold text-slate-700 mb-4">Kasus Terbaru</h4>
                                <div className="space-y-3">
                                    {stats.recentCases.slice(0, 3).map((case_) => (
                                        <div key={case_.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                            <div className={`w-3 h-3 rounded-full ${
                                                case_.status === 'RESOLVED' ? 'bg-emerald-500' :
                                                case_.status === 'ONGOING' ? 'bg-amber-500' : 'bg-red-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-800 text-sm">{case_.title}</div>
                                                <div className="text-xs text-slate-500">Student: {case_.student.name}</div>
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(case_.createdAt).toLocaleDateString('id-ID')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            </div>
        </div>
    )
}

export default ProfileContent
