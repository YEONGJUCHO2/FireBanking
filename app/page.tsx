import { LandingExperience } from '@/components/fire-banking'

interface HomePageProps {
  searchParams?: Promise<{ error?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps = {}) {
  const params = searchParams ? await searchParams : {}
  const authError = params?.error ?? null

  return <LandingExperience authError={authError} />
}
