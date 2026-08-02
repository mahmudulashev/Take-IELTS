import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ArrowRight, User } from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-4 sm:px-6 md:px-12">
      <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 bg-[#FF3131] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
          IE
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          Take <span className="text-[#FF3131]">IELTS</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#FF3131] text-white hover:bg-[#E82C2C] transition-all shadow-md shadow-[#FF3131]/20"
          >
            <User className="w-4 h-4" />
            <span>Dashboard ga o'tish</span>
          </Link>
        ) : (
          <>
            <Link
              to="/auth"
              className="hidden sm:inline-flex px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:text-[#FF3131] hover:bg-[#FFF0F0] transition-colors"
            >
              Kirish
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#FF3131] text-[#FFFFFF] hover:bg-[#E82C2C] transition-all shadow-md shadow-[#FF3131]/20 hover:shadow-lg"
            >
              <span>Bepul boshlash</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
