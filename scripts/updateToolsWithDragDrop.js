import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toolsDir = path.join(__dirname, '../src/components/tools');

// Get all tool files
const toolFiles = fs.readdirSync(toolsDir).filter(file => file.endsWith('.jsx'));

console.log(`Found ${toolFiles.length} tool files to update...`);

let updatedCount = 0;
let skippedCount = 0;

toolFiles.forEach(file => {
  const filePath = path.join(toolsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has FileUploadZone import
  if (content.includes('FileUploadZone')) {
    console.log(`✓ Skipped ${file} (already updated)`);
    skippedCount++;
    return;
  }
  
  // Skip if doesn't have file input
  if (!content.includes('type="file"')) {
    console.log(`✓ Skipped ${file} (no file input)`);
    skippedCount++;
    return;
  }
  
  let modified = false;
  
  // 1. Add FileUploadZone import
  if (content.includes("import config from '../../config';")) {
    content = content.replace(
      "import config from '../../config';",
      "import config from '../../config';\nimport FileUploadZone from '../shared/FileUploadZone';"
    );
    modified = true;
  }
  
  // 2. Update handleFileChange to accept file directly instead of event
  const handleFileChangePattern = /const handleFileChange = \(e\) => \{[\s\S]*?const selectedFile = e\.target\.files\[0\];[\s\S]*?\};/;
  if (handleFileChangePattern.test(content)) {
    content = content.replace(
      handleFileChangePattern,
      `const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
      
      // Get file info
      const sizeInKB = (selectedFile.size / 1024).toFixed(2);
      setFileInfo({
        name: selectedFile.name,
        size: sizeInKB,
        type: selectedFile.type
      });
    } else {
      // File was removed
      setFile(null);
      setPreview(null);
      setFileInfo(null);
    }
  };`
    );
    modified = true;
  }
  
  // 3. Replace file input section with FileUploadZone
  const fileInputPattern = /<div>\s*<label[^>]*>\s*Select (Image|Photo|File)[^<]*<\/label>\s*<input\s+type="file"[^>]*\/>\s*<\/div>\s*(?:\/\* File Info \*\/\s*)?(?:\{fileInfo[\s\S]*?\}\))?(?:\s*\/\* Preview \*\/\s*)?(?:\{preview[\s\S]*?\}\))?/;
  
  if (fileInputPattern.test(content)) {
    content = content.replace(
      fileInputPattern,
      `{/* File Upload Zone */}
              <FileUploadZone
                file={file}
                onFileSelect={handleFileChange}
                preview={preview}
                accept="image/*"
              />

              {/* File Info */}
              {fileInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">File Information</h3>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p><span className="font-medium">Name:</span> {fileInfo.name}</p>
                    <p><span className="font-medium">Size:</span> {fileInfo.size} KB</p>
                    <p><span className="font-medium">Type:</span> {fileInfo.type}</p>
                  </div>
                </div>
              )}`
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${file}`);
    updatedCount++;
  } else {
    console.log(`✗ Could not update ${file} (pattern not matched)`);
    skippedCount++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`Updated: ${updatedCount} files`);
console.log(`Skipped: ${skippedCount} files`);
console.log(`Total: ${toolFiles.length} files`);
