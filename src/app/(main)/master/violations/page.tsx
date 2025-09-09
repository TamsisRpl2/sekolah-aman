import dynamic from 'next/dynamic'

const ViolationsContent = dynamic(() => import('./_components/violations-content'))

const page = () => {
    return <ViolationsContent />
}

export default page
