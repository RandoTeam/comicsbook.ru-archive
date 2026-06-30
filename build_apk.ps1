cd C:\G_3.1\comicsbook\react_app
npm run build
cd C:\G_3.1\comicsbook
Copy-Item -Path "upload" -Destination "cordova_app\www\upload" -Recurse -Force
echo "Images copied."
python update_version.py
cd cordova_app\platforms\android
.\gradlew assembleRelease
cd C:\G_3.1\comicsbook
Copy-Item -Path "cordova_app\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk" -Destination "comicsbook-release.apk" -Force
apksigner sign --ks comicsbook.keystore --ks-pass pass:123456 --key-pass pass:123456 comicsbook-release.apk
echo "Build complete."
