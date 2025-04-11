// Main JavaScript functionality for Resume Builder
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    
    if (page === 'create') {
        initializeCreatePage();
    } else if (page === 'templates') {
        initializeTemplatesPage();
    } else if (page === 'preview') {
        initializePreviewPage();
    }
});

// Create Page Initialization
function initializeCreatePage() {
    const sections = ['personal', 'experience', 'education', 'skills'];
    let currentSectionIndex = 0;

    // Elements
    const form = document.getElementById('resumeForm');
    const prevBtn = document.getElementById('prevSection');
    const nextBtn = document.getElementById('nextSection');
    const submitBtn = document.getElementById('submitForm');
    const progressBar = document.getElementById('formProgress');
    const saveBtn = document.getElementById('saveProgress');
    const previewBtn = document.getElementById('previewResume');

    // Initialize form with saved data if exists
    loadSavedFormData();

    // Navigation Buttons
    prevBtn?.addEventListener('click', () => {
        if (currentSectionIndex > 0) {
            navigateToSection(currentSectionIndex - 1);
        }
    });

    nextBtn?.addEventListener('click', () => {
        if (validateCurrentSection()) {
            if (currentSectionIndex < sections.length - 1) {
                navigateToSection(currentSectionIndex + 1);
            }
        }
    });

    // Save Progress
    saveBtn?.addEventListener('click', () => {
        if (saveFormData()) {
            showNotification('Progress saved successfully!', 'success');
        }
    });

    // Preview
    previewBtn?.addEventListener('click', () => {
        if (validateForm()) {
            saveFormData();
            window.location.href = 'preview_resume.html';
        } else {
            showNotification('Please fill in all required fields before previewing', 'error');
        }
    });

    // Form Submission
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            saveFormData();
            window.location.href = 'preview_resume.html';
        }
    });

    // Add Experience Entry
    document.getElementById('addExperience')?.addEventListener('click', () => {
        const container = document.getElementById('experienceContainer');
        const entries = container.querySelectorAll('.experience-entry');
        const newEntry = entries[0].cloneNode(true);
        
        // Clear values
        newEntry.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
            input.name = input.name.replace('[0]', `[${entries.length}]`);
        });

        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-entry';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => {
            newEntry.remove();
            updateProgress();
        };
        newEntry.appendChild(removeBtn);

        container.appendChild(newEntry);
        initializeCurrentJobCheckboxes();
    });

    // Add Education Entry
    document.getElementById('addEducation')?.addEventListener('click', () => {
        const container = document.getElementById('educationContainer');
        const entries = container.querySelectorAll('.education-entry');
        const newEntry = entries[0].cloneNode(true);
        
        // Clear values
        newEntry.querySelectorAll('input, textarea').forEach(input => {
            input.value = '';
            input.name = input.name.replace('[0]', `[${entries.length}]`);
        });

        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-entry';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.onclick = () => {
            newEntry.remove();
            updateProgress();
        };
        newEntry.appendChild(removeBtn);

        container.appendChild(newEntry);
        initializeCurrentEducationCheckboxes();
    });

    // Initialize Skills Tags
    initializeSkillsTags();

    // Initialize Current Job/Education Checkboxes
    initializeCurrentJobCheckboxes();
    initializeCurrentEducationCheckboxes();

    function navigateToSection(index) {
        // Hide current section
        document.querySelector('.form-section.active')?.classList.remove('active');
        
        // Show new section
        document.getElementById(sections[index])?.classList.add('active');
        
        // Update buttons
        prevBtn.disabled = index === 0;
        if (index === sections.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }

        // Update progress
        updateProgress(index);
        
        // Update current index
        currentSectionIndex = index;
        
        // Update steps
        updateSteps(index);
    }

    function updateProgress(index = currentSectionIndex) {
        const progress = ((index + 1) / sections.length) * 100;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    function updateSteps(index) {
        document.querySelectorAll('.step').forEach((step, i) => {
            step.classList.remove('active', 'completed');
            if (i === index) {
                step.classList.add('active');
            } else if (i < index) {
                step.classList.add('completed');
            }
        });
    }

    function validateCurrentSection() {
        const currentSection = document.querySelector('.form-section.active');
        if (!currentSection) return true;

        const inputs = currentSection.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                showInputError(input);
            } else {
                input.classList.remove('error');
                hideInputError(input);
            }
        });

        if (!isValid) {
            showNotification('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    function validateForm() {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        return Array.from(inputs).every(input => input.value.trim() !== '');
    }

    function showInputError(input) {
        const errorDiv = input.parentElement.querySelector('.error-message') || 
                        document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'This field is required';
        if (!input.parentElement.querySelector('.error-message')) {
            input.parentElement.appendChild(errorDiv);
        }
    }

    function hideInputError(input) {
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    function initializeSkillsTags() {
        const skillsInputs = ['technicalSkills', 'softSkills', 'languages'];
        
        skillsInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            const preview = document.getElementById(`${inputId}Preview`);
            
            if (input && preview) {
                input.addEventListener('input', () => {
                    updateSkillTags(input.value, preview);
                });
                
                // Initialize with any existing values
                if (input.value) {
                    updateSkillTags(input.value, preview);
                }
            }
        });
    }

    function updateSkillTags(value, container) {
        const skills = value.split(',').map(skill => skill.trim()).filter(Boolean);
        container.innerHTML = skills.map(skill => `
            <div class="skill-tag">
                ${skill}
                <i class="fas fa-times" onclick="this.parentElement.remove()"></i>
            </div>
        `).join('');
    }

    function initializeCurrentJobCheckboxes() {
        document.querySelectorAll('.current-job').forEach(checkbox => {
            const endDateInput = checkbox.closest('.experience-entry')
                .querySelector('input[name*="endDate"]');
            
            checkbox.addEventListener('change', () => {
                endDateInput.disabled = checkbox.checked;
                if (checkbox.checked) {
                    endDateInput.value = '';
                }
            });
        });
    }

    function initializeCurrentEducationCheckboxes() {
        document.querySelectorAll('.current-education').forEach(checkbox => {
            const endDateInput = checkbox.closest('.education-entry')
                .querySelector('input[name*="endDate"]');
            
            checkbox.addEventListener('change', () => {
                endDateInput.disabled = checkbox.checked;
                if (checkbox.checked) {
                    endDateInput.value = '';
                }
            });
        });
    }
}

// Preview Page Functions
function initializePreviewPage() {
    // ... (previous preview page code remains unchanged)
}

// Templates Page Functions
function initializeTemplatesPage() {
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const templateId = card.dataset.templateId;
            localStorage.setItem('selectedTemplate', templateId);
            window.location.href = 'create_resume.html';
        });
    });
}

// Utility Functions
function saveFormData() {
    try {
        const form = document.getElementById('resumeForm');
        if (!form) return false;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem('resumeData', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving form data:', error);
        return false;
    }
}

function loadSavedFormData() {
    try {
        const form = document.getElementById('resumeForm');
        if (!form) return;

        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.entries(data).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = value;
                }
            });
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
