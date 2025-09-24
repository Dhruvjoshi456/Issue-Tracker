// Application Initialization and Event Handlers
class App {
    static async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', App.onDOMReady);
        } else {
            App.onDOMReady();
        }
    }

    static async onDOMReady() {
        try {
            // Initialize components
            await issueManager.init();
            ModalManager.setupModalEvents();
            App.setupKeyboardShortcuts();
            App.setupGlobalEventHandlers();
            
            console.log('✅ Issue Tracker initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Issue Tracker:', error);
            MessageService.showError('Failed to initialize application');
        }
    }

    static setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(event) {
            // Escape key to close modal
            if (event.key === 'Escape') {
                ModalManager.closeCreateModal();
            }
            // Ctrl+N to open new issue modal
            if (event.ctrlKey && event.key === 'n') {
                event.preventDefault();
                ModalManager.openCreateModal();
            }
            // Ctrl+R to refresh
            if (event.ctrlKey && event.key === 'r') {
                event.preventDefault();
                issueManager.loadIssues();
            }
        });
    }

    static setupGlobalEventHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            MessageService.showError('An unexpected error occurred');
        });

        // Global unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            MessageService.showError('An unexpected error occurred');
        });
    }
}

// Global functions for backward compatibility and direct HTML calls
async function checkBackendHealth() {
    try {
        MessageService.showLoading(true);
        MessageService.clearMessages();
        
        const data = await ApiService.healthCheck();
        MessageService.showSuccess(`🎉 Backend is healthy! Status: ${data.status.toUpperCase()}`);
    } catch (error) {
        MessageService.showError(`Failed to connect to backend: ${error.message}`);
    } finally {
        MessageService.showLoading(false);
    }
}

function loadIssues() {
    issueManager.loadIssues();
}

function testCreateIssue() {
    issueManager.createTestIssue();
}

function sortBy(field) {
    issueManager.sortBy(field);
}

function viewIssue(issueId) {
    issueManager.viewIssue(issueId);
}

function editIssue(issueId) {
    issueManager.editIssue(issueId);
}

// Initialize the application
App.init();