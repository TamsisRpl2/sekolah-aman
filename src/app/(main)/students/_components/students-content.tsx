'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Student } from '@/types/student'
import Avatar from '@/components/avatar'
import Pagination from '@/components/pagination'
import { IoAdd, IoSearch, IoEye, IoCreate, IoTrash, IoSchool, IoPeople, IoMale, IoFemale } from "react-icons/io5"
import { getStudents, deleteStudent, getStudentStats } from '../actions'

export default function StudentsContent() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    recentStudents: 0
  })
  const [isPending, startTransition] = useTransition()
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const classLevel = searchParams.get('class') || ''
  const gender = searchParams.get('gender') || ''
  const limit = 12

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        classLevel: classLevel || undefined,
        gender: gender || undefined
      }
      
      const [studentsData, statsData] = await Promise.all([
        getStudents(params),
        getStudentStats()
      ])
      
      setStudents(studentsData.students)
      setTotal(studentsData.pagination.total)
      setTotalPages(studentsData.pagination.totalPages)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [page, search, classLevel, gender])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa ${name}?`)) {
      return
    }

    startTransition(async () => {
      try {
        await deleteStudent(id)
        alert('Siswa berhasil dihapus')
        fetchStudents()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal menghapus siswa')
      }
    })
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    
    const params = new URLSearchParams(searchParams)
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    
    router.push(`/students?${params.toString()}`)
  }

  const handleClassFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classLevel = e.target.value
    
    const params = new URLSearchParams(searchParams)
    if (classLevel) {
      params.set('class', classLevel)
    } else {
      params.delete('class')
    }
    params.set('page', '1')
    
    router.push(`/students?${params.toString()}`)
  }

  const handleGenderFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gender = e.target.value
    
    const params = new URLSearchParams(searchParams)
    if (gender) {
      params.set('gender', gender)
    } else {
      params.delete('gender')
    }
    params.set('page', '1')
    
    router.push(`/students?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Siswa</h1>
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Siswa</h1>
            <p className="text-gray-600">Kelola data siswa dan informasi akademik</p>
          </div>
          <Link 
            href="/students/add" 
            className="btn bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
          >
            <IoAdd className="w-5 h-5" />
            Tambah Siswa
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Siswa</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <IoSchool className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100">Laki-laki</p>
              <p className="text-3xl font-bold">{stats.maleStudents}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <IoMale className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Perempuan</p>
              <p className="text-3xl font-bold">{stats.femaleStudents}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <IoFemale className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Siswa Aktif</p>
              <p className="text-3xl font-bold">{stats.activeStudents}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <IoPeople className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                name="search"
                placeholder="Cari siswa berdasarkan nama atau NIS..."
                className="input input-bordered w-full pl-10 rounded-xl"
                defaultValue={search}
              />
            </div>
          </div>
          <select 
            className="select select-bordered rounded-xl"
            value={classLevel}
            onChange={handleClassFilter}
          >
            <option value="">Semua Kelas</option>
            <option value="10">Kelas 10</option>
            <option value="11">Kelas 11</option>
            <option value="12">Kelas 12</option>
          </select>
          <select 
            className="select select-bordered rounded-xl"
            value={gender}
            onChange={handleGenderFilter}
          >
            <option value="">Semua Jenis Kelamin</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
          <button type="submit" className="btn btn-primary rounded-xl">
            <IoSearch className="w-5 h-5" />
            Cari
          </button>
        </form>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-500 mb-4">
            <IoSchool className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada siswa ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            {search || classLevel || gender
              ? 'Coba ubah filter pencarian Anda'
              : 'Mulai dengan menambahkan siswa baru'
            }
          </p>
          {!search && !classLevel && !gender && (
            <Link href="/students/add" className="btn btn-primary">
              Tambah Siswa Pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar 
                      name={student?.name}
                      size="lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {student.major && `${student.major}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {student.gender === 'L' ? (
                        <IoMale className="w-4 h-4 text-blue-500" />
                      ) : (
                        <IoFemale className="w-4 h-4 text-pink-500" />
                      )}
                      <span className="text-xs text-gray-500">NIS: {student.nis}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {student.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-16">Telp:</span>
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.parentName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-16">Wali:</span>
                      <span>
                        {student.parentName}
                        {student.parentPhone && ` (${student.parentPhone})`}
                      </span>
                    </div>
                  )}
                  {student.address && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Alamat:</span>
                      <p className="text-xs mt-1 line-clamp-2">{student.address}</p>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">TA:</span>
                    <span className="ml-1">{student.academicYear}</span>
                  </div>
                </div>

                {!student.isActive && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                    <p className="text-xs text-red-600 font-medium">
                      Status: Tidak Aktif
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link 
                    href={`/students/${student.id}`}
                    className="btn btn-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 hover:border-emerald-300 rounded-lg flex-1"
                  >
                    <IoEye className="w-4 h-4" />
                    Detail
                  </Link>
                  <button 
                    onClick={() => handleDelete(student.id, student.name)}
                    className="btn btn-sm bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 rounded-lg"
                  >
                    <IoTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-medium">{((page - 1) * limit) + 1}-{Math.min(page * limit, total)}</span> dari <span className="font-medium">{total}</span> siswa
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage: number) => {
                const params = new URLSearchParams(searchParams)
                params.set('page', newPage.toString())
                router.push(`/students?${params.toString()}`)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

