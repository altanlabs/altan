#!/usr/bin/env python3
"""
Async example of using the Altan Python SDK.
"""
import os
import asyncio
from altan import AsyncAltanActionsClient, AltanActionError

# Get API key from environment variable or use a placeholder
API_KEY = os.environ.get("ALTAN_API_KEY", "your-api-key-here")

async def list_connections_example(client):
    """Example of listing connections asynchronously"""
    print("\n=== Listing Connections (Async) ===")
    try:
        connections = await client.list_connections()
        print(f"Found {len(connections.get('data', []))} connections")
        
        # Print each connection
        for connection in connections.get("data", []):
            print(f"- {connection['name']} (ID: {connection['id']}, Provider: {connection['provider']})")
            
    except AltanActionError as e:
        print(f"Error listing connections: {e}")

async def execute_action_example(client, connection_id, action_type_id, payload):
    """Example of executing an action asynchronously"""
    print(f"\n=== Executing Action '{action_type_id}' on Connection '{connection_id}' (Async) ===")
    try:
        response = await client.execute_action(
            connection_id=connection_id,
            action_type_id=action_type_id,
            payload=payload
        )
        
        print("Action executed successfully!")
        print(f"Response: {response}")
        
    except AltanActionError as e:
        print(f"Error executing action: {e}")

async def execute_multiple_actions(client, connection_id, action_type_id, payloads):
    """Example of executing multiple actions concurrently"""
    print(f"\n=== Executing {len(payloads)} Actions Concurrently ===")
    
    tasks = []
    for i, payload in enumerate(payloads):
        print(f"Scheduling action {i+1}...")
        task = client.execute_action(
            connection_id=connection_id,
            action_type_id=action_type_id,
            payload=payload
        )
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    print("\nResults:")
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"Action {i+1} failed: {result}")
        else:
            print(f"Action {i+1} succeeded: {result}")

async def main():
    # Initialize the async client
    client = AsyncAltanActionsClient(api_key=API_KEY)
    
    try:
        # List all connections
        await list_connections_example(client)
        
        # You would replace these with actual IDs from your Altan account
        sample_connection_id = "your-connection-id"
        sample_action_type_id = "your-action-type-id"
        
        # Example payload - this would depend on the action type
        sample_payload = {
            "message": "Hello from Altan Python SDK (Async)!",
            "recipient": "example@example.com"
        }
        
        # Execute an action (uncomment to run)
        # await execute_action_example(client, sample_connection_id, sample_action_type_id, sample_payload)
        
        # Example of multiple concurrent actions
        # sample_payloads = [
        #     {"message": f"Concurrent message {i}", "recipient": "example@example.com"}
        #     for i in range(1, 4)
        # ]
        # await execute_multiple_actions(client, sample_connection_id, sample_action_type_id, sample_payloads)
        
        print("\nTo run the action execution examples, update the connection_id, action_type_id, and payload,")
        print("then uncomment the execute_action_example() or execute_multiple_actions() calls in this script.")
        
    finally:
        # Always close the client
        await client.close()

if __name__ == "__main__":
    asyncio.run(main()) 