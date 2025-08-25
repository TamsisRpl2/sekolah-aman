const Form = () => {
    return <form>
        <div role="alert" className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>New software update available.</span>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-5">
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Foto Tindakan</legend>
                <input type="file" className="file-input w-full" placeholder="Masukkan nama tindakan" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Nama Tindakan</legend>
                <input type="text" className="input w-full" placeholder="Masukkan nama tindakan" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Tanggal Tindakan</legend>
                <input type="date" className="input w-full" placeholder="Masukkan tanggal tindakan" />
            </fieldset>
        </div>

        <div className="mt-5 flex justify-end">
            <button type="submit" className="btn btn-primary rounded-lg text-white">Simpan</button>
        </div>
    </form>
}

export default Form