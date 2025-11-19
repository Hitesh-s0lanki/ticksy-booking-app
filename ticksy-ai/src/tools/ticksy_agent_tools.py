from typing import List
from langchain_core.tools import BaseTool, StructuredTool

from src.agents.query_resolver_agent import QueryResolverAgent

class TicksyAgentTools:
    def __init__(self, model=None):
        self.query_resolver_agent = QueryResolverAgent(model=model)
        self.query_resolver_tool = StructuredTool.from_function(
            func=self._build_query_resolver_callable(),
            name="query_resolver_agent",
            description=(
                "Specialized agent for resolving detailed queries about movies, "
                "events, venues, and showtimes. Use for booking-related requests."
            )
        )

    def _build_query_resolver_callable(self):
        def _tool_fn(query: str):
            return self._run_query_resolver(query)
        _tool_fn.__name__ = "query_resolver_agent_tool"
        return _tool_fn

    def _run_query_resolver(self, query: str):
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
            print(f"[LOG] Query Resolver Agent Query: {query}")
            
            # Invoke the query resolver agent with the user's query
            result = self.query_resolver_agent.invoke([
                {"role": "user", "content": query}
            ])
            return result
        except Exception as e:
            return f"[ERROR] Query Resolver Agent Error: {str(e)}"
        
    def get_all_tools(self) -> List[BaseTool]:
        return [
            self.query_resolver_tool
        ]