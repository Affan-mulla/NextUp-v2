"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { debounce } from "@/utils/debounce"
import { cn } from "@/lib/utils"

interface SearchUser {
  id: string
  username: string
  email: string
  avatar: string | null
}

interface SearchProduct {
  id: string
  title: string
  image: string | null
  price: number | null
}

interface SearchResponse {
  users: SearchUser[]
  products: SearchProduct[]
}

type Group = "user" | "product"

interface HighlightProps {
  text: string
  query: string
}

const Highlight: React.FC<HighlightProps> = ({ text, query }) => {
  if (!query) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-primary/10 text-primary font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

const SKELETON_ITEMS = 3

export const UnifiedSearchBar: React.FC = () => {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResponse>({ users: [], products: [] })
  const [isOpen, setIsOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [activeGroup, setActiveGroup] = React.useState<Group | null>(null)
  const [activeIndex, setActiveIndex] = React.useState<number>(-1)

  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const totalItems = (results.users?.length ?? 0) + (results.products?.length ?? 0)

  const runSearch = React.useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value) {
          setResults({ users: [], products: [] })
          setLoading(false)
          return
        }

        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`, {
            method: "GET",
          })
          if (!res.ok) throw new Error("Failed to search")
          const json = (await res.json()) as SearchResponse
          setResults(json)
        } catch (error) {
          console.error(error)
          setResults({ users: [], products: [] })
        } finally {
          setLoading(false)
        }
      }, 300),
    []
  )

  React.useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], products: [] })
      setActiveIndex(-1)
      setActiveGroup(null)
      return
    }
    setLoading(true)
    runSearch(query.trim())
  }, [query, runSearch])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
        setActiveGroup(null)
      }
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        setActiveIndex(-1)
        setActiveGroup(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      setIsOpen(true)
    }

    if (!totalItems) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const nextIndex = (activeIndex + 1 + totalItems) % totalItems
      setActiveIndex(nextIndex)
      setActiveGroup(nextIndex < results.users.length ? "user" : "product")
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      const nextIndex = (activeIndex - 1 + totalItems) % totalItems
      setActiveIndex(nextIndex)
      setActiveGroup(nextIndex < results.users.length ? "user" : "product")
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault()
      const item =
        activeIndex < results.users.length
          ? { type: "user" as const, value: results.users[activeIndex] }
          : { type: "product" as const, value: results.products[activeIndex - results.users.length] }

      // TODO: wire navigation to item detail page
      console.log("Selected", item)
      setIsOpen(false)
    }

    if (event.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setQuery(value)
    setIsOpen(!!value)
  }

  const hasResults =
    (results.users && results.users.length > 0) ||
    (results.products && results.products.length > 0)

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md border-4 dark:border-foreground/10 border-primary/15 rounded-[14.5px]"
    >

      <Input
        ref={inputRef}
        placeholder="Search users or products…"
        value={query}
        onChange={handleChange}
        onFocus={() => query && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="bg-background/80 text-foreground h-10 rounded-lg border-2    focus:ring-0 focus:ring-offset-0  transition-colors w-full focus-visible:ring-0"
      />

      <AnimatePresence>
        {isOpen && (query || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 right-0 z-30 mt-2 rounded-lg border border-border bg-background/30 backdrop-blur-xl shadow-none"
          >
            <ScrollArea className="max-h-80 rounded-lg">
              <div className="p-2 text-sm">
                {loading && (
                  <div className="space-y-2">
                    {Array.from({ length: SKELETON_ITEMS }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-md bg-muted/40 px-2 py-2 animate-pulse"
                      >
                        <div className="h-8 w-8 rounded-full bg-muted" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 w-1/3 rounded-full bg-muted" />
                          <div className="h-3 w-1/4 rounded-full bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && hasResults && (
                  <div className="space-y-3">
                    {results.users.length > 0 && (
                      <div>
                        <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                          Users
                        </div>
                        <div className="space-y-1">
                          {results.users.map((user, index) => {
                            const globalIndex = index
                            const isActive =
                              activeGroup === "user" && activeIndex === globalIndex
                            return (
                              <button
                                key={user.id}
                                type="button"
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted/60"
                                )}
                                onMouseEnter={() => {
                                  setActiveIndex(globalIndex)
                                  setActiveGroup("user")
                                }}
                              >
                                <Avatar className="h-8 w-8">
                                  {user.avatar && (
                                    <AvatarImage src={user.avatar} alt={user.username} />
                                  )}
                                  <AvatarFallback>
                                    {user.username?.[0]?.toUpperCase() ?? "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium leading-tight">
                                    <Highlight text={user.username} query={query} />
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    <Highlight text={user.email} query={query} />
                                  </span>
                                </div>
                              </button>
                            )}
                          )}
                        </div>
                      </div>
                    )}

                    {results.products.length > 0 && (
                      <div>
                        <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                          Products
                        </div>
                        <div className="space-y-1">
                          {results.products.map((product, index) => {
                            const globalIndex = results.users.length + index
                            const isActive =
                              activeGroup === "product" && activeIndex === globalIndex
                            return (
                              <button
                                key={product.id}
                                type="button"
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted/60"
                                )}
                                onMouseEnter={() => {
                                  setActiveIndex(globalIndex)
                                  setActiveGroup("product")
                                }}
                              >
                                <div className="h-8 w-8 overflow-hidden rounded-md bg-muted">
                                  {product.image && (
                                    <img
                                      src={product.image}
                                      alt={product.title}
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium leading-tight">
                                    <Highlight text={product.title} query={query} />
                                  </span>
                                  {product.price != null && (
                                    <span className="text-xs text-muted-foreground">
                                      ${""}
                                      {product.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </button>
                            )}
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!loading && !hasResults && query && (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
