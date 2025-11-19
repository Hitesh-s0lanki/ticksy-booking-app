from langchain_core.messages import HumanMessage, SystemMessage
from src.states.graph_state import GraphState, QueryParserRouteState

from src.instructions.query_parser_route_agent import query_parser_route_agent

class QueryParserRouteNode:
    def __init__(self, llm):
        self.llm = llm
        self.instruction = query_parser_route_agent()
        
    def execute(self, state: GraphState) -> GraphState:
        # Extract the latest user input from messages
        user_input = state['messages'][-1]['content']

        router = self.llm.with_structured_output(QueryParserRouteState)
        
        decision = router.invoke(
            [
                SystemMessage(content=self.instruction),
                HumanMessage(content=user_input)
            ]
        )

        state['query_parser_route_state'] = QueryParserRouteState(
            source=decision.source,
            step=decision.step,
            date=decision.date,
            location=decision.location
        )

        return state
        