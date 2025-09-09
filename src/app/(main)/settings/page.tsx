import dynamic from 'next/dynamic'

const SettingsContent = dynamic(() => import('./_components/settings-content'), {
  loading: () => <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
})

const SettingsPage = () => {
    return <SettingsContent />
}

export default SettingsPage
