// Message Service
class MessageService {
    static showLoading(show) {
        const loadingDiv = document.getElementById('loadingMessage');
        if (loadingDiv) {
            loadingDiv.style.display = show ? 'block' : 'none';
        }
    }

    static showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    static showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        if (successDiv) {
            successDiv.innerHTML = `${message}`;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 4000);
        }
    }

    static clearMessages() {
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');
        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';
    }

    static clearErrors() {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) errorDiv.style.display = 'none';
    }
}

// Utility Functions
class Utils {
    static escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    static truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}