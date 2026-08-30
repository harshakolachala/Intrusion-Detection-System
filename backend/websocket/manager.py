"""
WebSocket Connection Manager for SentinelAI.

Handles real-time communication between the backend
detection engine and connected SOC dashboard clients.

Supports broadcasting from both:
    - FastAPI async WebSocket handlers
    - Background detection-engine threads
"""

import asyncio
from typing import List, Optional

from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

        # FastAPI's main asyncio event loop.
        # Detection engine threads use this loop to
        # safely schedule WebSocket broadcasts.
        self.event_loop: Optional[asyncio.AbstractEventLoop] = None

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket client."""

        await websocket.accept()

        # Capture the FastAPI event loop.
        try:
            self.event_loop = asyncio.get_running_loop()
        except RuntimeError:
            self.event_loop = None

        if websocket not in self.active_connections:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected WebSocket client."""

        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(
        self,
        message: dict,
        websocket: WebSocket,
    ):
        """Send a message to one client."""

        try:
            await websocket.send_json(message)

        except Exception:
            self.disconnect(websocket)

    async def broadcast(
        self,
        message: dict,
    ):
        """Broadcast an event to all connected WebSocket clients."""

        if not self.active_connections:
            return

        disconnected = []

        # Use a copy so connections can safely be removed
        # while broadcasting.
        for websocket in list(self.active_connections):

            try:
                await websocket.send_json(message)

            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(websocket)

    def broadcast_from_thread(
        self,
        message: dict,
    ):
        """
        Thread-safe WebSocket broadcast.

        The detection engine runs outside FastAPI's async
        event loop. This method schedules the async broadcast
        on FastAPI's event loop.
        """

        if not self.event_loop:
            return

        if self.event_loop.is_closed():
            return

        try:
            asyncio.run_coroutine_threadsafe(
                self.broadcast(message),
                self.event_loop,
            )

        except Exception as error:
            print(
                f"[WebSocket] Thread broadcast error: {error}"
            )

    def connection_count(self) -> int:
        """Return number of connected dashboard clients."""

        return len(self.active_connections)


manager = ConnectionManager()