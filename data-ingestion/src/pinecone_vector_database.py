import os
from dotenv import load_dotenv

## Pinecone Vector Store
from pinecone import Pinecone, ServerlessSpec

## embeddings
from langchain_openai import OpenAIEmbeddings

## Pinecone Vector Store
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document

class PineconeVectorDB:
    def __init__(self):
        
        ## Set environment variables
        load_dotenv()
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = os.getenv("PINECONE_INDEX_NAME")
        
        os.environ["OPENAI_API_KEY"]  = os.getenv("OPENAI_API_KEY")
        
        self.pinecone = Pinecone(api_key=self.api_key)
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small",dimensions=1024)
        
        if not self.pinecone.has_index(self.index_name):
            self.pinecone.create_index(
                name=self.index_name,
                dimension=1024,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )

        self.index = self.pinecone.Index(self.index_name)
    
    def add_documents(self, documents: list[Document]):
        
        vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings
        )

        vector_store.add_documents(documents)
        print(f"✅ Added {len(documents)} documents to Pinecone index '{self.index_name}'")
    
    def query(self, query: str, top_k: int = 5):
        
        vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings
        )
        
        results = vector_store.similarity_search(query, k=top_k)
        return results
        