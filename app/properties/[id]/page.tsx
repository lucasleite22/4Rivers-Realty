import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // TODO: fetch property title for dynamic meta
  return {
    title: `Property ${params.id} | 4Rivers Realty`,
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  // TODO (Semana 5): fetch property from API, render gallery + specs + interest form
  return (
    <main className="min-h-screen bg-site-bg">
      <p className="p-8 font-barlow text-navy">Property detail — ID: {params.id}</p>
    </main>
  )
}
