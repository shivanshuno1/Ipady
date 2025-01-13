# apps/calculator/__init__.py
from .route import router  # Import router from the route module

# Explicitly use it to avoid the unused import warning
print(router)  # This will suppress the warning if you want to keep this import
