from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback
import time
import uuid


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start = time.time()
        try:
            response = await call_next(request)
            elapsed = int((time.time() - start) * 1000)
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{elapsed}ms"
            return response
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            detail = str(e)
            status_code = getattr(e, "status_code", 500)
            return JSONResponse(
                status_code=status_code,
                content={
                    "error": True,
                    "detail": detail,
                    "request_id": request_id,
                    "elapsed_ms": elapsed,
                },
                headers={"X-Request-ID": request_id, "X-Response-Time": f"{elapsed}ms"},
            )
