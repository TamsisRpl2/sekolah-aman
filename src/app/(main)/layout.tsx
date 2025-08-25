import dynamic from "next/dynamic";
import { ReactNode } from "react";

const Sidenav = dynamic(() => import('./_components/sidenav'))

const Layout = ({ children }: { children: ReactNode }) => {
    return <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
            <div className="p-20">
                { children }
            </div>
        </div>
        <Sidenav />
    </div>
}

export default Layout