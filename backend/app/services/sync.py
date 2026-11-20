import asyncio
import logging

from fastapi import WebSocket

from ..schemas.sync import ServerSyncEvent

logger = logging.getLogger(__name__)


class SyncConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}
        self._devices: dict[str, dict[WebSocket, str]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, session_id: str, websocket: WebSocket, device_id: str) -> None:
        async with self._lock:
            self._connections.setdefault(session_id, set()).add(websocket)
            self._devices.setdefault(session_id, {})[websocket] = device_id

    async def disconnect(self, session_id: str, websocket: WebSocket) -> None:
        async with self._lock:
            connections = self._connections.get(session_id)
            if connections is not None:
                connections.discard(websocket)
                if not connections:
                    self._connections.pop(session_id, None)
            devices = self._devices.get(session_id)
            if devices is not None:
                devices.pop(websocket, None)
                if not devices:
                    self._devices.pop(session_id, None)

    def device_ids(self, session_id: str) -> list[str]:
        return sorted(set(self._devices.get(session_id, {}).values()))

    async def broadcast(
        self,
        session_id: str,
        event: ServerSyncEvent,
        *,
        exclude_device_id: str | None = None,
    ) -> None:
        payload = event.model_dump(mode="json")
        async with self._lock:
            targets = [
                (websocket, device_id)
                for websocket, device_id in self._devices.get(session_id, {}).items()
                if device_id != exclude_device_id
            ]

        for websocket, _ in targets:
            try:
                await websocket.send_json(payload)
            except Exception as exc:
                logger.warning("Removing failed sync connection: %s", exc)
                await self.disconnect(session_id, websocket)
