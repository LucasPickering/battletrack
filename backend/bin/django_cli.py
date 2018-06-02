import django
import os
import sys
sys.path.append('')  # Add cwd to path so we can import battletrack and its apps

# Configure Django settings
import battletrack.settings
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "battletrack.settings"
)
django.setup()
