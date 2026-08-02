import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { RevealGroup, Reveal, useSmoothScroll } from '../components/motion'
import { TestCatalog } from '../data/tests-catalog'
import { Headphones, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ListeningPacksPage() {
  useSmoothScroll(true)
  const { user, sessionChecked, signOut, results } = useAuth()
  const navigate = useNavigate()

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF3131] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) { navigate('/auth'); return null }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const listeningPacks = TestCatalog.filter(p => p.type === 'listening')

  // Find result for a pack
  const getPackResult = (packId) => {
    const matching = results.filter(r => r.test_type === 'listening' && r.test_id === packId)
    if (!matching.length) return null
    // Get best band score
    const best = matching.reduce((max, curr) => parseFloat(curr.band_score) > parseFloat(max.band_score) ? curr : max, matching[0])
    return best
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      <Sidebar user={user} onSignOut={handleSignOut} />

      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">



        {/* Page Banner */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
              <Headphones className="w-3.5 h-3.5" />
              <span>Listening Testlar To'plami</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              IELTS Listening Test To'plamlari
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              4 ta part, 40 ta savol, audio player va transkript bilan mashq qiling.
            </p>
          </div>
        </div>

        {/* Grid of Listening Packs */}
        <RevealGroup stagger={0.09} y={36} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listeningPacks.map(pack => {
            const packResult = getPackResult(pack.id)

            return (
              <div
                key={pack.id}
                className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-ui flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Headphones className="w-6 h-6" />
                    </div>
                    
                    {/* Status Badge */}
                    {packResult ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Topshirilgan (Band {packResult.band_score})</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                        Topshirilmagan
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 mb-2 group-hover:text-[#FF3131] transition-colors">
                    {pack.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-6">
                    <span>{pack.parts} Part</span>
                    <span>•</span>
                    <span>{pack.questions} Savol</span>
                    <span>•</span>
                    <span>{pack.duration} daqiqa</span>
                  </div>
                </div>

                {pack.route.endsWith('.html') ? (
                  <a
                    href={pack.route}
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#FF3131] text-white font-bold text-xs hover:bg-[#E82C2C] transition-ui shadow-md shadow-[#FF3131]/20"
                  >
                    <span>{packResult ? "Qayta Topshirish" : "Testni Boshlash"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    to={pack.route}
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#FF3131] text-white font-bold text-xs hover:bg-[#E82C2C] transition-ui shadow-md shadow-[#FF3131]/20"
                  >
                    <span>{packResult ? "Qayta Topshirish" : "Testni Boshlash"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )
          })}
        </RevealGroup>
      </main>
    </div>
  )
}
