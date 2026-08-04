"""
Notification Service.

Central notification manager for SentinelAI.
"""

import logging

from notifications.email import send_email_notification
from notifications.teams import send_teams_notification
from notifications.websocket_manager import manager

logger = logging.getLogger(__name__)


class NotificationService:

    @staticmethod
    async def notify(
        title: str,
        message: str,
        severity: str = "Medium",
    ):
        """
        Send notification through all available channels.
        """

        # Email Notification
        try:
            send_email_notification(
                subject=title,
                body=message,
            )
        except Exception as e:
            logger.warning(f"Email notification failed: {e}")

        # Microsoft Teams Notification
        try:
            send_teams_notification(
                title=title,
                message=message,
            )
        except Exception as e:
            logger.warning(f"Teams notification failed: {e}")

        # WebSocket Notification
        try:
            await manager.send_message(
                {
                    "title": title,
                    "message": message,
                    "severity": severity,
                }
            )
        except Exception as e:
            logger.warning(f"WebSocket notification failed: {e}")