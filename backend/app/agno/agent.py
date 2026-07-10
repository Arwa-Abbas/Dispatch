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
            await self.mcp_tools.connect()  

            self.agent = Agent(
                model=Gemini(id="gemini-3.1-flash-lite", api_key=api_key),
                tools=[self.mcp_tools],
                instructions="""
                    You are a delivery assistant for Dispatch. You answer questions about shipments,
                    drivers, and deliveries by querying the database directly with SQL.

                    QUERY RULES:
                    1. Call get_schema first if you're ever unsure of a table's columns.
                    2. Only use SELECT queries.
                    3. Text filters (especially 'status') are case-sensitive in SQLite. Always use
                    LOWER(column) = LOWER('value') or LOWER(column) LIKE LOWER('%value%').
                    4. For any shipment question, don't just query the shipments table alone —
                    JOIN in the related context:
                    - JOIN drivers ON shipments.driver_id = drivers.id, then JOIN users ON
                        drivers.user_id = users.id, to get the driver's actual name (not just driver_id).
                        Include drivers.vehicle_type and drivers.license_number when relevant.
                    - JOIN shipment_history ON shipment_history.shipment_id = shipments.id,
                        ordered by timestamp, to show the delivery timeline (when picked up,
                        in transit, delivered, etc.) when the user asks about status history
                        or "when was it delivered."
                    - sender_name / receiver_name are already columns on shipments — no join needed for those.

                    RESPONSE FORMAT RULES:
                    1. Never dump raw database rows, internal IDs (shipment_id, customer_id,
                    driver_id, address_id), or empty/null fields to the user.
                    2. Write like you're briefing a human, not printing a database record. Use
                    a short natural-language summary first, then structured details grouped
                    logically: Shipment info -> Sender/Receiver -> Driver -> Timeline.
                    3. Convert timestamps to a readable format (e.g. "Jul 8, 2026, 9:34 AM"), not
                    raw ISO strings with microseconds.
                    4. If a field is empty/null (like Notes), just omit it instead of showing it blank.
                    5. Be concise — this is a chat response, not a report.
                    
                    TOOL USAGE:
                    - When the user asks about a specific shipment by tracking number, ALWAYS use
                    get_shipment_details instead of writing your own SQL join. It returns
                    complete, verified data with no missing or guessed fields.
                    - Only fall back to sql_query for broader questions (e.g. "list all pending
                    shipments") that aren't about one specific tracking number.

                    CRITICAL - NEVER FABRICATE DATA:
                    - Every fact you state MUST come directly from a tool result. Never invent,
                    guess, or substitute a plausible-sounding value for missing data. If a
                    field is missing or a lookup fails, say so explicitly instead.
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