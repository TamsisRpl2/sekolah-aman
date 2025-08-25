import Link from "next/link"

const Form = () => {
    return <form className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
            </label>
            <input
                type="email"
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400"
                required
            />
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot Password?
                </Link>
            </div>
            <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400"
                required
            />
        </div>

        <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-lg"
        >
            Sign in
        </button>
    </form>
}

export default Form