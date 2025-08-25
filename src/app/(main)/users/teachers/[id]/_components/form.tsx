const Form = () => {
    return <form>
        <div className="grid grid-cols-2 gap-6">
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Unggah Profil</legend>
                <input type="file" name="avatar" id="avatar" className="file-input w-full" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">NIP*</legend>
                <input type="text" name="nip" id="nip" className="input w-full" placeholder="38xxx" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Email*</legend>
                <input type="text" name="email" id="email" className="input w-full" placeholder="example@mail.com" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Nama Lengkap*</legend>
                <input type="text" name="nama" id="nama" className="input w-full" placeholder="Jhon Doe" />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Telp*</legend>
                <input type="tel" name="telp" id="telp" className="input w-full" placeholder="08xxxx" />
            </fieldset>
            
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Kata Sandi*</legend>
                <input type="password" name="password" id="password" className="input w-full" placeholder="********" />
            </fieldset>
        </div>

        <div className="flex justify-end mt-5">
            <button type="submit" className="btn btn-primary text-white rounded-lg">Tambah Guru</button>
        </div>
    </form>
}

export default Form