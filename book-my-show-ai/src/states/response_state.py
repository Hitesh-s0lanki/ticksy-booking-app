from typing import List, Annotated
from typing_extensions import TypedDict, Literal
from langgraph.graph.message import add_messages

class ResponseState(TypedDict):
    type: Literal["otp", "message", "error", "suggestion"]
    messages: Annotated[List, add_messages]
    data: List[dict]
    response_message: str
    