import dynamic from "next/dynamic"

const MonthlyReportContent = dynamic(() => import('./_components/monthly-report-content'))

const page = () => {
    return <MonthlyReportContent />
}

export default page
