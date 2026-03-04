# Script to reset database and recreate with new structure
import os
import subprocess

print("⚠️  WARNING: This will DELETE all data and recreate database with new structure!")
print("Press Ctrl+C to cancel or Enter to continue...")
input()

# Step 1: Delete database
if os.path.exists('db.sqlite3'):
    os.remove('db.sqlite3')
    print("✅ Deleted old database")

# Step 2: Delete migrations (keep __init__.py)
migrations_dir = 'shop/migrations'
for file in os.listdir(migrations_dir):
    if file != '__init__.py' and file.endswith('.py'):
        os.remove(os.path.join(migrations_dir, file))
        print(f"✅ Deleted {file}")

# Step 3: Create new migrations
print("\n📝 Creating new migrations...")
subprocess.run(['python', 'manage.py', 'makemigrations'])

# Step 4: Apply migrations
print("\n🔨 Applying migrations...")
subprocess.run(['python', 'manage.py', 'migrate'])

# Step 5: Create superuser
print("\n👤 Creating superuser...")
subprocess.run(['python', 'manage.py', 'createsuperuser', '--username', 'admin', '--email', 'admin@example.com'])

print("\n✅ Database reset complete!")
print("Now you can:")
print("1. Run 'python setup_data.py' or 'python create_fashion_data.py' to create test data")
print("2. Start the server with 'python manage.py runserver'")
