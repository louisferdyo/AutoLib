'use client'

import { useEffect, useState } from 'react'
import {createClient} from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function UserActivitiesPage() {
  const supabase = createClient();
  const [activities, setActivities] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchActivitiesDirectly() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setError('Unauthorized')
        router.push('/login')
        return
      }

      const user = session.user

      const { data, error: dbError } = await supabase
        .from('user_activities')
        .select(`
          *,
          users:user_id (
            full_name,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (dbError) {
        setError(dbError.message)
      } else {
        setActivities(data || [])
      }
    }

    fetchActivitiesDirectly()
  }, [])

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Activities</h1>
      <ul className="space-y-2">
        {activities.map((a, i) => (
          <li key={i} className="bg-gray-100 p-4 rounded">
            <strong>{a.activity_type}</strong>: {a.description}
          </li>
        ))}
      </ul>
    </div>
  )
}
