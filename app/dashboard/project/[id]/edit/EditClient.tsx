'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, X, FileText } from 'lucide-react'
import Link from 'next/link'

export default function EditClient({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ project_name: '', installer_name: '', beneficiary_name: '', observations: '' })
  const [existingFile, setExistingFile] = useState<string | null>(null)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('projects').select('*').eq('id', id).eq('designer_id', user!.id).single()
      if (data) { setForm({ project_name: data.project_name, installer_name: data.installer_name, beneficiary_name: data.beneficiary_name, observations: data.observations || '' }); setExistingFile(data.boq_file_path) }
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let boqFilePath = existingFile
      if (newFile) {
        const ext = newFile.name.split('.').pop()
        const { data: uploadData, error: uploadError } = await supabase.storage.from('boq-files').upload(`${user!.id}/${Date.now()}.${ext}`, newFile)
        if (uploadError) throw uploadError
        boqFilePath = uploadData.path
      }
      const { error: updateError } = await supabase.from('projects').update({ project_name: form.project_name.trim(), installer_name: form.installer_name.trim(), beneficiary_name: form.beneficiary_name.trim(), observations: form.observations.trim() || null, boq_file_path: boqFilePath, updated_at: new Date().toISOString() }).eq('id', id).eq('designer_id', user!.id)
      if (updateError) throw updateError
      router.push(`/dashboard/project/${id}`)
    } catch (err: any) { setError(err.message || 'Failed to update project.'); setSaving(false) }
  }

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-gray-200 border-t-orange-600 rounded-full animate-spin" /></div>

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Link href={`/dashboard/project/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />Cancel</Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Project</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          {(['project_name', 'beneficiary_name', 'installer_name'] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{field.replace('_', ' ')} <span className="text-red-400">*</span></label>
              <input type="text" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" required />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">BOQ File</h2>
          {newFile ? (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl"><FileText className="w-5 h-5 text-orange-600" /><span className="text-sm flex-1 truncate">{newFile.name}</span><button type="button" onClick={() => setNewFile(null)}><X className="w-4 h-4 text-gray-400 hover:text-red-500" /></button></div>
          ) : existingFile ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600"><FileText className="w-4 h-4" />Current BOQ file</div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-orange-600 hover:underline">Replace</button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/50 transition-all">
              <Upload className="w-5 h-5 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Upload BOQ <span className="text-orange-600">browse</span></p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={e => e.target.files?.[0] && setNewFile(e.target.files[0])} className="hidden" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Observations</label>
          <textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all resize-none" rows={3} />
        </div>
        <button type="submit" disabled={saving} className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all">
          {saving ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
