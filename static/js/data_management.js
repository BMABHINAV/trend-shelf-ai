// Data Management specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupFileUpload();
});

function setupFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    const fileNameSpan = document.getElementById('file-name');
    const uploadStatus = document.getElementById('upload-status');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const fileControls = document.getElementById('file-controls');
    
    let clearButton = null;

    fileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fileNameSpan.textContent = file.name;
        uploadStatus.textContent = '';
        uploadProgress.classList.remove('hidden');
        progressBar.style.width = '0%';

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Show progress
            progressBar.style.width = '30%';
            uploadStatus.textContent = 'Uploading file...';
            uploadStatus.className = 'mt-4 text-blue-400';

            const response = await fetch('/api/upload-file/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            progressBar.style.width = '60%';
            uploadStatus.textContent = 'Processing with AI models...';

            const result = await response.json();

            if (response.ok) {
                progressBar.style.width = '100%';
                uploadStatus.textContent = result.message;
                uploadStatus.className = 'mt-4 text-green-400';
                
                // Add clear button if not exists
                if (!clearButton) {
                    clearButton = document.createElement('button');
                    clearButton.innerHTML = `<i class="fas fa-trash-alt mr-2"></i> Clear Data`;
                    clearButton.className = 'clear-data-btn';
                    clearButton.addEventListener('click', clearData);
                    fileControls.appendChild(clearButton);
                }

                // Dispatch custom event to notify other components of data update
                window.dispatchEvent(new CustomEvent('dataUpdated', {
                    detail: { source: 'fileUpload', recordsCount: result.records_count }
                }));

                // Update uploads table
                updateUploadsTable();

                // Show success notification
                showNotification('File processed successfully with AI predictions!', 'success');
                
            } else {
                throw new Error(result.error || 'Upload failed');
            }

        } catch (error) {
            console.error('Upload error:', error);
            uploadStatus.textContent = `Error: ${error.message}`;
            uploadStatus.className = 'mt-4 text-red-400';
            progressBar.style.width = '0%';
            showNotification('Upload failed: ' + error.message, 'error');
        } finally {
            setTimeout(() => {
                uploadProgress.classList.add('hidden');
            }, 2000);
        }
    });

    async function clearData() {
        if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await apiCall('/api/clear-data/', {
                method: 'POST'
            });

            if (response.success) {
                fileNameSpan.textContent = 'No file chosen';
                uploadStatus.textContent = '';
                fileUpload.value = '';
                
                if (clearButton) {
                    clearButton.remove();
                    clearButton = null;
                }

                updateUploadsTable();
                showNotification('All data cleared successfully', 'success');
            }
        } catch (error) {
            console.error('Clear data error:', error);
            showNotification('Error clearing data: ' + error.message, 'error');
        }
    }

    async function updateUploadsTable() {
        // Reload the page to update the uploads table
        // In a real application, you might want to update this via AJAX
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}