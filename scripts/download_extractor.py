import urllib.request
import os

url = "https://raw.githubusercontent.com/extremecoders-re/pyinstxtractor/master/pyinstxtractor.py"
print("Downloading pyinstxtractor.py...")
urllib.request.urlretrieve(url, "scripts/pyinstxtractor.py")
print("Saved to scripts/pyinstxtractor.py")
