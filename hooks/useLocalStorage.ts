import { useEffect, useRef } from "react"
import { type UseFormReturn, type FieldValues } from "react-hook-form"

/**
 *
 * @param form
 * @param storageKey
 */
export function useFormLocalStoragePersistence<T extends FieldValues>(
  form: UseFormReturn<T>,
  storageKey: string
) {
  const { watch, reset, getValues } = form
  const isLoadedRef = useRef(false)
  const saveTimerRef = useRef<number | null>(null)

  // 1. Load from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge stored data with any existing default values
        reset({ ...getValues(), ...parsed })
      }
    } catch (error) {
      console.warn(`Failed to load form data for key "${storageKey}"`, error)
    } finally {
      // Mark as loaded so we don't overwrite storage with empty initial state
      isLoadedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, reset])

  // 2. Watch and Save (Debounced)
  useEffect(() => {
    const subscription = watch((values) => {
      // prevent saving before the initial load happens
      if (!isLoadedRef.current) return

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
      }

      saveTimerRef.current = window.setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(values))
        } catch (error) {
          console.warn(`Failed to save form data for key "${storageKey}"`, error)
        }
      }, 500) // 500ms debounce
    })

    return () => {
      subscription.unsubscribe()
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [watch, storageKey])
}


export function getFormLocalStorage<T>(storageKey: string): T | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = localStorage.getItem(storageKey)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn(`Error reading key "${storageKey}"`, error)
    return null
  }
}