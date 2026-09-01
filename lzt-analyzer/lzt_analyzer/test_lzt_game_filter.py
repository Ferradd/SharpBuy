import urllib.request
import json
import os
import ssl

ctx = ssl._create_unverified_context()
token_path = "token.txt"
token = ""
if os.path.exists(token_path):
    token = open(token_path).read().strip()

# Test different ways to pass Counter-Strike 2 or CS2 in LZT API
test_urls = [
    "https://prod-api.lzt.market/steam?game[]=730&count=20",
    "https://prod-api.lzt.market/steam?title=CS2&count=20",
    "https://prod-api.lzt.market/steam?title=Counter-Strike&count=20",
    "https://prod-api.lzt.market/steam?game[]=Counter-Strike+2&count=20",
    "https://prod-api.lzt.market/steam?app_id[]=730&count=20",
    "https://prod-api.lzt.market/steam?app_id=730&count=20"
]

for url in test_urls:
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0')
    if token: req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get("items", [])
            print(f"URL: {url}")
            print(f"  Returned count: {len(items)}")
            if items:
                for it in items[:2]:
                    print(f"    - ID {it.get('item_id')}: {it.get('title')} | bans_str: {it.get('steam_bans_string')}")
    except Exception as e:
        print(f"URL: {url} -> Error: {e}")
