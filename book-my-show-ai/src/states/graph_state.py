from typing_extensions import TypedDict, List, Literal
from typing import Annotated
from langgraph.graph.message import add_messages

from src.states.user_input_route_state import UserInputRouteState
from src.states.query_parser_route_state import QueryParserRouteState
from src.states.information_state import InformationState
from src.states.query_resolver_state import QueryResolverState

class GraphState(TypedDict):
    messages: Annotated[List, add_messages]
    state: Literal["initial", "user_input_route", "query", "support", "final_answer"]
    user_input_route_state: UserInputRouteState
    query_parser_route_state: QueryParserRouteState
    query_resolver_agent: QueryResolverState
    information_state: InformationState
    error_message: str
