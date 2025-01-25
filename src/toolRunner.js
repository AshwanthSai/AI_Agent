import { getDadJokes } from './../src/tools/dadJokes.js'
import { generateImages } from './tools/generateImages.js'
import { getRedditPost } from './tools/reddit.js'

export const runTool = (userMessage, tool) => {
  let input = {
    userMessage,
    tool,
  }
  switch (tool.function.name) {
    case 'getDadJokes':
      return getDadJokes()
    case 'generateImages':
      return generateImages(userMessage)
    case 'getRedditPost':
      return getRedditPost()
    default:
      throw new Error(`Tool not found ${tool.function.type}`)
  }
}
