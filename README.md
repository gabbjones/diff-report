[README.md](https://github.com/user-attachments/files/23966408/README.md)
# CSV Comparison Tool

This tool compares two CSV files and exports the differences to a new CSV file. Available in both **web browser** and **command-line** versions.

## 🌐 Web Browser Version (Recommended for Sharing)

The web version runs entirely in your browser - no installation required!

### Usage

1. Open `index.html` in any modern web browser
2. Upload two CSV files using the upload boxes (or drag and drop)
3. Optionally change the sheet/tab name (defaults to "Sheet1")
4. Click "Compare Files"
5. Review the results and click "Download Differences CSV" to save

### Features
- ✅ Works entirely in the browser (no server needed)
- ✅ Drag and drop file upload
- ✅ Real-time preview of differences
- ✅ Download results as CSV
- ✅ Mobile-friendly responsive design
- ✅ No installation required

### Sharing
Simply share the `index.html`, `styles.css`, and `script.js` files together. Recipients can open `index.html` in any browser to use the tool.

### Deploying to GitHub Pages

1. Create a new GitHub repository
2. Upload all three files (`index.html`, `styles.css`, `script.js`) to the root of the repository
3. Go to Settings → Pages in your repository
4. Select the branch (usually `main` or `master`) and folder (`/ (root)`)
5. Click Save
6. Your site will be available at `https://[username].github.io/[repository-name]`

**Important:** Make sure all three files (`index.html`, `styles.css`, `script.js`) are in the same directory.

---

## 💻 Command-Line Version (Python)

### Requirements

- Python 3.6 or higher
- No external dependencies (uses only standard library)

### Usage

1. Place two CSV files in the same folder as `compare_csv.py`
2. Run the program:
   ```bash
   python compare_csv.py
   ```

3. The program will:
   - Automatically find CSV files in the directory
   - Compare the first two CSV files found
   - Generate a `differences.csv` file with all differences

## Output Format

The `differences.csv` file contains the following columns:

- **file_name**: The name of the CSV file where the difference was found
- **tab_name**: Sheet name (defaults to "Sheet1" for CSV files)
- **cell_reference**: Excel-style cell reference (e.g., A1, B2, C3)
- **value**: The actual cell value

## Example

If you have `file1.csv` and `file2.csv` in the folder:

```bash
python compare_csv.py
```

This will create `differences.csv` showing all cells that differ between the two files.

## Notes

- The comparison is cell-by-cell based on row and column position
- If one file has more rows/columns than the other, missing cells are treated as empty strings
- Each difference shows both values (one from each file) in separate rows

