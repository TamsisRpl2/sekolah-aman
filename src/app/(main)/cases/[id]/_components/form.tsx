import dynamic from "next/dynamic"

const Combobox = dynamic(() => import('@/components/combobox'))

const Form = () => {
    return <form>
        <div className="grid grid-cols-2 gap-6">
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Nama Siswa</legend>
                <Combobox />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Kelas</legend>
                <select name="" id="" className="select w-full">
                    <option value="">Pilih Kelas</option>
                    <option value="kelas-1">Kelas 1</option>
                    <option value="kelas-2">Kelas 2</option>
                    <option value="kelas-3">Kelas 3</option>
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Jurusan</legend>
                <select name="" id="" className="select w-full">
                    <option value="">Pilih Jurusan</option>
                    <option value="jurusan-1">Jurusan 1</option>
                    <option value="jurusan-2">Jurusan 2</option>
                    <option value="jurusan-3">Jurusan 3</option>
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Jenis Pelanggaran</legend>
                <select name="" id="" className="select w-full">
                    <option value="">Pilih Jenis Pelanggaran</option>
                    <option value="jenis-1">Jenis 1</option>
                    <option value="jenis-2">Jenis 2</option>
                    <option value="jenis-3">Jenis 3</option>
                </select>
            </fieldset>

            <fieldset className="fieldset col-span-2">
                <legend className="fieldset-legend">Deskripsi Pelanggaran</legend>
                <textarea placeholder="Deskripsikan pelanggaran yang dilakukan siswa" className="textarea w-full"></textarea>
            </fieldset>
        </div>

        <div className="mt-5 flex justify-end">
            <button type="submit" className="btn btn-primary rounded-lg text-white">Simpan</button>
        </div>
    </form>
}

export default Form