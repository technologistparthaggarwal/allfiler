class FileUploader {
    constructor() {
        this.form = document.getElementById('uploadForm');
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('file');
        this.browseButton = document.getElementById('browseFiles');
        this.resultDiv = document.getElementById('result');
        this.progressContainer = document.getElementById('uploadProgress');
        this.progressItems = document.getElementById('progressItems');
        
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupBrowseButton();
        this.setupFileInput();
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.remove('drag-over');
            });
        });

        this.dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
    }

    setupBrowseButton() {
        this.browseButton.addEventListener('click', () => {
            this.fileInput.click();
        });
    }

    setupFileInput() {
        this.fileInput.addEventListener('change', () => {
            if (this.fileInput.files.length > 0) {
                this.handleFiles(this.fileInput.files);
            }
        });
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            this.uploadFile(file);
        });
    }

    createProgressItem(file) {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-header">
                <span>${file.name}</span>
                <span class="progress-percentage">0%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
        `;
        this.progressItems.appendChild(progressItem);
        this.progressContainer.style.display = 'block';
        return progressItem;
    }

    updateProgress(progressItem, percentage) {
        const progressBar = progressItem.querySelector('.progress-bar');
        const progressText = progressItem.querySelector('.progress-percentage');
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const description = document.getElementById('description').value.trim();
        const tags = document.getElementById('tags').value.trim();
        
        if (description) formData.append('description', description);
        if (tags) formData.append('tags', tags);

        const progressItem = this.createProgressItem(file);

        try {
            const response = await fetch('/files/upload', {
                method: 'POST',
                body: formData,
                onUploadProgress: (progressEvent) => {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.updateProgress(progressItem, percentage);
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data);
                setTimeout(() => {
                    progressItem.remove();
                    if (this.progressItems.children.length === 0) {
                        this.progressContainer.style.display = 'none';
                    }
                }, 1000);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            this.showError(error);
            progressItem.remove();
        }
    }

    showSuccess(data) {
        this.resultDiv.className = 'success';
        this.resultDiv.innerHTML = `
            <p>File uploaded successfully!</p>
            <div class="file-info">
                <p><strong>File name:</strong> ${data.displayName}</p>
                <p><strong>Sharable link:</strong> <a href="${data.publicUrl}" target="_blank">${data.publicUrl}</a></p>
                <p><strong>File size:</strong> ${data.size} MB</p>
                <p><strong>Expires in:</strong> ${data.expiresIn}</p>
            </div>
        `;
        this.resultDiv.style.display = 'block';
    }

    showError(error) {
        this.resultDiv.className = 'error';
        this.resultDiv.textContent = `Error: ${error.message}`;
        this.resultDiv.style.display = 'block';
    }
}

// Initialize the uploader when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FileUploader();
});