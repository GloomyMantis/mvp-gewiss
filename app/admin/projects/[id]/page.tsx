import ProjectDetailClient from './ProjectDetailClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export const dynamicParams = true

export default function AdminProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailClient id={params.id} />
}
