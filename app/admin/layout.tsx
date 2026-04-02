'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data: p } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (!p || p.role !== 'admin') { router.replace('/dashboard'); return }
      setProfile(p)
      setLoading(false)
    }
    check()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-orange-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#f8f7f4]">
      <Sidebar role="admin" companyName={profile.company_name} username={profile.username} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
