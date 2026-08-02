import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  BookOpen, 
  Headphones,
  User, 
  LogOut,
} from 'lucide-react'

export default function Sidebar({ user, onSignOut }) {
  const location = useLocation()

  const menuItems = [
    { label: 'Bosh sahifa', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Reading Testlar', path: '/reading-packs', icon: BookOpen },
    { label: 'Listening Testlar', path: '/listening-packs', icon: Headphones },
    { label: 'Profilim', path: '/profile', icon: User },
  ]

  const bottomNavItems = [
    { label: 'Bosh sahifa', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Reading', path: '/reading-packs', icon: BookOpen },
    { label: 'Listening', path: '/listening-packs', icon: Headphones },
    { label: 'Profilim', path: '/profile', icon: User },
  ]

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'IELTS Student'
  const userEmail = user?.email || 'student@ielts.uz'
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="w-full lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF3131] rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm">
            IE
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Take <span className="text-[#FF3131]">IELTS</span>
          </span>
        </Link>

        <Link to="/profile">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF3131] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      </div>

      {/* Mobile Floating Bottom Navigation Bar with Framer Motion liquid tab indicator */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 z-40 bg-white/90 backdrop-blur-xl border border-gray-200/80 shadow-2xl rounded-full p-1.5 flex items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center py-2 px-4 rounded-full transition-colors z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute inset-0 bg-[#FF3131] rounded-full shadow-md shadow-[#FF3131]/30 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className={`text-[10px] font-bold mt-0.5 tracking-tight transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Sidebar Container - Desktop only */}
      <aside className="max-lg:hidden flex fixed top-0 left-0 h-[100dvh] w-[260px] bg-white border-r border-gray-100 p-5 sm:p-6 flex-col justify-between z-50 shadow-none">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/dashboard" className="flex items-center gap-3 px-2 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 bg-[#FF3131] rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md shadow-[#FF3131]/20"
              >
                IE
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">
                  Take <span className="text-[#FF3131]">IELTS</span>
                </h1>
                <p className="text-[11px] font-medium text-gray-400 mt-1">Real Exam Simulation</p>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative block"
                >
                  <div
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#FFF0F0] text-[#FF3131] font-bold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#FF3131]' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="pt-4 border-t border-gray-100">
          <Link 
            to="/profile"
            className="flex items-center gap-3 px-2 mb-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3131] to-[#FF6B6B] flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-[#FF3131] transition-colors">
                {userName}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {userEmail}
              </p>
            </div>
          </Link>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-[#FF3131] transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>
    </>
  )
}
