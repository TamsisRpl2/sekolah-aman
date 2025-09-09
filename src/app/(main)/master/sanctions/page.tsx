import dynamic from 'next/dynamic'

const SanctionsContent = dynamic(() => import('./_components/sanctions-content'))

const page = () => {
    return <SanctionsContent />
}

export default page
