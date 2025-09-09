import dynamic from "next/dynamic"

const StatisticsContent = dynamic(() => import('./_components/statistics-content'))

const page = () => {
    return <StatisticsContent />
}

export default page
