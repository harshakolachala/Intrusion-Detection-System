"""
Enterprise Request Logging Middleware.
"""

import logging
import time
import uuid

from fastapi import Request

logger = logging.getLogger("SentinelAI")


class LoggingMiddleware:

    async def __call__(self, request: Request, call_next):

        request_id = str(uuid.uuid4())[:8]

        start = time.perf_counter()

        response = await call_next(request)

        elapsed = (time.perf_counter() - start) * 1000

        logger.info(
            "[%s] %s %s | %s | %d | %.2f ms",
            request_id,
            request.method,
            request.url.path,
            request.client.host,
            response.status_code,
            elapsed,
        )

        response.headers["X-Request-ID"] = request_id

        return response