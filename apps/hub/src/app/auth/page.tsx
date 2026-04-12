import AuthPageClient from './page-client'

function normalizeNextPath(value: string | string[] | undefined) {
  const nextValue = Array.isArray(value) ? value[0] : value

  if (!nextValue || !nextValue.startsWith('/') || nextValue.startsWith('//')) {
    return '/'
  }

  return nextValue
}

export default function AuthPage({
  searchParams,
}: {
  searchParams?: {
    next?: string | string[]
  }
}) {
  return <AuthPageClient nextPath={normalizeNextPath(searchParams?.next)} />
}
