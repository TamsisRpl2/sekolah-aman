import dynamic from "next/dynamic"

const DashboardContent = dynamic(() => import('./_components/dashboard-content'))

const page = () => {
    return <DashboardContent />
}

export default page
