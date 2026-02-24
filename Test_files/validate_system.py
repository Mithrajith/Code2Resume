#!/usr/bin/env python3
"""
Complete system validation
Checks all components are properly connected
"""
import os
import sys

def print_status(check, passed, message=""):
    symbol = "✓" if passed else "✗"
    color = "\033[92m" if passed else "\033[91m"
    reset = "\033[0m"
    status = f"{color}{symbol}{reset}"
    extra = f" - {message}" if message else ""
    print(f"{status} {check}{extra}")
    return passed

def main():
    print("🔍 Code2Resume System Validation\n")
    print("=" * 50)
    
    all_passed = True
    
    # Check 1: Virtual environment
    print("\n📦 Environment Checks:")
    all_passed &= print_status(
        "Virtual environment", 
        os.path.exists("env/bin/python"),
        "env/bin/python"
    )
    
    # Check 2: Database file
    print("\n💾 Database Checks:")
    db_exists = os.path.exists("users.db")
    all_passed &= print_status(
        "Database file exists",
        db_exists,
        "users.db"
    )
    
    # Check 3: Database schema
    if db_exists:
        import sqlite3
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        required_columns = [
            'id', 'username', 'hashed_password', 'github_url', 'github_token',
            'linkedin_id', 'leetcode_id', 'gmail', 'mobile_number'
        ]
        
        for col in required_columns:
            all_passed &= print_status(
                f"Column: {col}",
                col in columns
            )
        
        conn.close()
    
    # Check 4: Template files
    print("\n📄 Template Files:")
    templates = ['login.html', 'register.html', 'dashboard.html', 'settings.html']
    for template in templates:
        path = f"template/{template}"
        all_passed &= print_status(
            template,
            os.path.exists(path),
            path
        )
    
    # Check 5: Backend modules
    print("\n🔧 Backend Modules:")
    backend_files = ['app.py', 'database.py', 'models/user.py']
    for file in backend_files:
        path = f"backend/{file}"
        all_passed &= print_status(
            file,
            os.path.exists(path),
            path
        )
    
    # Check 6: Scripts
    print("\n📜 Utility Scripts:")
    scripts = ['init_db.py', 'test_db.py', 'start.sh', 'run.sh']
    for script in scripts:
        all_passed &= print_status(
            script,
            os.path.exists(script),
            script
        )
    
    # Summary
    print("\n" + "=" * 50)
    if all_passed:
        print("\n✅ All checks passed! System is ready.")
        print("\n🚀 Start the server with: ./start.sh")
        print("🌐 Then visit: http://localhost:8001")
        return 0
    else:
        print("\n❌ Some checks failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
