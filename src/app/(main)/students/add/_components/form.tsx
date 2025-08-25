const Form = () => {
    return <form>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Foto Siswa*</legend>
                <input type="file" className="file-input w-full" name="photo" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">NIS*</legend>
                <input type="text" className="input w-full" name="nis" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Nama Siswa*</legend>
                <input type="text" className="input w-full" name="name" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Jenis Kelamin*</legend>
                <select defaultValue="Pilih Jenis Kelamin" className="select w-full">
                    <option disabled={true}>Pilih Jenis Kelamin</option>
                    <option>Pria</option>
                    <option>Wanita</option>
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Telp*</legend>
                <input type="tel" className="input w-full" name="telp" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Telp Wali*</legend>
                <input type="tel" className="input w-full" name="telpWali" />
            </fieldset>

            <fieldset className="fieldset col-span-2">
                <legend className="fieldset-legend">Alamat*</legend>
                <textarea className="textarea w-full" name="alamat"></textarea>
            </fieldset>
        </div>

        <div className="flex justify-end mt-5">
            <button type="submit" className="btn btn-primary text-white rounded-lg">Simpan</button>
        </div>
    </form>
}

export default Form