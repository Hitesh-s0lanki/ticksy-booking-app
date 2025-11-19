import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

class GeminiLLM:
    def __init__(self):
        load_dotenv()
        self.model_name = "gemini-2.0-flash"        

    def get_llm_model(self) -> ChatGoogleGenerativeAI:

        os.environ['GOOGLE_API_KEY'] = google_api_key = os.getenv('GOOGLE_API_KEY')

        if not google_api_key:
            raise ValueError("API key is required to call OpenAI.")

        try:
            llm = ChatGoogleGenerativeAI(model=self.model_name)
            return llm
        except Exception as e:
            error_msg = f"OpenAI initialization error: {e}"
            raise ValueError(error_msg)
    