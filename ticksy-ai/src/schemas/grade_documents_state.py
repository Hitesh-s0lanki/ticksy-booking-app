from pydantic import BaseModel, Field

class GradeDocumentsState(BaseModel):
    binary_score: str = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )