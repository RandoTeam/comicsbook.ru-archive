import os
import subprocess
import sys
import shutil

BASE_DIR = r"C:\G_3.1\comicsbook"
CORDOVA_DIR = os.path.join(BASE_DIR, "cordova_app")
REACT_DIR = os.path.join(BASE_DIR, "react_app")

def run_cmd(args, cwd):
    print(f"Running: {' '.join(args)} in {cwd}")
    subprocess.run(args, cwd=cwd, check=True, shell=True)

def main():
    # Inject local Gradle bin directory into PATH
    gradle_bin = r"C:\G_3.1\comicsbook\gradle\bin"
    if os.path.exists(gradle_bin):
        os.environ["PATH"] = gradle_bin + os.path.pathsep + os.environ["PATH"]
        print(f"Injected local Gradle to PATH: {gradle_bin}")

    # 1. Uninstall old app from phone to avoid signature collision
    print("Uninstalling old app from connected device...")
    adb_path = r"C:\Users\Ilia V\AppData\Local\Android\Sdk\platform-tools\adb.exe"
    if os.path.exists(adb_path):
        subprocess.run([adb_path, "uninstall", "ru.comicsbook.app"], shell=True)
    
    # 2. Build React App
    print("Building React frontend SPA...")
    run_cmd(["npm", "run", "build"], REACT_DIR)
    
    # 3. Export DB and Copy Assets (we can run python build_android.py's helper parts, or just run python build_android.py up to build_release_apk)
    # Actually we can import build_android
    sys.path.append(BASE_DIR)
    import build_android
    
    print("Exporting database and copying assets...")
    build_android.export_database()
    build_android.copy_assets()
    
    # 4. Build Cordova Debug APK
    print("Building Cordova Debug APK...")
    run_cmd(["npx", "cordova", "build", "android"], CORDOVA_DIR)
    
    # 5. Install debug APK
    debug_apk = os.path.join(CORDOVA_DIR, "platforms", "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
    if os.path.exists(debug_apk):
        print(f"Installing debug APK: {debug_apk}")
        run_cmd([adb_path, "install", "-r", debug_apk], BASE_DIR)
        print("Debug APK installed successfully!")
    else:
        print("Error: Debug APK not found!")

if __name__ == "__main__":
    main()
