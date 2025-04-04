from .client import AltanActionsClient
from .exceptions import AltanActionError
from .models import Connection, ActionType, ActionExecutionResult

# Import async client if httpx is available
try:
    from .async_client import AsyncAltanActionsClient
    __all__ = [
        "AltanActionsClient", 
        "AsyncAltanActionsClient",
        "AltanActionError",
        "Connection",
        "ActionType",
        "ActionExecutionResult"
    ]
except ImportError:
    __all__ = [
        "AltanActionsClient", 
        "AltanActionError",
        "Connection",
        "ActionType",
        "ActionExecutionResult"
    ]

__version__ = "0.1.0" 