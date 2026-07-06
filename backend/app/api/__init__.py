# app/api/__init__.py
from . import auth_routes
from . import user_routes

__all__ = ["auth_routes", "user_routes"]