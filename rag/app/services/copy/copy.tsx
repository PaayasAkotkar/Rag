import { useState, useCallback } from 'react'

interface UseCopyOptions {
    timeout?: number
    onSuccess?: () => void
    onError?: (error: Error) => void
}

interface UseCopyReturn {
    isCopied: boolean
    copy: (text: string) => Promise<void>
    reset: () => void
    error: Error | null
}

export function useCopy(options: UseCopyOptions = {}): UseCopyReturn {
    const { timeout = 2000, onSuccess, onError } = options

    const [isCopied, setIsCopied] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const copy = useCallback(
        async (text: string) => {
            // Reset error state
            setError(null)

            try {
                // Modern clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text)
                }

                setIsCopied(true)
                onSuccess?.()

                setTimeout(() => {
                    setIsCopied(false)
                }, timeout)

            } catch (err) {
                const copyError = err instanceof Error ? err : new Error('Failed to copy')
                setError(copyError)
                onError?.(copyError)
                setIsCopied(false)
            }
        },
        [timeout, onSuccess, onError]
    )

    const reset = useCallback(() => {
        setIsCopied(false)
        setError(null)
    }, [])

    return {
        isCopied,
        copy,
        reset,
        error,
    }
}