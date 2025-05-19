Write-Host "Cleaning Vite cache and build files..."

# Delete .vite cache
if (Test-Path .\node_modules\.vite) {
    Remove-Item -Recurse -Force .\node_modules\.vite
    Write-Host "Deleted .vite cache"
} else {
    Write-Host ".vite folder not found, skipping"
}

# Delete dist folder
if (Test-Path .\dist) {
    Remove-Item -Recurse -Force .\dist
    Write-Host "Deleted dist folder"
} else {
    Write-Host "dist folder not found, skipping"
}

# Reinstall dependencies
Write-Host "Installing dependencies..."
npm install

# Start development server
Write-Host "Starting dev server..."
npm run dev
