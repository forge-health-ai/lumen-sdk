"""
Supabase client initialization for LUMEN SDK API.

Copyright 2026 Forge Partners Inc.
"""

import os
from typing import Optional
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)

# Global Supabase client instance
_supabase_client: Optional[Client] = None


def init_supabase() -> Client:
    """
    Initialize Supabase client with service key.
    
    Returns:
        Client: Initialized Supabase client
        
    Raises:
        ValueError: If required environment variables are missing
        Exception: If client initialization fails
    """
    global _supabase_client
    
    if _supabase_client is not None:
        return _supabase_client
        
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url:
        raise ValueError("SUPABASE_URL environment variable is required")
    if not service_key:
        raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")
    
    try:
        _supabase_client = create_client(url, service_key)
        logger.info("✅ Supabase client initialized successfully")
        return _supabase_client
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase client: {e}")
        raise


def get_supabase() -> Client:
    """
    Get the Supabase client instance.
    
    Returns:
        Client: Supabase client instance
        
    Raises:
        RuntimeError: If client hasn't been initialized
    """
    if _supabase_client is None:
        raise RuntimeError("Supabase client not initialized. Call init_supabase() first.")
    return _supabase_client


async def health_check() -> bool:
    """
    Check if Supabase connection is healthy.
    
    Returns:
        bool: True if connection is healthy, False otherwise
    """
    try:
        client = get_supabase()
        # Simple query to test connection
        result = client.from_("api_keys").select("count", count="exact").limit(1).execute()
        return True
    except Exception as e:
        logger.error(f"Supabase health check failed: {e}")
        return False