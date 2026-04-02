export type UserRole = 'designer' | 'admin'

export type ProjectStatus =
  | 'registered'
  | 'in_quotation'
  | 'sale_secured'
  | 'completed'
  | 'reward_paid'

export interface UserProfile {
  id: string
  username: string
  company_name: string
  role: UserRole
  created_at: string
}

export interface Project {
  id: string
  project_name: string
  designer_id: string
  installer_name: string
  beneficiary_name: string
  observations: string | null
  boq_file_path: string | null
  status: ProjectStatus
  reward_paid: boolean
  created_at: string
  updated_at: string
  // Joined
  designer?: UserProfile
}

export interface ProjectFile {
  id: string
  project_id: string
  file_path: string
  file_type: string
  uploaded_at: string
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  registered: 'Registered',
  in_quotation: 'In Quotation',
  sale_secured: 'Chance >50%',
  completed: 'Completed',
  reward_paid: 'Reward Paid',
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  registered: 'bg-slate-100 text-slate-700',
  in_quotation: 'bg-blue-50 text-blue-700',
  sale_secured: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
  reward_paid: 'bg-emerald-100 text-emerald-800',
}

export const STATUS_DOT: Record<ProjectStatus, string> = {
  registered: 'bg-slate-400',
  in_quotation: 'bg-blue-500',
  sale_secured: 'bg-amber-500',
  completed: 'bg-green-500',
  reward_paid: 'bg-emerald-500',
}
