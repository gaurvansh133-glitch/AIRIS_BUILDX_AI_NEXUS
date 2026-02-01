# Cortana - Level-Aware Socratic Teaching Assistant

**Cortana** is an advanced AI teaching assistant designed to help users learn programming concepts through **Socratic questioning**, **adaptive difficulty**, and a **collaborative coding playground**. Unlike standard chatbots, Cortana NEVER gives direct answers. Instead, it guides you step-by-step, helping you build understanding and problem-solving skills.

![Cortana UI](https://via.placeholder.com/800x450?text=Cortana+Socratic+Teaching+Assistant)

## 🌟 Key Features

### 🧠 Level-Aware Teaching
Cortana detects your knowledge level and adapts its teaching style:
- **Beginner**: Simple language, more analogies, frequent checkpoints, and many hints.
- **Intermediate**: Focus on application, moderate hints, assumes basic syntax knowledge.
- **Advanced**: Deep conceptual questions, edge cases, optimization, and minimal holding hands.

### 🏛️ Socratic Methodology
- **No Direct Solutions**: Cortana refuses to write final code or give answers.
- **Step-by-Step Guidance**: breaks complex problems into manageable logical steps.
- **Diagnostic Phase**: Always starts with an assessment to verify your level.
- **Text-Based Fallback**: If UI is unavailable, you can manually type diagnostics (e.g., `D1: A, D2: B`) to set your level.
- **Mini-Quizzes**: Checks understanding before moving to the next concept.

### 💻 Collaborative Coding Playground
- **Integrated Editor**: Write and edit code directly in the chat interface.
- **AI Code Review**: Submit your code for instant AI feedback.
- **Educational Feedback**: Feedback is given as hints, error highlights, and thinking questions — not auto-fixes.

### 🎨 Modern Experience
- **Structured UI**: Interactive cards for assessments, quizzes, and levels.
- **Cortana Branding**: Sleek, dark-mode interface inspired by professional developer tools.
- **Code Highlighting**: Syntax highlighting for all major languages.

## 🛠️ Technology Stack

- **Frontend**: React, Unix, Tailwind CSS (Minimalist Dark Theme)
- **Backend**: FastAPI, LangChain, LangGraph
- **AI Model**: Ollama (Phi/Llama2) running locally
- **State Management**: React Hooks & Session State

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- [Ollama](https://ollama.ai/) installed and running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cortana-assistant
   ```

2. **Backend Setup**
   ```bash
   cd baackend
   pip install -r requirements.txt
   # Start the server (ensure Ollama is running)
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Start the interface
   npm run dev
   ```

## 📖 Usage Guide

1. **Start a Chat**: Open `http://localhost:5173`.
2. **Ask a Question**: Type "How do I implement a binary search?".
3. **Select Level**: Cortana will ask for your familiarity. Choose **Beginner**, **Intermediate**, or **Advanced**.
4. **Answer Diagnostics**: Complete the quick check to verify your level.
5. **Learn**: Follow the step-by-step guide. Answer thinking questions.
6. **Practice**: When asked, use the **Coding Playground** to write your implementation.
   - Click "Submit for Review" to get feedback.
   - Iterate until your code is correct.

## 🤝 Teaching Philosophy
Cortana is built on the belief that **struggle is essential for learning**. By withholding the answer and acting as a guide, we ensure students actually build the neural pathways required for mastery, rather than just copying syntax.

---
*Powered by Local LLMs & Socratic Logic*
