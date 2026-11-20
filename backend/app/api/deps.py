from collections.abc import Iterator

from fastapi import Request, WebSocket
from sqlalchemy.orm import Session

from ..config import Settings
from ..services.ollama import OllamaService


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_db(request: Request) -> Iterator[Session]:
    with request.app.state.session_factory() as session:
        yield session


def get_websocket_db(websocket: WebSocket) -> Iterator[Session]:
    with websocket.app.state.session_factory() as session:
        yield session


def get_ollama(request: Request) -> OllamaService:
    return request.app.state.ollama
