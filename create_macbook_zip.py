import os
import zipfile

target_zip = 'C:/Users/iliyk/Desktop/SharpBuy_MacBook_Project.zip'
source_dir = 'C:/Users/iliyk/Desktop/SharpBuy'
excluded_dirs = {'node_modules', '.git', 'dist', '.vercel'}

print(f"Creating clean MacBook ZIP archive: {target_zip}")

with zipfile.ZipFile(target_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(source_dir):
        # Exclude specified directories
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for file in files:
            if file.endswith('.zip') or file.endswith('.log'):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, source_dir)
            zipf.write(file_path, arcname)

size_mb = os.path.getsize(target_zip) / (1024 * 1024)
print(f"✅ Archive created successfully: {target_zip} ({size_mb:.2f} MB)")
