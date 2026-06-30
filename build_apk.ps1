cd C:\G_3.1\comicsbook\react_app
npm run build
cd C:\G_3.1\comicsbook
Copy-Item -Path "upload" -Destination "cordova_app\www\upload" -Recurse -Force
echo "Images copied."
cd cordova_app\platforms\android
.\gradlew assembleRelease
cd C:\G_3.1\comicsbook
python update_version.py
Copy-Item -Path "cordova_app\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk" -Destination "comicsbook-release.apk" -Force
echo "Build complete."
