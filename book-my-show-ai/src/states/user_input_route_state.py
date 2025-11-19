from typing_extensions import Literal
from pydantic import BaseModel, Field

class UserInputRouteState(BaseModel):
    step: Literal["query", "support"] = Field(description="The next step in the routing process")