from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass


@dataclass
class Connection:
    """Represents an Altan API connection."""
    id: str
    name: str
    provider: str
    status: str
    created_at: str
    updated_at: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ActionType:
    """Represents an action type that can be executed on a connection."""
    id: str
    name: str
    description: str
    connection_id: str
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    created_at: str
    updated_at: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ActionExecutionResult:
    """Represents the result of executing an action."""
    id: str
    connection_id: str
    action_type_id: str
    status: str
    result: Dict[str, Any]
    created_at: str
    metadata: Optional[Dict[str, Any]] = None 