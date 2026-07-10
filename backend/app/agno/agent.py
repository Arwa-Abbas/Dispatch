import os
import sys
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.mcp import MCPTools
from mcp import StdioServerParameters


class DeliveryAgent:
    def __init__(self):
        self.agent = None
        self.mcp_tools = None

    async def init_agent(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("ERROR: GOOGLE_API_KEY not set in environment")
            return

        try:
            print("Initializing agent with MCP SQLite...")
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            mcp_script = os.path.join(backend_dir, "app", "mcp", "sqlite_server.py")
            print(f"MCP Script path: {mcp_script}")

            server_params = StdioServerParameters(
                command=sys.executable,
                args=[mcp_script],
            )

            self.mcp_tools = MCPTools(server_params=server_params)
            await self.mcp_tools.connect()  # <-- this line was missing; actually opens the stdio session

            self.agent = Agent(
                model=Gemini(id="gemini-2.5-flash", api_key=api_key),
                tools=[self.mcp_tools],
                instructions="""
                You are a delivery assistant for Dispatch.
                You can query the database directly using SQL.

                IMPORTANT RULES:
                1. Use get_schema first to understand table structure
                2. Only use SELECT queries
                3. Explain what you're doing
                4. Be concise and professional

                Tables in the database:
                - users (id, full_name, email, role, is_active, is_verified)
                - shipments (id, tracking_number, customer_id, driver_id, status, weight, receiver_name, sender_name)
                - customers (id, user_id, phone, address, city, state)
                - drivers (id, user_id, phone, vehicle_type, license_number)
                - shipment_history (id, shipment_id, status, timestamp, remarks)
                - addresses (id, street, city, state, postal_code, country)

                Use SQL to answer questions about shipments, drivers, and deliveries.
                Always format results nicely.
                """,
                markdown=True,
            )
            print("Agent initialized successfully with MCP SQLite")

        except Exception as e:
            print(f"Agent initialization failed: {str(e)}")
            import traceback
            traceback.print_exc()

    async def close(self):
        if self.mcp_tools:
            await self.mcp_tools.close()

    async def chat(self, message: str) -> str:
        if not self.agent:
            error_msg = "Agent not ready. Please check GOOGLE_API_KEY and MCP server."
            print(error_msg)
            return error_msg

        try:
            print(f"Processing: {message}")
            response = await self.agent.arun(message)
            return response.content if response else "No response from agent"
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            print(error_msg)
            return error_msg