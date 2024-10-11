
# Rate My Professor AI Assistant

A Retrieval-Augmented Generation (RAG) powered AI assistant built using OpenAI, Pinecone, Next.js, and Material-UI. This project retrieves professor reviews from a vector database and generates informed responses using GPT-3.5. 

## Table of Contents
- [Overview](#overview)
- [Languages and Frameworks](#languages-and-frameworks)
- [Features](#features)
- [How to Set Up](#how-to-set-up)
- [How to Use](#how-to-use)
- [Future Directions](#future-directions)
- [What I Learned](#what-i-learned)

## Overview
This project implements an AI assistant that helps students find class reviews using the `Rate My Professor` database. It integrates Retrieval-Augmented Generation (RAG) to combine vector-based search results from Pinecone with OpenAI's GPT-3.5 model to generate meaningful, context-aware responses. 

The assistant uses professor reviews stored in Pinecone, where each review is embedded using OpenAI's text-embedding models and can be queried with semantic search. Users can interact with the assistant through a web-based chat interface.

## Languages and Frameworks
- **JavaScript/TypeScript**: Core language for the web application
- **Python**: Used for embedding and interacting with Pinecone and OpenAI
- **Next.js**: Server-side rendering and frontend framework
- **Material-UI**: For creating a responsive and clean user interface
- **OpenAI API**: For embedding reviews and generating AI responses
- **Pinecone**: For vector database management and retrieval of professor reviews

## Features
- RAG (Retrieval-Augmented Generation) pipeline to enhance responses with relevant data
- Semantic search of professor reviews using Pinecone
- Chat interface where users can interact with the AI assistant
- Streaming of responses to provide real-time feedback during conversations
- Deployed using Next.js and easy to extend with more features

## How to Set Up
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rate-my-professor-ai-assistant.git
   cd rate-my-professor-ai-assistant
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file and add the following:
   ```bash
   PINECONE_API_KEY=<your_pinecone_api_key>
   OPENAI_API_KEY=<your_openai_api_key>
   ```

4. **Run the Next.js server:**
   ```bash
   npm run dev
   ```

5. **Set up Python environment and dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate   # On macOS/Linux
   venv\Scriptsctivate      # On Windows
   pip install -r requirements.txt
   ```

6. **Run the setup script to load reviews and create embeddings:**
   ```bash
   python setup_rag.py
   ```

## How to Use
- Once set up, open `http://localhost:3000` in your browser.
- Type a question or professor search in the chat box (e.g., "Tell me about Professor Smith from the math department").
- The AI assistant will retrieve relevant reviews and generate a helpful response.

## Future Directions
- **User Authentication**: Add login functionality for personalized experiences.
- **Data Expansion**: Integrate more professor metadata such as office hours, publications, etc.
- **Fine-tuning**: Train the model on specific academic datasets to improve response relevance.
- **Mobile App**: Extend the project to a mobile app for easier access.
- **Real-time Data Integration**: Connect with university databases for live data on courses and professors.

## What I Learned
- **RAG Integration**: Combining vector search with generative models to provide contextually accurate responses.
- **Pinecone**: Learning how to use Pinecone for vector database indexing and querying.
- **OpenAI Embeddings**: Understanding how to use OpenAI's models to create high-quality embeddings for semantic search.
- **Next.js and Material-UI**: Leveraging modern frameworks for creating responsive and interactive UIs.
- **API Development**: Handling real-time streaming responses in API endpoints.
