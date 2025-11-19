
from langchain.agents import create_agent
from typing import AsyncGenerator, List, Dict, Any, Sequence, Union
from langchain_core.tools import BaseTool
from langchain_core.messages import BaseMessage

from src.llms.openai_llm import OpenAILLM
from src.instructions.query_resolver_instruction import get_query_resolver_system_prompt
from src.tools.query_resolver_tools import QueryResolverTools


class QueryResolverAgent:
    
    def __init__(self, model=None, tools: Sequence[BaseTool] = None):
        self.name = "QueryResolverAgent"
        self.model = model or OpenAILLM().get_llm_model()
        self.instructions = get_query_resolver_system_prompt()
        
        # If tools not provided, get them from QueryResolverTools
        if tools is None:
            tools_instance = QueryResolverTools()
            tools = self._get_tools_from_instance(tools_instance)
        
        self.tools = tools
        
        # Create the agent executable upon initialization
        self.agent = create_agent(
            model=self.model,
            system_prompt=self.instructions,
            tools=self.tools
        )
    
    def _get_tools_from_instance(self, tools_instance: QueryResolverTools) -> List[BaseTool]:
        """Extract all @tool decorated methods from QueryResolverTools instance."""
        return tools_instance.get_all_tools()

    def invoke(self, messages: Union[List[Dict[str, str]], List[BaseMessage]]) -> Dict[str, Any]:
        return self.agent.invoke({"messages": messages})

    async def astream(self, messages: Union[List[Dict[str, str]], List[BaseMessage]]) -> AsyncGenerator[Dict[str, Any], None]:
        async for chunk in self.agent.astream({"messages": messages}):
            yield chunk
    
    def resolve_query(self, query: str) -> str:
        """Legacy method for backward compatibility."""
        result = self.invoke([{"role": "user", "content": query}])
        # Extract the response from the agent result
        if "messages" in result and len(result["messages"]) > 0:
            last_message = result["messages"][-1]
            if hasattr(last_message, "content"):
                return last_message.content
            elif isinstance(last_message, dict) and "content" in last_message:
                return last_message["content"]
        return str(result)