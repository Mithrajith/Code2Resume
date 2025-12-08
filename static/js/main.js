// Global variables
let currentResults = null;

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Setup form handlers
    setupSourceTypeToggle();
    setupFormSubmission();
    
    // Setup initial state
    toggleInputSections();
}

function setupSourceTypeToggle() {
    const sourceTypeRadios = document.querySelectorAll('input[name="sourceType"]');
    sourceTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleInputSections);
    });
}

function toggleInputSections() {
    const selectedSource = document.querySelector('input[name="sourceType"]:checked').value;
    const githubSection = document.getElementById('githubSection');
    const manualSection = document.getElementById('manualSection');
    
    if (selectedSource === 'github') {
        githubSection.style.display = 'block';
        manualSection.style.display = 'none';
        clearManualFields();
    } else {
        githubSection.style.display = 'none';
        manualSection.style.display = 'block';
        clearGithubFields();
    }
}

function clearManualFields() {
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('techStack').value = '';
}

function clearGithubFields() {
    document.getElementById('repoUrl').value = '';
}

function setupFormSubmission() {
    const form = document.getElementById('resumeForm');
    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateForm(data)) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Prepare request payload
        const payload = preparePayload(data);
        
        // Make API call
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Generation failed:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

function validateForm(data) {
    const sourceType = data.sourceType;
    
    if (!data.targetRole) {
        showError('Please select a target job role.');
        return false;
    }
    
    if (sourceType === 'github') {
        if (!data.repoUrl) {
            showError('Please enter a GitHub repository URL.');
            return false;
        }
        
        // Basic URL validation
        try {
            new URL(data.repoUrl);
            if (!data.repoUrl.includes('github.com')) {
                showError('Please enter a valid GitHub repository URL.');
                return false;
            }
        } catch {
            showError('Please enter a valid GitHub repository URL.');
            return false;
        }
    } else {
        if (!data.projectName || !data.projectDescription || !data.techStack) {
            showError('Please fill in all required fields for manual input.');
            return false;
        }
    }
    
    return true;
}

function preparePayload(data) {
    const payload = {
        source_type: data.sourceType,
        target_role: data.targetRole,
        user_role: data.userRole || null
    };
    
    if (data.sourceType === 'github') {
        payload.repo_url = data.repoUrl;
    } else {
        payload.project_name = data.projectName;
        payload.project_description = data.projectDescription;
        payload.tech_stack = data.techStack;
    }
    
    return payload;
}

function setLoadingState(isLoading) {
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    
    if (isLoading) {
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
    } else {
        generateBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
    }
}

function displayResults(result) {
    currentResults = result;
    
    // Hide error and show results
    hideError();
    
    // Populate result content
    document.getElementById('summaryContent').textContent = result.summary;
    
    // Format bullet points
    const bulletPoints = result.bullet_points.map(bullet => `• ${bullet}`).join('\n');
    document.getElementById('bulletContent').textContent = bulletPoints;
    
    document.getElementById('techContent').textContent = result.tech_stack_line;
    document.getElementById('portfolioContent').textContent = result.portfolio_version;
    
    // Show results section
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Scroll to error
    errorDiv.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function generateNew() {
    // Hide results
    document.getElementById('results').style.display = 'none';
    
    // Reset form
    document.getElementById('resumeForm').reset();
    
    // Reset source type to default
    document.querySelector('input[name="sourceType"][value="github"]').checked = true;
    toggleInputSections();
    
    // Scroll to top
    document.querySelector('.header').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Clear current results
    currentResults = null;
}

async function copyToClipboard(elementId) {
    try {
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        await navigator.clipboard.writeText(text);
        
        // Show feedback
        const copyBtn = element.parentNode.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#10b981';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#667eea';
        }, 2000);
        
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        
        // Fallback: select the text
        const element = document.getElementById(elementId);
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Show fallback message
        const copyBtn = element.parentNode.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Selected - Press Ctrl+C';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 3000);
    }
}

// Utility functions
function debounce(func, wait) {
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

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});