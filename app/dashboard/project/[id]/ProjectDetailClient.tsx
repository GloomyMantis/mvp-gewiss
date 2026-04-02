'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProjectStatus, STATUS_LABELS } from '@/lib/types'
import { ArrowLeft, Calendar, Building2, HardHat, FileText, Download } from 'lucide-react'

export default function ProjectDetailClient({ id }: { id: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [boqUrl, setBoqUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data } = await supabase.from('projects').select('*').eq('id', id).eq('designer_id', user.id).single()
      if (!data) { router.replace('/dashboard'); return }
      setProject(data)
      if (data.boq_file_path) {
        const { data: urlData } = await supabase.storage.from('boq-files').createSignedUrl(data.boq_file_path, 3600)
        setBoqUrl(urlData?.signedUrl ?? null)
      }
      setLoading(false)
    }
    fetchProject()
  }, [id])

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-gray-200 border-t-orange-600 rounded-full animate-spin" /></div>
  if (!project) return null

  const isEditable = !['completed','reward_paid'].includes(project.status)
  const statuses: ProjectStatus[] = ['registered','in_quotation','sale_secured','completed','reward_paid']
  const currentIdx = statuses.indexOf(project.status)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to projects
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.project_name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={project.status as ProjectStatus} />
            {project.reward_paid && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Reward Paid ✓</span>}
          </div>
        </div>
        {isEditable && (
          <Link href={`/dashboard/project/${project.id}/edit`} className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Edit</Link>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-6">
        <div className="p-5 grid grid-cols-2 gap-5">
          <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5"><Building2 className="w-3.5 h-3.5" /> Beneficiary</div><div className="text-sm font-medium text-gray-900">{project.beneficiary_name}</div></div>
          <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5"><HardHat className="w-3.5 h-3.5" /> Installer</div><div className="text-sm font-medium text-gray-900">{project.installer_name}</div></div>
          <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Submitted</div><div className="text-sm font-medium text-gray-900">{new Date(project.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
          <div><div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Last Updated</div><div className="text-sm font-medium text-gray-900">{new Date(project.updated_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
        </div>
        {boqUrl && (
          <div className="p-5">
            <div className="text-xs text-gray-400 mb-2">BOQ Document</div>
            <a href={boqUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 text-sm font-medium rounded-xl hover:bg-orange-100 transition-colors">
              <FileText className="w-4 h-4" />View BOQ<Download className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        )}
        {project.observations && (
          <div className="p-5"><div className="text-xs text-gray-400 mb-2">Observations</div><p className="text-sm text-gray-700 leading-relaxed">{project.observations}</p></div>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Status Progress</div>
        <div className="flex items-center">
          {statuses.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${i <= currentIdx ? (i === currentIdx ? 'bg-orange-600 text-white ring-2 ring-orange-200' : 'bg-orange-600 text-white') : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                <span className={`text-[9px] mt-1 text-center leading-tight max-w-[60px] ${i === currentIdx ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>{STATUS_LABELS[s]}</span>
              </div>
              {i < statuses.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentIdx ? 'bg-orange-400' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
