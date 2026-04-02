'use client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, LayoutDashboard, PlusCircle, LogOut, BarChart3, Users, FolderKanban, UserPlus } from 'lucide-react'

interface NavItem { href: string; label: string; icon: React.ComponentType<{ className?: string }> }
interface SidebarProps { role: 'designer' | 'admin'; companyName: string; username: string }

const designerNav: NavItem[] = [
  { href: '/dashboard', label: 'My Projects', icon: LayoutDashboard },
  { href: '/dashboard/new', label: 'Add Project', icon: PlusCircle },
]
const adminNav: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/projects', label: 'All Projects', icon: FolderKanban },
  { href: '/admin/designers', label: 'Designers', icon: Users },
  { href: '/admin/users/new', label: 'Add Designer', icon: UserPlus },
]

export function Sidebar({ role, companyName, username }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const nav = role === 'admin' ? adminNav : designerNav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Gewiss</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Projects</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <item.icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : ''}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600 uppercase">
            {username.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{username}</div>
            <div className="text-xs text-gray-400 truncate">{companyName}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-4 h-4" />Sign out
        </button>
      </div>
    </aside>
  )
}
