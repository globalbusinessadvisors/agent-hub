"""
AgentHub client implementation.

This module provides the main client interface for interacting with AgentHub services.
"""
from typing import Dict, Any, Optional
import aiohttp


class AgentHub:
    """Main client for interacting with AgentHub services."""
    
    def __init__(self, http_client: Optional[aiohttp.ClientSession] = None):
        """Initialize the AgentHub client.
        
        Args:
            http_client: Optional aiohttp.ClientSession for making HTTP requests.
                        If not provided, a new session will be created.
        """
        self._http = http_client or aiohttp.ClientSession()
        
    async def find_agent(self, name: str) -> Dict[str, Any]:
        """Find an agent by name.
        
        Args:
            name: The name of the agent to find.
            
        Returns:
            Dict containing the agent details.
        """
        async with self._http.get("/agents", params={"name": name}) as resp:
            data = await resp.json()
            return data["agents"][0]
            
    async def create_session(self, agent: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new session with an agent.
        
        Args:
            agent: The agent to create a session with.
            
        Returns:
            Dict containing the session details.
        """
        async with self._http.post("/sessions", json={"agent_id": agent["id"]}) as resp:
            data = await resp.json()
            return data["session"]