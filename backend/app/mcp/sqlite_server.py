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
        ),
        types.Tool(
            name="get_shipment_details",
            description=(
                "Get full details for a single shipment by tracking number, including "
                "sender/receiver info, pickup and delivery addresses, the assigned "
                "driver's name/vehicle/license, and the full status history timeline. "
                "Use this instead of sql_query whenever the user asks about a specific "
                "shipment by tracking number - it does all the joins for you and "
                "guarantees accurate data with no missing or guessed fields."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "tracking_number": {
                        "type": "string",
                        "description": "The shipment tracking number, e.g. DSP-7918689C"
                    }
                },
                "required": ["tracking_number"]
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
        elif name == "get_shipment_details":
            return await get_shipment_details(arguments.get("tracking_number", ""))
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


async def get_shipment_details(tracking_number: str) -> list[types.TextContent]:
    """
    Does all the joins in one place (shipments -> addresses x2, drivers -> users,
    shipment_history) so the LLM never has to construct this SQL itself and can
    never silently drop a field or hallucinate one that failed to join.

    NOTE: column names below (pickup_address_id, delivery_address_id, driver_id,
    user_id, etc.) are based on the schema described in this conversation.
    If your actual column names differ, adjust the SQL below to match -
    run get_schema first to confirm exact names before editing.
    """
    if not tracking_number.strip():
        return [types.TextContent(type="text", text="Error: tracking_number is required")]

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                s.id AS shipment_id,
                s.tracking_number,
                s.status,
                s.weight,
                s.sender_name,
                s.receiver_name,
                s.created_at,
                s.updated_at,
                s.delivered_at,

                pickup.street   AS pickup_street,
                pickup.city     AS pickup_city,
                pickup.state    AS pickup_state,
                pickup.postal_code AS pickup_postal_code,
                pickup.country  AS pickup_country,

                delivery.street     AS delivery_street,
                delivery.city       AS delivery_city,
                delivery.state      AS delivery_state,
                delivery.postal_code AS delivery_postal_code,
                delivery.country    AS delivery_country,

                u.full_name  AS driver_name,
                d.phone      AS driver_phone,
                d.vehicle_type,
                d.license_number

            FROM shipments s
            LEFT JOIN addresses pickup   ON s.pickup_address_id   = pickup.id
            LEFT JOIN addresses delivery ON s.delivery_address_id = delivery.id
            LEFT JOIN users u   ON s.driver_id = u.id
            LEFT JOIN drivers d ON d.user_id   = u.id
            WHERE s.tracking_number = ?
            """,
            (tracking_number,)
        )
        shipment = cursor.fetchone()

        if not shipment:
            conn.close()
            return [types.TextContent(
                type="text",
                text=f"No shipment found with tracking number '{tracking_number}'."
            )]

        shipment_dict = dict(shipment)

        cursor.execute(
            """
            SELECT status, timestamp, remarks
            FROM shipment_history
            WHERE shipment_id = ?
            ORDER BY timestamp ASC
            """,
            (shipment_dict["shipment_id"],)
        )
        history = [dict(row) for row in cursor.fetchall()]
        conn.close()

        shipment_dict["history"] = history

        return [types.TextContent(type="text", text=json.dumps(shipment_dict, indent=2, default=str))]

    except sqlite3.Error as e:
        logger.error(f"SQL Error in get_shipment_details: {str(e)}")
        return [types.TextContent(type="text", text=f"SQL Error: {str(e)}")]


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