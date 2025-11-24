export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
