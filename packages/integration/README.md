# Altan Python SDK

A Python client library for interacting with the Altan Actions API. This SDK makes it easy to execute actions through the Altan platform from any Python application.

## Installation

Basic installation:

```bash
pip install altan
```

For async support:

```bash
pip install altan[async]
```

## Quick Start

```python
from altan import AltanActionsClient

# Initialize the client with your API key
client = AltanActionsClient(api_key="your-api-key")

# Execute an action
response = client.execute_action(
    connection_id="abc123",
    action_type_id="send-email",
    payload={
        "to": "someone@example.com",
        "subject": "Test Email from Altan",
        "body": "This email was sent through the Altan Actions API!"
    }
)

print(response)
```

## Usage Guide

### Initializing the Client

The client automatically uses `http://api.altan.ai/integration` as the base URL:

```python
from altan import AltanActionsClient

# Use the default base URL
client = AltanActionsClient(api_key="your-api-key")

# Or specify a custom base URL if needed
custom_client = AltanActionsClient(
    api_key="your-api-key",
    base_url="https://your-custom-altan-instance.com"
)
```

### Working with Connections

List all available connections:

```python
connections = client.list_connections()
print(connections)

# Example: Print the name of each connection
for connection in connections.get("data", []):
    print(f"Connection: {connection['name']} (ID: {connection['id']})")
```

Get details of a specific connection:

```python
connection = client.get_connection("connection-id")
print(connection)
```

### Working with Action Types

List all available action types for a connection:

```python
action_types = client.list_action_types("connection-id")
print(action_types)

# Example: Print all available actions for a connection
for action_type in action_types.get("data", []):
    print(f"Action: {action_type['name']} (ID: {action_type['id']})")
```

Get details of a specific action type:

```python
action_type = client.get_action_type("connection-id", "action-type-id")
print(action_type)

# Example: Print the input schema to understand required parameters
print(f"Required parameters for '{action_type['name']}':")
input_schema = action_type.get("input_schema", {})
for prop_name, prop_details in input_schema.get("properties", {}).items():
    required = "Required" if prop_name in input_schema.get("required", []) else "Optional"
    prop_type = prop_details.get("type", "any")
    print(f"  - {prop_name} ({prop_type}): {required}")
```

### Executing Actions

Execute an action with the necessary parameters:

```python
response = client.execute_action(
    connection_id="abc123",
    action_type_id="send-email",
    payload={
        "to": "someone@example.com",
        "subject": "Test Email",
        "body": "This is a test email sent through Altan!"
    }
)

# Handle the response
if response.get("status") == "success":
    print("Action executed successfully!")
    print(f"Result: {response.get('result')}")
else:
    print(f"Action execution failed: {response.get('error')}")
```

## Async Support

For asynchronous operations, install with async support and use the AsyncAltanActionsClient:

```python
import asyncio
from altan import AsyncAltanActionsClient

async def main():
    # Initialize the async client
    client = AsyncAltanActionsClient(api_key="your-api-key")
    
    try:
        # List connections asynchronously
        connections = await client.list_connections()
        print(connections)
        
        # Execute an action asynchronously
        response = await client.execute_action(
            connection_id="abc123",
            action_type_id="send-email",
            payload={
                "to": "someone@example.com",
                "subject": "Async Test",
                "body": "This email was sent asynchronously!"
            }
        )
        print(response)
        
        # Execute multiple actions concurrently
        tasks = [
            client.execute_action(
                connection_id="abc123",
                action_type_id="send-email",
                payload={"to": f"user{i}@example.com", "subject": f"Email {i}", "body": f"Message {i}"}
            )
            for i in range(3)
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        print(results)
        
    finally:
        # Always close the client when done
        await client.close()

# Run the async function
asyncio.run(main())
```

## Error Handling

Use try/except blocks to handle any errors that may occur:

```python
from altan import AltanActionsClient, AltanActionError

client = AltanActionsClient(api_key="your-api-key")

try:
    response = client.execute_action(
        connection_id="abc123",
        action_type_id="invalid-action",
        payload={}
    )
    print("Success:", response)
except AltanActionError as e:
    print(f"Error executing action: {e}")
```

## Development

### Setup

1. Clone the repository
2. Install development dependencies: `pip install -e ".[dev]"`
3. Run tests: `pytest`

## License

MIT 