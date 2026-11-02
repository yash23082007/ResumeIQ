"""
ResumeIQ — Rate Limiting Configuration (slowapi)
Protects unauthenticated and sensitive authentication routes against brute-force and scraping abuse.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],
    headers_enabled=True,
)
