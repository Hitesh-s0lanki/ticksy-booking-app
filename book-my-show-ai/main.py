from src.llms.openai_llm import OpenAILLM
from src.graphs.corrective_graph_builder import CorrectiveGraphBuilder

from src.states.graph_state import GraphState
from langchain_core.messages import HumanMessage

from src.data.db import ConnectionDB

import warnings

if __name__ == "__main__":
    ## Suppressing Warnings
    # warnings.filterwarnings("ignore")
    
    # ## using the llm 
    # llm = OpenAILLM().get_llm_model()

    # ## defining the graph builder
    # graph_builder = CorrectiveGraphBuilder(llm)

    # ## Example state with user message
    # state = GraphState(
    #     messages=[
    #         HumanMessage(content="What's on movies tonight for me?")
    #     ],
    #     query_parser_route_state={"source": "random"},
    # )

    # graph = graph_builder.setup_graph()
    # state:GraphState = graph.invoke(state)
    
    # if state.get("error_message") is not None:
    #     print("Error encountered:", state["error_message"])
    # else:
    #     print("Final State:", state["information_state"]["generation"])
    
    db = ConnectionDB()
    # movies = db.get_movies_data()
    # print(movies)

    events = db.get_event_data()
    print(events)

    