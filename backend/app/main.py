from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.ai import router as ai_router
from .api.routes.annotations import router as annotations_router
from .api.routes.documents import router as documents_router
from .api.routes.health import router as health_router
from .api.routes.reading_position import router as reading_position_router
from .api.routes.sync import router as sync_router
from .config import Settings, get_settings
from .db.database import check_db, create_db_engine, create_session_factory, init_db
from .logging_config import configure_logging
from .services.ollama import OllamaService
from .services.sync import SyncConnectionManager


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings)

    engine = create_db_engine(settings)
    ollama = OllamaService(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        settings.data_dir.mkdir(parents=True, exist_ok=True)
        upload_dir = settings.upload_dir or settings.data_dir / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        init_db(engine)
        check_db(engine)
        yield
        await ollama.close()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.settings = settings
    app.state.engine = engine
    app.state.session_factory = create_session_factory(engine)
    app.state.ollama = ollama
    app.state.sync_manager = SyncConnectionManager()

    app.include_router(health_router)
    app.include_router(documents_router)
    app.include_router(annotations_router)
    app.include_router(reading_position_router)
    app.include_router(sync_router)
    app.include_router(ai_router)

    return app


app = create_app()
