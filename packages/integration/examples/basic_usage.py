#!/usr/bin/env python3
"""
Basic example of using the Altan Python SDK.
"""
import os
from altan import AltanActionsClient, AltanActionError

# Get API key from environment variable or use a placeholder
API_KEY = os.environ.get("ALTAN_API_KEY", "your-api-key-here")

# Initialize the client
client = AltanActionsClient(api_key=API_KEY)

def list_connections_example():
    """Example of listing connections"""
    print("\n=== Listing Connections ===")
    try:
        connections = client.list_connections()
        print(f"Found {len(connections.get('data', []))} connections")
        
        # Print each connection
        for connection in connections.get("data", []):
            print(f"- {connection['name']} (ID: {connection['id']}, Provider: {connection['provider']})")
            
    except AltanActionError as e:
        print(f"Error listing connections: {e}")

def execute_action_example(connection_id, action_type_id, payload):
    """Example of executing an action"""
    print(f"\n=== Executing Action '{action_type_id}' on Connection '{connection_id}' ===")
    try:
        response = client.execute_action(
            connection_id=connection_id,
            action_type_id=action_type_id,
            payload=payload
        )
        
        print("Action executed successfully!")
        print(f"Response: {response}")
        
    except AltanActionError as e:
        print(f"Error executing action: {e}")

if __name__ == "__main__":
    # List all connections
    list_connections_example()
    
    # You would replace these with actual IDs from your Altan account
    sample_connection_id = "your-connection-id"
    sample_action_type_id = "your-action-type-id"
    
    # Example payload - this would depend on the action type
    sample_payload = {
        "message": "Hello from Altan Python SDK!",
        "recipient": "example@example.com"
    }
    
    # Execute an action (uncomment to run)
    # execute_action_example(sample_connection_id, sample_action_type_id, sample_payload)
    
    print("\nTo run the action execution example, update the connection_id, action_type_id, and payload,")
    print("then uncomment the execute_action_example() call in this script.") 