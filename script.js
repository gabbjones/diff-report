// CSV Comparison Tool - Client-side implementation

let file1Data = null;
let file1Name = '';
let file2Data = null;
let file2Name = '';
let differences = [];

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    // File input handlers
    const file1Input = document.getElementById('file1');
    const file2Input = document.getElementById('file2');
    
    if (file1Input) {
        file1Input.addEventListener('change', handleFile1);
    }
    if (file2Input) {
        file2Input.addEventListener('change', handleFile2);
    }

    // Drag and drop handlers
    const uploadBoxes = document.querySelectorAll('.upload-box');
    uploadBoxes.forEach((box, index) => {
        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            box.style.borderColor = '#764ba2';
            box.style.background = '#f0f2ff';
        });

        box.addEventListener('dragleave', (e) => {
            e.preventDefault();
            box.style.borderColor = '#667eea';
            box.style.background = '#f8f9ff';
        });

        box.addEventListener('drop', (e) => {
            e.preventDefault();
            box.style.borderColor = '#667eea';
            box.style.background = '#f8f9ff';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.csv')) {
                if (index === 0) {
                    handleFileUpload(files[0], 1);
                } else {
                    handleFileUpload(files[0], 2);
                }
            }
        });
    });

    // Event listeners for buttons
    const compareBtn = document.getElementById('compareBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (compareBtn) {
        compareBtn.addEventListener('click', compareCSVFiles);
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCSV);
    }
});

function handleFile1(e) {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0], 1);
    }
}

function handleFile2(e) {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0], 2);
    }
}

function handleFileUpload(file, fileNumber) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const data = parseCSV(text);
            
            if (fileNumber === 1) {
                file1Data = data;
                file1Name = file.name;
                const fileName1El = document.getElementById('fileName1');
                if (fileName1El) {
                    fileName1El.textContent = file.name;
                }
            } else {
                file2Data = data;
                file2Name = file.name;
                const fileName2El = document.getElementById('fileName2');
                if (fileName2El) {
                    fileName2El.textContent = file.name;
                }
            }
            
            updateCompareButton();
        } catch (error) {
            console.error('Error parsing CSV:', error);
            showError('Error reading CSV file: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        showError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file, 'UTF-8');
}

function parseCSV(text) {
    const rows = [];
    // Handle both Windows (\r\n) and Unix (\n) line endings
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    
    for (let line of lines) {
        // Handle quoted fields with commas
        const row = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        row.push(current); // Add last field
        
        rows.push(row);
    }
    
    return rows;
}

function getColumnLetter(colNum) {
    // Convert column number (1-based) to Excel-style letter (A, B, C, ..., Z, AA, AB, etc.)
    let result = '';
    let num = colNum;
    
    while (num > 0) {
        num--;
        result = String.fromCharCode(65 + (num % 26)) + result;
        num = Math.floor(num / 26);
    }
    
    return result;
}

function compareCSVFiles() {
    if (!file1Data || !file2Data) {
        showError('Please upload both CSV files');
        return;
    }
    
    try {
        differences = [];
        const sheetNameEl = document.getElementById('sheetName');
        const sheetName = (sheetNameEl && sheetNameEl.value) ? sheetNameEl.value : 'Sheet1';
        
        // Get maximum dimensions
        const maxRows = Math.max(file1Data.length, file2Data.length);
        
        // Safely get max columns, handling empty arrays
        const file1MaxCols = file1Data.length > 0 
            ? Math.max(...file1Data.map(row => row ? row.length : 0), 0)
            : 0;
        const file2MaxCols = file2Data.length > 0
            ? Math.max(...file2Data.map(row => row ? row.length : 0), 0)
            : 0;
        const maxCols = Math.max(file1MaxCols, file2MaxCols);
    
        // Compare cell by cell
        for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
            for (let colIdx = 0; colIdx < maxCols; colIdx++) {
                // Get cell values (empty string if row/column doesn't exist)
                const row1 = file1Data[rowIdx];
                const row2 = file2Data[rowIdx];
                const val1 = (row1 && colIdx < row1.length && row1[colIdx] !== undefined) 
                    ? String(row1[colIdx]).trim() : '';
                const val2 = (row2 && colIdx < row2.length && row2[colIdx] !== undefined) 
                    ? String(row2[colIdx]).trim() : '';
                
                // Convert to cell reference (Excel style: A1, B2, etc.)
                const cellRef = `${getColumnLetter(colIdx + 1)}${rowIdx + 1}`;
                
                // Check if values are different
                if (val1 !== val2) {
                    // Add difference from file1
                    if (val1 !== '') {
                        differences.push({
                            file_name: file1Name,
                            tab_name: sheetName,
                            cell_reference: cellRef,
                            value: val1
                        });
                    }
                    
                    // Add difference from file2
                    if (val2 !== '') {
                        differences.push({
                            file_name: file2Name,
                            tab_name: sheetName,
                            cell_reference: cellRef,
                            value: val2
                        });
                    }
                }
            }
        }
        
        displayResults();
    } catch (error) {
        console.error('Error comparing files:', error);
        showError('Error comparing files: ' + error.message);
    }
}

function displayResults() {
    const resultsSection = document.getElementById('results');
    const resultsStats = document.getElementById('resultsStats');
    const resultsPreview = document.getElementById('resultsPreview');
    const errorDiv = document.getElementById('error');
    
    errorDiv.style.display = 'none';
    
    if (differences.length === 0) {
        resultsStats.textContent = 'No differences found!';
        resultsPreview.innerHTML = '<p style="padding: 20px; text-align: center; color: #28a745;">✓ The two CSV files are identical.</p>';
    } else {
        resultsStats.textContent = `${differences.length} difference(s) found`;
        
        // Create table
        let tableHTML = '<table><thead><tr><th>File Name</th><th>Tab Name</th><th>Cell Reference</th><th>Value</th></tr></thead><tbody>';
        
        // Show first 100 rows in preview
        const previewRows = differences.slice(0, 100);
        previewRows.forEach(diff => {
            tableHTML += `
                <tr>
                    <td>${escapeHtml(diff.file_name)}</td>
                    <td>${escapeHtml(diff.tab_name)}</td>
                    <td>${escapeHtml(diff.cell_reference)}</td>
                    <td>${escapeHtml(diff.value)}</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        
        if (differences.length > 100) {
            tableHTML += `<p style="padding: 10px; text-align: center; color: #666;">Showing first 100 of ${differences.length} differences. Download the full CSV for all results.</p>`;
        }
        
        resultsPreview.innerHTML = tableHTML;
    }
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function downloadCSV() {
    if (differences.length === 0) {
        showError('No differences to download');
        return;
    }
    
    // Create CSV content
    let csvContent = 'file_name,tab_name,cell_reference,value\n';
    
    differences.forEach(diff => {
        const row = [
            escapeCSVField(diff.file_name),
            escapeCSVField(diff.tab_name),
            escapeCSVField(diff.cell_reference),
            escapeCSVField(diff.value)
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'differences.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function escapeCSVField(field) {
    if (field === null || field === undefined) {
        return '';
    }
    const fieldStr = String(field);
    if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
        return '"' + fieldStr.replace(/"/g, '""') + '"';
    }
    return fieldStr;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function updateCompareButton() {
    const compareBtn = document.getElementById('compareBtn');
    compareBtn.disabled = !(file1Data && file2Data);
}

// Event listeners are set up in DOMContentLoaded above

