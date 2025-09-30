from langchain_core.messages import HumanMessage, SystemMessage
from src.states.graph_state import GraphState, UserInputRouteState

from src.instructions.user_input_route_agent import user_input_route_agent

class UserInputRouteNode:
    def __init__(self, llm):
        self.llm = llm
        self.instruction = user_input_route_agent()
        
    def execute(self, state: GraphState) -> GraphState:
        # Extract the latest user input from messages
        user_input = state['messages'][-1]['content']

        router = self.llm.with_structured_output(UserInputRouteState)
        
        decision = router.invoke(
            [
                SystemMessage(content=self.instruction),
                HumanMessage(content=user_input)
            ]
        )
        
        print(decision)
        
        state['user_input_route_state'] = UserInputRouteState(step=decision.step)

        return state
        