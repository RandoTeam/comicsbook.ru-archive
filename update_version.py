import os, re

manifest = r'c:\G_3.1\comicsbook\cordova_app\platforms\android\app\src\main\AndroidManifest.xml'
gradle = r'c:\G_3.1\comicsbook\cordova_app\platforms\android\app\build.gradle'

try:
    with open(manifest, 'r', encoding='utf-8') as f:
        m = f.read()
    m = re.sub(r'android:versionName=".*?"', 'android:versionName="1.0.1"', m)
    m = re.sub(r'android:versionCode=".*?"', 'android:versionCode="10001"', m)
    with open(manifest, 'w', encoding='utf-8') as f:
        f.write(m)
    print('Updated AndroidManifest.xml')

    if os.path.exists(gradle):
        with open(gradle, 'r', encoding='utf-8') as f:
            g = f.read()
        g = re.sub(r'versionName\s+[\"''\'].*?[\"''\']', 'versionName "1.0.1"', g)
        g = re.sub(r'versionCode\s+\d+', 'versionCode 10001', g)
        with open(gradle, 'w', encoding='utf-8') as f:
            f.write(g)
        print('Updated build.gradle')
except Exception as e:
    print(e)
