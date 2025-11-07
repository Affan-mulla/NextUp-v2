"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import type { User } from "@/lib/store/user-store"

const SESSION_QUERY_KEY = ["session"]

export function useSessionQuery(options?: {
  staleTime?: number
  cacheTime?: number
  onSuccess?: (user: User | null) => void
}) {
  const queryClient = useQueryClient()

  // some workspaces may have incompatible react-query types; cast to any to avoid
  // strict overload issues while keeping runtime behavior intact.
  const useQueryAny: any = useQuery as any

  const query = useQueryAny({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axios.get('/api/session', { 
        withCredentials: true 
      })
      return data.user ?? null
    },
  // sensible defaults - you can override via options
  staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    retry: false,
    onSuccess: (user: User | null) => {
      // store a copy in query cache under the key for other consumers
      queryClient.setQueryData(SESSION_QUERY_KEY, user)
      options?.onSuccess?.(user)
    },
  })

  return query
}

export function useInvalidateSession() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: SESSION_QUERY_KEY })
}
