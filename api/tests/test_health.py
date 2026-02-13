# Copyright 2026 Forge Health Inc.
# Licensed under the Apache License, Version 2.0

"""Health endpoint tests for LUMEN SDK API."""

import pytest
from httpx import AsyncClient, ASGITransport
from api.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    """Health endpoint returns 200 with expected fields."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_root_endpoint():
    """Root endpoint returns API info."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "LUMEN" in data.get("name", "") or "lumen" in str(data).lower()


@pytest.mark.asyncio
async def test_evaluate_requires_auth():
    """Evaluate endpoint requires API key."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/v1/evaluate", json={})
    assert response.status_code in [401, 403, 422]
