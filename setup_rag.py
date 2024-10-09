from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
import openai
import os
import json

# Load API keys
load_dotenv()
pinecone_api_key = os.getenv("PINECONE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize Pinecone using the Pinecone class
pc = Pinecone(api_key=pinecone_api_key)

# Check if the index already exists
index_name = "rag"
if index_name not in [index['name'] for index in pc.list_indexes().indexes]:
    pc.create_index(
        name=index_name,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )

# Connect to the existing index
index = pc.Index(index_name)

# Load review data
with open('reviews.json', 'r') as f:
    data = json.load(f)

# Process data and create embeddings
openai.api_key = openai_api_key
embeddings = []
for review in data['reviews']:
    response = openai.Embedding.create(input=review['review'], model="text-embedding-ada-002")
    embedding = response['data'][0]['embedding']
    embeddings.append({
        "values": embedding,
        "id": review["professor"],
        "metadata": {
            "review": review["review"],
            "subject": review["subject"],
            "stars": review["stars"]
        }
    })

# Upsert embeddings into Pinecone
index.upsert(vectors=embeddings, namespace='ns1')

# Print index stats
print(index.describe_index_stats())