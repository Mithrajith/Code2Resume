#!/usr/bin/env python3
"""
Quick test script for Code2Resume functionality
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services.github_service import GitHubService
from backend.services.prompt_builder import PromptBuilder
from backend.models.llm_handler import LLMHandler
from backend.services.resume_generator import ResumeGenerator

async def test_manual_generation():
    """Test manual project input generation"""
    print("🧪 Testing manual project generation...")
    
    # Initialize services
    github_service = GitHubService()
    prompt_builder = PromptBuilder()
    llm_handler = LLMHandler()
    generator = ResumeGenerator(github_service, prompt_builder, llm_handler)
    
    # Test with sample data
    result = await generator.generate_from_manual(
        project_name="E-commerce Platform",
        project_description="Full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration using modern web technologies.",
        tech_stack="Python, Django, React, PostgreSQL, Redis, Docker",
        target_role="Full Stack Developer",
        user_role="Lead Developer"
    )
    
    print(f"✅ Generated content for: {result['project_name']}")
    print(f"📝 Summary: {result['summary']}")
    print(f"📋 Bullet points: {len(result['bullet_points'])}")
    print(f"🛠️ Tech stack: {result['tech_stack_line']}")
    print(f"✨ Success: {result['success']}")
    
    return result

async def test_github_generation():
    """Test GitHub repository generation (if network available)"""
    print("\n🐙 Testing GitHub repository generation...")
    
    # Initialize services
    github_service = GitHubService()
    prompt_builder = PromptBuilder()
    llm_handler = LLMHandler()
    generator = ResumeGenerator(github_service, prompt_builder, llm_handler)
    
    # Test with a popular repository
    test_repo = "https://github.com/microsoft/vscode"
    
    try:
        result = await generator.generate_from_github(
            repo_url=test_repo,
            target_role="Software Engineer"
        )
        
        print(f"✅ Generated content for: {result['project_name']}")
        print(f"📝 Summary: {result['summary'][:100]}...")
        print(f"📋 Bullet points: {len(result['bullet_points'])}")
        print(f"✨ Success: {result['success']}")
        
        return result
    except Exception as e:
        print(f"⚠️ GitHub test failed (expected if no internet/Ollama): {str(e)}")
        return None

async def test_llm_connection():
    """Test LLM connection"""
    print("\n🤖 Testing LLM connection...")
    
    llm_handler = LLMHandler()
    status = await llm_handler.test_connection()
    
    print(f"🔍 LLM Status: {status['status']}")
    if status['status'] == 'connected':
        print(f"📦 Available models: {', '.join(status['available_models'])}")
        print(f"🎯 Default model: {status['default_model']}")
    else:
        print(f"❌ Error: {status.get('message', 'Unknown error')}")
        if 'suggestion' in status:
            print(f"💡 Suggestion: {status['suggestion']}")
    
    return status

async def main():
    """Run all tests"""
    print("🚀 Code2Resume Test Suite\n")
    
    # Test 1: LLM Connection
    llm_status = await test_llm_connection()
    
    # Test 2: Manual Generation (always works)
    manual_result = await test_manual_generation()
    
    # Test 3: GitHub Generation (requires network + LLM)
    if llm_status['status'] == 'connected':
        github_result = await test_github_generation()
    else:
        print("\n⏭️ Skipping GitHub test (LLM not available)")
    
    print("\n🎉 Test suite completed!")
    print("\n📋 Summary:")
    print(f"  • LLM Connection: {'✅' if llm_status['status'] == 'connected' else '❌'}")
    print(f"  • Manual Generation: {'✅' if manual_result['success'] else '❌'}")
    print(f"  • Basic functionality: {'✅ Working' if manual_result['bullet_points'] else '❌ Issues'}")
    
    if llm_status['status'] != 'connected':
        print("\n💡 To fully test Code2Resume:")
        print("  1. Install Ollama: https://ollama.ai")
        print("  2. Run: ollama pull gemma2:9b")
        print("  3. Run: ollama pull llama3.1:8b")
        print("  4. Start Ollama service")

if __name__ == "__main__":
    asyncio.run(main())