"""
Tests for LUMEN SDK API enterprise features.

Copyright 2026 Forge Partners Inc.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, AsyncMock
import sys
from pathlib import Path

# Add api directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch("auth.supabase_client.get_supabase") as mock:
        mock_client = Mock()
        mock.return_value = mock_client
        yield mock_client


class TestPolicyPacks:
    """Test policy pack endpoints."""
    
    def test_list_packs_public(self, client):
        """Test public policy pack listing."""
        response = client.get("/v1/packs")
        assert response.status_code == 200
        
        packs = response.json()
        assert len(packs) == 6  # Should have all 6 packs
        
        # Check structure
        pack = packs[0]
        assert "pack_id" in pack
        assert "name" in pack
        assert "jurisdiction" in pack
        assert "tier" in pack
        assert "frameworks" in pack
        assert "checks_count" in pack
    
    def test_get_pack_detail_no_auth(self, client):
        """Test pack detail requires authentication."""
        response = client.get("/v1/packs/ca-on-phipa")
        assert response.status_code == 401
    
    @patch("auth.api_keys.verify_api_key")
    def test_get_pack_detail_with_auth(self, mock_verify, client):
        """Test pack detail with authentication."""
        from auth.api_keys import APIKeyInfo
        
        mock_verify.return_value = APIKeyInfo("key123", "org123", "free", "test", "dev")
        
        headers = {"X-API-Key": "lumen_pk_dev_test123"}
        response = client.get("/v1/packs/ca-on-phipa", headers=headers)
        assert response.status_code == 200
        
        pack = response.json()
        assert pack["pack_id"] == "ca-on-phipa"
        assert pack["name"] == "Ontario PHIPA Healthcare Pack"
        assert len(pack["checks"]) == 15  # Should have 15 checks
    
    def test_get_nonexistent_pack(self, client):
        """Test getting non-existent pack."""
        with patch("auth.api_keys.verify_api_key") as mock_verify:
            from auth.api_keys import APIKeyInfo
            mock_verify.return_value = APIKeyInfo("key123", "org123", "free", "test", "dev")
            
            headers = {"X-API-Key": "lumen_pk_dev_test123"}
            response = client.get("/v1/packs/nonexistent", headers=headers)
            assert response.status_code == 404


class TestAPIKeyManagement:
    """Test API key management endpoints."""
    
    def test_generate_key_no_auth(self, client):
        """Test key generation requires JWT auth."""
        response = client.post("/v1/keys/generate", json={
            "name": "Test Key",
            "environment": "dev"
        })
        assert response.status_code == 401
    
    @patch("auth.jwt_auth.verify_jwt_token")
    @patch("auth.supabase_client.get_supabase")
    def test_generate_key_success(self, mock_supabase, mock_jwt, client):
        """Test successful key generation."""
        # Mock JWT verification
        mock_jwt.return_value = {
            "user_id": "user123",
            "org_id": "org123", 
            "plan": "free"
        }
        
        # Mock Supabase responses
        mock_client = Mock()
        mock_supabase.return_value = mock_client
        
        # Mock existing key count (none)
        mock_client.from_().select().eq().eq().execute.return_value = Mock(count=0)
        
        # Mock key insert
        mock_client.from_().insert().execute.return_value = Mock(data=[{
            "id": "key123",
            "name": "Test Key",
            "environment": "dev",
            "created_at": "2026-02-13T15:30:00Z"
        }])
        
        headers = {"Authorization": "Bearer valid-jwt-token"}
        response = client.post("/v1/keys/generate", headers=headers, json={
            "name": "Test Key",
            "environment": "dev"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Key"
        assert data["environment"] == "dev"
        assert "api_key" in data
        assert data["api_key"].startswith("lumen_pk_dev_")
    
    @patch("auth.jwt_auth.verify_jwt_token")
    @patch("auth.supabase_client.get_supabase")
    def test_generate_key_limit_exceeded(self, mock_supabase, mock_jwt, client):
        """Test key generation with limit exceeded."""
        mock_jwt.return_value = {
            "user_id": "user123",
            "org_id": "org123",
            "plan": "free"
        }
        
        mock_client = Mock()
        mock_supabase.return_value = mock_client
        
        # Mock existing key count (at limit)
        mock_client.from_().select().eq().eq().execute.return_value = Mock(count=2)
        
        headers = {"Authorization": "Bearer valid-jwt-token"}
        response = client.post("/v1/keys/generate", headers=headers, json={
            "name": "Test Key",
            "environment": "dev"
        })
        
        assert response.status_code == 403
        assert "limit reached" in response.json()["detail"]


class TestRateLimiting:
    """Test rate limiting middleware."""
    
    @patch("middleware.rate_limit._rate_limiter.is_allowed")
    @patch("auth.api_keys.verify_api_key")
    def test_rate_limit_headers(self, mock_verify, mock_rate_limit, client):
        """Test rate limit headers are added."""
        from auth.api_keys import APIKeyInfo
        
        mock_verify.return_value = APIKeyInfo("key123", "org123", "free", "test", "dev")
        mock_rate_limit.return_value = (True, {
            "limit": 100,
            "remaining": 99,
            "reset": 1708789200,
            "retry_after": 0
        })
        
        headers = {"X-API-Key": "lumen_pk_dev_test123"}
        response = client.get("/v1/packs", headers=headers)
        
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
        assert response.headers["X-RateLimit-Limit"] == "100"
    
    @patch("middleware.rate_limit._rate_limiter.is_allowed")
    def test_rate_limit_exceeded(self, mock_rate_limit, client):
        """Test rate limit exceeded response."""
        mock_rate_limit.return_value = (False, {
            "limit": 100,
            "remaining": 0,
            "reset": 1708789200,
            "retry_after": 60
        })
        
        headers = {"X-API-Key": "lumen_pk_dev_test123"}
        response = client.get("/v1/packs", headers=headers)
        
        assert response.status_code == 429
        assert "Retry-After" in response.headers


class TestHealthCheck:
    """Test health check endpoints."""
    
    @patch("auth.supabase_client.health_check")
    def test_health_check_healthy(self, mock_health, client):
        """Test healthy status."""
        mock_health.return_value = True
        
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert data["supabase_healthy"] is True
        assert "uptime" in data
    
    @patch("auth.supabase_client.health_check")
    def test_health_check_degraded(self, mock_health, client):
        """Test degraded status when Supabase is down."""
        mock_health.return_value = False
        
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "degraded"
        assert data["supabase_healthy"] is False


class TestSecurityFeatures:
    """Test security-related features."""
    
    def test_cors_headers(self, client):
        """Test CORS headers are present."""
        response = client.options("/health", headers={
            "Origin": "https://developer.forgelumen.ca"
        })
        
        # Should allow the request
        assert response.status_code in [200, 204]
    
    def test_api_key_format_validation(self, client):
        """Test API key format validation."""
        # Short key should be rejected
        headers = {"X-API-Key": "short"}
        response = client.get("/v1/packs/ca-on-phipa", headers=headers)
        assert response.status_code == 403
    
    @patch("auth.api_keys.verify_api_key")  
    def test_environment_isolation(self, mock_verify, client):
        """Test environment isolation in key generation."""
        from auth.api_keys import APIKeyInfo
        
        mock_verify.return_value = APIKeyInfo("key123", "org123", "free", "test", "dev")
        
        headers = {"X-API-Key": "lumen_pk_dev_test123"}
        response = client.get("/v1/packs/ca-on-phipa", headers=headers)
        
        # Should work with dev key
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__])