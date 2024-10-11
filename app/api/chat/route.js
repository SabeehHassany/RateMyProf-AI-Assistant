/**
 * API route to handle chat-based user interactions for the Rate My Professor AI assistant.
 * - Receives user queries as POST requests
 * - Uses Pinecone to search for relevant professor reviews
 * - Combines the reviews with a GPT-3.5 language model via OpenAI to generate a response
 * 
 * This route is essential to the RAG (Retrieval-Augmented Generation) system, where professor reviews 
 * from the Pinecone vector database are retrieved and used to generate relevant responses to user queries.
 */

import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// System prompt for the AI assistant's behavior
const systemPrompt = `
You are a rate my professor agent to help students find classes. For every user question, the top 3 professors matching the query are returned. Use them to answer the question if relevant.
`;

export async function POST(req) {
  // Parse the incoming JSON request (user query)
  const data = await req.json();
  
  // Initialize Pinecone and OpenAI APIs
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })
  const index = pc.index('rag').namespace('ns1') // Connect to the 'rag' index in Pinecone
  const openai = new OpenAI()
  
  // Extract the user's query and generate an embedding using OpenAI
  const text = data[data.length - 1].content; // User's latest input
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });

  // Use the embedding to query Pinecone for relevant professor reviews
  const results = await index.query({
    topK: 5,  // Retrieve the top 5 closest results based on cosine similarity
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  // Format the retrieved results from Pinecone into a readable string
  let resultString = ''
  results.matches.forEach((match) => {
    resultString += `
    Returned Results:
    Professor: ${match.id}
    Review: ${match.metadata.review}
    Subject: ${match.metadata.subject}
    Stars: ${match.metadata.stars}
    \n\n`
  })
  
  // Prepare the final message by combining user input with retrieved reviews
  const lastMessage = data[data.length - 1]
  const lastMessageContent = lastMessage.content + resultString
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1)  

  // Make a chat completion request to OpenAI to generate a full response
  const completion = await openai.chat.completions.create({
    messages: [
      {role: 'system', content: systemPrompt}, // System instructions for the AI assistant
      ...lastDataWithoutLastMessage,            // Previous conversation history
      {role: 'user', content: lastMessageContent}, // User's query with the results added
    ],
    model: 'gpt-3.5-turbo',  // Use GPT-3.5 to generate a natural language response
    stream: true,  // Stream the response in chunks
  })
  
  // Stream the response to the client as it's generated
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        // Stream each chunk of the OpenAI response to the client
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err) // Handle errors if any occur during the stream
      } finally {
        controller.close() // Close the stream when the response is finished
      }
    },
  })
  return new NextResponse(stream) // Return the streamed response to the client
}