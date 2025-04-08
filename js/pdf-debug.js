/**
 * PDF Tools Debug Script
 * This script helps identify issues with the PDF tools functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('PDF Debug Script loaded');
    
    // Test basic PDF.js functionality
    testPDFJSFunctionality();
    
    // Monitor file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        console.log(`File input found: ${input.id}`);
        input.addEventListener('change', (event) => {
            console.log(`File selected in ${input.id}:`, event.target.files);
            
            // Check if the file is properly being read
            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                console.log('File details:', {
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                
                // Test FileReader functionality
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log(`FileReader successfully loaded file ${file.name}`);
                };
                reader.onerror = (e) => {
                    console.error(`FileReader error for ${file.name}:`, e);
                };
                reader.readAsArrayBuffer(file);
            }
        });
    });
    
    // Monitor display containers
    const displayContainers = [
        'page-numbers-file-name',
        'watermark-file-name',
        'compress-file-name',
        'encrypt-file-name',
        'merge-file-list'
    ];
    
    displayContainers.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`Display container found: ${id}`);
            
            // Create MutationObserver to monitor changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        console.log(`Container ${id} updated:`, element.innerHTML ? 'Has content' : 'Empty');
                        // Check if the file reference is stored properly
                        if (element._file) {
                            console.log(`Container ${id} has file reference:`, element._file.name);
                        } else {
                            console.log(`Container ${id} has no file reference`);
                        }
                    }
                });
            });
            
            // Start observing
            observer.observe(element, { childList: true, subtree: true });
        } else {
            console.error(`Display container not found: ${id}`);
        }
    });
    
    // Check for PDF.js and PDF-LIB availability
    setTimeout(() => {
        console.log('Checking library availability:');
        console.log('- pdfjsLib available:', typeof pdfjsLib !== 'undefined');
        console.log('- PDFLib available:', typeof PDFLib !== 'undefined');
        console.log('- Sortable available:', typeof Sortable !== 'undefined');
        console.log('- saveAs (FileSaver) available:', typeof saveAs !== 'undefined');
    }, 1000);
    
    // Check drag and drop functionality
    const dropAreas = document.querySelectorAll('.file-upload-area');
    dropAreas.forEach(area => {
        console.log(`Drop area found: ${area.id}`);
        
        // Add test highlight
        area.addEventListener('dragenter', () => {
            console.log(`Drag entered: ${area.id}`);
        });
        
        area.addEventListener('drop', (e) => {
            console.log(`Drop occurred on: ${area.id}`, e.dataTransfer.files);
        });
    });

    // Monitor process buttons
    const processButtons = document.querySelectorAll('.process-btn');
    processButtons.forEach(btn => {
        console.log(`Process button found: ${btn.id}`);
        btn.addEventListener('click', () => {
            console.log(`Process button clicked: ${btn.id}`);
        });
    });

    // Add global error handler to catch unhandled errors
    window.addEventListener('error', function(event) {
        console.error('Global error caught:', event.error);
        alert(`Error occurred: ${event.error.message}. Check console for details.`);
    });
});

// Test basic PDF.js functionality
function testPDFJSFunctionality() {
    try {
        // Create a simple PDF document with PDF-LIB
        console.log("Testing PDF-LIB...");
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        
        async function testPDFLib() {
            try {
                const pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage([500, 500]);
                console.log("PDF-LIB test successful: Created document with page");
                return true;
            } catch (error) {
                console.error("PDF-LIB test failed:", error);
                return false;
            }
        }
        
        // Test PDF.js
        console.log("Testing PDF.js...");
        const testPDFJS = typeof pdfjsLib.getDocument === 'function';
        console.log("PDF.js test:", testPDFJS ? "Successful" : "Failed");
        
        // Run PDF-LIB test
        testPDFLib();
        
    } catch (error) {
        console.error("PDF library testing failed:", error);
    }
} 