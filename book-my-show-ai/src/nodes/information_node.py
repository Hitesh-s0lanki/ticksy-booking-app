import json
from langchain.schema import Document
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

## Instructions
from src.instructions.grade_documents_agent import grade_documents_agent

## Tools
from src.tools.web_search_tool import WebSearchTool
from src.vector_store.pinecone_vector_database import PineconeVectorDB

## States
from src.states.graph_state import GraphState, InformationState
from src.states.grade_documents_state import GradeDocumentsState
from langchain_core.output_parsers import StrOutputParser

class InformationNode:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.retriever = PineconeVectorDB().get_retriever("similarity", k=5)
        self.grade_documents_agent = grade_documents_agent()
        self.web_search_tool = WebSearchTool().get_tool()

    def retrieve(self, state: GraphState) -> GraphState:
        question = state["messages"][-1]["content"]
        
        filter = {}
        filter_params = state["query_parser_route_state"]
        
        if filter_params.get("source") is not None and filter_params["source"] != "random":
            filter["source"] = filter_params["source"]
        
        parse_question = f"""
            {question}
            
            << Additional Context >>
            {json.dumps(filter)}
            << End Additional Context >>
        """

        documents = self.retriever.invoke(parse_question)
        
        state["information_state"] = InformationState(
            question=question,
            documents=documents
        )
        
        return state

    def grade_documents(self, state: GraphState) -> GraphState:
        question = state['information_state']["question"]
        documents = state['information_state']["documents"]

        # Score each doc
        filtered_docs = []
        web_search = "No"
        
        # llm with structured output
        structured_llm_grader = self.llm.with_structured_output(GradeDocumentsState)
        grade_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", self.grade_documents_agent()),
                ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
            ]
        )
        
        ##chain the prompt with the LLM
        retrieval_grader = grade_prompt | structured_llm_grader
        
        for d in documents:
            score = retrieval_grader.invoke(
                {"question": question, "document": d.page_content}
            )
            grade = score.binary_score
            if grade == "yes":
                print("---GRADE: DOCUMENT RELEVANT---")
                filtered_docs.append(d)
            else:
                print("---GRADE: DOCUMENT NOT RELEVANT---")
                web_search = "Yes"
                continue
        
        state["information_state"] = InformationState(
            question=question,
            documents=filtered_docs,
            web_search=web_search
        )
        
        return state

    # def generate(self, state):
        
    #     question = state["question"]
    #     documents = state["documents"]

    #     # RAG generation
    #     generation = rag_chain.invoke({"context": documents, "question": question})
    #     return {"documents": documents, "question": question, "generation": generation}


    def transform_query(self, state:GraphState) -> GraphState:
        
        question = state['information_state']["question"]
        documents = state['information_state']["documents"]
        web_search = state['information_state']["web_search"]
        
        system = """You a question re-writer that converts an input question to a better version that is optimized \n 
            for web search. Look at the input and try to reason about the underlying semantic intent / meaning."""
        re_write_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system),
                (
                    "human",
                    "Here is the initial question: \n\n {question} \n Formulate an improved question.",
                ),
            ]
        )
        
        question_rewriter = re_write_prompt | self.llm | StrOutputParser()
        
        # Re-write question
        better_question = question_rewriter.invoke({"question": question})
        
        state["information_state"] = InformationState(
            question=better_question,
            documents=documents,
            web_search=web_search
        )
        
        return state

    def web_search(self, state:GraphState) -> GraphState:

        question = state["information_state"]["question"]
        documents = state["information_state"]["documents"]
        web_search = state["information_state"]["web_search"]
        
        # Web search
        docs = self.web_search_tool.invoke({"query": question})
        web_results = "\n".join([d["content"] for d in docs])
        web_results = Document(page_content=web_results)
        documents.append(web_results)

        state["information_state"] = InformationState(
            question=question,
            documents=documents,
            web_search=web_search
        )
        
        return state

    ### Edges
    def decide_to_generate(state: GraphState) -> str:
        web_search = state["information_state"]["web_search"]
        if web_search == "Yes":
            return "transform_query"
        else:
            return "generate"
        
    