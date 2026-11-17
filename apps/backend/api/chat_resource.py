"""REST API router for AI Clinical Assistant."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel
from chat import agent

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])


class ChatRequest(BaseModel):
    session_id: str
    message: str


@router.get("/welcome", response_model=dict[str, str])
def get_welcome() -> dict[str, str]:
    return agent.get_welcome_message()


@router.post("", response_model=dict[str, Any])
def send_message(req: ChatRequest) -> dict[str, Any]:
    return agent.chat(req.session_id, req.message)


@router.post("/reset/{session_id}", response_model=dict[str, bool])
def reset_chat(session_id: str) -> dict[str, bool]:
    res = agent.reset_session(session_id)
    return {"reset": res}
