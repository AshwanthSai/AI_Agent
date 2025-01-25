import { runLLM } from './llm.js'
import {
  addMessagesToDb,
  getMessagesFromDb,
  saveToolResponse,
} from './memory.js'
import { showLoader, logMessage } from './ui.js'
import { runTool } from './toolRunner.js'

export const runAgent = async ({ userMessage, tools }) => {
  await addMessagesToDb([{ role: 'user', content: userMessage }])
  const loader = showLoader('Thinking...\n')

  while (true) {
    // Add present user message to database.
    // Retrieve all messages from memory to pass as context
    const messages = await getMessagesFromDb()
    const response = await runLLM(messages, tools)
    //Save response to memory
    await addMessagesToDb([response])
    if (response.content) {
      loader.stop()
      logMessage(response)
      return getMessagesFromDb()
    }
    if (response.tool_calls) {
      loader.update(`executing: ${response.tool_calls[0].function.name}`)
      logMessage(response)
      const toolCallResult = await runTool(userMessage, response.tool_calls[0])
      await saveToolResponse(response, toolCallResult)
      loader.update(`done: ${response.tool_calls[0].function.name}`)
    }
    loader.stop()
  }
}
