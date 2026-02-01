"""
FastAPI Backend for AI Personal Assistant
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json
import asyncio

from agent import create_agent, OllamaAgent

# Initialize FastAPI app
app = FastAPI(
    title="AI Personal Assistant",
    description="A ChatGPT-like AI assistant powered by Ollama",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the agent
agent: OllamaAgent = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[ChatMessage]] = None
    stream: Optional[bool] = True


class ChatResponse(BaseModel):
    response: str
    success: bool = True


class HealthResponse(BaseModel):
    status: str
    model: str


@app.on_event("startup")
async def startup_event():
    """Initialize the agent on startup."""
    global agent
    try:
        agent = create_agent(model_name="phi")
        print("✅ Agent initialized successfully with phi model")
    except Exception as e:
        print(f"⚠️ Failed to initialize agent: {e}")
        print("Make sure Ollama is running: ollama serve")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if the API is healthy and the model is loaded."""
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    return HealthResponse(
        status="healthy",
        model=agent.model_name
    )


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Send a message to the AI assistant.
    
    Supports both streaming and non-streaming responses.
    """
    if agent is None:
        raise HTTPException(
            status_code=503, 
            detail="Agent not initialized. Make sure Ollama is running."
        )
    
    # Convert history to the expected format
    history = None
    if request.history:
        history = [{"role": msg.role, "content": msg.content} for msg in request.history]
    
    if request.stream:
        # Streaming response
        async def generate():
            try:
                async for chunk in agent.chat_stream(request.message, history):
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    else:
        # Non-streaming response
        try:
            response = agent.chat(request.message, history)
            return ChatResponse(response=response)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/sync", response_model=ChatResponse)
async def chat_sync(request: ChatRequest):
    """
    Send a message and get a complete response (non-streaming).
    """
    if agent is None:
        raise HTTPException(
            status_code=503, 
            detail="Agent not initialized. Make sure Ollama is running."
        )
    
    history = None
    if request.history:
        history = [{"role": msg.role, "content": msg.content} for msg in request.history]
    
    try:
        response = agent.chat(request.message, history)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
