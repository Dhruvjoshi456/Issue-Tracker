// Modal Management
class ModalManager {
    static openCreateModal() {
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    static closeCreateModal() {
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    static async createCustomIssue() {
        try {
            const title = document.getElementById('modalTitle')?.value.trim();
            const description = document.getElementById('modalDescription')?.value.trim();
            const status = document.getElementById('modalStatus')?.value;
            const priority = document.getElementById('modalPriority')?.value;
            const assignee = document.getElementById('modalAssignee')?.value.trim();

            if (!title) {
                MessageService.showError('Title is required');
                return;
            }

            MessageService.showLoading(true);
            MessageService.clearMessages();
            
            const newIssue = {
                title,
                description: description || null,
                status,
                priority,
                assignee: assignee || null
            };

            const data = await ApiService.createIssue(newIssue);
            MessageService.showSuccess(`✅ Issue "${title}" created successfully! ID: ${data.id.substring(0, 8)}...`);
            
            ModalManager.closeCreateModal();
            document.getElementById('createIssueForm')?.reset();
            
            setTimeout(() => {
                issueManager.loadIssues(false);
            }, 1000);
            
        } catch (error) {
            MessageService.showError(`Failed to create issue: ${error.message}`);
        } finally {
            MessageService.showLoading(false);
        }
    }

    static setupModalEvents() {
        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('createModal');
            if (event.target === modal) {
                ModalManager.closeCreateModal();
            }
        }
    }
}

// Global functions for backward compatibility
function openCreateModal() {
    ModalManager.openCreateModal();
}

function closeCreateModal() {
    ModalManager.closeCreateModal();
}

function createCustomIssue() {
    ModalManager.createCustomIssue();
}