import requests
from typing import Dict, Any, Optional

from .exceptions import AltanActionError


class AltanActionsClient:
    """Client for interacting with the Altan Actions API."""

    def __init__(self, api_key: str, base_url: str = "http://api.altan.ai/integration"):
        """
        Initialize the Altan Actions client.

        Args:
            api_key: API key for authentication
            base_url: Base URL for the Altan API (default: http://api.altan.ai/integration)
        """
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def execute_action(self, connection_id: str, action_type_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
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
        response = requests.post(url, json=payload, headers=self.headers)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Execution failed: {response.status_code} {response.text}")
        
        return response.json()

    def list_connections(self) -> Dict[str, Any]:
        """
        List all available connections.

        Returns:
            List of connections as a dictionary

        Raises:
            AltanActionError: If the API returns an error
        """
        url = f"{self.base_url}/api/connections"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to list connections: {response.status_code} {response.text}")
        
        return response.json()

    def get_connection(self, connection_id: str) -> Dict[str, Any]:
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
        response = requests.get(url, headers=self.headers)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to get connection: {response.status_code} {response.text}")
        
        return response.json()

    def list_action_types(self, connection_id: str) -> Dict[str, Any]:
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
        response = requests.get(url, headers=self.headers)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to list action types: {response.status_code} {response.text}")
        
        return response.json()

    def get_action_type(self, connection_id: str, action_type_id: str) -> Dict[str, Any]:
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
        response = requests.get(url, headers=self.headers)
        
        if response.status_code >= 400:
            raise AltanActionError(f"Failed to get action type: {response.status_code} {response.text}")
        
        return response.json() 