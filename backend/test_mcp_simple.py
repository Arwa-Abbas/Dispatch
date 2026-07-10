"""
Simple test to check if MCP SQLite server works
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.mcp.sqlite_server import main
import asyncio

print("Testing MCP SQLite Server...")
asyncio.run(main())