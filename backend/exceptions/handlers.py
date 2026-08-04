"""
Global exception handlers.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from exceptions.custom_exceptions import SentinelAIException


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(SentinelAIException)
    async def sentinel_exception_handler(
        request: Request,
        exc: SentinelAIException,
    ):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": exc.message,
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request,
        exc: Exception,
    ):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal Server Error",
            },
        )