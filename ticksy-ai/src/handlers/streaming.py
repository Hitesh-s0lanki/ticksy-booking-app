import logging
import uuid
from typing import AsyncGenerator, List
from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from src.schemas.models import CharResponse
from src.state.suggestion_state import suggestion_state
from src.utils.suggestion_extractor import extract_suggestions_from_tool_output

logger = logging.getLogger(__name__)

async def stream_generator(messages: List[BaseMessage], agent) -> AsyncGenerator[str, None]:
    """Stream chunks from the agent in CharResponse format."""
    # Generate a session ID for this stream
    session_id = str(uuid.uuid4())
    
    try:
        last_content = ""
        chunk_count = 0
        current_suggestions = []
        
        async for chunk in agent.astream(messages):
            chunk_count += 1

            # Handle different chunk structures
            messages_list = None
            tool_outputs = []
            
            if isinstance(chunk, dict):
                if "messages" in chunk:
                    messages_list = chunk["messages"]
                elif "model" in chunk and isinstance(chunk["model"], dict) and "messages" in chunk["model"]:
                    # Handle LangChain agent model chunks: {'model': {'messages': [...]}}
                    messages_list = chunk["model"]["messages"]
                elif "agent" in chunk and isinstance(chunk["agent"], dict) and "messages" in chunk["agent"]:
                    messages_list = chunk["agent"]["messages"]
                elif "steps" in chunk:
                    # Handle agent steps - extract tool outputs
                    for step in chunk.get("steps", []):
                        if "messages" in step:
                            messages_list = step["messages"]
                            # Extract tool messages from steps
                            for msg in step.get("messages", []):
                                if isinstance(msg, ToolMessage) or (hasattr(msg, "type") and msg.type == "tool"):
                                    tool_outputs.append(msg)
                            break
                
                # Also check for tool calls in the chunk itself
                if "tool_calls" in chunk or "tool" in chunk:
                    # Try to extract tool output
                    if "tool" in chunk:
                        tool_outputs.append(chunk["tool"])
            
            # Extract suggestions from tool outputs
            if tool_outputs:
                for tool_output in tool_outputs:
                    try:
                        # Get tool output content
                        if hasattr(tool_output, "content"):
                            output_content = tool_output.content
                        elif isinstance(tool_output, dict):
                            output_content = tool_output.get("content") or tool_output
                        else:
                            output_content = tool_output
                        
                        # Extract suggestions from tool output
                        suggestions = extract_suggestions_from_tool_output(output_content)
                        if suggestions:
                            current_suggestions.extend(suggestions)
                            # Update global state
                            suggestion_state.set_suggestions(session_id, current_suggestions)
                            logger.debug(f"Extracted {len(suggestions)} suggestions from tool output")
                    except Exception as e:
                        logger.error(f"Error extracting suggestions from tool output: {e}", exc_info=True)
            
            # Also check messages for tool messages
            if messages_list:
                for message in messages_list:
                    # Check for tool messages
                    if isinstance(message, ToolMessage) or (hasattr(message, "type") and message.type == "tool"):
                        try:
                            output_content = message.content if hasattr(message, "content") else str(message)
                            suggestions = extract_suggestions_from_tool_output(output_content)
                            if suggestions:
                                current_suggestions.extend(suggestions)
                                suggestion_state.set_suggestions(session_id, current_suggestions)
                                logger.debug(f"Extracted {len(suggestions)} suggestions from tool message")
                        except Exception as e:
                            logger.error(f"Error extracting suggestions from tool message: {e}", exc_info=True)
                    
                    # Check if it's an AI message
                    if isinstance(message, AIMessage) or (hasattr(message, "type") and message.type == "ai"):
                        # Handle different content types
                        raw_content = message.content if hasattr(message, "content") else str(message)
                        
                        # Convert content to string if it's a list or other type
                        if isinstance(raw_content, list):
                            # Handle list of content blocks (e.g., from OpenAI)
                            content = "".join(str(item.get("text", item)) if isinstance(item, dict) else str(item) for item in raw_content)
                        elif isinstance(raw_content, dict):
                            # Handle dict content
                            content = raw_content.get("text", str(raw_content))
                        else:
                            content = str(raw_content)
                        
                        if content and isinstance(content, str):
                            # Get current suggestions from state
                            suggestions = suggestion_state.get_suggestions(session_id)
                            
                            # Extract only the new part
                            if content.startswith(last_content):
                                new_part = content[len(last_content):]
                                if new_part:
                                    last_content = content
                                    response = CharResponse(
                                        message=new_part, 
                                        suggestion=suggestions, 
                                        stage="query"
                                    )
                                    logger.debug(f"Yielding new content: {new_part[:50]}...")
                                    yield f"{response.model_dump_json()}\n"
                            elif last_content and not content.startswith(last_content):
                                # Content changed completely, send the full new content
                                last_content = content
                                response = CharResponse(
                                    message=content, 
                                    suggestion=suggestions, 
                                    stage="query"
                                )
                                logger.debug(f"Yielding full new content: {content[:50]}...")
                                yield f"{response.model_dump_json()}\n"
                            elif not last_content:
                                # First chunk
                                last_content = content
                                response = CharResponse(
                                    message=content, 
                                    suggestion=suggestions, 
                                    stage="query"
                                )
                                logger.debug(f"Yielding first content: {content[:50]}...")
                                yield f"{response.model_dump_json()}\n"
        
        # Clean up session state after streaming completes
        suggestion_state.clear_suggestions(session_id)
    
    except Exception as e:
        logger.error(f"Error in stream_generator: {e}", exc_info=True)
        error_response = CharResponse(message=f"Error: {str(e)}", suggestion=[], stage="query")
        yield f"{error_response.model_dump_json()}\n"
        # Clean up on error
        suggestion_state.clear_suggestions(session_id)

