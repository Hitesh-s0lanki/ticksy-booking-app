from langchain.agents import create_agent
from typing import AsyncGenerator, List, Dict, Any, Sequence, Union
from langchain_core.tools import BaseTool
from langchain_core.messages import BaseMessage
from langchain.tools import tool


from src.llms.openai_llm import OpenAILLM
from src.agents.query_resolver_agent import QueryResolverAgent
from src.instructions.ticksy_agent_instruction import get_ticksy_agent_system_prompt
import logging

logger = logging.getLogger(__name__)

class TicksyAgent:

    def __init__(self, model=None, tools: Sequence[BaseTool] = None):
        self.name = "TicksyAgent"
        self.model = model or OpenAILLM().get_llm_model()
        self.instructions = get_ticksy_agent_system_prompt()
        self.query_resolver_agent = QueryResolverAgent(model=model)
        
        # Initialize the TicksyAgentTools
        # self.tools = TicksyAgentTools(model=model).get_all_tools()
        
        self.tools = self._create_default_tools()
        
        # Create the agent executable upon initialization
        self.agent = create_agent(
            model=self.model,
            system_prompt=self.instructions,
            tools=self.tools
        )
        
    def _create_query_resolver_tool(self) -> BaseTool:
        
        @tool("query_resolver_agent")
        def query_resolver_agent(query: str) -> str:
            """
            Specialized agent for resolving detailed queries about 
            data about movies, events, venues, and showtimes.
            
            Use this tool when users ask about:
            - Finding movies or events
            - Checking showtimes and availability
            - Getting venue information
            - Searching for specific entertainment content
            - Any booking-related queries
            
            Args:
                query: The user's query about movies, events, venues, or showtimes.
            
            Returns:
                A friendly, formatted response with the requested information.
            """
            try: 
                logger.info(f"[LOG] Query Resolver Agent Query: {query}")
                result = self.query_resolver_agent.invoke([{"role": "user", "content": query}])
                
                logger.info(f"[LOG] Query Resolver Agent Result: {result['messages'][-1].content}")
                
                return result['messages'][-1].content
            
            except Exception as e:
                logger.error(f"[ERROR] Query Resolver Agent Error: {str(e)}")
                return f"Sorry, I couldn't find any information about that. Please try again later."

        return query_resolver_agent
    
    def _create_default_tools(self) -> List[BaseTool]:
        """Create default tools including query_resolver_agent as a tool."""
        return [
            self._create_query_resolver_tool()
        ]
    
    def invoke(self, messages: Union[List[Dict[str, str]], List[BaseMessage]]) -> Dict[str, Any]:
        """
        Invoke the agent with a list of messages.
        
        Args:
            messages: List of message dictionaries or BaseMessage objects.
        
        Returns:
            Agent response dictionary.
        """
        return self.agent.invoke({"messages": messages})
    
    async def astream(self, messages: Union[List[Dict[str, str]], List[BaseMessage]]) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream agent responses asynchronously.
        
        Args:
            messages: List of message dictionaries or BaseMessage objects.
        
        Yields:
            Streaming chunks from the agent.
        """
        async for chunk in self.agent.astream({"messages": messages}):
            yield chunk
    
    def chat(self, user_message: str) -> str:
        """
        Convenience method for simple chat interactions.
        
        Args:
            user_message: The user's message string.
        
        Returns:
            The agent's response as a string.
        """
        result = self.invoke([{"role": "user", "content": user_message}])
        
        # Extract the response from the agent result
        if "messages" in result and len(result["messages"]) > 0:
            last_message = result["messages"][-1]
            if hasattr(last_message, "content"):
                return last_message.content
            elif isinstance(last_message, dict) and "content" in last_message:
                return last_message["content"]
        
        return str(result)
    