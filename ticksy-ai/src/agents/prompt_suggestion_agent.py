
from src.llms.gemini_llm import GeminiLLM
from src.instructions.prompt_suggestion_agent_instruction import get_prompt_suggestion_agent_system_prompt
from src.schemas.prompt_suggestion_state import PromptSuggestionState

from langchain_core.prompts import ChatPromptTemplate
import logging

logger = logging.getLogger(__name__)

class PromptSuggestionAgent:    
    def __init__(self, model=None):
        self.model = model or GeminiLLM().get_llm_model()
        self.instruction = get_prompt_suggestion_agent_system_prompt()

    
    def invoke(self, message: str):    
        try:
            
            structured_llm_grader = self.model.with_structured_output(PromptSuggestionState)
            prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", self.instruction),
                    ("human", "User query: {user_query}"),
                ]
            )
            
            prompt_suggestion_chain = prompt | structured_llm_grader
            
            result = prompt_suggestion_chain.invoke(
                {"user_query": message}
            )
            
            return result.suggestions
        except Exception as e:
            logger.error(f"Error invoking prompt suggestion agent: {e}", exc_info=True)
            return []