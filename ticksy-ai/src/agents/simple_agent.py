from langchain.agents import create_agent
from typing import AsyncGenerator, List, Dict, Any, Sequence, Union
from langchain_core.tools import BaseTool
from langchain_core.messages import BaseMessage

class SimpleAgent:
    
    def __init__(self, model, tools: Sequence[BaseTool] = None):
        self.name = "SimpleAssistant"
        self.instructions = "You are a helpful assistant."
        self.model = model
        self.tools = tools or []
        
        # Create the agent executable upon initialization
        self.agent = create_agent(
            model=self.model,
            system_prompt=self.instructions,
            tools=self.tools
        )

    def invoke(self, messages: Union[List[Dict[str, str]], List[BaseMessage]]) -> Dict[str, Any]:
        return self.agent.invoke({"messages": messages})

    async def astream(self, messages: Union[List[Dict[str, str]], List[BaseMessage]]) -> AsyncGenerator[Dict[str, Any], Any]:
        async for chunk in self.agent.astream({"messages": messages}):
            yield chunk