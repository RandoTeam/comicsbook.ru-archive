$ErrorActionPreference = "Stop"
Write-Host "--- 1. Building React SPA Frontend ---" -ForegroundColor Cyan
cd C:\G_3.1\comicsbook\react_app
npm run build

cd C:\G_3.1\comicsbook
if (Test-Path "upload") {
    Copy-Item -Path "upload" -Destination "cordova_app\www\upload" -Recurse -Force
    Write-Host "Images copied to www/upload." -ForegroundColor Green
}

Write-Host "--- 2. Syncing Version Information ---" -ForegroundColor Cyan
python update_version.py

Write-Host "--- 3. Compiling Android APK with Gradle ---" -ForegroundColor Cyan
$env:PATH = "C:\Users\Ilia V\.gradle\wrapper\dists\gradle-8.11.1-bin\bpt9gzteqjrbo1mjrsomdt32c\gradle-8.11.1\bin;" + $env:PATH
cd cordova_app\platforms\android
.\gradlew.bat assembleRelease

cd C:\G_3.1\comicsbook
$unsignedApk = "cordova_app\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk"
$targetApk = "comicsbook-release.apk"
Copy-Item -Path $unsignedApk -Destination $targetApk -Force

Write-Host "--- 4. Signing APK with Keystore ---" -ForegroundColor Cyan
$apksigner = "C:\Users\Ilia V\AppData\Local\Android\Sdk\build-tools\35.0.0\apksigner.bat"
if (-not (Test-Path $apksigner)) {
    $found = Get-ChildItem -Path "$env:ANDROID_HOME\build-tools" -Filter "apksigner.bat" -Recurse | Select-Object -First 1
    if ($found) { $apksigner = $found.FullName }
}

& $apksigner sign --ks comicsbook.keystore --ks-pass pass:123456 --key-pass pass:123456 $targetApk
& $apksigner verify --verbose $targetApk

Write-Host "Build and signing successfully complete: $targetApk" -ForegroundColor Green

