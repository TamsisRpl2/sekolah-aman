import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"

const Pagination = () => {
    return <div className="join">
        <button className="join-item btn"><IoIosArrowBack /> </button>
        <button className="join-item btn">Page 22</button>
        <button className="join-item btn"><IoIosArrowForward /> </button>
    </div>
}

export default Pagination