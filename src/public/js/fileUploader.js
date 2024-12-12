class FileUploader {
    constructor() {
        this.form = document.getElementById('uploadForm');
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.browseButton = document.getElementById('browseButton');
        this.uploadButton = document.getElementById('uploadButton');
        this.selectedFileInfo = document.getElementById('selectedFileInfo');
        this.resultDiv = document.getElementById('result');
        
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupFileInput();
        this.setupUploadButton();
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
            if (files.length > 0) {
                this.fileInput.files = files;
                this.updateSelectedFileInfo(files[0]);
            }
        });
    }

    setupFileInput() {
        this.browseButton.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.updateSelectedFileInfo(e.target.files[0]);
            }
        });
    }

    setupUploadButton() {
        this.uploadButton.addEventListener('click', () => {
            if (this.fileInput.files.length > 0) {
                this.uploadFile(this.fileInput.files[0]);
            } else {
                this.showError({ message: 'Please select a file first' });
            }
        });
    }

    updateSelectedFileInfo(file) {
        this.selectedFileInfo.innerHTML = `
            <p>Selected file: ${file.name}</p>
            <p>Size: ${this.formatFileSize(file.size)}</p>
        `;
        this.selectedFileInfo.style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/files/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess(data);
                this.fileInput.value = '';
                this.selectedFileInfo.style.display = 'none';
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            this.showError(error);
        }
    }

    showSuccess(data) {
        this.resultDiv.className = 'success';
        this.resultDiv.innerHTML = `
            <div class="file-info">
                <p><strong>File name:</strong> ${data.originalFilename}</p>
                <p><strong>Sharable link:</strong> <a href="${data.publicUrl}" target="_blank">${data.publicUrl}</a></p>
                <p><strong>File size:</strong> ${data.size}</p>
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