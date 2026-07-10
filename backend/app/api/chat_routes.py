from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request, current_user: User = Depends(get_current_user)):
    agent = req.app.state.delivery_agent
    response = await agent.chat(request.message)
    return ChatResponse(response=response)

@router.get("/status")
async def chat_status(req: Request):
    agent = req.app.state.delivery_agent
    return {
        "status": "ready" if agent.agent else "not_ready",
        "agent_ready": agent.agent is not None
    }