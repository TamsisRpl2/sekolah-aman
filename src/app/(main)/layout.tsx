import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";

const Sidenav = dynamic(() => import('./_components/sidenav'))
const Topbar = dynamic(() => import('./_components/topbar'))

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <AuthGuard requireAuth={true}>
            <div className="drawer lg:drawer-open">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Topbar />
                    <div className="flex-1 p-6 bg-gray-50">
                        {children}
                    </div>
                </div>
                <Sidenav />
            </div>
        </AuthGuard>
    )
}

export default Layout
