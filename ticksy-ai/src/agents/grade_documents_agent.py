from typing import Dict, Any
from src.schemas.grade_documents_state import GradeDocumentsState

from src.instructions.grade_documents_instruction import grade_documents_instruction

from langchain_core.prompts import ChatPromptTemplate
from src.llms.openai_llm import OpenAILLM

class GradeDocumentsAgent:
    
    def __init__(self, ):
        self.llm = OpenAILLM().get_llm_model()
        self.instruction = grade_documents_instruction()
        
    def grade_documents(self, documents: list[Dict[str, Any]], question: str) -> list[Dict[str, Any]]:
        # llm with structured output
        structured_llm_grader = self.llm.with_structured_output(GradeDocumentsState)
        grade_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", self.instruction),
                ("human", "Retrieved documents: \n\n {documents} \n\n User question: {question}"),
            ]
        )

        ##chain the prompt with the LLM
        retrieval_grader = grade_prompt | structured_llm_grader
        
        filtered_docs = []
        
        for d in documents:    
            score = retrieval_grader.invoke(
                {"documents": documents, "question": question}
            )
            
            if score.binary_score == "yes":
                filtered_docs.append(d)
            else:
                continue
            
        return filtered_docs