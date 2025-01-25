import { openai } from './ai.js'
import { systemPrompt } from './systemPrompt.js'
/* 
  - Boiler plate from GPT Docs
*/
export const runLLM = async (messages, tools) => {
  const response = await openai.chat.completions.create({
    // Prefer using 4o-mini
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    tools,
    // Choose the appropriate tool for the job from the entire pool.
    tool_choice: 'auto', // You could narrow the selection for pool call here.
    parallel_tool_calls: false,
  })
  /* 
    If it is a tool call response, the response will not have content
  */
  return response.choices[0].message
}
