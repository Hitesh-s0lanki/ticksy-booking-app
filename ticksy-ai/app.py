import os
import uvicorn
import logging
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from src.agents.ticksy_agent import TicksyAgent
from src.schemas import ChatRequest, ChatMessage, CharResponse
from src.handlers.streaming import stream_generator
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

if "OPENAI_API_KEY" not in os.environ:
    raise ValueError("OPENAI_API_KEY environment variable not set")

try:
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0, streaming=True)
except Exception as e:
    raise RuntimeError(f"Error initializing model: {e}") from e

agent = TicksyAgent(model=model)

app = FastAPI(
    title="Ticksy Booking AI Assistant",
    description="A FastAPI server for Ticksy Booking Platform AI assistant - stream responses from the Ticksy agent.",
    docs_url="/",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_langchain_messages(messages: List[ChatMessage]) -> List[BaseMessage]:
    """Convert ChatMessage models into LangChain message instances."""
    role_map = {
        "system": SystemMessage,
        "user": HumanMessage,
        "assistant": AIMessage,
    }

    converted: List[BaseMessage] = []
    for message in messages:
        message_cls = role_map.get(message.role.lower())
        if message_cls is None:
            raise ValueError(f"Unsupported role in ChatMessage: {message.role}")
        converted.append(message_cls(content=message.content))
    return converted


@app.post("/stream")
async def stream_chat(request: ChatRequest):
    """Stream chat responses from the agent in CharResponse format."""
    try:
        messages = _to_langchain_messages(request.messages)
        return StreamingResponse(
            stream_generator(messages, agent),
            media_type="application/x-ndjson",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        logger.error(f"Error in stream_chat endpoint: {e}", exc_info=True)
        # Return error as streaming response
        async def error_generator():
            error_response = CharResponse(message=f"Error: {str(e)}", suggestion=[], stage="query")
            yield f"{error_response.model_dump_json()}\n"
        return StreamingResponse(
            error_generator(),
            media_type="application/x-ndjson",
            status_code=500
        )


if __name__ == "__main__":
    print("Starting FastAPI server on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)