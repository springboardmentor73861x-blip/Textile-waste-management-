import time
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.config.logging_config import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        url_path = request.url.path

        logger.info(f"Incoming Request: {method} {url_path} from {client_ip}")

        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            logger.info(
                f"Completed: {method} {url_path} - Status: {response.status_code} - Duration: {process_time:.2f}ms"
            )
            response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
            return response
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"Failed Request: {method} {url_path} - Error: {str(exc)} - Duration: {process_time:.2f}ms",
                exc_info=True
            )
            raise exc
