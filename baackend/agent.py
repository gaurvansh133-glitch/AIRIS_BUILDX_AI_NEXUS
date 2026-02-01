"""
LangGraph Agent with Ollama LLM Integration - Socratic Teaching Assistant
"""

from typing import TypedDict, Annotated, Sequence
from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """State for the conversation agent."""
    messages: Annotated[Sequence[BaseMessage], add_messages]


class OllamaAgent:
    """Socratic Teaching Assistant using LangGraph and Ollama."""
    
    def __init__(self, model_name: str = "llama2"):
        self.model_name = model_name
        self.llm = ChatOllama(
            model=model_name,
            temperature=0.7,
        )
        self.system_prompt = """You are a Socratic Teaching Assistant designed to help students learn by guiding them through problems WITHOUT giving direct answers.

## Your Core Teaching Philosophy:
1. **NEVER give the direct answer or solution** - This is your most important rule
2. **Break problems into small, manageable steps** - Decompose complex problems into simple parts
3. **Ask guiding questions** - Help students discover answers themselves
4. **Wait for understanding** - Do not proceed to the next step until the student demonstrates understanding
5. **Celebrate progress** - Acknowledge when students are on the right track

## Your Teaching Process:
1. When a student presents a problem:
   - First, acknowledge the problem and show you understand it
   - Identify what concepts/skills are needed to solve it
   - Break it into numbered steps (but don't solve them)
   - Start with Step 1 and ask a guiding question

2. For each step:
   - Ask ONE focused question that leads toward understanding
   - If the student answers correctly: praise them briefly and move to the next step
   - If the student answers incorrectly: 
     * Don't say "wrong" - instead ask "What if we think about it this way..."
     * Give a hint or rephrase the question
     * Ask simpler sub-questions if needed
   - If the student is stuck:
     * Provide a small hint (not the answer)
     * Relate to something they might already know
     * Use analogies or examples

3. Response format:
   - Keep responses focused and concise
   - Use markdown for clarity (bullet points, bold for key terms)
   - End EVERY response with a question for the student
   - Use encouraging language: "Great thinking!", "You're on the right track!", "Almost there!"

## What NOT to do:
❌ Never solve the problem for the student
❌ Never give formulas/code without the student working toward it
❌ Never skip steps - mastery of each step is essential
❌ Never proceed if the student seems confused - address confusion first
❌ Never be condescending - respect the student's effort

## Example Interaction:
Student: "How do I find the area of a circle with radius 5?"

Good Response: "Great question! Let's work through this together. 📚

To find the area of a circle, we need to understand the formula first.

**Step 1:** Do you remember what the formula for the area of a circle is? 
(Hint: It involves π and the radius)

What do you think it might be?"

Remember: Your goal is to create "aha!" moments, not to provide answers. A student who discovers the answer themselves will remember it forever."""
        
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow."""
        
        def agent_node(state: AgentState) -> AgentState:
            """Process messages and generate response."""
            messages = list(state["messages"])
            
            # Add system message at the beginning if not present
            if not messages or not isinstance(messages[0], SystemMessage):
                messages.insert(0, SystemMessage(content=self.system_prompt))
            
            # Get response from LLM
            response = self.llm.invoke(messages)
            
            return {"messages": [response]}
        
        # Build the graph
        workflow = StateGraph(AgentState)
        workflow.add_node("agent", agent_node)
        workflow.set_entry_point("agent")
        workflow.add_edge("agent", END)
        
        return workflow.compile()
    
    def chat(self, message: str, history: list[dict] = None) -> str:
        """
        Send a message and get a response.
        
        Args:
            message: The user's message
            history: Optional conversation history
            
        Returns:
            The assistant's response
        """
        # Build message history
        messages = []
        
        if history:
            for msg in history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        # Add current message
        messages.append(HumanMessage(content=message))
        
        # Run the graph
        result = self.graph.invoke({"messages": messages})
        
        # Extract the response
        response_messages = result["messages"]
        if response_messages:
            last_message = response_messages[-1]
            return last_message.content
        
        return "I apologize, but I couldn't generate a response. Please try again."
    
    async def chat_stream(self, message: str, history: list[dict] = None):
        """
        Stream a response for the given message.
        
        Args:
            message: The user's message
            history: Optional conversation history
            
        Yields:
            Chunks of the assistant's response
        """
        # Build message history
        messages = [SystemMessage(content=self.system_prompt)]
        
        if history:
            for msg in history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
        
        # Add current message
        messages.append(HumanMessage(content=message))
        
        # Stream response
        async for chunk in self.llm.astream(messages):
            if chunk.content:
                yield chunk.content


# Create a default agent instance
def create_agent(model_name: str = "llama2") -> OllamaAgent:
    """Create an Ollama agent with the specified model."""
    return OllamaAgent(model_name=model_name)
