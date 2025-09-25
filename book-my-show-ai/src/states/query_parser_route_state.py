from typing_extensions import Literal
from pydantic import BaseModel, Field

class QueryParserRouteState(BaseModel):
    source: Literal["movie", "event", "sport", "random"] = Field(description="The source of the query")
    step: Literal["information", "suggestion"] = Field(description="The next step in the routing process")
    
    