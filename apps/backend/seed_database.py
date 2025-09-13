#!/usr/bin/env python
"""
Script to seed the database with comprehensive demo data.
Run this script to populate the database with realistic sample data for demonstration.
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model

User = get_user_model()


def seed_database():
    """Seed the database with comprehensive demo data."""
    print("🌱 Starting database seeding process...")
    
    try:
        # Step 1: Create demo users and organization
        print("\n1️⃣ Creating demo users and organization...")
        call_command('seed_demo', '--clear')
        
        # Step 2: Create comprehensive business data
        print("\n2️⃣ Creating comprehensive business data...")
        call_command('seed_business_data', '--clear')
        
        print("\n✅ Database seeding completed successfully!")
        print("\n📋 Demo Credentials:")
        print("   Admin: admin / admin123")
        print("   Demo Users: demo1, demo2, demo3 / password123")
        print("\n🌐 Access the application at: http://localhost:3000")
        print("🔧 Admin panel at: http://localhost:8000/admin")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        sys.exit(1)


if __name__ == '__main__':
    seed_database()
