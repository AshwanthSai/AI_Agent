import { JSONFilePreset } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'
import { summarizeMessage } from './llm.js'

// Add meta data - from AI to DB
export const addMetaData = (message) => {
  return {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }
}

// Remove meta data - from DB to AI
export const removeMetaData = (message) => {
  const { id, createdAt, ...messageWithoutMetaData } = message
  return messageWithoutMetaData
}

// Aux database methods
export const getDb = async () => {
  const defaultData = { messages: [] }
  const db = await JSONFilePreset('db.json', defaultData)
  return db
}

// Message will be of the form  [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hello' }]
// Output -> { role: 'user', content: 'Hello' } { role: 'user', content: 'Hello' }
// Messages we receive will not have any meta data
export const addMessagesToDb = async (messages) => {
  const db = await getDb()
  // We are supposed to spread messages, let me check
  db.data.messages.push(...messages.map(addMetaData))
  /* 
    - IF message length more than 10, summarize and add to db.summary field
  */
  if (db?.data?.messages?.length >= 10) {
    const oldestMessages = db.data.messages.slice(0, 5).map(removeMetaData)
    const summary = await summarizeMessage(oldestMessages)
    db.data.summary = summary
  }
  await db.write()
}

export const getMessagesFromDb = async () => {
  const db = await getDb()
  const messages = db.data.messages.map(removeMetaData)
  const lastFive = messages.slice(-5)

  /* 
    By Design the last message of DB will never be a plain tool call definition.
    You do not want to send a tool call definition, for summarization
    without the user prompt which triggered it.

    So if 1st message of last 5 is a tool call definition
    we need to go back and add one more to ensure that the context is complete
  */
  if (lastFive[0]?.role === 'tool') {
    const sixthMessage = messages[messages.length - 6]
    if (sixthMessage) {
      return [...[sixthMessage], ...lastFive]
    }
  }

  return lastFive
}

export const getSummaryFromDb = async () => {
  const db = await getDb()
  return db.data.summary
}

export const saveToolResponse = async (response, result) => {
  return addMessagesToDb([
    {
      role: 'tool',
      tool_call_id: response?.tool_calls?.[0]?.id || response,
      content: result.toString(),
    },
  ])
}
