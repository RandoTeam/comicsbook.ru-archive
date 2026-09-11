import os, re
import xml.etree.ElementTree as ET

config_path = r'c:\G_3.1\comicsbook\cordova_app\config.xml'
manifest = r'c:\G_3.1\comicsbook\cordova_app\platforms\android\app\src\main\AndroidManifest.xml'
gradle = r'c:\G_3.1\comicsbook\cordova_app\platforms\android\app\build.gradle'

version_name = "1.0.6"
version_code = "10006"

if os.path.exists(config_path):
    try:
        tree = ET.parse(config_path)
        root = tree.getroot()
        version_name = root.attrib.get('version', version_name)
        version_code = root.attrib.get('{http://schemas.android.com/apk/res/android}versionCode', version_code)
    except Exception as e:
        print("Config parse error, using default:", e)

print(f"Syncing version {version_name} (code: {version_code})...")

try:
    if os.path.exists(manifest):
        with open(manifest, 'r', encoding='utf-8') as f:
            m = f.read()
        m = re.sub(r'android:versionName=".*?"', f'android:versionName="{version_name}"', m)
        m = re.sub(r'android:versionCode=".*?"', f'android:versionCode="{version_code}"', m)
        with open(manifest, 'w', encoding='utf-8') as f:
            f.write(m)
        print('Updated AndroidManifest.xml')

    if os.path.exists(gradle):
        with open(gradle, 'r', encoding='utf-8') as f:
            g = f.read()
        g = re.sub(r'versionName\s+[\"\'\'].*?[\"\'\']', f'versionName "{version_name}"', g)
        g = re.sub(r'versionCode\s+\d+', f'versionCode {version_code}', g)
        with open(gradle, 'w', encoding='utf-8') as f:
            f.write(g)
        print('Updated build.gradle')
except Exception as e:
    print(e)
