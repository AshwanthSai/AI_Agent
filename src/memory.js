import { JSONFilePreset } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'

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
  await db.write()
}

export const getMessagesFromDb = async () => {
  const db = await getDb()
  const data = db.data.messages.map(removeMetaData)
  return data
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
