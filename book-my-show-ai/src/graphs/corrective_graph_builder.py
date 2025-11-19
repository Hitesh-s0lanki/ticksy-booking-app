from langgraph.graph import StateGraph, START, END
from src.states.graph_state import GraphState

from src.nodes.information_node import InformationNode

from langchain_openai import ChatOpenAI

class CorrectiveGraphBuilder:

    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.graph = StateGraph(GraphState)
        
    def build_corrective_rag_graph(self):
        """
            Build a graph to generate bolgs based on topic
        """
        ## defining the information node
        self.information_node = InformationNode(self.llm)

        # Define the nodes
        self.graph.add_node("retrieve", self.information_node.retrieve)  # retrieve
        self.graph.add_node("grade_documents", self.information_node.grade_documents)  # grade documents
        self.graph.add_node("generate", self.information_node.generate)  # generate
        self.graph.add_node("transform_query", self.information_node.transform_query)  # transform_query
        self.graph.add_node("web_search_node", self.information_node.web_search)  # web search

        # Build graph
        self.graph.add_edge(START, "retrieve")
        self.graph.add_edge("retrieve", "grade_documents")
        self.graph.add_conditional_edges(
            "grade_documents",
            self.information_node.decide_to_generate,
            {
                "transform_query": "transform_query",
                "generate": "generate",
                "error": END,
            },
        )
        
        self.graph.add_edge("transform_query", "web_search_node")
        self.graph.add_edge("web_search_node", "generate")
        self.graph.add_edge("generate", END)
    

    def setup_graph(self):        
        self.build_corrective_rag_graph()
        return self.graph.compile()

    
