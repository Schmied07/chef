"""
AI Service using emergentintegrations library
This service provides AI-powered code generation capabilities
"""

import asyncio
import json
import os
import sys
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage


class AIService:
    """Service for AI-powered code generation"""

    def __init__(self, api_key: Optional[str] = None, provider: str = "openai", model: str = "gpt-4o"):
        """
        Initialize AI service
        
        Args:
            api_key: API key (uses EMERGENT_LLM_KEY from env if not provided)
            provider: AI provider (openai, anthropic, gemini)
            model: Model to use
        """
        self.api_key = api_key or os.getenv("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("API key required. Set EMERGENT_LLM_KEY or provide api_key parameter")
        
        self.provider = provider
        self.model = model

    async def extract_intent(self, prompt: str) -> Dict[str, Any]:
        """
        Extract structured intent from user prompt
        
        Args:
            prompt: User's natural language description
            
        Returns:
            Extracted intent with purpose, features, tech stack, constraints
        """
        system_message = """You are an expert software architect. Extract structured information from user prompts.
        
        Output JSON with this structure:
        {
            "purpose": "brief description of the application",
            "features": ["list", "of", "features"],
            "techStack": ["suggested", "technologies"],
            "constraints": ["any", "requirements", "or", "constraints"]
        }
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"extract-intent-{id(prompt)}",
            system_message=system_message
        ).with_model(self.provider, self.model)
        
        user_message = UserMessage(
            text=f"Extract intent from this prompt:\n\n{prompt}\n\nProvide only JSON output, no explanation."
        )
        
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback to basic extraction
            return {
                "purpose": prompt[:100],
                "features": [],
                "techStack": [],
                "constraints": []
            }

    async def generate_plan(self, intent: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate execution plan from intent
        
        Args:
            intent: Extracted intent
            
        Returns:
            Generation plan with steps and dependencies
        """
        system_message = """You are an expert software architect. Create detailed execution plans.
        
        Output JSON with this structure:
        {
            "steps": [
                {
                    "id": "step-1",
                    "type": "scaffold|component|api|database|test|config",
                    "description": "what to do",
                    "dependencies": ["step-ids"],
                    "files": ["file/paths"]
                }
            ],
            "dependencies": ["npm", "packages"],
            "estimatedTime": 300
        }
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"generate-plan-{id(intent)}",
            system_message=system_message
        ).with_model(self.provider, self.model)
        
        user_message = UserMessage(
            text=f"Create execution plan for:\n\n{json.dumps(intent, indent=2)}\n\nProvide only JSON output."
        )
        
        response = await chat.send_message(user_message)
        
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "steps": [],
                "dependencies": [],
                "estimatedTime": 0
            }

    async def generate_code(self, plan: Dict[str, Any], context: str = "") -> Dict[str, Any]:
        """
        Generate code based on plan
        
        Args:
            plan: Execution plan
            context: Additional context
            
        Returns:
            Generated code with files and dependencies
        """
        system_message = """You are an expert software developer. Generate production-ready code.
        
        Output JSON with this structure:
        {
            "files": [
                {
                    "path": "src/file.ts",
                    "content": "file content here",
                    "language": "typescript"
                }
            ],
            "dependencies": {
                "package": "version"
            },
            "metadata": {
                "framework": "react",
                "template": "react-convex",
                "features": ["auth", "database"],
                "createdAt": "ISO date"
            }
        }
        
        Generate complete, working code with proper imports, types, and error handling.
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"generate-code-{id(plan)}",
            system_message=system_message
        ).with_model(self.provider, self.model)
        
        prompt = f"""Generate code based on this plan:

{json.dumps(plan, indent=2)}

{f"Additional context: {context}" if context else ""}

Generate all necessary files with complete, production-ready code.
Provide only JSON output."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "files": [],
                "dependencies": {},
                "metadata": {
                    "framework": "",
                    "template": "",
                    "features": [],
                    "createdAt": ""
                }
            }

    async def generate_tests(self, code: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate tests for code
        
        Args:
            code: Generated code
            
        Returns:
            Generated tests with coverage estimate
        """
        system_message = """You are an expert test engineer. Generate comprehensive tests.
        
        Output JSON with this structure:
        {
            "files": [
                {
                    "path": "src/__tests__/file.test.ts",
                    "content": "test content",
                    "language": "typescript"
                }
            ],
            "coverage": 85
        }
        
        Generate unit tests, integration tests, and e2e tests where appropriate.
        """
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"generate-tests-{id(code)}",
            system_message=system_message
        ).with_model(self.provider, self.model)
        
        # Extract file paths and key functions
        files_summary = [f["path"] for f in code.get("files", [])]
        
        user_message = UserMessage(
            text=f"Generate tests for these files:\n\n{json.dumps(files_summary, indent=2)}\n\nProvide only JSON output."
        )
        
        response = await chat.send_message(user_message)
        
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "files": [],
                "coverage": 0
            }


async def main():
    """CLI interface for AI service"""
    if len(sys.argv) < 3:
        print("Usage: python ai_service.py <command> <json_input>")
        print("Commands: extract_intent, generate_plan, generate_code, generate_tests")
        sys.exit(1)
    
    command = sys.argv[1]
    input_data = json.loads(sys.argv[2])
    
    # Get provider and model from env or defaults
    provider = os.getenv("AI_PROVIDER", "openai")
    model = os.getenv("AI_MODEL", "gpt-4o")
    
    service = AIService(provider=provider, model=model)
    
    if command == "extract_intent":
        result = await service.extract_intent(input_data["prompt"])
    elif command == "generate_plan":
        result = await service.generate_plan(input_data["intent"])
    elif command == "generate_code":
        result = await service.generate_code(input_data["plan"], input_data.get("context", ""))
    elif command == "generate_tests":
        result = await service.generate_tests(input_data["code"])
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
    
    print(json.dumps(result))


if __name__ == "__main__":
    asyncio.run(main())
