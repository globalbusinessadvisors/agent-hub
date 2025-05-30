import pytest
from unittest.mock import AsyncMock, Mock
from typing import Dict, Any
import aiohttp

class MockResponse:
    """Mock aiohttp.ClientResponse that implements async context manager protocol."""
    def __init__(self, json_data: Dict[str, Any]):
        self.json_data = json_data
        self._closed = False
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self._closed = True
        
    async def json(self):
        return self.json_data

class MockClientSession:
    """Mock aiohttp.ClientSession that returns proper async context managers."""
    def __init__(self, responses: Dict[str, Dict[str, Any]]):
        self.responses = responses
        self.get = AsyncMock()
        self.post = AsyncMock()
        
        # Configure mocks to return proper async context managers
        self.get = AsyncMock()
        self.post = AsyncMock()
        
        async def async_context_manager(*args, **kwargs):
            return MockResponse(self.responses.get("get", {}))
        async def async_post_context_manager(*args, **kwargs):
            return MockResponse(self.responses.get("post", {}))
            
        self.get.return_value = async_context_manager()
        self.post.return_value = async_post_context_manager()

@pytest.mark.asyncio
async def test_agent_discovery_and_session_creation():
    """
    Test the main workflow of discovering an agent and creating a session.
    This is an acceptance test that verifies the core SDK functionality.
    """
    from agenthub import AgentHub
    
    # Arrange
    mock_agent = {
        "id": "test-agent-1",
        "name": "gpt4",
        "capabilities": ["chat", "completion"]
    }
    
    mock_session = {
        "id": "test-session-1",
        "agent_id": "test-agent-1",
        "status": "active"
    }
    
    mock_response = {
        "result": "Hello, I am GPT-4"
    }
    
    # Create mock HTTP client with proper context manager support
    responses = {
        "get": {"agents": [mock_agent]},
        "post": {"session": mock_session}
    }
    http_client = MockClientSession(responses)
    
    # Act
    hub = AgentHub(http_client=http_client)
    agent = await hub.find_agent(name="gpt4")
    session = await hub.create_session(agent)
    
    # Assert
    assert agent["id"] == mock_agent["id"]
    assert agent["name"] == mock_agent["name"]
    assert session["id"] == mock_session["id"]
    assert session["agent_id"] == mock_session["agent_id"]
    
    # Verify HTTP client interactions
    http_client.get.assert_called_once_with("/agents", params={"name": "gpt4"})
    http_client.post.assert_called_once_with(
        "/sessions",
        json={"agent_id": mock_agent["id"]}
    )