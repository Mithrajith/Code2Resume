#!/usr/bin/env python3
"""
Test database operations
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import SessionLocal
from backend.models.user import User
import bcrypt

def test_database():
    """Test basic database operations"""
    db = SessionLocal()
    
    try:
        # Test 1: Check if table exists and is queryable
        print("✓ Test 1: Querying users table...")
        users = db.query(User).all()
        print(f"  Found {len(users)} users in database")
        
        # Test 2: Verify schema
        print("\n✓ Test 2: Verifying User model attributes...")
        attrs = ['id', 'username', 'hashed_password', 'github_url', 'github_token', 
                 'linkedin_id', 'leetcode_id', 'gmail', 'mobile_number']
        for attr in attrs:
            if not hasattr(User, attr):
                print(f"  ✗ Missing attribute: {attr}")
                return False
            print(f"  ✓ {attr}")
        
        # Test 3: Try creating a test user
        print("\n✓ Test 3: Creating test user...")
        test_password = bcrypt.hashpw("testpass".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        test_user = User(
            username="test_user_temp",
            hashed_password=test_password,
            github_url="https://github.com/test",
            github_token="ghp_test_token",
            gmail="test@gmail.com",
            mobile_number="+1234567890",
            linkedin_id="test-user",
            leetcode_id="testuser"
        )
        db.add(test_user)
        db.commit()
        print("  User created successfully!")
        
        # Test 4: Query the user back
        print("\n✓ Test 4: Querying test user...")
        queried_user = db.query(User).filter(User.username == "test_user_temp").first()
        if queried_user:
            print(f"  Username: {queried_user.username}")
            print(f"  Gmail: {queried_user.gmail}")
            print(f"  LinkedIn: {queried_user.linkedin_id}")
            print(f"  LeetCode: {queried_user.leetcode_id}")
        
        # Clean up
        print("\n✓ Cleaning up test user...")
        db.delete(queried_user)
        db.commit()
        
        print("\n✅ All tests passed! Database is ready.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = test_database()
    sys.exit(0 if success else 1)
