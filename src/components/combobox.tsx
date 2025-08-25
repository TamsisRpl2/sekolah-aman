"use client"

const Combobox = () => {
    return <div className="relative w-full">
        <input type="text" className="input w-full peer" placeholder="Cari..." />
        <ul className="hidden menu bg-base-200 shadow-lg p-4 rounded-box w-full absolute transform translate-y-3 z-50 peer-focus:flex">
            <li><a onMouseDown={() => console.log("test")}>Item 1</a></li>
            <li><a>Item 2</a></li>
            <li><a>Item 3</a></li>
        </ul>
    </div>
}

export default Combobox