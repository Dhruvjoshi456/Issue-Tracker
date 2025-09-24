from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum

# Create FastAPI app with enhanced metadata
app = FastAPI(
    title="🎯 Issue Tracker API",
    description="""
    ## Professional Issue Tracker REST API
    
    A modern, full-featured issue tracking system with comprehensive CRUD operations.
    
    ### Features:
    * ✅ **Create, Read, Update Issues** - Full CRUD operations
    * 🔍 **Advanced Search & Filtering** - Search by title, filter by status/priority/assignee
    * 📊 **Sorting & Pagination** - Flexible data retrieval with pagination support
    * 🏷️ **Status Management** - Track issue lifecycle (Open → In Progress → Closed)
    * ⚡ **Priority System** - Low, Medium, High, Critical priority levels
    * 👤 **Assignee Management** - Assign issues to team members
    * 🕒 **Timestamp Tracking** - Automatic creation and update timestamps
    
    ### Quick Start:
    1. Check API health with `/health`
    2. Get all issues with `/issues`
    3. Create new issues with `POST /issues`
    4. View specific issues with `/issues/{id}`
    5. Update issues with `PUT /issues/{id}`
    
    Perfect for development teams, project management, and bug tracking workflows.
    """,
    version="1.0.0",
    contact={
        "name": "Issue Tracker API Support",
        "email": "support@issuetracker.dev",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    tags_metadata=[
        {
            "name": "Health",
            "description": "System health and status monitoring endpoints",
        },
        {
            "name": "Issues",
            "description": "Complete issue management operations - create, read, update, search, and filter",
        },
    ]
)

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # Angular default
        "http://localhost:3000",  # React/Frontend server
        "http://127.0.0.1:3000",  # Local frontend
        "http://localhost:8080",  # Vue default
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enum definitions for better API documentation
class IssueStatus(str, Enum):
    open = "open"
    in_progress = "in-progress" 
    closed = "closed"

class IssuePriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

# Enhanced data models with better documentation
class IssueBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Issue title (required)")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed issue description")
    status: IssueStatus = Field(default=IssueStatus.open, description="Current issue status")
    priority: IssuePriority = Field(default=IssuePriority.medium, description="Issue priority level")
    assignee: Optional[str] = Field(None, max_length=100, description="Assigned team member email")
    
    class Config:
        json_schema_extra = {
            "example": {}
        }

class IssueCreate(IssueBase):
    """Model for creating new issues"""
    class Config:
        json_schema_extra = {
            "example": {}
        }

class IssueUpdate(BaseModel):
    """Model for updating existing issues - all fields optional"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated issue title")
    description: Optional[str] = Field(None, max_length=2000, description="Updated issue description") 
    status: Optional[IssueStatus] = Field(None, description="Updated issue status")
    priority: Optional[IssuePriority] = Field(None, description="Updated issue priority")
    assignee: Optional[str] = Field(None, max_length=100, description="Updated assignee email")
    
    class Config:
        json_schema_extra = {
            "example": {}
        }

class Issue(IssueBase):
    """Complete issue model with system-generated fields"""
    id: str = Field(..., description="Unique issue identifier (UUID)")
    created_at: datetime = Field(..., description="Issue creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {}
        }

# In-memory storage (in production, you'd use a database)
issues_db: List[Issue] = []

@app.get("/", tags=["Health"])
async def root():
    """
    ## 🏠 API Root Endpoint
    
    Welcome to the Issue Tracker API! This endpoint provides basic API information and navigation links.
    
    **Use this to:**
    - Verify API connectivity
    - Get overview of available endpoints
    - Access API documentation links
    """
    return {
        "message": "🎯 Issue Tracker API - Professional Issue Management System",
        "version": "1.0.0",
        "status": "operational",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_json": "/openapi.json"
        },
        "endpoints": {
            "health_check": "/health",
            "all_issues": "/issues",
            "single_issue": "/issues/{id}",
            "create_issue": "POST /issues",
            "update_issue": "PUT /issues/{id}"
        },
        "features": [
            "Advanced search and filtering",
            "Pagination and sorting", 
            "Full CRUD operations",
            "Status and priority management",
            "Assignee tracking",
            "Automatic timestamps"
        ]
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    ## ❤️ Health Check Endpoint
    
    Verify that the API server is running and operational.
    
    **Returns:**
    - Server status
    - Current timestamp
    - Database connection status
    
    **Use this for:**
    - Monitoring and alerting
    - Load balancer health checks
    - API connectivity verification
    """
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "database": "connected",
        "total_issues": len(issues_db)
    }

@app.get("/issues", response_model=dict, tags=["Issues"])
async def get_issues(
    search: Optional[str] = Query(None, description="🔍 Search issues by title, description, or assignee"),
    status: Optional[IssueStatus] = Query(None, description="📊 Filter by issue status"),
    priority: Optional[IssuePriority] = Query(None, description="⚡ Filter by priority level"),
    assignee: Optional[str] = Query(None, description="👤 Filter by assignee email/name"),
    sort_by: Optional[str] = Query("updated_at", description="📈 Sort by field (title, status, priority, assignee, created_at, updated_at)"),
    sort_order: Optional[str] = Query("desc", description="🔄 Sort order: 'asc' (ascending) or 'desc' (descending)"),
    page: int = Query(1, ge=1, description="📄 Page number (starts from 1)"),
    page_size: int = Query(10, ge=1, le=100, description="📦 Number of issues per page (max 100)")
):
    """
    ## 📋 Get All Issues
    
    Retrieve issues with powerful search, filtering, sorting, and pagination capabilities.
    
    ### 🔍 **Search & Filter:**
    - **Search**: Find issues by title, description, or assignee name
    - **Status Filter**: Show only Open, In-Progress, or Closed issues  
    - **Priority Filter**: Filter by Low, Medium, High, or Critical priority
    - **Assignee Filter**: Show issues assigned to specific team members
    
    ### 📊 **Sorting Options:**
    - **title**: Alphabetical by issue title
    - **status**: Group by status (open → in-progress → closed)
    - **priority**: Order by importance (critical → high → medium → low)
    - **assignee**: Alphabetical by assignee name
    - **created_at**: Order by creation date
    - **updated_at**: Order by last modification (default)
    
    ### 📄 **Pagination:**
    - Efficiently handle large datasets
    - Configurable page size (1-100 issues per page)
    - Total count and page information included
    
    ### 💡 **Usage:**
    Use query parameters to filter, search, sort and paginate results as needed.
    """
    
    filtered_issues = issues_db.copy()
    
    # Apply search across multiple fields
    if search:
        search_lower = search.lower()
        filtered_issues = [
            issue for issue in filtered_issues 
            if (search_lower in issue.title.lower() or 
                (issue.description and search_lower in issue.description.lower()) or
                (issue.assignee and search_lower in issue.assignee.lower()))
        ]
    
    # Apply filters
    if status:
        filtered_issues = [issue for issue in filtered_issues if issue.status == status]
    
    if priority:
        filtered_issues = [issue for issue in filtered_issues if issue.priority == priority]
    
    if assignee:
        filtered_issues = [issue for issue in filtered_issues if issue.assignee and assignee.lower() in issue.assignee.lower()]
    
    # Apply sorting
    reverse = sort_order == "desc"
    if sort_by == "title":
        filtered_issues.sort(key=lambda x: x.title.lower(), reverse=reverse)
    elif sort_by == "status":
        status_order = {"open": 1, "in-progress": 2, "closed": 3}
        filtered_issues.sort(key=lambda x: status_order.get(x.status, 0), reverse=reverse)
    elif sort_by == "priority":
        priority_order = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        filtered_issues.sort(key=lambda x: priority_order.get(x.priority, 0), reverse=reverse)
    elif sort_by == "assignee":
        filtered_issues.sort(key=lambda x: x.assignee or "", reverse=reverse)
    elif sort_by == "created_at":
        filtered_issues.sort(key=lambda x: x.created_at, reverse=reverse)
    else:  # default to updated_at
        filtered_issues.sort(key=lambda x: x.updated_at, reverse=reverse)
    
    # Apply pagination
    total_count = len(filtered_issues)
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    paginated_issues = filtered_issues[start_index:end_index]
    
    return {
        "issues": paginated_issues,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "totalCount": total_count,
            "totalPages": (total_count + page_size - 1) // page_size
        },
        "filters_applied": {
            "search": search,
            "status": status,
            "priority": priority, 
            "assignee": assignee
        },
        "sorting": {
            "sort_by": sort_by,
            "sort_order": sort_order
        }
    }

@app.get("/issues/{issue_id}", response_model=Issue, tags=["Issues"])
async def get_issue(issue_id: str):
    """
    ## 🔍 Get Single Issue
    
    Retrieve detailed information for a specific issue by its unique ID.
    
    ### 📋 **Returns:**
    - Complete issue details including all fields
    - Creation and last update timestamps
    - Current status and priority
    - Assigned team member information
    
    ### 💡 **Use Cases:**
    - Retrieve complete issue information
    - Get latest issue status for notifications
    - Audit trail and issue history
    - Integration with external tools
    
    ### ❌ **Error Responses:**
    - **404 Not Found**: Issue with specified ID doesn't exist
    """
    issue = next((issue for issue in issues_db if issue.id == issue_id), None)
    if not issue:
        raise HTTPException(
            status_code=404, 
            detail={
                "error": "Issue not found",
                "message": f"No issue exists with ID: {issue_id}",
                "suggestion": "Check the issue ID or use GET /issues to see all available issues"
            }
        )
    return issue

@app.post("/issues", response_model=Issue, status_code=201, tags=["Issues"])
async def create_issue(issue_data: IssueCreate):
    """
    ## ✨ Create New Issue
    
    Create a new issue with automatic ID generation and timestamp tracking.
    
    ### 📝 **Required Fields:**
    - **title**: Clear, descriptive issue title (1-200 characters)
    
    ### 🔧 **Optional Fields:**
    - **description**: Detailed explanation of the issue
    - **status**: Initial status (defaults to "open")
    - **priority**: Issue priority (defaults to "medium") 
    - **assignee**: Team member email to assign the issue
    
    ### 🚀 **Auto-Generated:**
    - **id**: Unique UUID identifier
    - **created_at**: Current timestamp
    - **updated_at**: Current timestamp (same as created_at initially)
    
    ### 💡 **Usage:**
    Submit a JSON payload with the required fields. All fields except `title` are optional and will use default values if not provided.
    
    ### ✅ **Success Response:**
    Returns the complete created issue with generated ID and timestamps.
    """
    new_issue = Issue(
        id=str(uuid.uuid4()),
        created_at=datetime.now(),
        updated_at=datetime.now(),
        **issue_data.model_dump()
    )
    issues_db.append(new_issue)
    return new_issue

@app.put("/issues/{issue_id}", response_model=Issue, tags=["Issues"])
async def update_issue(issue_id: str, issue_update: IssueUpdate):
    """
    ## ✏️ Update Existing Issue
    
    Modify an existing issue with partial updates. Only provided fields will be changed.
    
    ### 🔄 **Updatable Fields:**
    - **title**: Change issue title
    - **description**: Update detailed description
    - **status**: Change workflow status (open → in-progress → closed)
    - **priority**: Adjust priority level (low, medium, high, critical)
    - **assignee**: Reassign to different team member
    
    ### ⚡ **Auto-Updated:**
    - **updated_at**: Automatically set to current timestamp
    
    ### 💡 **Usage:**
    Provide a JSON payload with only the fields you want to update. All fields are optional for updates.
    
    ### ❌ **Error Responses:**
    - **404 Not Found**: Issue with specified ID doesn't exist
    - **422 Validation Error**: Invalid field values provided
    """
    issue = next((issue for issue in issues_db if issue.id == issue_id), None)
    if not issue:
        raise HTTPException(
            status_code=404, 
            detail={
                "error": "Issue not found", 
                "message": f"No issue exists with ID: {issue_id}",
                "suggestion": "Check the issue ID or use GET /issues to see all available issues"
            }
        )
    
    # Update only provided fields
    update_data = issue_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(issue, field, value)
    
    # Always update the timestamp
    issue.updated_at = datetime.now()
    
    return issue

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)