'use client'

import { useState, useTransition } from "react"
import { useSession, signOut } from "next-auth/react"
import { 
    IoShield,
    IoKey,
    IoEye,
    IoEyeOff,
    IoSettings,
    IoLogOut,
    IoTrash,
    IoWarning,
    IoCheckmarkCircle
} from "react-icons/io5"

const SettingsContent = () => {
    const { data: session } = useSession()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState('account')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        })
        setPasswordError('')
        setPasswordSuccess(false)
    }

    const handleChangePassword = async () => {
        try {
            setPasswordError('')
            setPasswordSuccess(false)

            if (!passwordForm.currentPassword) {
                setPasswordError('Password saat ini harus diisi')
                return
            }

            if (!passwordForm.newPassword) {
                setPasswordError('Password baru harus diisi')
                return
            }

            if (passwordForm.newPassword.length < 8) {
                setPasswordError('Password baru minimal 8 karakter')
                return
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordError('Password baru dan konfirmasi password tidak sama')
                return
            }

            if (passwordForm.currentPassword === passwordForm.newPassword) {
                setPasswordError('Password baru tidak boleh sama dengan password saat ini')
                return
            }

            setIsChangingPassword(true)

            startTransition(async () => {
                try {
                    const { changePassword } = await import('../actions')
                    const result = await changePassword({
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword
                    })

                    if (result.success) {
                        setPasswordSuccess(true)
                        setPasswordForm({ 
                            currentPassword: '', 
                            newPassword: '', 
                            confirmPassword: '' 
                        })
                        setShowCurrentPassword(false)
                        setShowNewPassword(false)
                        setShowConfirmPassword(false)

                        setTimeout(() => {
                            setPasswordSuccess(false)
                        }, 5000)
                    }
                } catch (error) {
                    console.error('Error changing password:', error)
                    setPasswordError(error instanceof Error ? error.message : 'Gagal mengubah password')
                } finally {
                    setIsChangingPassword(false)
                }
            })
        } catch (error) {
            console.error('Error preparing password change:', error)
            setPasswordError('Terjadi kesalahan. Silakan coba lagi.')
            setIsChangingPassword(false)
        }
    }

    const handleLogoutAllDevices = async () => {
        if (confirm('Yakin ingin logout dari semua perangkat?')) {
            await signOut({ callbackUrl: "/auth/signin" })
        }
    }

    const tabs = [
        { id: 'account', label: 'Akun', icon: IoSettings },
        { id: 'security', label: 'Keamanan', icon: IoShield }
    ]

    return (
        <main className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
            {}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Pengaturan
                    </h1>
                    <p className="text-slate-600">Kelola pengaturan akun dan keamanan</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {}
                <div className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                                : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {}
                <div className="lg:col-span-3">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
                        {}
                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                                        <IoSettings className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800">Informasi Akun</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                                            <input 
                                                type="text"
                                                value={session?.user?.name || ''}
                                                disabled
                                                className="input w-full bg-slate-50 border-slate-200 rounded-xl text-slate-600"
                                            />
                                            <p className="text-xs text-slate-500">Hubungi admin untuk mengubah nama</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email</label>
                                            <input 
                                                type="email"
                                                value={session?.user?.email || ''}
                                                disabled
                                                className="input w-full bg-slate-50 border-slate-200 rounded-xl text-slate-600"
                                            />
                                            <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Role</label>
                                            <input 
                                                type="text"
                                                value={session?.user?.role === 'ADMIN' ? 'Administrator' : 'Guru'}
                                                disabled
                                                className="input w-full bg-slate-50 border-slate-200 rounded-xl text-slate-600"
                                            />
                                            <p className="text-xs text-slate-500">Role ditentukan oleh sistem</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Status Akun</label>
                                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                                <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-700 font-medium">Aktif</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <h4 className="font-medium text-blue-800 mb-2">Informasi</h4>
                                        <p className="text-sm text-blue-700">
                                            Data akun Anda dikelola oleh administrator sistem. 
                                            Untuk mengubah informasi personal, silakan hubungi admin sekolah.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                        <IoShield className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800">Pengaturan Keamanan</h3>
                                </div>

                                <div className="space-y-6">
                                    {}
                                    <div className="p-6 border border-slate-200 bg-slate-50 rounded-xl">
                                        <h4 className="font-medium text-slate-800 mb-4">Ganti Password</h4>
                                        
                                        {passwordSuccess && (
                                            <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                                                <p className="text-sm text-green-700 flex items-center gap-2">
                                                    <IoCheckmarkCircle className="w-4 h-4" />
                                                    Password berhasil diubah! Gunakan password baru Anda saat login berikutnya.
                                                </p>
                                            </div>
                                        )}

                                        {passwordError && (
                                            <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-700 flex items-center gap-2">
                                                    <IoWarning className="w-4 h-4" />
                                                    {passwordError}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Password Saat Ini</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        name="currentPassword"
                                                        value={passwordForm.currentPassword}
                                                        onChange={handlePasswordChange}
                                                        disabled={isChangingPassword}
                                                        className="input w-full pr-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl disabled:bg-slate-50 disabled:cursor-not-allowed"
                                                        placeholder="Masukkan password saat ini"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        disabled={isChangingPassword}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                                                    >
                                                        {showCurrentPassword ? <IoEyeOff className="w-4 h-4" /> : <IoEye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Password Baru</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showNewPassword ? "text" : "password"}
                                                        name="newPassword"
                                                        value={passwordForm.newPassword}
                                                        onChange={handlePasswordChange}
                                                        disabled={isChangingPassword}
                                                        className="input w-full pr-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl disabled:bg-slate-50 disabled:cursor-not-allowed"
                                                        placeholder="Masukkan password baru (min. 8 karakter)"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        disabled={isChangingPassword}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                                                    >
                                                        {showNewPassword ? <IoEyeOff className="w-4 h-4" /> : <IoEye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                        disabled={isChangingPassword}
                                                        className="input w-full pr-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl disabled:bg-slate-50 disabled:cursor-not-allowed"
                                                        placeholder="Konfirmasi password baru"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        disabled={isChangingPassword}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                                                    >
                                                        {showConfirmPassword ? <IoEyeOff className="w-4 h-4" /> : <IoEye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handleChangePassword}
                                                disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                                className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isChangingPassword ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-sm"></span>
                                                        Mengubah Password...
                                                    </>
                                                ) : (
                                                    <>
                                                        <IoKey className="w-4 h-4" />
                                                        Ganti Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {}
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <h4 className="font-medium text-amber-800 mb-2">Tips Keamanan</h4>
                                        <ul className="text-sm text-amber-700 space-y-1">
                                            <li>• Gunakan password minimal 8 karakter</li>
                                            <li>• Kombinasikan huruf besar, kecil, angka dan simbol</li>
                                            <li>• Jangan gunakan password yang sama dengan akun lain</li>
                                            <li>• Ganti password secara berkala</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-red-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                        <IoWarning className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800">Zona Berbahaya</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                        <h4 className="font-medium text-red-800 mb-2">Logout Semua Perangkat</h4>
                        <p className="text-sm text-red-700 mb-3">Keluar dari semua perangkat yang terhubung</p>
                        <button 
                            onClick={handleLogoutAllDevices}
                            className="btn btn-sm bg-red-600 hover:bg-red-700 border-0 text-white rounded-lg"
                        >
                            <IoLogOut className="w-4 h-4" />
                            Logout All
                        </button>
                    </div>

                    <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                        <h4 className="font-medium text-red-800 mb-2">Hapus Akun</h4>
                        <p className="text-sm text-red-700 mb-3">Hubungi admin untuk menghapus akun</p>
                        <button 
                            className="btn btn-sm bg-slate-400 border-0 text-white rounded-lg cursor-not-allowed"
                            disabled
                        >
                            <IoTrash className="w-4 h-4" />
                            Contact Admin
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default SettingsContent
