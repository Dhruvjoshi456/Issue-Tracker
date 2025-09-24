// API Configuration
const API_BASE = 'http://127.0.0.1:8000';

// API Service functions
class ApiService {
    static async healthCheck() {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error('Health check failed');
        return response.json();
    }

    static async getIssues(params = {}) {
        const searchParams = new URLSearchParams(params);
        const response = await fetch(`${API_BASE}/issues?${searchParams}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    static async getIssue(issueId) {
        const response = await fetch(`${API_BASE}/issues/${issueId}`);
        if (!response.ok) throw new Error('Issue not found');
        return response.json();
    }

    static async createIssue(issueData) {
        const response = await fetch(`${API_BASE}/issues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(issueData)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    static async updateIssue(issueId, updateData) {
        const response = await fetch(`${API_BASE}/issues/${issueId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
}