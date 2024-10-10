import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// System prompt for the assistant's behavior
const systemPrompt = `
You are a rate my professor agent to help students find classes. For every user question, the top 3 professors matching the query are returned. Use them to answer the question if relevant.
`;

export async function POST(req) {
  const data = await req.json();
  
  // Initialize Pinecone and OpenAI
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })
  const index = pc.index('rag').namespace('ns1')
  const openai = new OpenAI()
  
  
  // Extract user query and generate an embedding
  const text = data[data.length - 1].content;
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });

  // Query Pinecone for relevant professor reviews
  const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  // Format the results for the assistant response
  let resultString = ''
  results.matches.forEach((match) => {
    resultString += `
    Returned Results:
    Professor: ${match.id}
    Review: ${match.metadata.stars}
    Subject: ${match.metadata.subject}
    Stars: ${match.metadata.stars}
    \n\n`
  })
  

  // Prepare the final message for OpenAI
  const lastMessage = data[data.length - 1]
  const lastMessageContent = lastMessage.content + resultString
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1)  

  // Chat completion request to OpenAI
  const completion = await openai.chat.completions.create({
    messages: [
      {role: 'system', content: systemPrompt},
      ...lastDataWithoutLastMessage,
      {role: 'user', content: lastMessageContent},
    ],
    model: 'gpt-3.5-turbo',
    stream: true,
  })
  

  // Stream the response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })
  return new NextResponse(stream)
}