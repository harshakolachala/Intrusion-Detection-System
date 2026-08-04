"""
Custom exceptions for the Capture Engine.
"""


class CaptureException(Exception):
    """Base exception for capture-related errors."""
    pass


class InterfaceNotFoundError(CaptureException):
    """Raised when the selected interface cannot be found."""
    pass


class CaptureAlreadyRunningError(CaptureException):
    """Raised when capture is already running."""
    pass


class CaptureNotRunningError(CaptureException):
    """Raised when capture is not running."""
    pass


class PacketParsingError(CaptureException):
    """Raised when packet parsing fails."""
    pass


class QueueOverflowError(CaptureException):
    """Raised when the packet queue is full."""
    pass