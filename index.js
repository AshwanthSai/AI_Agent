import { runAgent } from './src/agent.js'
import { dadJokeDefinition } from './src/tools/dadJokes.js'
import { generateImagesDefinition } from './src/tools/generateImages.js'
import { movieSearchDefinition } from './src/tools/movieSearch.js'
import { redditToolDefinition } from './src/tools/reddit.js'

const userMessage = process.argv[2]
/* 
- Adding our present prompt to memory(db)
- Remember, all that the model is doing, is extrapolating 
  text from the last sentence, which is our prompt 
*/

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

export const tools = [
  {
    type: 'function',
    function: dadJokeDefinition,
  },
  {
    type: 'function',
    function: generateImagesDefinition,
  },
  {
    type: 'function',
    function: redditToolDefinition,
  },
  {
    type: 'function',
    function: movieSearchDefinition,
  },
]

const response = await runAgent({
  userMessage,
  tools,
})
