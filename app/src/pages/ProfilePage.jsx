import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../lib/supabase'
import ProfileHeader from '../components/profile/ProfileHeader'
import Toast from '../components/profile/Toast'
import GoalCard from '../components/profile/GoalCard'
import ProfileForm from '../components/profile/ProfileForm'
import DataCard from '../components/profile/DataCard'
import ClearHistoryModal from '../components/profile/ClearHistoryModal'

/**
 * Profil sahifasi: ma'lumotlarni yuklash, saqlash va tarixni tozalash.
 * Ko'rinadigan bo'laklar `components/profile/` da — bu yerda faqat
 * holat va amallar turadi.
 */
export default function ProfilePage() {
  const { user, sessionChecked, signOut, clearHistory } = useAuth()
  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [fullName, setFullName] = useState('')
  const [targetBand, setTargetBand] = useState('7.5')
  const [examDate, setExamDate] = useState('2026-10-15')

  useEffect(() => {
    if (!sessionChecked || !user) return

    async function loadUserData() {
      try {
        const p = await getProfile()
        setProfile(p)

        if (p) {
          setFullName(p.full_name || '')
          setTargetBand(p.target_band || '7.5')
          setExamDate(p.exam_date || '2026-10-15')
        } else {
          setFullName(user?.user_metadata?.full_name || user?.user_metadata?.name || '')
        }
      } catch (err) {
        console.error('Profile loading error:', err)
      }
    }

    loadUserData()
  }, [user, sessionChecked])

  // Xabar uch soniyadan keyin o'zi yo'qoladi
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const updated = await updateProfile({
        full_name: fullName,
        target_band: targetBand,
        exam_date: examDate,
        bio: '',
      })
      setProfile(updated)
      setMessage({ type: 'success', text: 'Profil ma\'lumotlari muvaffaqiyatli saqlandi! ✨' })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Profilni saqlashda xatolik yuz berdi.' })
    } finally {
      setSaving(false)
    }
  }

  const handleClearHistory = async () => {
    await clearHistory()
    setShowDeleteModal(false)
    setMessage({ type: 'success', text: 'Barcha javoblar tarixi tozalandi. ✨' })
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#FF3131] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      <Sidebar user={user} onSignOut={signOut} />

      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">
        <ProfileHeader
          avatar={profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
          name={profile?.full_name || 'IELTS Student'}
          email={user?.email || 'student@ielts.uz'}
        />

        <Toast message={message} />

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-4 flex">
              <GoalCard targetBand={targetBand} examDate={examDate} />
            </div>

            <div className="lg:col-span-8 flex">
              <ProfileForm
                fullName={fullName}
                onFullName={setFullName}
                targetBand={targetBand}
                onTargetBand={setTargetBand}
                examDate={examDate}
                onExamDate={setExamDate}
                saving={saving}
                onSubmit={handleSaveProfile}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <DataCard onClear={() => setShowDeleteModal(true)} />
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <ClearHistoryModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleClearHistory}
        />
      )}
    </div>
  )
}
