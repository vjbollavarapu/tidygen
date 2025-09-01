# Virtual Environment Setup Guide

## ✅ **Current Status**
Your virtual environment is properly configured and working! All dependencies have been successfully installed.

## 🚀 **Quick Commands**

### **Activate Virtual Environment**
```bash
cd apps/backend
source venv/bin/activate
```

### **Deactivate Virtual Environment**
```bash
deactivate
```

### **Check Django Status**
```bash
source venv/bin/activate
python manage.py check
```

### **Run Django Development Server**
```bash
source venv/bin/activate
python manage.py runserver
```

### **Install New Dependencies**
```bash
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt  # Update requirements
```

## 🔧 **Virtual Environment Best Practices**

### **1. Always Activate Before Working**
```bash
# Always activate before running Django commands
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### **2. Environment Variables**
Create a `.env` file (copy from `env.example`):
```bash
cp env.example .env
# Edit .env with your actual values
```

### **3. Database Setup**
```bash
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
```

### **4. Development Tools**
```bash
# Install development dependencies
source venv/bin/activate
pip install -r requirements-dev.txt

# Run tests
pytest

# Run linting
black .
flake8 .
```

## 🐳 **Docker Alternative**

If you prefer using Docker instead of virtual environment:

```bash
# From project root
cd infra/docker/development
docker-compose up -d
```

## 📝 **Troubleshooting**

### **Issue: Command not found: python**
```bash
# Use python3 instead
python3 manage.py check
# Or activate virtual environment first
source venv/bin/activate
python manage.py check
```

### **Issue: Module not found**
```bash
# Make sure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

### **Issue: Database connection error**
```bash
# Check if PostgreSQL is running
# Or use Docker for database
docker-compose up db redis
```

## 🎯 **Next Steps**

1. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your database and other settings
   ```

2. **Run migrations**:
   ```bash
   source venv/bin/activate
   python manage.py migrate
   ```

3. **Create superuser**:
   ```bash
   source venv/bin/activate
   python manage.py createsuperuser
   ```

4. **Start development server**:
   ```bash
   source venv/bin/activate
   python manage.py runserver
   ```

## 🔗 **Useful Links**

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Virtual Environment Guide](https://docs.python.org/3/tutorial/venv.html)

---

*Your virtual environment is ready for development! 🎉*
