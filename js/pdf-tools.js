/**
 * Ednormous PDF Tools
 * JavaScript for handling PDF tool operations
 * 
 * This file implements secure, client-side PDF operations using PDF.js and PDF-LIB libraries.
 * All processing happens in the browser with no server storage for maximum privacy.
 * 
 * @version 1.0.0
 * @author Ednormous
 * @license MIT
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Tool Navigation
    setupToolNavigation();
    
    // File Upload Handlers
    setupFileUploads();
    
    // Tool-specific Functionality
    setupMergePDFTool();
    setupPageNumbersTool();
    setupWatermarkTool();
    setupCompressTool();
    setupEncryptTool();
});

// Ensure the PDF-LIB library is available
const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;

/**
 * Sets up navigation between different PDF tools
 */
function setupToolNavigation() {
    const navButtons = document.querySelectorAll('.pdf-nav-btn');
    const toolContainers = document.querySelectorAll('.pdf-tool');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTool = button.getAttribute('data-tool');
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show selected tool
            toolContainers.forEach(container => {
                container.classList.remove('active');
                if (container.id === `${targetTool}-tool`) {
                    container.classList.add('active');
                }
            });
        });
    });
}

/**
 * Sets up file upload functionality with drag & drop and click selection
 */
function setupFileUploads() {
    const uploadAreas = document.querySelectorAll('.file-upload-area');
    
    uploadAreas.forEach(area => {
        // Click to select files
        area.addEventListener('click', () => {
            const input = area.querySelector('input[type="file"]');
            if (input) {
                input.click();
            }
        });
        
        // Handle file input change
        const fileInput = area.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    handleFileSelection(fileInput.id, files);
                }
            });
        }
        
        // Drag & Drop functionality
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const input = area.querySelector('input[type="file"]');
                if (input) {
                    handleFileSelection(input.id, files);
                }
            }
        });
    });
    
    // Handle image uploads for watermarking
    const watermarkImageInput = document.getElementById('watermark-image-input');
    if (watermarkImageInput) {
        watermarkImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('watermark-image-preview');
                    preview.innerHTML = `<img src="${e.target.result}" alt="Watermark Image">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Toggle between text and image watermark
    const watermarkTypeRadios = document.querySelectorAll('input[name="watermark-type"]');
    watermarkTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const textOptions = document.querySelector('.watermark-text-options');
            const imageOptions = document.querySelector('.watermark-image-options');
            
            if (e.target.value === 'text') {
                textOptions.style.display = 'block';
                imageOptions.style.display = 'none';
            } else {
                textOptions.style.display = 'none';
                imageOptions.style.display = 'block';
            }
        });
    });
}

/**
 * Common function to handle file selection for different tools
 * @param {string} inputId - ID of the file input element
 * @param {FileList} files - Selected files
 */
function handleFileSelection(inputId, files) {
    switch(inputId) {
        case 'merge-file-input':
            handleMergeFileSelection(files);
            break;
        case 'page-numbers-file-input':
            handleSingleFileSelection(files[0], 'page-numbers-file-name', 'page-numbers-process-btn');
            break;
        case 'watermark-file-input':
            handleSingleFileSelection(files[0], 'watermark-file-name', 'watermark-process-btn');
            break;
        case 'compress-file-input':
            handleSingleFileSelection(files[0], 'compress-file-name', 'compress-process-btn');
            break;
        case 'encrypt-file-input':
            handleSingleFileSelection(files[0], 'encrypt-file-name', 'encrypt-process-btn');
            break;
    }
}

/**
 * Handles selection of a single PDF file
 * @param {File} file - The selected PDF file
 * @param {string} displayElementId - ID of element to display filename
 * @param {string} processBtnId - ID of the process button to enable
 */
function handleSingleFileSelection(file, displayElementId, processBtnId) {
    if (!file || !file.type.includes('pdf')) {
        showError('Please select a valid PDF file.');
        return;
    }
    
    const displayElement = document.getElementById(displayElementId);
    const processBtn = document.getElementById(processBtnId);
    
    if (displayElement) {
        displayElement.innerHTML = `
            <div class="selected-file-item">
                <i class="fas fa-file-pdf file-icon"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${formatFileSize(file.size)})</span>
            </div>
        `;
    }
    
    if (processBtn) {
        processBtn.disabled = false;
    }
}

/**
 * Handles selection of multiple PDF files for merging
 * @param {FileList} files - The selected PDF files
 */
function handleMergeFileSelection(files) {
    const fileList = document.getElementById('merge-file-list');
    const processBtn = document.getElementById('merge-process-btn');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.includes('pdf')) {
            continue;
        }
        
        const fileId = 'file-' + Math.random().toString(36).substr(2, 9);
        
        const listItem = document.createElement('li');
        listItem.setAttribute('data-file-id', fileId);
        listItem.innerHTML = `
            <i class="fas fa-file-pdf file-icon"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
            <div class="file-actions">
                <button type="button" class="file-action-btn file-remove-btn" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Store file reference in the DOM element
        listItem.file = file;
        
        fileList.appendChild(listItem);
        
        // Add remove button handler
        const removeBtn = listItem.querySelector('.file-remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            listItem.remove();
            updateMergeButtonState();
        });
    }
    
    updateMergeButtonState();
    
    // Initialize sortable if not already
    if (!fileList.sortable) {
        fileList.sortable = new Sortable(fileList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag'
        });
    }
}

/**
 * Updates the state of the merge button based on file selection
 */
function updateMergeButtonState() {
    const fileList = document.getElementById('merge-file-list');
    const processBtn = document.getElementById('merge-process-btn');
    
    if (fileList.children.length > 1) {
        processBtn.disabled = false;
    } else {
        processBtn.disabled = true;
    }
}

/**
 * Formats file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Shows an error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Simple alert for now, can be replaced with a custom notification
    alert(message);
}

/**
 * Shows a success message and handles download of processed PDF
 * @param {Blob} pdfBlob - The processed PDF as a Blob
 * @param {string} filename - Suggested filename for download
 */
function handleProcessedPDF(pdfBlob, filename) {
    // Use FileSaver.js for better cross-browser compatibility
    saveAs(pdfBlob, filename);
    alert('PDF processed successfully! Your download should begin automatically.');
}

/**
 * Reads a file as ArrayBuffer for PDF processing
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>} The file contents as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Sets up the Merge PDFs tool functionality
 */
function setupMergePDFTool() {
    const processBtn = document.getElementById('merge-process-btn');
    
    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            try {
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                const fileList = document.getElementById('merge-file-list');
                const files = Array.from(fileList.children).map(li => li.file);
                
                if (files.length < 2) {
                    showError('Please select at least two PDF files to merge.');
                    return;
                }
                
                // Create a new PDF document
                const mergedPdf = await PDFDocument.create();
                
                // Process all PDFs in order of the list
                for (const file of files) {
                    const fileArrayBuffer = await readFileAsArrayBuffer(file);
                    const pdf = await PDFDocument.load(fileArrayBuffer);
                    
                    // Copy all pages from current PDF to the merged PDF
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach(page => {
                        mergedPdf.addPage(page);
                    });
                }
                
                // Save the merged PDF
                const mergedPdfBytes = await mergedPdf.save();
                const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                
                handleProcessedPDF(mergedPdfBlob, 'merged_document.pdf');
            } catch (error) {
                console.error('Error merging PDFs:', error);
                showError('An error occurred while merging PDFs. Please try again.');
            } finally {
                processBtn.disabled = false;
                processBtn.innerHTML = '<i class="fas fa-object-group"></i> Merge PDFs';
            }
        });
    }
}

/**
 * Sets up the Add Page Numbers tool functionality
 */
function setupPageNumbersTool() {
    const processBtn = document.getElementById('page-numbers-process-btn');
    
    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            try {
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                const fileInput = document.getElementById('page-numbers-file-input');
                const position = document.getElementById('page-numbers-position').value;
                const startFrom = parseInt(document.getElementById('page-numbers-start').value, 10);
                const format = document.getElementById('page-numbers-format').value;
                const fontSize = parseInt(document.getElementById('page-numbers-font-size').value, 10);
                
                if (!fileInput.files[0]) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(fileInput.files[0]);
                const pdfDoc = await PDFDocument.load(fileArrayBuffer);
                const pages = pdfDoc.getPages();
                const totalPages = pages.length;
                
                // Embed the font
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                
                // Add page numbers to each page
                pages.forEach((page, index) => {
                    const pageNumber = startFrom + index;
                    const { width, height } = page.getSize();
                    
                    // Format the page number text
                    let formattedPageNumber = format.replace('n', pageNumber);
                    formattedPageNumber = formattedPageNumber.replace('total', totalPages);
                    
                    // Calculate text width for positioning
                    const textWidth = font.widthOfTextAtSize(formattedPageNumber, fontSize);
                    
                    // Set position coordinates based on selected position
                    let x, y;
                    const margin = 30; // margin from page edge
                    
                    switch (position) {
                        case 'bottom-right':
                            x = width - textWidth - margin;
                            y = margin;
                            break;
                        case 'bottom-center':
                            x = (width - textWidth) / 2;
                            y = margin;
                            break;
                        case 'bottom-left':
                            x = margin;
                            y = margin;
                            break;
                        case 'top-right':
                            x = width - textWidth - margin;
                            y = height - margin;
                            break;
                        case 'top-center':
                            x = (width - textWidth) / 2;
                            y = height - margin;
                            break;
                        case 'top-left':
                            x = margin;
                            y = height - margin;
                            break;
                    }
                    
                    // Draw the page number
                    page.drawText(formattedPageNumber, {
                        x,
                        y,
                        size: fontSize,
                        font,
                        color: rgb(0, 0, 0),
                    });
                });
                
                // Save the modified PDF
                const modifiedPdfBytes = await pdfDoc.save();
                const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
                
                const originalName = fileInput.files[0].name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const numberedFileName = `${baseName}_numbered.pdf`;
                
                handleProcessedPDF(modifiedPdfBlob, numberedFileName);
            } catch (error) {
                console.error('Error adding page numbers:', error);
                showError('An error occurred while adding page numbers. Please try again.');
            } finally {
                processBtn.disabled = false;
                processBtn.innerHTML = '<i class="fas fa-list-ol"></i> Add Page Numbers';
            }
        });
    }
}

/**
 * Sets up the Watermark PDF tool functionality
 */
function setupWatermarkTool() {
    const processBtn = document.getElementById('watermark-process-btn');
    
    // Update output display when range inputs change
    const opacityRange = document.getElementById('watermark-opacity');
    const rotationRange = document.getElementById('watermark-rotation');
    const imageOpacityRange = document.getElementById('watermark-image-opacity');
    const imageScaleRange = document.getElementById('watermark-image-scale');
    
    [opacityRange, rotationRange, imageOpacityRange, imageScaleRange].forEach(range => {
        if (range) {
            range.addEventListener('input', (e) => {
                const unit = e.target.id.includes('opacity') ? '%' : '°';
                e.target.nextElementSibling.textContent = `${e.target.value}${unit}`;
            });
        }
    });
    
    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            try {
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                const fileInput = document.getElementById('watermark-file-input');
                const watermarkType = document.querySelector('input[name="watermark-type"]:checked').value;
                
                if (!fileInput.files[0]) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(fileInput.files[0]);
                const pdfDoc = await PDFDocument.load(fileArrayBuffer);
                const pages = pdfDoc.getPages();
                
                if (watermarkType === 'text') {
                    // Text watermark
                    const watermarkText = document.getElementById('watermark-text').value;
                    const opacity = parseInt(document.getElementById('watermark-opacity').value, 10) / 100;
                    const rotation = parseInt(document.getElementById('watermark-rotation').value, 10);
                    const fontSize = parseInt(document.getElementById('watermark-font-size').value, 10);
                    const colorHex = document.getElementById('watermark-color').value;
                    const position = document.getElementById('watermark-position').value;
                    
                    // Convert hex color to RGB
                    const r = parseInt(colorHex.slice(1, 3), 16) / 255;
                    const g = parseInt(colorHex.slice(3, 5), 16) / 255;
                    const b = parseInt(colorHex.slice(5, 7), 16) / 255;
                    
                    // Embed font
                    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                    
                    // Add text watermark to each page
                    pages.forEach(page => {
                        const { width, height } = page.getSize();
                        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
                        
                        // Calculate position based on selection
                        let x, y;
                        
                        if (position === 'center') {
                            x = (width - textWidth) / 2;
                            y = height / 2;
                        } else if (position === 'tile') {
                            // For tiling, we'll add multiple watermarks in a grid
                            const xSpacing = Math.max(textWidth + 100, width / 3);
                            const ySpacing = Math.max(fontSize + 100, height / 3);
                            
                            for (let tileX = 0; tileX < width; tileX += xSpacing) {
                                for (let tileY = 0; tileY < height; tileY += ySpacing) {
                                    page.drawText(watermarkText, {
                                        x: tileX,
                                        y: tileY,
                                        size: fontSize,
                                        font,
                                        color: rgb(r, g, b),
                                        opacity,
                                        rotate: degrees(rotation),
                                    });
                                }
                            }
                            
                            // Skip the default drawing since we've already drawn the tiled watermarks
                            return;
                        } else {
                            const margin = 50;
                            
                            switch (position) {
                                case 'top-left':
                                    x = margin;
                                    y = height - margin;
                                    break;
                                case 'top-right':
                                    x = width - textWidth - margin;
                                    y = height - margin;
                                    break;
                                case 'bottom-left':
                                    x = margin;
                                    y = margin + fontSize;
                                    break;
                                case 'bottom-right':
                                    x = width - textWidth - margin;
                                    y = margin + fontSize;
                                    break;
                            }
                        }
                        
                        // Draw the watermark
                        page.drawText(watermarkText, {
                            x,
                            y,
                            size: fontSize,
                            font,
                            color: rgb(r, g, b),
                            opacity,
                            rotate: degrees(rotation),
                        });
                    });
                } else {
                    // Image watermark
                    const watermarkImageInput = document.getElementById('watermark-image-input');
                    
                    if (!watermarkImageInput.files[0]) {
                        showError('Please select an image for the watermark.');
                        return;
                    }
                    
                    const imageFile = watermarkImageInput.files[0];
                    const imageArrayBuffer = await readFileAsArrayBuffer(imageFile);
                    
                    // Determine image type and embed accordingly
                    let image;
                    if (imageFile.type === 'image/jpeg') {
                        image = await pdfDoc.embedJpg(imageArrayBuffer);
                    } else if (imageFile.type === 'image/png') {
                        image = await pdfDoc.embedPng(imageArrayBuffer);
                    } else {
                        showError('Only JPEG and PNG images are supported.');
                        return;
                    }
                    
                    const opacity = parseInt(document.getElementById('watermark-image-opacity').value, 10) / 100;
                    const scale = parseInt(document.getElementById('watermark-image-scale').value, 10) / 100;
                    const position = document.getElementById('watermark-position').value;
                    
                    // Add image watermark to each page
                    pages.forEach(page => {
                        const { width, height } = page.getSize();
                        const imgWidth = image.width * scale;
                        const imgHeight = image.height * scale;
                        
                        // Calculate position based on selection
                        let x, y;
                        
                        if (position === 'center') {
                            x = (width - imgWidth) / 2;
                            y = (height - imgHeight) / 2;
                        } else if (position === 'tile') {
                            // For tiling, add multiple watermarks in a grid
                            const xSpacing = Math.max(imgWidth + 50, width / 3);
                            const ySpacing = Math.max(imgHeight + 50, height / 3);
                            
                            for (let tileX = 0; tileX < width; tileX += xSpacing) {
                                for (let tileY = 0; tileY < height; tileY += ySpacing) {
                                    page.drawImage(image, {
                                        x: tileX,
                                        y: tileY,
                                        width: imgWidth,
                                        height: imgHeight,
                                        opacity,
                                    });
                                }
                            }
                            
                            // Skip the default drawing
                            return;
                        } else {
                            const margin = 50;
                            
                            switch (position) {
                                case 'top-left':
                                    x = margin;
                                    y = height - imgHeight - margin;
                                    break;
                                case 'top-right':
                                    x = width - imgWidth - margin;
                                    y = height - imgHeight - margin;
                                    break;
                                case 'bottom-left':
                                    x = margin;
                                    y = margin;
                                    break;
                                case 'bottom-right':
                                    x = width - imgWidth - margin;
                                    y = margin;
                                    break;
                            }
                        }
                        
                        // Draw the watermark
                        page.drawImage(image, {
                            x,
                            y,
                            width: imgWidth,
                            height: imgHeight,
                            opacity,
                        });
                    });
                }
                
                // Save the modified PDF
                const modifiedPdfBytes = await pdfDoc.save();
                const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
                
                const originalName = fileInput.files[0].name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const watermarkedFileName = `${baseName}_watermarked.pdf`;
                
                handleProcessedPDF(modifiedPdfBlob, watermarkedFileName);
            } catch (error) {
                console.error('Error adding watermark:', error);
                showError('An error occurred while adding watermark. Please try again.');
            } finally {
                processBtn.disabled = false;
                processBtn.innerHTML = '<i class="fas fa-tint"></i> Add Watermark';
            }
        });
    }
}

/**
 * Sets up the Compress PDF tool functionality
 */
function setupCompressTool() {
    const processBtn = document.getElementById('compress-process-btn');
    
    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            try {
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                const fileInput = document.getElementById('compress-file-input');
                const compressionLevel = document.querySelector('input[name="compression-level"]:checked').value;
                
                if (!fileInput.files[0]) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(fileInput.files[0]);
                const pdfDoc = await PDFDocument.load(fileArrayBuffer);
                
                // Compression settings based on level
                let compressionOptions = {};
                
                switch (compressionLevel) {
                    case 'low':
                        compressionOptions = { 
                            useObjectStreams: true 
                        };
                        break;
                    case 'medium':
                        compressionOptions = { 
                            useObjectStreams: true,
                            addXrefToTrailer: false
                        };
                        break;
                    case 'high':
                        compressionOptions = { 
                            useObjectStreams: true,
                            addXrefToTrailer: false,
                            objectsPerTick: 100
                        };
                        break;
                }
                
                // Save with compression options
                const compressedPdfBytes = await pdfDoc.save(compressionOptions);
                const compressedPdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
                
                const originalName = fileInput.files[0].name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const compressedFileName = `${baseName}_compressed.pdf`;
                
                handleProcessedPDF(compressedPdfBlob, compressedFileName);
            } catch (error) {
                console.error('Error compressing PDF:', error);
                showError('An error occurred while compressing the PDF. Please try again.');
            } finally {
                processBtn.disabled = false;
                processBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress PDF';
            }
        });
    }
}

/**
 * Sets up the Encrypt PDF tool functionality
 */
function setupEncryptTool() {
    const processBtn = document.getElementById('encrypt-process-btn');
    const passwordInput = document.getElementById('encrypt-password');
    const confirmPasswordInput = document.getElementById('encrypt-confirm-password');
    const strengthProgress = document.querySelector('.strength-progress');
    const strengthText = document.querySelector('.strength-text');
    
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Password strength meter
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            let strength = 0;
            let status = '';
            
            if (password.length > 0) {
                // Length check
                strength += Math.min(6, Math.floor(password.length / 3)) * 10;
                
                // Complexity checks
                if (/[A-Z]/.test(password)) strength += 10;
                if (/[a-z]/.test(password)) strength += 10;
                if (/[0-9]/.test(password)) strength += 10;
                if (/[^A-Za-z0-9]/.test(password)) strength += 20;
                
                // Cap at 100
                strength = Math.min(100, strength);
                
                // Status text
                if (strength < 30) status = 'Weak';
                else if (strength < 60) status = 'Moderate';
                else if (strength < 80) status = 'Strong';
                else status = 'Very Strong';
            } else {
                status = 'No password';
            }
            
            // Update UI
            strengthProgress.style.width = `${strength}%`;
            strengthText.textContent = status;
        });
    }
    
    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            try {
                const fileInput = document.getElementById('encrypt-file-input');
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                if (!fileInput.files[0]) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                if (!password) {
                    showError('Please enter a password.');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showError('Passwords do not match.');
                    return;
                }
                
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                // Get selected permissions
                const permissions = {
                    printing: false,
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: true,
                    contentAccessibility: true,
                    documentAssembly: false,
                };
                
                const selectedPermissions = Array.from(document.querySelectorAll('input[name="permission"]:checked'))
                    .map(checkbox => checkbox.value);
                
                if (selectedPermissions.includes('print')) {
                    permissions.printing = true;
                }
                if (selectedPermissions.includes('edit')) {
                    permissions.modifying = true;
                }
                if (selectedPermissions.includes('copy')) {
                    permissions.copying = true;
                }
                if (selectedPermissions.includes('annotate')) {
                    permissions.annotating = true;
                }
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(fileInput.files[0]);
                const pdfDoc = await PDFDocument.load(fileArrayBuffer);
                
                // Encrypt the document
                pdfDoc.encrypt({
                    userPassword: password,
                    ownerPassword: password,
                    permissions,
                });
                
                // Save the encrypted PDF
                const encryptedPdfBytes = await pdfDoc.save();
                const encryptedPdfBlob = new Blob([encryptedPdfBytes], { type: 'application/pdf' });
                
                const originalName = fileInput.files[0].name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const encryptedFileName = `${baseName}_encrypted.pdf`;
                
                handleProcessedPDF(encryptedPdfBlob, encryptedFileName);
            } catch (error) {
                console.error('Error encrypting PDF:', error);
                showError('An error occurred while encrypting the PDF. Please try again.');
            } finally {
                processBtn.disabled = false;
                processBtn.innerHTML = '<i class="fas fa-lock"></i> Encrypt PDF';
            }
        });
    }
} 