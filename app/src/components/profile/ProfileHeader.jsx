import React from 'react'

/** Avatar, ism va email — sahifaning yuqori kartasi. */
export default function ProfileHeader({ avatar, name, email }) {
  return (
    <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col xl:flex-row items-center xl:items-center justify-between gap-8 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full p-1 bg-gradient-to-tr from-[#FF3131] to-[#FF6B6B] shadow-lg shadow-[#FF3131]/20">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover rounded-full bg-white"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-3xl text-[#FF3131]">
              {name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500 mt-1">{email}</p>
        </div>
      </div>
    </div>
  )
}
