import ollama
import asyncio
import json
import re
from typing import Dict, List, Optional, Any
from config.settings import settings

class LLMHandler:
    """Handler for Local LLM integration using Ollama"""
    
    def __init__(self):
        self.client = ollama.Client(host=settings.ollama_host)
        self.default_model = settings.default_model
        self.fallback_model = settings.fallback_model
        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature
    
    async def generate_resume_content(self, prompt: str) -> Dict[str, Any]:
        """Generate resume content using the configured LLM"""
        try:
            # Try primary model first
            response = await self._generate_with_model(prompt, self.default_model)
            
            if not response:
                # Fallback to alternative model
                response = await self._generate_with_model(prompt, self.fallback_model)
            
            if not response:
                raise Exception("Both primary and fallback models failed")
            
            # Parse the structured response
            parsed_content = self._parse_llm_response(response)
            
            return parsed_content
            
        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")
    
    async def _generate_with_model(self, prompt: str, model: str) -> Optional[str]:
        """Generate content with a specific model"""
        try:
            # Check if model is available
            if not await self._is_model_available(model):
                print(f"Model {model} not available, attempting to pull...")
                await self._pull_model(model)
            
            # Generate response
            response = await asyncio.get_event_loop().run_in_executor(
                None, self._sync_generate, prompt, model
            )
            
            return response
            
        except Exception as e:
            print(f"Generation with model {model} failed: {str(e)}")
            return None
    
    def _sync_generate(self, prompt: str, model: str) -> str:
        """Synchronous generation for executor"""
        response = self.client.generate(
            model=model,
            prompt=prompt,
            options={
                'temperature': self.temperature,
                'top_p': 0.9,
                'top_k': 40,
                'num_predict': self.max_tokens,
            }
        )
        return response['response']
    
    async def _is_model_available(self, model: str) -> bool:
        """Check if a model is available locally"""
        try:
            models = await asyncio.get_event_loop().run_in_executor(
                None, self.client.list
            )
            available_models = [m['name'] for m in models['models']]
            return any(model in available_model for available_model in available_models)
        except Exception:
            return False
    
    async def _pull_model(self, model: str) -> bool:
        """Pull a model if it's not available locally"""
        try:
            await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.client.pull(model)
            )
            return True
        except Exception as e:
            print(f"Failed to pull model {model}: {str(e)}")
            return False
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse the structured LLM response into components"""
        try:
            # Initialize result structure
            result = {
                'summary': '',
                'bullet_points': [],
                'tech_stack_line': '',
                'portfolio_version': ''
            }
            
            # Clean the response
            response = response.strip()
            
            # Parse sections using regex patterns
            sections = {
                'summary': r'SUMMARY:\s*(.*?)(?=BULLET POINTS:|$)',
                'bullet_points': r'BULLET POINTS:\s*(.*?)(?=TECH STACK:|$)',
                'tech_stack': r'TECH STACK:\s*(.*?)(?=PORTFOLIO VERSION:|$)',
                'portfolio': r'PORTFOLIO VERSION:\s*(.*?)$'
            }
            
            for section_key, pattern in sections.items():
                match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
                if match:
                    content = match.group(1).strip()
                    
                    if section_key == 'summary':
                        result['summary'] = self._clean_text(content)
                    
                    elif section_key == 'bullet_points':
                        # Extract bullet points
                        bullets = []
                        lines = content.split('\n')
                        for line in lines:
                            line = line.strip()
                            if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                                bullet = line.lstrip('-•* ').strip()
                                if bullet:
                                    bullets.append(bullet)
                        
                        result['bullet_points'] = bullets[:5]  # Limit to 5 bullets
                    
                    elif section_key == 'tech_stack':
                        result['tech_stack_line'] = self._clean_text(content)
                    
                    elif section_key == 'portfolio':
                        result['portfolio_version'] = self._clean_text(content)
            
            # Validation and fallbacks
            if not result['summary']:
                result['summary'] = "Professional software developer with experience in modern technologies."
            
            if not result['bullet_points']:
                result['bullet_points'] = [
                    "Developed and maintained software applications using modern technologies",
                    "Collaborated with team members to deliver high-quality solutions",
                    "Implemented best practices for code quality and performance"
                ]
            
            if not result['tech_stack_line']:
                result['tech_stack_line'] = "Tech: Various programming languages and frameworks"
            
            if not result['portfolio_version']:
                result['portfolio_version'] = result['summary']
            
            return result
            
        except Exception as e:
            print(f"Failed to parse LLM response: {str(e)}")
            # Return fallback content
            return self._get_fallback_content()
    
    def _clean_text(self, text: str) -> str:
        """Clean and format text content"""
        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove common artifacts
        text = re.sub(r'^(SUMMARY|BULLET POINTS|TECH STACK|PORTFOLIO VERSION):\s*', '', text, flags=re.IGNORECASE)
        
        return text
    
    def _get_fallback_content(self) -> Dict[str, Any]:
        """Provide fallback content when parsing fails"""
        return {
            'summary': "Experienced software developer with expertise in modern development practices and technologies.",
            'bullet_points': [
                "Designed and implemented scalable software solutions using industry best practices",
                "Collaborated with cross-functional teams to deliver high-quality applications",
                "Optimized application performance and maintainability through code refactoring",
                "Integrated modern development tools and frameworks to improve development efficiency"
            ],
            'tech_stack_line': "Tech: Programming languages, frameworks, and development tools",
            'portfolio_version': "Professional software developer with strong technical skills and experience in building modern applications. Focused on writing clean, efficient code and delivering solutions that meet business requirements."
        }
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test connection to Ollama service"""
        try:
            models = await asyncio.get_event_loop().run_in_executor(
                None, self.client.list
            )
            
            return {
                'status': 'connected',
                'available_models': [m['name'] for m in models['models']],
                'default_model': self.default_model,
                'fallback_model': self.fallback_model
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'suggestion': 'Make sure Ollama is running on ' + settings.ollama_host
            }
    
    async def get_model_info(self, model: str) -> Dict[str, Any]:
        """Get information about a specific model"""
        try:
            info = await asyncio.get_event_loop().run_in_executor(
                None, lambda: self.client.show(model)
            )
            return {
                'name': model,
                'size': info.get('size', 'Unknown'),
                'modified_at': info.get('modified_at', 'Unknown'),
                'available': True
            }
        except Exception as e:
            return {
                'name': model,
                'available': False,
                'error': str(e)
            }