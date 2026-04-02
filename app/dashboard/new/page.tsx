'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, FileText, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    project_name: '',
    installer_name: '',
    beneficiary_name: '',
    observations: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let boqFilePath: string | null = null

      // Upload BOQ if provided
      if (file) {
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('boq-files')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        boqFilePath = uploadData.path
      }

      // Create project
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          project_name: form.project_name.trim(),
          installer_name: form.installer_name.trim(),
          beneficiary_name: form.beneficiary_name.trim(),
          observations: form.observations.trim() || null,
          boq_file_path: boqFilePath,
          designer_id: user.id,
          status: 'registered',
          reward_paid: false,
        })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to create project. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-8 max-w-xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-slide-up">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Project Created!</h2>
          <p className="text-gray-500 text-sm mt-1">Redirecting to your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">New Project</h1>
        <p className="text-sm text-gray-500 mt-0.5">Takes less than 60 seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Project Name */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Project Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.project_name}
              onChange={e => setForm({ ...form, project_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="e.g. Industrial Complex Pitești"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Beneficiary Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.beneficiary_name}
              onChange={e => setForm({ ...form, beneficiary_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="e.g. SC Construct SRL"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Installer Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.installer_name}
              onChange={e => setForm({ ...form, installer_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="e.g. Electro Install SRL"
              required
            />
          </div>
        </div>

        {/* BOQ Upload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            BOQ Upload <span className="text-gray-300 font-normal normal-case">(optional)</span>
          </h2>

          {file ? (
            <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-100">
              <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all"
            >
              <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Drop your BOQ here or <span className="text-brand-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, Excel, Word up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.doc,.docx"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Observations */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Observations <span className="text-gray-300 font-normal normal-case">(optional)</span>
          </label>
          <textarea
            value={form.observations}
            onChange={e => setForm({ ...form, observations: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all resize-none"
            placeholder="Any notes about the project, timeline, special requirements..."
            rows={3}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-brand-600/20 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating project...
            </span>
          ) : (
            'Create Project'
          )}
        </button>
      </form>
    </div>
  )
}
