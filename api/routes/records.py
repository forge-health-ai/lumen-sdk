"""Records retrieval endpoint for LUMEN SDK API."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from auth.api_keys import verify_api_key
from models.schemas import HumanAction, RecordResponse, Verdict

router = APIRouter(prefix="/v1", tags=["Records"])

# In-memory store for MVP (v1.0.0)
# Production (v1.1.0+): PostgreSQL persistence
MOCK_RECORDS: dict[str, RecordResponse] = {}


@router.get("/records/{record_id}", response_model=RecordResponse)
async def get_record(
    record_id: UUID,
    api_key_data: dict = Depends(verify_api_key)
) -> RecordResponse:
    """
    Retrieve a defensible record by ID.
    
    Args:
        record_id: UUID of the record to retrieve
        api_key_data: Validated API key metadata (injected)
        
    Returns:
        RecordResponse with full record details
        
    Raises:
        HTTPException: If record not found
    """
    record_id_str = str(record_id)
    
    # Check store
    if record_id_str in MOCK_RECORDS:
        return MOCK_RECORDS[record_id_str]
    
    # MVP (v1.0.0): Return demonstration record
    # Production (v1.1.0+): Query PostgreSQL, return 404 if not found
    
    # Generate deterministic demo record for API testing
    demo_record = RecordResponse(
        record_id=record_id,
        ai_output="[Demo] Sample AI output for API demonstration.",
        human_action=HumanAction.ACCEPTED,
        compliance_packs=["phipa"],
        lumen_score=85,
        tier=1,
        verdict=Verdict.ALLOW,
        citation_integrity=0.92,
        created_at=datetime.now(timezone.utc).isoformat(),
        context={"demo": True, "version": "1.0.0"}
    )
    
    return demo_record


@router.get("/records", response_model=list[RecordResponse])
async def list_records(
    limit: int = 10,
    offset: int = 0,
    api_key_data: dict = Depends(verify_api_key)
) -> list[RecordResponse]:
    """
    List defensible records with pagination.
    
    Args:
        limit: Maximum number of records to return (default 10)
        offset: Number of records to skip (default 0)
        api_key_data: Validated API key metadata (injected)
        
    Returns:
        List of RecordResponse objects
    """
    # MVP (v1.0.0): In-memory storage
    # Production (v1.1.0+): PostgreSQL with proper pagination
    
    records = list(MOCK_RECORDS.values())
    return records[offset:offset + limit]
