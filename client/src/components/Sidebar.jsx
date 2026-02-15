import React from "react"
import { NavLink } from "react-router-dom"
import { Protect, useClerk, useUser } from "@clerk/clerk-react"
import {
  House,
  SquarePen,
  Hash,
  Image,
  Eraser,
  Scissors,
  FileText,
  Users,
  LogOut,
} from "lucide-react"

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Resume Reviewer", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
]

const Sidebar = ({ setSidebar }) => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  // Defensive: only call setSidebar if it exists
  const closeSidebar = () => {
    if (setSidebar) setSidebar(false)
  }

  if (!user) return <div className="p-4">Loading...</div>

  return (
    <div className="w-full h-full flex flex-col justify-between border-r">
      {/* Top Section */}
      <div className="p-6">
        <img
          src={user.imageUrl}
          className="w-14 h-14 rounded-full mx-auto"
          alt="user"
        />
        <h1 className="mt-2 text-center font-medium">{user.fullName}</h1>

        <div className="mt-6 space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `px-3 py-2 flex items-center gap-3 rounded transition ${
                  isActive
                    ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t p-4 flex items-center justify-between">
        <div
          onClick={openUserProfile}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src={user.imageUrl} className="w-8 h-8 rounded-full" alt="" />
          <div>
            <h1 className="text-sm font-medium">{user.fullName}</h1>
            <p className="text-xs text-gray-500">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>{" "}
              plan
            </p>
          </div>
        </div>

        <LogOut
          onClick={signOut}
          className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-700"
        />
      </div>
    </div>
  )
}

export default Sidebar






























