import React, { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Menu } from "lucide-react"
import Sidebar from "../components/Sidebar.jsx"
import { assets } from "../assets/assets"

const Layout = () => {
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden sm:block w-64 border-r">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 sm:hidden"
            onClick={() => setSidebar(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 sm:hidden">
            <Sidebar setSidebar={setSidebar} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <nav className="flex items-center justify-between p-4 border-b">
          <img
            src={assets.logo}
            className="w-32 cursor-pointer sm:w-44"
            onClick={() => navigate("/")}
          />

          {/* Mobile Menu Button */}
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        </nav>

        <div className="p-4 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
