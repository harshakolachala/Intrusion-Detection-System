"""
Custom application exceptions.
"""


class SentinelAIException(Exception):
    """Base exception for SentinelAI."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class PredictionException(SentinelAIException):
    pass


class AlertException(SentinelAIException):
    pass


class AuthenticationException(SentinelAIException):
    pass


class DatabaseException(SentinelAIException):
    pass


class AnalyticsException(SentinelAIException):
    pass