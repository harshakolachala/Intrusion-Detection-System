"""
Email Notification Service.

Currently logs notifications.
Can later be integrated with SMTP, Gmail, SendGrid, etc.
"""

import logging

logger = logging.getLogger(__name__)


def send_email_notification(
    subject: str,
    body: str,
):

    logger.info("=" * 60)
    logger.info("EMAIL NOTIFICATION")
    logger.info(f"Subject : {subject}")
    logger.info(f"Message : {body}")
    logger.info("=" * 60)