"use client"

/**
 * Minimal stub so the demo can compile without the real tRPC client.
 * Replace this with your actual tRPC implementation when ready.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
type MutationHandlers = {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

const createFakeMutation = () => ({
  mutate: (_input?: unknown, _handlers?: MutationHandlers) => {
    // Fake async behaviour so UI feedback still works
    setTimeout(() => {
      _handlers?.onSuccess?.()
    }, 300)
  },
})

export const trpc = {
  /* Hook that mimics trpc.useContext() */
  useContext() {
    return {
      output: {
        getAllOutput: {
          invalidate: () => Promise.resolve(),
        },
      },
    }
  },

  /* Fake routers/mutations used in the demo */
  output: {
    updateOutput: {
      useMutation: (_handlers?: MutationHandlers) => ({
        ...createFakeMutation(),
        ..._handlers,
      }),
    },
    deleteOutput: {
      useMutation: (_handlers?: MutationHandlers) => ({
        ...createFakeMutation(),
        ..._handlers,
      }),
    },
  },
}
