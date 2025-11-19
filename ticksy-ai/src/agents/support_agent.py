from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages

from src.instructions.support_agent_instruction import get_support_agent_system_prompt
from src.llms.openai_llm import OpenAILLM
import logging

logger = logging.getLogger(__name__)


class SupportAgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]


class SupportAgent:
    """Support agent built with LangGraph for handling customer disputes and support issues."""
    
    def __init__(self, model=None):
        self.name = "SupportAgent"
        self.model = model or OpenAILLM().get_llm_model()
        self.instructions = get_support_agent_system_prompt()
        
        # Build the graph
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph graph for support agent."""
        graph = StateGraph(SupportAgentState)
        
        # Add the agent node
        graph.add_node("agent", self._agent_node)
        
        # Set entry point
        graph.set_entry_point("agent")
        
        # Add edge from agent to END
        graph.add_edge("agent", END)
        
        return graph.compile()
    
    def _agent_node(self, state: SupportAgentState) -> SupportAgentState:
        """Agent node that processes messages and generates responses."""
        try:
            # Create prompt with system message
            prompt = ChatPromptTemplate.from_messages([
                ("system", self.instructions),
                MessagesPlaceholder(variable_name="messages"),
            ])
            
            # Create chain
            chain = prompt | self.model
            
            # Get messages from state
            messages = state.get("messages", [])
            
            # Invoke the chain
            response = chain.invoke({"messages": messages})
            
            # Return updated state with the response
            return {"messages": [response]}
            
        except Exception as e:
            logger.error(f"Error in support agent node: {e}", exc_info=True)
            error_message = AIMessage(content=f"I apologize, but I encountered an error while processing your request. Please try again or contact our support team.")
            return {"messages": [error_message]}
    
    def invoke(self, messages):
        """Invoke the agent with messages."""
        if isinstance(messages, list) and len(messages) > 0:
            # Convert dict messages to BaseMessage if needed
            langchain_messages = []
            for msg in messages:
                if isinstance(msg, dict):
                    if msg.get("role") == "user":
                        langchain_messages.append(HumanMessage(content=msg.get("content", "")))
                    elif msg.get("role") == "assistant":
                        langchain_messages.append(AIMessage(content=msg.get("content", "")))
                elif isinstance(msg, BaseMessage):
                    langchain_messages.append(msg)
            
            result = self.graph.invoke({"messages": langchain_messages})
            return {"messages": result.get("messages", [])}
        
        return {"messages": []}
    
    async def astream(self, messages):
        """Stream agent responses asynchronously."""
        if isinstance(messages, list) and len(messages) > 0:
            # Convert dict messages to BaseMessage if needed
            langchain_messages = []
            for msg in messages:
                if isinstance(msg, dict):
                    if msg.get("role") == "user":
                        langchain_messages.append(HumanMessage(content=msg.get("content", "")))
                    elif msg.get("role") == "assistant":
                        langchain_messages.append(AIMessage(content=msg.get("content", "")))
                elif isinstance(msg, BaseMessage):
                    langchain_messages.append(msg)
            
            async for chunk in self.graph.astream({"messages": langchain_messages}):
                yield chunk

