"""
This script sets up the Pinecone vector database and processes review data from Rate My Professor.
It creates embeddings for each review using OpenAI and stores them in a Pinecone index for later retrieval.

- Loads review data from a JSON file
- Creates embeddings using OpenAI
- Inserts the embeddings into a Pinecone index
This is a key component in the RAG (Retrieval-Augmented Generation) pipeline to enable searching and responding with relevant professor reviews.
"""

from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
import openai
import os
import json

# Load API keys from environment variables
load_dotenv()
pinecone_api_key = os.getenv("PINECONE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize Pinecone using the Pinecone class
pc = Pinecone(api_key=pinecone_api_key)

# Check if the Pinecone index already exists
index_name = "rag"
if index_name not in [index['name'] for index in pc.list_indexes().indexes]:
    pc.create_index(
        name=index_name,
        dimension=1536,  # Embedding dimension for OpenAI's model
        metric="cosine",  # Similarity metric for vector search
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

# Connect to the existing Pinecone index
index = pc.Index(index_name)

# Load professor review data from JSON file
with open('reviews.json', 'r') as f:
    data = json.load(f)

# Process the reviews and create embeddings using OpenAI's API
openai.api_key = openai_api_key
embeddings = []
for review in data['reviews']:
    response = openai.Embedding.create(input=review['review'], model="text-embedding-ada-002")
    embedding = response['data'][0]['embedding']
    # Each embedding is paired with its corresponding review and metadata
    embeddings.append({
        "values": embedding,
        "id": review["professor"],
        "metadata": {
            "review": review["review"],
            "subject": review["subject"],
            "stars": review["stars"]
        }
    })

# Insert the processed embeddings into the Pinecone index for later retrieval
index.upsert(vectors=embeddings, namespace='ns1')

# Output index stats after upserting the embeddings
print(index.describe_index_stats())