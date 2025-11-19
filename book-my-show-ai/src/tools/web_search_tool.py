import os
from langchain_tavily import TavilySearch
from dotenv import load_dotenv

class WebSearchTool:
    def __init__(self):
        load_dotenv()  # Load environment variables from .env file
        self.tool = TavilySearch(max_results=8)
        # Ensure the API key is set in the environment
        os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")
    
    def get_tool(self):
        return self.tool
