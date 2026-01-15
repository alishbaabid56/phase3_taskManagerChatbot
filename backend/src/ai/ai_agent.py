# backend/src/ai/ai_agent.py

import os
from dotenv import load_dotenv, find_dotenv
from ..config import settings
from agents import Agent, Runner, OpenAIChatCompletionsModel, AsyncOpenAI

load_dotenv(find_dotenv())

class AIConfig:
    """Configures the Gemini API client"""
    def __init__(self):
        self.gemini_api_key = settings.gemini_api_key
        if not self.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        self.client = AsyncOpenAI(
            api_key=self.gemini_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

    def get_client(self):
        return self.client


class AIAgent:
    """
    AI Agent that can process user messages using Gemini API and tools
    """
    def __init__(self):
        self.ai_config = AIConfig()
        self.client = self.ai_config.get_client()

        # LLM Model
        self.llm_model = OpenAIChatCompletionsModel(
            model="gemini-2.5-flash",
            openai_client=self.client
        )

        # System prompt / instructions for the chatbot
        self.system_prompt = (
            "You are an intelligent task assistant. "
            "Your job is to help the user manage tasks, answer questions clearly, "
            "and respond politely. You can call task management tools when needed. "
            "Always summarize and confirm actions before executing them."
        )

        # Create Agent (without system_message)
        self.agent = Agent(
            name="Assistant",
            model=self.llm_model
        )

    def run_sync(self, input_text: str) -> str:
        """Run the agent synchronously with system prompt"""
        try:
            # Prepend system prompt to input
            final_input = f"{self.system_prompt}\n\nUser: {input_text}"
            result = Runner.run_sync(
                starting_agent=self.agent,
                input=final_input
            )
            return result.final_output
        except Exception as e:
            return f"Error in AI Agent: {str(e)}"

    async def run_async(self, input_text: str) -> str:
        """Run the agent asynchronously with system prompt"""
        try:
            final_input = f"{self.system_prompt}\n\nUser: {input_text}"
            result = await Runner.run_async(
                starting_agent=self.agent,
                input=final_input
            )
            return result.final_output
        except Exception as e:
            return f"Error in AI Agent: {str(e)}"


# Global instance
ai_agent = AIAgent()
