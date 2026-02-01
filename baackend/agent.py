"""
LangGraph Agent with Ollama LLM Integration
Cortana - Level-Aware Socratic Teaching Assistant with Coding Playground
"""

from typing import TypedDict, Annotated, Sequence
from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
import json
import re


class AgentState(TypedDict):
    """State for the conversation agent."""
    messages: Annotated[Sequence[BaseMessage], add_messages]


class OllamaAgent:
    """Cortana - Level-Aware Socratic Teaching Assistant with Coding Playground."""
    
    LEVELS = {
        "beginner": {
            "name": "Beginner",
            "description": "New to programming or shaky fundamentals",
            "style": "Use simple language, explain every term, provide more examples and checks",
            "hints": "many",
            "quiz_frequency": 1
        },
        "intermediate": {
            "name": "Intermediate", 
            "description": "Know basics but struggle with application",
            "style": "Assume basic knowledge, focus on application, fewer hints",
            "hints": "moderate",
            "quiz_frequency": 2
        },
        "advanced": {
            "name": "Advanced",
            "description": "Understand concepts, want guided problem solving",
            "style": "Minimal explanations, focus on edge cases and optimization, deep reasoning",
            "hints": "minimal",
            "quiz_frequency": 3
        }
    }
    
    def __init__(self, model_name: str = "llama2"):
        self.model_name = model_name
        self.llm = ChatOllama(
            model=model_name,
            temperature=0.7,
        )
        
        self.system_prompt = """You are Cortana, a Level-Aware Socratic Teaching Assistant.

CORE RULES:
1. NEVER give complete code or direct answers
2. Teach ONE step at a time
3. Every response MUST end with a question, task, or quiz
4. Adapt difficulty based on user's level
5. Review code, don't write it

TEACHING FLOW:
1. Brief concept explanation (level-adjusted)
2. Ask a thinking question
3. Wait for response
4. Correct/refine understanding
5. Move to next step

CODE REVIEW RULES:
- Point out logical mistakes without fixing them
- Highlight syntax issues
- Ask "why" questions about their approach
- Suggest improvements via hints, not solutions

REFUSAL RESPONSE:
If asked for full code, respond: "I can't give the final solution, but I can help you reason it out step by step."

LEVEL ADAPTATION:
- Beginner: Simple language, more checks, many hints
- Intermediate: Assume basics, fewer hints, application focus
- Advanced: Minimal hints, edge cases, optimization questions"""
        
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        
        def agent_node(state: AgentState) -> AgentState:
            messages = list(state["messages"])
            if not messages or not isinstance(messages[0], SystemMessage):
                messages.insert(0, SystemMessage(content=self.system_prompt))
            response = self.llm.invoke(messages)
            return {"messages": [response]}
        
        workflow = StateGraph(AgentState)
        workflow.add_node("agent", agent_node)
        workflow.set_entry_point("agent")
        workflow.add_edge("agent", END)
        return workflow.compile()
    
    def _detect_educational_query(self, message: str) -> bool:
        """Check if user is asking an educational question."""
        keywords = ['code', 'implement', 'write', 'show me', 'give me', 'solution', 
                   'answer', 'how to', 'how do i', 'example', 'program', 'explain',
                   'what is', 'why', 'understand', 'learn', 'teach', 'help me']
        return any(kw in message.lower() for kw in keywords)
    
    def _detect_code_submission(self, message: str) -> bool:
        """Check if message contains code for review."""
        code_indicators = ['```', 'def ', 'function ', 'class ', 'for ', 'while ', 'if ']
        return any(ind in message for ind in code_indicators)
    
    def _build_level_select_json(self, topic: str) -> dict:
        """Build level selection JSON."""
        return {
            "phase": "LEVEL_SELECT",
            "prompt": "Before we start, how familiar are you with this topic?",
            "topic": topic,
            "levels": [
                {"id": "beginner", "name": "Beginner", "desc": "I'm new / shaky fundamentals"},
                {"id": "intermediate", "name": "Intermediate", "desc": "I know basics but struggle with application"},
                {"id": "advanced", "name": "Advanced", "desc": "I understand concepts, want guided problem solving"}
            ],
            "instruction": "Select your level to continue"
        }
    
    def _build_diagnostic_json(self, topic: str, level: str) -> dict:
        """Build diagnostic questions based on level."""
        level_info = self.LEVELS.get(level, self.LEVELS["beginner"])
        
        return {
            "phase": "DIAGNOSTIC",
            "level": level,
            "title": "Quick Knowledge Check",
            "message": f"Great! Let me verify your {level_info['name']} level with a few quick questions.",
            "questions": [
                {
                    "id": "d1",
                    "text": f"What is the main purpose of {topic}?",
                    "type": "multiple_choice",
                    "options": [
                        {"key": "A", "text": "I can explain it clearly"},
                        {"key": "B", "text": "I have a rough idea"},
                        {"key": "C", "text": "I'm not sure"}
                    ]
                },
                {
                    "id": "d2",
                    "text": "Have you implemented something similar before?",
                    "type": "multiple_choice",
                    "options": [
                        {"key": "A", "text": "Yes, multiple times"},
                        {"key": "B", "text": "Once or twice"},
                        {"key": "C", "text": "Never"}
                    ]
                }
            ],
            "next_phase": "TEACHING"
        }
    
    def _build_teaching_step_json(self, step_num: int, total: int, content: str, task: str, level: str) -> dict:
        """Build a teaching step."""
        return {
            "phase": "STEP",
            "step_number": step_num,
            "total_steps": total,
            "level": level,
            "content": content,
            "task": task,
            "show_playground": step_num >= 2
        }
    
    def _build_code_review_json(self, feedback: list) -> dict:
        """Build code review feedback."""
        return {
            "phase": "CODE_REVIEW",
            "title": "Code Review",
            "feedback": feedback,
            "next_action": "revise"
        }
    
    def _build_quiz_json(self, question: str, options: list, level: str) -> dict:
        """Build quiz checkpoint."""
        return {
            "phase": "QUIZ",
            "level": level,
            "title": "Knowledge Check",
            "question": question,
            "options": options
        }
    
    def _build_near_solution_json(self, skeleton: str, blanks: list) -> dict:
        """Build near-solution with blanks."""
        return {
            "phase": "NEAR_SOLUTION",
            "title": "Complete the Code",
            "message": "You've learned the concepts! Now fill in the blanks:",
            "skeleton": skeleton,
            "blanks": blanks,
            "instruction": "Use the playground to complete this code"
        }
    
    def review_code(self, code: str, context: str, level: str) -> dict:
        """Review user-submitted code and provide feedback."""
        level_info = self.LEVELS.get(level, self.LEVELS["beginner"])
        
        # Build review prompt
        review_prompt = f"""Review this code submitted by a {level_info['name']} level student.
Context: {context}

Code:
```
{code}
```

Provide feedback as a JSON array with objects containing:
- "type": "hint" | "error" | "improvement" | "question"
- "message": the feedback message
- "line": (optional) line number if applicable

Remember:
- Do NOT fix the code
- Do NOT write working solutions
- Ask questions that guide them to the fix
- Adapt feedback complexity to {level_info['name']} level

Respond with ONLY the JSON array, no other text."""

        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=review_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Parse response
        try:
            feedback = json.loads(response.content)
        except:
            # Fallback feedback
            feedback = [
                {"type": "hint", "message": "Take a closer look at your logic. What happens in edge cases?"},
                {"type": "question", "message": "Can you trace through your code with a simple example?"}
            ]
        
        return self._build_code_review_json(feedback)
    
    def chat(self, message: str, history: list[dict] = None) -> str:
        """Send a message and get a response."""
        messages = []
        if history:
            for msg in history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        messages.append(HumanMessage(content=message))
        result = self.graph.invoke({"messages": messages})
        if result["messages"]:
            return result["messages"][-1].content
        return "I couldn't generate a response. Please try again."
    
    async def chat_stream(self, message: str, history: list[dict] = None, user_level: str = None):
        """Stream a response with level-aware structured output."""
        messages = [SystemMessage(content=self.system_prompt)]
        
        if history:
            for msg in history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        is_new = not history or len(history) == 0
        is_educational = self._detect_educational_query(message)
        has_code = self._detect_code_submission(message)
        
        # Handle code submission
        if has_code:
            yield "<!--JSON_START-->\n"
            # Extract code from message
            code_match = re.search(r'```[\w]*\n?([\s\S]*?)```', message)
            code = code_match.group(1) if code_match else message
            review = self.review_code(code, "User submitted code for review", user_level or "beginner")
            yield json.dumps(review, indent=2)
            yield "\n<!--JSON_END-->\n\n"
            yield "**[CODE REVIEW]** Let me review your code...\n\n"
            for fb in review.get("feedback", []):
                fb_type = fb.get("type", "hint").upper()
                yield f"**{fb_type}:** {fb.get('message', '')}\n\n"
            return
        
        # New educational query - start with level selection
        if is_new and is_educational:
            topic = message.lower().replace("how do i ", "").replace("implement ", "").replace("?", "").strip()
            
            yield "<!--JSON_START-->\n"
            level_data = self._build_level_select_json(topic)
            yield json.dumps(level_data, indent=2)
            yield "\n<!--JSON_END-->\n\n"
            
            yield "Before we start, **how familiar are you with this topic?**\n\n"
            for lvl in level_data["levels"]:
                yield f"**{lvl['name']}** - {lvl['desc']}\n\n"
            yield "\nSelect your level to continue, then I'll guide you step by step.\n"
            return
        
        # Check if user selected a level
        level_keywords = ["beginner", "intermediate", "advanced"]
        selected_level = None
        for kw in level_keywords:
            if kw in message.lower():
                selected_level = kw
                break
        
        if selected_level:
            # User selected level - show diagnostic
            level_info = self.LEVELS[selected_level]
            yield "<!--JSON_START-->\n"
            diag = self._build_diagnostic_json("this topic", selected_level)
            yield json.dumps(diag, indent=2)
            yield "\n<!--JSON_END-->\n\n"
            
            yield f"**Level set to: {level_info['name']}**\n\n"
            yield "Let me verify with a quick check:\n\n"
            for i, q in enumerate(diag["questions"], 1):
                yield f"**Q{i}:** {q['text']}\n"
                for opt in q["options"]:
                    yield f"   {opt['key']}) {opt['text']}\n"
                yield "\n"
            return
        
        # Regular teaching flow - use LLM
        level_context = ""
        if user_level:
            level_info = self.LEVELS.get(user_level, self.LEVELS["beginner"])
            level_context = f"\n\nAdapt your response for a {level_info['name']} level student. {level_info['style']}"
        
        messages.append(HumanMessage(content=message + level_context))
        
        async for chunk in self.llm.astream(messages):
            if chunk.content:
                yield chunk.content


def create_agent(model_name: str = "phi") -> OllamaAgent:
    """Create an Ollama agent with the specified model."""
    return OllamaAgent(model_name=model_name)
