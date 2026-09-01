import zipfile
import os

zip_path = 'mac_build_kit.zip'
folders_to_include = [
    'scripts/publish_launcher_mac.sh',
    'src/launcher/SharpBuy_Launcher_Mac',
    'src/launcher/SharpBuy_Launcher/Assets'
]

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for item in folders_to_include:
        if os.path.isfile(item):
            zipf.write(item, arcname=item.replace('\\', '/'))
        elif os.path.isdir(item):
            for root, dirs, files in os.walk(item):
                # Skip heavy build folders to keep the zip tiny
                parts = root.replace('\\', '/').split('/')
                if 'target' in parts or 'node_modules' in parts or 'gen' in parts:
                    continue
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, start='.').replace('\\', '/')
                    zipf.write(file_path, arcname=arcname)

print(f"Successfully created {zip_path} with minimal required files!")
