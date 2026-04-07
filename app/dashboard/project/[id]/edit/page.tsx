import EditClient from './EditClient'

export async function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return <EditClient id={params.id} />
}
