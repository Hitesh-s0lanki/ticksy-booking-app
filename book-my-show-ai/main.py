from src.llms.openai_llm import OpenAILLM
from src.nodes.query_parser_route_node import QueryParserRouteNode

if __name__ == "__main__":
    
    ## using the llm 
    llm = OpenAILLM().get_llm_model()
    
    ## Define the node
    node = QueryParserRouteNode(llm)
    
    ## Example state with user message
    state = {
        "messages": [
            {"role": "user", "content": "I want to book two tickets for the movie Inception."}
        ],
        "state": "initial"
    }
    
    # Execute the node
    new_state = node.execute(state)
    
    print(new_state)
    