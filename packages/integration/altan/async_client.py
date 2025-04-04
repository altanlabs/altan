import httpx
from typing import Dict, Any, Optional

from .exceptions import AltanActionError


class AsyncAltanActionsClient:
    """Async client for interacting with the Altan Actions API."""

    def __init__(self, api_key: str, base_url: str = "http://api.altan.ai/integration"):
        """
        Initialize the Async Altan Actions client.

        Args:
            api_key: API key for authentication
            base_url: Base URL for the Altan API (default: http://api.altan.ai/integration)
        """
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.AsyncClient(headers=self.headers)

    async def execute_action(self, connection_id: str, action_type_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute an action with the specified connection, action type, and payload.

        Args:
            connection_id: ID of the connection to use
            action_type_id: ID of the action type to execute
            payload: Data payload for the action

        Returns:
            API response as a dictionary

        Raises:
            AltanActionError: If the API returns an error
        """
        url = f"{self.base_url}/api/connections/{connection_id}/actions/{action_type_id}/execute"
        response = await self.client.post(url, json=payload)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Execution failed: {response.status_code} {response.text}")
        
        return response.json()

    async def list_connections(self) -> Dict[str, Any]:
        """
        List all available connections.

        Returns:
            List of connections as a dictionary

        Raises:
            AltanActionError: If the API returns an error
        """
        url = f"{self.base_url}/api/connections"
        response = await self.client.get(url)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to list connections: {response.status_code} {response.text}")
        
        return response.json()

    async def get_connection(self, connection_id: str) -> Dict[str, Any]:
        """
        Get details of a specific connection.

        Args:
            connection_id: ID of the connection

        Returns:
            Connection details as a dictionary

        Raises:
            AltanActionError: If the API returns an error
        """
        url = f"{self.base_url}/api/connections/{connection_id}"
        response = await self.client.get(url)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to get connection: {response.status_code} {response.text}")
        
        return response.json()

    async def list_action_types(self, connection_id: str) -> Dict[str, Any]:
        """
        List all available action types for a connection.

        Args:
            connection_id: ID of the connection

        Returns:
            List of action types as a dictionary

        Raises:
            AltanActionError: If the API returns an error
        """
        url = f"{self.base_url}/api/connections/{connection_id}/actions"
        response = await self.client.get(url)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to list action types: {response.status_code} {response.text}")
        
        return response.json()

    async def get_action_type(self, connection_id: str, action_type_id: str) -> Dict[str, Any]:
        """
        Get details of a specific action type.

        Args:
            connection_id: ID of the connection
            action_type_id: ID of the action type

        Returns:
            Action type details as a dictionary

        Raises:
            AltanActionError: If the API returns an error
        """
        url = f"{self.base_url}/api/connections/{connection_id}/actions/{action_type_id}"
        response = await self.client.get(url)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to get action type: {response.status_code} {response.text}")
        
        return response.json()
    
    async def close(self):
        """Close the underlying HTTP client."""
        await self.client.aclose() 