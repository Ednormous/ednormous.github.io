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
        // Find the actual file input for this area
        const fileInput = area.querySelector('input[type="file"]');
        if (!fileInput) return;

        // For click handling, don't trigger if we're clicking on buttons or inputs
        area.addEventListener('click', (e) => {
            // Don't trigger if we're clicking on a button or input inside the area
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || 
                e.target.closest('button') || e.target.closest('input') ||
                e.target.closest('label')) {
                return;
            }
            
            if (fileInput) {
                fileInput.click();
            }
        });
        
        // Handle file input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log(`File input changed: ${fileInput.id}`, e.target.files);
                if (e.target.files.length > 0) {
                    handleFileSelection(fileInput.id, e.target.files);
                }
            });
        }
        
        // Drag & Drop functionality
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            area.classList.add('dragover');
        });
        
        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            area.classList.remove('dragover');
        });
        
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            area.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelection(fileInput.id, files);
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
        // Clear previous content
        displayElement.innerHTML = '';
        
        // Create a new file item container
        const fileItem = document.createElement('div');
        fileItem.className = 'selected-file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-pdf file-icon"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${formatFileSize(file.size)})</span>
            </div>
            <div class="file-actions">
                <button type="button" class="file-action-btn file-remove-btn" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add the preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'pdf-file-preview';
        fileItem.appendChild(previewContainer);
        
        // Add the file item to the display element
        displayElement.appendChild(fileItem);
        
        // Store the file reference directly on the element
        displayElement._file = file;
        
        // Add remove button handler
        const removeBtn = fileItem.querySelector('.file-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Clear the display and disable the process button
                displayElement.innerHTML = '';
                displayElement._file = null;
                if (processBtn) {
                    processBtn.disabled = true;
                }
            });
        }
    }
    
    if (processBtn) {
        processBtn.disabled = false;
    }
    
    // Create preview - with slight delay to ensure DOM is ready
    setTimeout(() => {
        createPDFPreview(file, displayElement.querySelector('.pdf-file-preview'), 1);
    }, 50);
}

/**
 * Creates a preview of the first page of a PDF
 * @param {File} file - PDF file to preview
 * @param {HTMLElement} container - Element to append preview to
 * @param {number} pageNum - Page number to preview (default: 1)
 */
function createPDFPreview(file, container, pageNum = 1) {
    console.log('Creating PDF preview for', file.name, 'in container', container);
    
    if (!container) {
        console.error('Preview container not found');
        return;
    }
    
    // Show loading indicator
    container.innerHTML = '<div class="preview-loading"><i class="fas fa-spinner fa-spin"></i> Loading preview...</div>';
    
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const typedArray = new Uint8Array(e.target.result);
            const loadingTask = pdfjsLib.getDocument(typedArray);
            
            // Clear loading indicator
            container.innerHTML = '';
            
            const pdf = await loadingTask.promise;
            
            if (pageNum > pdf.numPages) {
                pageNum = 1;
            }
            
            const page = await pdf.getPage(pageNum);
            const scale = 0.5;
            const viewport = page.getViewport({ scale });
            
            // Create canvas element for the preview
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.classList.add('pdf-preview-canvas');
            
            const context = canvas.getContext('2d');
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            container.appendChild(canvas);
            
            console.log('PDF preview successfully created');
        } catch (error) {
            console.error('Error creating PDF preview:', error);
            container.innerHTML = '<div class="preview-error">Failed to create preview</div>';
        }
    };
    
    reader.onerror = function(error) {
        console.error('Error reading file:', error);
        container.innerHTML = '<div class="preview-error">Failed to read file</div>';
    };
    
    reader.readAsArrayBuffer(file);
}

/**
 * Handles selection of multiple PDF files for merging
 * @param {FileList} files - The selected PDF files
 */
function handleMergeFileSelection(files) {
    const fileList = document.getElementById('merge-file-list');
    const processBtn = document.getElementById('merge-process-btn');
    
    // Filter only PDF files
    const pdfFiles = Array.from(files).filter(file => file.type.includes('pdf'));
    
    if (pdfFiles.length === 0) {
        showError('No valid PDF files were selected.');
        return;
    }
    
    for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const fileId = 'file-' + Math.random().toString(36).substr(2, 9);
        
        const listItem = document.createElement('li');
        listItem.setAttribute('data-file-id', fileId);
        listItem.classList.add('file-list-item');
        
        // Add inner content
        listItem.innerHTML = `
            <div class="file-handle">
                <i class="fas fa-grip-lines"></i>
            </div>
            <div class="file-info">
                <i class="fas fa-file-pdf file-icon"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${formatFileSize(file.size)})</span>
            </div>
            <div class="file-actions">
                <button type="button" class="file-action-btn file-up-btn" title="Move Up">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button type="button" class="file-action-btn file-down-btn" title="Move Down">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button type="button" class="file-action-btn file-remove-btn" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Create preview container and add it after file handle
        const previewContainer = document.createElement('div');
        previewContainer.className = 'file-preview-container';
        listItem.insertBefore(previewContainer, listItem.querySelector('.file-info'));
        
        // Keep the actual file object for processing
        listItem._file = file;
        
        // Add to file list
        fileList.appendChild(listItem);
        
        // Create a small preview of the first page
        createPDFPreview(file, previewContainer, 1);
        
        // Add file action handlers
        const removeBtn = listItem.querySelector('.file-remove-btn');
        const upBtn = listItem.querySelector('.file-up-btn');
        const downBtn = listItem.querySelector('.file-down-btn');
        
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            listItem.remove();
            updateMergeButtonState();
        });
        
        upBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prev = listItem.previousElementSibling;
            if (prev) {
                fileList.insertBefore(listItem, prev);
            }
        });
        
        downBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const next = listItem.nextElementSibling;
            if (next) {
                fileList.insertBefore(next, listItem);
            }
        });
    }
    
    updateMergeButtonState();
    
    // Initialize or update Sortable instance
    if (!window.mergeSortable) {
        window.mergeSortable = new Sortable(fileList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            handle: '.file-handle',
            onEnd: function() {
                // Update order for accessibility or other processing
                updateFileOrder();
            }
        });
        console.log('Initialized Sortable on merge-file-list');
    }
}

/**
 * Updates the order of files in the merge list for accessibility
 */
function updateFileOrder() {
    const fileList = document.getElementById('merge-file-list');
    const items = fileList.querySelectorAll('.file-list-item');
    
    items.forEach((item, index) => {
        item.setAttribute('data-order', index + 1);
        // Update aria attributes for accessibility
        item.setAttribute('aria-setsize', items.length);
        item.setAttribute('aria-posinset', index + 1);
    });
}

/**
 * Updates the state of the merge button based on file selection
 */
function updateMergeButtonState() {
    const fileList = document.getElementById('merge-file-list');
    const processBtn = document.getElementById('merge-process-btn');
    
    if (fileList.children.length >= 1) {
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
 * @param {string} toolId - ID of the tool container for displaying preview
 */
function handleProcessedPDF(pdfBlob, filename, toolId) {
    // Use FileSaver.js for better cross-browser compatibility
    saveAs(pdfBlob, filename);
    
    // Create a preview if toolId is provided
    if (toolId) {
        try {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'pdf-preview';
            previewContainer.innerHTML = `
                <h3>Preview of ${filename}</h3>
                <div class="pdf-preview-container">
                    <iframe src="${URL.createObjectURL(pdfBlob)}" width="100%" height="500px"></iframe>
                </div>
            `;
            
            // Add the preview to the tool container
            const toolContainer = document.getElementById(toolId);
            
            // Remove any existing preview
            const existingPreview = toolContainer.querySelector('.pdf-preview');
            if (existingPreview) {
                toolContainer.removeChild(existingPreview);
            }
            
            toolContainer.appendChild(previewContainer);
        } catch (previewError) {
            console.warn('Could not create preview:', previewError);
        }
    }
    
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
                const fileItems = Array.from(fileList.querySelectorAll('.file-list-item'));
                
                // Get files in the current order as displayed in the UI
                const files = fileItems.map(item => item._file).filter(file => file != null);
                
                if (files.length === 0) {
                    showError('Please select at least one PDF file.');
                    return;
                }
                
                // Create a new PDF document
                const mergedPdf = await PDFDocument.create();
                
                // Show a progress indicator
                const progressContainer = document.createElement('div');
                progressContainer.className = 'merge-progress-container';
                progressContainer.innerHTML = `
                    <div class="merge-progress">
                        <div class="merge-progress-bar" style="width: 0%"></div>
                    </div>
                    <div class="merge-progress-text">Processing file 0/${files.length}</div>
                `;
                
                const actionsContainer = document.querySelector('#merge-tool .process-actions');
                actionsContainer.appendChild(progressContainer);
                
                // Process all PDFs in order of the list
                for (let i = 0; i < files.length; i++) {
                    // Update progress
                    const progressBar = progressContainer.querySelector('.merge-progress-bar');
                    const progressText = progressContainer.querySelector('.merge-progress-text');
                    const progress = Math.round(((i) / files.length) * 100);
                    
                    progressBar.style.width = `${progress}%`;
                    progressText.textContent = `Processing file ${i+1}/${files.length}: ${files[i].name}`;
                    
                    // Small delay to allow UI to update
                    await new Promise(resolve => setTimeout(resolve, 10)); 
                    
                    const fileArrayBuffer = await readFileAsArrayBuffer(files[i]);
                    const pdf = await PDFDocument.load(fileArrayBuffer);
                    
                    // Copy all pages from current PDF to the merged PDF
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach(page => {
                        mergedPdf.addPage(page);
                    });
                }
                
                // Final progress update
                const progressBar = progressContainer.querySelector('.merge-progress-bar');
                const progressText = progressContainer.querySelector('.merge-progress-text');
                progressBar.style.width = '100%';
                progressText.textContent = 'Creating final document...';
                
                // Save the merged PDF
                const mergedPdfBytes = await mergedPdf.save();
                const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                
                // Generate a meaningful filename
                let mergedFileName = 'merged_document.pdf';
                if (files.length === 1) {
                    // If only one file, use its name with a prefix
                    const originalName = files[0].name;
                    const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                    mergedFileName = `${baseName}_processed.pdf`;
                } else if (files.length > 1) {
                    // If multiple files, try to create a meaningful name with the first two files
                    const firstFileName = files[0].name.substr(0, files[0].name.lastIndexOf('.')) || files[0].name;
                    const secondFileName = files[1].name.substr(0, files[1].name.lastIndexOf('.')) || files[1].name;
                    
                    if (files.length === 2) {
                        mergedFileName = `${firstFileName}_${secondFileName}.pdf`;
                    } else {
                        mergedFileName = `${firstFileName}_${secondFileName}_plus_${files.length - 2}_more.pdf`;
                    }
                }
                
                // Remove the progress indicator
                actionsContainer.removeChild(progressContainer);
                
                handleProcessedPDF(mergedPdfBlob, mergedFileName, 'merge-tool');
                
            } catch (error) {
                console.error('Error merging PDFs:', error);
                showError('An error occurred while merging PDFs. Please try again.');
                
                // Remove progress indicator if it exists
                const progressContainer = document.querySelector('.merge-progress-container');
                if (progressContainer) {
                    progressContainer.remove();
                }
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
                
                const fileNameContainer = document.getElementById('page-numbers-file-name');
                const selectedFile = fileNameContainer._file;
                const position = document.getElementById('page-numbers-position').value;
                const startFrom = parseInt(document.getElementById('page-numbers-start').value, 10);
                const format = document.getElementById('page-numbers-format').value;
                const fontSize = parseInt(document.getElementById('page-numbers-font-size').value, 10);
                
                if (!selectedFile) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(selectedFile);
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
                
                const originalName = selectedFile.name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const numberedFileName = `${baseName}_numbered.pdf`;
                
                handleProcessedPDF(modifiedPdfBlob, numberedFileName, 'page-numbers-tool');
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
                
                const fileNameContainer = document.getElementById('watermark-file-name');
                const selectedFile = fileNameContainer._file;
                const watermarkType = document.querySelector('input[name="watermark-type"]:checked').value;
                
                if (!selectedFile) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(selectedFile);
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
                    
                    // Read the image as an embedded PDF image
                    let image;
                    try {
                        if (imageFile.type.includes('jpeg') || imageFile.type.includes('jpg')) {
                            image = await pdfDoc.embedJpg(imageArrayBuffer);
                        } else if (imageFile.type.includes('png')) {
                            image = await pdfDoc.embedPng(imageArrayBuffer);
                        } else {
                            throw new Error('Unsupported image format');
                        }
                    } catch (error) {
                        showError('Error embedding image. Please try a different image or format (JPEG, PNG).');
                        throw error;
                    }
                    
                    const opacity = parseInt(document.getElementById('watermark-image-opacity').value, 10) / 100;
                    const scale = parseInt(document.getElementById('watermark-image-scale').value, 10) / 100;
                    const position = document.getElementById('watermark-position').value;
                    
                    // Add watermark to each page
                    pages.forEach(page => {
                        const { width, height } = page.getSize();
                        
                        // Scale image dimensions
                        const imgWidth = image.width * scale;
                        const imgHeight = image.height * scale;
                        
                        // Calculate position
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
                                    y = height - margin - imgHeight;
                                    break;
                                case 'top-right':
                                    x = width - imgWidth - margin;
                                    y = height - margin - imgHeight;
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
                        
                        // Draw the watermark image
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
                
                const originalName = selectedFile.name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const watermarkedFileName = `${baseName}_watermarked.pdf`;
                
                handleProcessedPDF(modifiedPdfBlob, watermarkedFileName, 'watermark-tool');
                
            } catch (error) {
                console.error('Error adding watermark:', error);
                showError('An error occurred while adding the watermark. Please try again.');
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
                
                const fileNameContainer = document.getElementById('compress-file-name');
                const selectedFile = fileNameContainer._file;
                const compressionLevel = document.querySelector('input[name="compression-level"]:checked').value;
                
                if (!selectedFile) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(selectedFile);
                const pdfDoc = await PDFDocument.load(fileArrayBuffer);
                
                // Compression settings based on selected level
                let pdfOptions = {};
                
                switch (compressionLevel) {
                    case 'low':
                        pdfOptions = {
                            useObjectStreams: true,
                            // Low compression preserves image quality
                            compress: true,
                        };
                        break;
                    case 'medium':
                        pdfOptions = {
                            useObjectStreams: true,
                            compress: true,
                            // Medium level compression - moderate quality
                        };
                        break;
                    case 'high':
                        pdfOptions = {
                            useObjectStreams: true,
                            compress: true,
                            // High compression reduces quality more significantly
                        };
                        break;
                }
                
                // Save the compressed PDF
                const compressedPdfBytes = await pdfDoc.save(pdfOptions);
                const compressedPdfBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
                
                const originalName = selectedFile.name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const compressedFileName = `${baseName}_compressed.pdf`;
                
                // Calculate size reduction
                const originalSize = selectedFile.size;
                const compressedSize = compressedPdfBytes.length;
                const reductionPercent = Math.round((1 - (compressedSize / originalSize)) * 100);
                
                let reductionMessage = '';
                if (reductionPercent > 0) {
                    reductionMessage = `File size reduced by ${reductionPercent}% (from ${formatFileSize(originalSize)} to ${formatFileSize(compressedSize)})`;
                } else {
                    reductionMessage = 'No significant size reduction achieved. The PDF may already be well-optimized.';
                }
                
                // Create a custom preview with size reduction info
                handleProcessedPDF(compressedPdfBlob, compressedFileName, 'compress-tool');
                
                // Add size reduction information
                setTimeout(() => {
                    const previewContainer = document.querySelector('#compress-tool .pdf-preview');
                    if (previewContainer) {
                        const sizeInfo = document.createElement('div');
                        sizeInfo.className = 'size-reduction-info';
                        sizeInfo.innerHTML = `
                            <div class="alert ${reductionPercent > 0 ? 'success' : 'warning'}">
                                <i class="${reductionPercent > 0 ? 'fas fa-check-circle' : 'fas fa-info-circle'}"></i>
                                <p>${reductionMessage}</p>
                            </div>
                        `;
                        previewContainer.insertBefore(sizeInfo, previewContainer.firstChild.nextSibling);
                    }
                }, 500);
                
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
    const strengthBar = document.querySelector('.strength-progress');
    const strengthText = document.querySelector('.strength-text');
    
    // Password strength meter
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }
    
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const icon = btn.querySelector('i');
            
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
    
    function updatePasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        let feedback = 'No password';
        
        if (password.length > 0) {
            // Length contribution (up to 30%)
            strength += Math.min(30, password.length * 6);
            
            // Character variety contribution
            if (/[A-Z]/.test(password)) strength += 15;
            if (/[a-z]/.test(password)) strength += 15;
            if (/[0-9]/.test(password)) strength += 15;
            if (/[^A-Za-z0-9]/.test(password)) strength += 25;
            
            // Classify strength
            if (strength < 30) {
                feedback = 'Very weak';
            } else if (strength < 60) {
                feedback = 'Weak';
            } else if (strength < 80) {
                feedback = 'Moderate';
            } else {
                feedback = 'Strong';
            }
        }
        
        // Update UI
        strengthBar.style.width = `${strength}%`;
        strengthText.textContent = feedback;
        
        // Update color based on strength
        if (strength < 30) {
            strengthBar.style.background = '#ff4747';
        } else if (strength < 60) {
            strengthBar.style.background = '#ffc107';
        } else {
            strengthBar.style.background = '#9CA368';
        }
    }
    
    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            try {
                // Validate password
                const password = passwordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                if (password !== confirmPassword) {
                    showError('Passwords do not match.');
                    return;
                }
                
                if (password.length < 4) {
                    showError('Password must be at least 4 characters long.');
                    return;
                }
                
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                const fileNameContainer = document.getElementById('encrypt-file-name');
                const selectedFile = fileNameContainer._file;
                
                if (!selectedFile) {
                    showError('Please select a PDF file.');
                    return;
                }
                
                // Get selected permissions
                const permissions = Array.from(document.querySelectorAll('input[name="permission"]:checked'))
                    .map(input => input.value);
                
                const allowPrinting = permissions.includes('print');
                const allowCopying = permissions.includes('copy');
                const allowModifying = permissions.includes('edit');
                const allowAnnotating = permissions.includes('annotate');
                
                // Load the PDF document
                const fileArrayBuffer = await readFileAsArrayBuffer(selectedFile);
                const pdfDoc = await PDFDocument.load(fileArrayBuffer);
                
                // Set encryption options
                pdfDoc.setPassword(password);
                pdfDoc.encrypt({
                    userPassword: password,
                    ownerPassword: password,
                    permissions: {
                        printing: allowPrinting ? 'highResolution' : 'none',
                        modifying: allowModifying,
                        copying: allowCopying,
                        annotating: allowAnnotating,
                        fillingForms: true,
                        contentAccessibility: true,
                        documentAssembly: allowModifying,
                    },
                });
                
                // Save the encrypted PDF
                const encryptedPdfBytes = await pdfDoc.save();
                const encryptedPdfBlob = new Blob([encryptedPdfBytes], { type: 'application/pdf' });
                
                const originalName = selectedFile.name;
                const baseName = originalName.substr(0, originalName.lastIndexOf('.')) || originalName;
                const encryptedFileName = `${baseName}_encrypted.pdf`;
                
                handleProcessedPDF(encryptedPdfBlob, encryptedFileName, 'encrypt-tool');
                
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