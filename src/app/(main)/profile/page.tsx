import dynamic from 'next/dynamic'

const ProfileContent = dynamic(() => import('./_components/profile-content'), {
  loading: () => <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
})

const ProfilePage = () => {
    return <ProfileContent />
}

export default ProfilePage
