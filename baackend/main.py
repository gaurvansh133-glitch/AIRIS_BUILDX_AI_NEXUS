"""
FastAPI Backend for Cortana - Level-Aware Socratic Teaching Assistant
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json

from agent import create_agent, OllamaAgent

# Initialize FastAPI app
app = FastAPI(
    title="Cortana Teaching Assistant",
    description="A level-aware Socratic teaching assistant with coding playground",
    version="2.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "*"],
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
    user_level: Optional[str] = None  # beginner, intermediate, advanced


class CodeReviewRequest(BaseModel):
    code: str
    context: Optional[str] = "User submitted code for review"
    user_level: Optional[str] = "beginner"


class ChatResponse(BaseModel):
    response: str
    success: bool = True


class HealthResponse(BaseModel):
    status: str
    model: str
    features: list[str]


@app.on_event("startup")
async def startup_event():
    """Initialize the agent on startup."""
    global agent
    try:
        agent = create_agent(model_name="phi")
        print("✅ Cortana initialized with level-aware teaching")
    except Exception as e:
        print(f"⚠️ Failed to initialize agent: {e}")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and features."""
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    return HealthResponse(
        status="healthy",
        model=agent.model_name,
        features=["level-aware", "socratic-teaching", "code-review", "playground"]
    )


@app.post("/chat")
async def chat(request: ChatRequest):
    """Send a message with optional level context."""
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    history = None
    if request.history:
        history = [{"role": msg.role, "content": msg.content} for msg in request.history]
    
    if request.stream:
        async def generate():
            try:
                async for chunk in agent.chat_stream(
                    request.message, 
                    history, 
                    user_level=request.user_level
                ):
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
        try:
            response = agent.chat(request.message, history)
            return ChatResponse(response=response)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/review")
async def review_code(request: CodeReviewRequest):
    """Review user-submitted code and provide educational feedback."""
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        review = agent.review_code(
            request.code,
            request.context,
            request.user_level
        )
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/levels")
async def get_levels():
    """Get available learning levels."""
    if agent is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    return {
        "levels": [
            {
                "id": "beginner",
                "name": "Beginner",
                "description": "New to programming or shaky fundamentals",
                "hints": "Many hints and checks"
            },
            {
                "id": "intermediate", 
                "name": "Intermediate",
                "description": "Know basics but struggle with application",
                "hints": "Moderate hints, focus on application"
            },
            {
                "id": "advanced",
                "name": "Advanced",
                "description": "Understand concepts, want guided problem solving",
                "hints": "Minimal hints, deep reasoning"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
