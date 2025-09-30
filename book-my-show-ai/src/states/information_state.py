from typing import List
from typing_extensions import TypedDict
from langchain_core.documents import Document

class InformationState(TypedDict):
    question: str
    generation: str
    web_search: str
    documents: List[Document]