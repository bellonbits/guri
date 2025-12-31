import os
import sys

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.config import settings

def main():
    print(f"DATABASE_URL from settings: {settings.DATABASE_URL}")
    # Mask password for safety in logs if I were worried, but here I need to see it to debug
    # print(f"POSTGRES_USER: {settings.POSTGRES_USER}")
    # print(f"POSTGRES_PASSWORD: {settings.POSTGRES_PASSWORD}")
    # print(f"POSTGRES_DB: {settings.POSTGRES_DB}")

if __name__ == "__main__":
    main()
