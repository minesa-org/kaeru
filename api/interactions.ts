import { MiniInteraction } from '@minesa-org/mini-interaction'

export const mini = new MiniInteraction()

export default mini.createNodeHandler({
  waitUntil: async (promise) => {
    try {
      const { waitUntil } = await import('@vercel/functions')
      waitUntil(promise)
    } catch (e) {
      console.log(e)
    }
  }
})