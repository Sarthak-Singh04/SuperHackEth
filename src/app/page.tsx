import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-2xl">Welcome to Our Platform</h1>
      <p className="mt-4">Join us to explore amazing projects and connect with talented individuals.</p>
      <Link href="/login" className="px-4 py-2 mt-8 rounded bg-blue-500 text-white inline-block">
        Get Started
      </Link>
    </main>
  )
}