"""
Microsoft Teams Notification Service.

Currently logs notifications.
Can later be connected to a Teams Incoming Webhook.
"""

import logging

logger = logging.getLogger(__name__)


def send_teams_notification(
    title: str,
    message: str,
):

    logger.info("=" * 60)
    logger.info("MICROSOFT TEAMS NOTIFICATION")
    logger.info(f"Title   : {title}")
    logger.info(f"Message : {message}")
    logger.info("=" * 60)