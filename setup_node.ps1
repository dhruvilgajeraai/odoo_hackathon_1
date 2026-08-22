$nodeDir = "C:\Users\01\AppData\Local\Programs\nodejs"
if (!(Test-Path $nodeDir)) {
    New-Item -ItemType Directory -Force -Path $nodeDir | Out-Null
}

$zipPath = "$env:TEMP\node.zip"
$extractDir = "$env:TEMP\node_extracted"

Write-Host "Downloading Node.js..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip" -OutFile $zipPath

Write-Host "Extracting Node.js..."
Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

Write-Host "Copying files to $nodeDir..."
Copy-Item -Path "$extractDir\node-v20.18.0-win-x64\*" -Destination $nodeDir -Recurse -Force

Write-Host "Cleaning temp files..."
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Adding to user PATH..."
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($currentPath -notlike "*$nodeDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$nodeDir", [EnvironmentVariableTarget]::User)
}

Write-Host "Testing node..."
& "$nodeDir\node.exe" -v
& "$nodeDir\npm.cmd" -v
