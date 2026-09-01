#!/usr/bin/env python3
"""
LZT Market Smart Account Finder & Analyzer (CLI Tool)
Author: Antigravity AI
"""

import sys
import json
import argparse
import requests
from typing import List, Dict, Any

# Ensure UTF-8 output in Windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


# Mock listings for demo mode
DEMO_LISTINGS = [
    {
        "item_id": 10849201,
        "title": "CS2 Prime | 800h CS2 | Отлежа 45 дней | Rust + GTA V",
        "price": 750,
        "cs2_prime": True,
        "daybreak": 45,
        "hours_2weeks": 0,
        "total_cs2_hours": 820,
        "steam_points": 45000,
        "guarantee_hours": 24,
        "extra_games": ["Rust", "Grand Theft Auto V", "Dota 2"],
        "seller_name": "GamerVault_Store"
    },
    {
        "item_id": 10849922,
        "title": "CS2 Prime [Личный] | 1400 часов | Медали | Инвентарь 3500₽",
        "price": 1490,
        "cs2_prime": True,
        "daybreak": 12,
        "hours_2weeks": 2.5,
        "total_cs2_hours": 1420,
        "steam_points": 115000,
        "guarantee_hours": 24,
        "extra_games": ["Cyberpunk 2077", "Dota 2"],
        "seller_name": "LegitDeals"
    },
    {
        "item_id": 10834110,
        "title": "CS2 Prime | Отлежа 92 дня (3+ месяца!) | Чистый steam guard",
        "price": 590,
        "cs2_prime": True,
        "daybreak": 92,
        "hours_2weeks": 0,
        "total_cs2_hours": 450,
        "steam_points": 12500,
        "guarantee_hours": 12,
        "extra_games": ["Left 4 Dead 2"],
        "seller_name": "FastSale_LZT"
    },
    {
        "item_id": 10842099,
        "title": "CS2 Prime + RUST + Dota 2 (3000 MMR) | 120 дней отлежа!",
        "price": 1100,
        "cs2_prime": True,
        "daybreak": 120,
        "hours_2weeks": 0,
        "total_cs2_hours": 1100,
        "steam_points": 82000,
        "guarantee_hours": 24,
        "extra_games": ["Rust", "Dota 2"],
        "seller_name": "SafeSteamShop"
    }
]

def calculate_deal_score(item: Dict[str, Any]) -> int:
    """Calculates Deal Score (0-100) based on value, risk, and features."""
    score = 50
    price = item.get("price", 700)
    
    if price <= 500: score += 20
    elif price <= 750: score += 12
    elif price <= 1100: score += 5
    elif price > 1800: score -= 10

    daybreak = item.get("daybreak", 0)
    if daybreak >= 90: score += 25
    elif daybreak >= 30: score += 18
    elif daybreak >= 14: score += 10
    elif daybreak >= 7: score += 4
    else: score -= 12

    recent_hours = item.get("hours_2weeks", 0)
    if recent_hours == 0: score += 10
    elif recent_hours < 5: score += 5
    elif recent_hours > 20: score -= 15

    guarantee = item.get("guarantee_hours", 0)
    if guarantee >= 24: score += 10
    elif guarantee >= 12: score += 5

    games = item.get("extra_games", [])
    if "Rust" in games: score += 10
    if "Grand Theft Auto V" in games: score += 7

    return max(1, min(100, score))

def fetch_lzt_listings(token: str, category: str = "steam", min_price: int = 300, max_price: int = 3000) -> List[Dict[str, Any]]:
    """Fetches live listings from official LZT Market API."""
    url = f"https://prod-api.lzt.market/{category}"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"pmin": min_price, "pmax": max_price}
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("items", [])
            results = []
            for raw in items:
                results.append({
                    "item_id": raw.get("item_id"),
                    "title": raw.get("title", "Steam Account"),
                    "price": raw.get("price", 0),
                    "cs2_prime": raw.get("cs2_prime") == 1 or raw.get("cs2_prime") is True,
                    "daybreak": raw.get("daybreak", 0),
                    "hours_2weeks": raw.get("hours_2weeks", 0),
                    "total_cs2_hours": raw.get("hours_cs2", 0),
                    "steam_points": raw.get("steam_points") or raw.get("points") or 0,
                    "guarantee_hours": raw.get("guarantee_hours", 0),
                    "extra_games": raw.get("games", []),
                    "seller_name": raw.get("seller", {}).get("username", "Seller")
                })
            return results
        else:
            print(f"[!] API Error {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"[!] Failed to connect to LZT Market API: {e}")
    
    return []

def main():
    parser = argparse.ArgumentParser(description="LZT Market Smart Account Finder & Analyzer")
    parser.add_argument("--token", type=str, help="LZT API Bearer Token")
    parser.add_argument("--cs2-prime", action="store_true", default=True, help="Filter for CS2 Prime")
    parser.add_argument("--min-price", type=int, default=300, help="Min price in RUB")
    parser.add_argument("--max-price", type=int, default=2500, help="Max price in RUB")
    parser.add_argument("--min-inactivity", type=int, default=7, help="Min inactivity days (daybreak)")
    parser.add_argument("--max-2weeks", type=float, default=10.0, help="Max hours played in last 2 weeks")
    parser.add_argument("--demo", action="store_true", help="Run in demo mode with sample listings")

    args = parser.parse_args()

    print("\n=======================================================")
    print("      🚀 LZT MARKET SMART ACCOUNT FINDER v1.0         ")
    print("=======================================================\n")

    if args.token and not args.demo:
        print(f"[*] Fetching live listings from LZT API (Price: {args.min_price}-{args.max_price} RUB)...")
        items = fetch_lzt_listings(args.token, min_price=args.min_price, max_price=args.max_price)
    else:
        print("[*] Running in DEMO mode with simulated CS2 Prime listings...")
        items = DEMO_LISTINGS

    # Calculate Deal Scores and filter
    analyzed = []
    for item in items:
        if args.cs2_prime and not item.get("cs2_prime", True):
            continue
        if item.get("price", 0) < args.min_price or item.get("price", 0) > args.max_price:
            continue
        if item.get("daybreak", 0) < args.min_inactivity:
            continue
        if item.get("hours_2weeks", 0) > args.max_2weeks:
            continue

        score = calculate_deal_score(item)
        item["deal_score"] = score
        analyzed.append(item)

    analyzed.sort(key=lambda x: x["deal_score"], reverse=True)

    print(f"\n[+] Found {len(analyzed)} matching accounts:\n")
    print(f"{'RANK':<5} {'SCORE':<7} {'PRICE':<9} {'DAYBREAK':<10} {'2W HOURS':<9} {'TITLE'}")
    print("-" * 80)

    for idx, item in enumerate(analyzed, 1):
        print(f"#{idx:<4} {item['deal_score']:<7} {item['price']} RUB{'':<2} {item['daybreak']}d{'':<6} {item['hours_2weeks']}h{'':<5} {item['title'][:40]}...")
        print(f"      🔗 Buy Link: https://lzt.market/{item['item_id']}")
        print()

if __name__ == "__main__":
    main()
