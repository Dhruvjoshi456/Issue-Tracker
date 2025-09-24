// Issue Management Functions
class IssueManager {
    constructor() {
        this.currentPage = 1;
        this.currentSort = 'updated_at';
        this.currentOrder = 'desc';
    }

    async init() {
        await this.loadIssues();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Real-time search listeners
        document.getElementById('searchInput')?.addEventListener('input', 
            this.debounce(() => this.loadIssues(), 300));
        document.getElementById('statusFilter')?.addEventListener('change', () => this.loadIssues());
        document.getElementById('priorityFilter')?.addEventListener('change', () => this.loadIssues());
        document.getElementById('assigneeFilter')?.addEventListener('input', 
            this.debounce(() => this.loadIssues(), 300));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async loadIssues(clearSuccessMessage = true) {
        try {
            MessageService.showLoading(true);
            if (clearSuccessMessage) {
                MessageService.clearMessages();
            } else {
                MessageService.clearErrors();
            }
            
            const params = {
                page: this.currentPage,
                page_size: 50,
                sort_by: this.currentSort,
                sort_order: this.currentOrder
            };

            // Add filter parameters
            const search = document.getElementById('searchInput')?.value;
            const status = document.getElementById('statusFilter')?.value;
            const priority = document.getElementById('priorityFilter')?.value;
            const assignee = document.getElementById('assigneeFilter')?.value;

            if (search) params.search = search;
            if (status) params.status = status;
            if (priority) params.priority = priority;
            if (assignee) params.assignee = assignee;

            const data = await ApiService.getIssues(params);
            this.displayIssues(data.issues);
            this.updateStatusCards(data.issues);
            
        } catch (error) {
            MessageService.showError(`Failed to load issues: ${error.message}`);
            this.displayIssues([]);
        } finally {
            MessageService.showLoading(false);
        }
    }

    displayIssues(issues) {
        const tbody = document.getElementById('issuesTableBody');
        const emptyState = document.getElementById('emptyState');
        const table = document.querySelector('.table-responsive');
        
        if (issues.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            document.getElementById('issueCount').textContent = '0 issues';
            return;
        }

        table.style.display = 'block';
        emptyState.style.display = 'none';
        
        tbody.innerHTML = '';
        document.getElementById('issueCount').textContent = `${issues.length} issue${issues.length !== 1 ? 's' : ''}`;

        issues.forEach(issue => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="issue-id" onclick="issueManager.viewIssue('${issue.id}')" title="Click to view details">
                        ${issue.id.substring(0, 8)}...
                    </span>
                </td>
                <td>
                    <strong>${Utils.escapeHtml(issue.title)}</strong>
                    ${issue.description ? `<br><small style="color: #6c757d;">${Utils.escapeHtml(issue.description.substring(0, 50))}${issue.description.length > 50 ? '...' : ''}</small>` : ''}
                </td>
                <td>
                    <span class="badge status-${issue.status.replace(' ', '-')}">${issue.status}</span>
                </td>
                <td>
                    <span class="badge priority-${issue.priority}">${issue.priority}</span>
                </td>
                <td>${issue.assignee ? Utils.escapeHtml(issue.assignee) : '<em style="color: #6c757d;">Unassigned</em>'}</td>
                <td>
                    <small style="color: #6c757d;">
                        ${new Date(issue.updated_at).toLocaleString()}
                    </small>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-info btn-sm" onclick="issueManager.viewIssue('${issue.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="issueManager.editIssue('${issue.id}')" title="Edit Issue">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateStatusCards(issues) {
        const openCount = issues.filter(issue => issue.status === 'open').length;
        const progressCount = issues.filter(issue => issue.status === 'in-progress').length;
        const closedCount = issues.filter(issue => issue.status === 'closed').length;
        const totalCount = issues.length;

        const openCountEl = document.getElementById('openCount');
        const progressCountEl = document.getElementById('progressCount');
        const closedCountEl = document.getElementById('closedCount');
        const totalCountEl = document.getElementById('totalCount');

        if (openCountEl) openCountEl.textContent = openCount;
        if (progressCountEl) progressCountEl.textContent = progressCount;
        if (closedCountEl) closedCountEl.textContent = closedCount;
        if (totalCountEl) totalCountEl.textContent = totalCount;
    }

    sortBy(field) {
        if (this.currentSort === field) {
            this.currentOrder = this.currentOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = field;
            this.currentOrder = 'asc';
        }
        this.loadIssues();
    }

    async viewIssue(issueId) {
        try {
            const issue = await ApiService.getIssue(issueId);
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-eye"></i> Issue Details</h2>
                        <button class="close" onclick="this.closest('.modal').remove(); document.body.style.overflow = 'auto';">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 30px;">
                        <div class="issue-detail">
                            <div class="detail-row">
                                <strong>ID:</strong> 
                                <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${issue.id}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Title:</strong> 
                                <span>${Utils.escapeHtml(issue.title)}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Description:</strong> 
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 5px; line-height: 1.6;">${Utils.escapeHtml(issue.description || 'No description')}</div>
                            </div>
                            <div class="detail-row">
                                <strong>Status:</strong> 
                                <span class="badge status-${issue.status.replace(' ', '-')}">${issue.status}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Priority:</strong> 
                                <span class="badge priority-${issue.priority}">${issue.priority}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Assignee:</strong> 
                                <span>${Utils.escapeHtml(issue.assignee || 'Unassigned')}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Created:</strong> 
                                <span>${new Date(issue.created_at).toLocaleString()}</span>
                            </div>
                            <div class="detail-row">
                                <strong>Last Updated:</strong> 
                                <span>${new Date(issue.updated_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            MessageService.showError('Failed to load issue details: ' + error.message);
        }
    }

    editIssue(issueId) {
        MessageService.showSuccess(`✏️ Editing issue: ${issueId.substring(0, 8)}... (Feature coming soon)`);
    }

    async createTestIssue() {
        try {
            MessageService.showLoading(true);
            MessageService.clearMessages();
            
            const testIssue = {
                title: "Test Issue - " + new Date().toLocaleTimeString(),
                description: "This is a test issue created at " + new Date().toLocaleString() + ". It demonstrates the issue creation functionality.",
                status: "open",
                priority: "medium",
                assignee: "test.user@company.com"
            };

            const issue = await ApiService.createIssue(testIssue);
            MessageService.showSuccess(`🎉 Test issue created successfully! ID: ${issue.id.substring(0, 8)}...`);
            
            await this.loadIssues();
            
        } catch (error) {
            MessageService.showError('Failed to create test issue: ' + error.message);
        } finally {
            MessageService.showLoading(false);
        }
    }
}

// Global instance
const issueManager = new IssueManager();