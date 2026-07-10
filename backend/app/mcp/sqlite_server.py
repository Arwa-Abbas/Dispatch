"""
SQLite MCP Server - Exposes database queries as MCP tools
"""

import json
import sqlite3
import logging
import os
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the database path relative to the backend folder
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "delivery.db")

logger.info(f"Database path: {DB_PATH}")

server = Server("delivery-sqlite-mcp")

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="sql_query",
            description="Execute read-only SQL query on the delivery database",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "SELECT SQL query"}
                },
                "required": ["query"]
            }
        ),
        types.Tool(
            name="get_schema",
            description="Get table schema",
            inputSchema={
                "type": "object",
                "properties": {
                    "table_name": {"type": "string", "description": "Table name (optional)"}
                }
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    try:
        if name == "sql_query":
            return await execute_query(arguments.get("query", ""))
        elif name == "get_schema":
            return await get_schema(arguments.get("table_name"))
        return [types.TextContent(type="text", text=f"Unknown tool: {name}")]
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return [types.TextContent(type="text", text=f"Error: {str(e)}")]

async def execute_query(query: str) -> list[types.TextContent]:
    query = query.strip()
    if not query.upper().startswith("SELECT"):
        return [types.TextContent(type="text", text="Error: Only SELECT queries allowed")]
    
    try:
        logger.info(f"Executing query: {query[:100]}...")
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return [types.TextContent(type="text", text="Query executed. No results.")]
        
        results = [dict(row) for row in rows]
        return [types.TextContent(type="text", text=json.dumps(results, indent=2, default=str))]
    except sqlite3.Error as e:
        logger.error(f"SQL Error: {str(e)}")
        return [types.TextContent(type="text", text=f"SQL Error: {str(e)}")]

async def get_schema(table_name: str = None) -> list[types.TextContent]:
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        if table_name:
            cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
            result = cursor.fetchone()
            conn.close()
            if result:
                return [types.TextContent(type="text", text=f"Schema for {table_name}:\n{result[0]}")]
            return [types.TextContent(type="text", text=f"Table '{table_name}' not found")]
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        conn.close()
        schema = "Database Tables:\n" + "\n".join(f"  - {t[0]}" for t in tables)
        return [types.TextContent(type="text", text=schema)]
    except sqlite3.Error as e:
        return [types.TextContent(type="text", text=f"Error: {str(e)}")]

async def main():
    logger.info("Starting SQLite MCP Server...")
    logger.info(f"Database path: {DB_PATH}")
    
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="delivery-sqlite-mcp",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())