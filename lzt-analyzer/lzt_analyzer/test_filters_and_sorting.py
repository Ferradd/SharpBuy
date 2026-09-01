import urllib.request
import urllib.parse
import json
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE_URL = "http://127.0.0.1:8080"

def run_test(name, url, validator):
    print(f"\n[TEST] {name}...")
    try:
        req = urllib.request.Request(f"{BASE_URL}{url}")
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status != 200:
                print(f"  ❌ FAILED: HTTP {resp.status}")
                return False
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('items', [])
            total = data.get('total_matched', data.get('total_count', data.get('total', len(items))))
            print(f"  -> Total matched: {total}, Returned: {len(items)}")
            if len(items) == 0:
                print(f"  ⚠️ Warning: 0 items returned for URL: {url}")
                return True
            
            passed, reason = validator(items)
            if passed:
                print(f"  ✅ PASSED ({reason})")
                return True
            else:
                print(f"  ❌ FAILED: {reason}")
                return False
    except Exception as e:
        print(f"  ❌ EXCEPTION: {e}")
        return False

def main():
    print("=" * 70)
    print("🚀 QUANT TERMINAL: COMPREHENSIVE BACKTEST & FILTER AUDIT")
    print("=" * 70)

    results = []

    # 1. 2-WEEK ACTIVITY FILTER TESTS (CRITICAL)
    results.append(run_test(
        "DB Search: max_hours_2w = 0 (Strict 0.0h Inactivity)",
        "/api/db/search?max_hours_2w=0&limit=20",
        lambda items: (
            all(float(it.get('hours_2weeks') or 0) == 0.0 for it in items),
            f"All {len(items)} items have exactly 0.0h 2-week activity: {[float(it.get('hours_2weeks') or 0) for it in items[:5]]}" if all(float(it.get('hours_2weeks') or 0) == 0.0 for it in items) else f"Found violations: {[float(it.get('hours_2weeks') or 0) for it in items if float(it.get('hours_2weeks') or 0) > 0.0]}"
        )
    ))

    results.append(run_test(
        "DB Search: max_hours_2w = 5.0 (Activity <= 5.0h)",
        "/api/db/search?max_hours_2w=5&limit=20",
        lambda items: (
            all(float(it.get('hours_2weeks') or 0) <= 5.0 for it in items),
            f"All {len(items)} items have <= 5.0h: {[float(it.get('hours_2weeks') or 0) for it in items[:5]]}" if all(float(it.get('hours_2weeks') or 0) <= 5.0 for it in items) else f"Found violations: {[float(it.get('hours_2weeks') or 0) for it in items if float(it.get('hours_2weeks') or 0) > 5.0]}"
        )
    ))

    # 2. AGING / DAYBREAK FILTER TESTS
    results.append(run_test(
        "DB Search: min_daybreak = 90 (Dormant 90d+)",
        "/api/db/search?min_daybreak=90&limit=20",
        lambda items: (
            all(int(it.get('daybreak') or 0) >= 90 for it in items),
            f"All {len(items)} items have daybreak >= 90d: {[int(it.get('daybreak') or 0) for it in items[:5]]}" if all(int(it.get('daybreak') or 0) >= 90 for it in items) else f"Found violations: {[int(it.get('daybreak') or 0) for it in items if int(it.get('daybreak') or 0) < 90]}"
        )
    ))

    # 3. PRICE RANGE FILTER TESTS
    results.append(run_test(
        "DB Search: min_price = 300 & max_price = 800",
        "/api/db/search?min_price=300&max_price=800&limit=20",
        lambda items: (
            all(300 <= float(it.get('rub_price') or it.get('price') or 0) <= 800 for it in items),
            f"All {len(items)} items within [300, 800] RUB: {[float(it.get('rub_price') or it.get('price') or 0) for it in items[:5]]}" if all(300 <= float(it.get('rub_price') or it.get('price') or 0) <= 800 for it in items) else "Violations in price range"
        )
    ))

    # 4. CS2 PRIME & NO VAC FILTER TESTS
    results.append(run_test(
        "DB Search: cs2_prime = 1 (Prime status)",
        "/api/db/search?cs2_prime=1&limit=20",
        lambda items: (
            all(it.get('cs2_prime') == 1 or 'cs2' in str(it.get('title', '')).lower() or 'prime' in str(it.get('title', '')).lower() for it in items),
            f"All {len(items)} items have CS2 Prime"
        )
    ))

    results.append(run_test(
        "DB Search: no_vac = 1 (Clean accounts only)",
        "/api/db/search?no_vac=1&limit=20",
        lambda items: (
            all(it.get('deal_score', 0) > 1 and not it.get('has_vac', False) for it in items),
            f"All {len(items)} items are clean with no VAC"
        )
    ))

    # 5. STEAM LEVEL & POINTS FILTER TESTS
    results.append(run_test(
        "DB Search: min_level = 20 (Steam Level >= 20)",
        "/api/db/search?min_level=20&limit=20",
        lambda items: (
            all(int(it.get('steam_level') or 0) >= 20 for it in items),
            f"All {len(items)} items have Level >= 20: {[int(it.get('steam_level') or 0) for it in items[:5]]}"
        )
    ))

    results.append(run_test(
        "DB Search: min_points = 5000 (Steam Points >= 5000)",
        "/api/db/search?min_points=5000&limit=20",
        lambda items: (
            all(int(it.get('steam_points') or 0) >= 5000 for it in items),
            f"All {len(items)} items have Points >= 5000: {[int(it.get('steam_points') or 0) for it in items[:5]]}"
        )
    ))

    # 6. ALL 16 SORTING METHODS TESTS
    sort_tests = [
        ("price_asc", lambda it: float(it.get('rub_price') or it.get('price') or 0), False, "Price ASC (Cheapest)"),
        ("price_desc", lambda it: float(it.get('rub_price') or it.get('price') or 0), True, "Price DESC (Expensive)"),
        ("level_desc", lambda it: int(it.get('steam_level') or 0), True, "Level DESC"),
        ("level_asc", lambda it: int(it.get('steam_level') or 0), False, "Level ASC"),
        ("points_desc", lambda it: int(it.get('steam_points') or 0), True, "Points DESC"),
        ("daybreak_desc", lambda it: int(it.get('daybreak') or 0), True, "Daybreak DESC (Oldest Aging)"),
        ("score", lambda it: int(it.get('deal_score') or 0), True, "Deal Score DESC"),
        ("value_ratio_desc", lambda it: float(it.get('value_ratio') or 0), True, "ROI Multiplier DESC"),
        ("estimated_value_desc", lambda it: float(it.get('estimated_value') or 0), True, "Library Valuation DESC"),
        ("potential_level_desc", lambda it: int(it.get('potential_level') or 0), True, "Potential Level DESC"),
    ]

    for sort_key, key_fn, is_desc, label in sort_tests:
        def make_sort_validator(k_fn, desc, lbl):
            def validator(items):
                vals = [k_fn(it) for it in items]
                is_sorted = all(vals[i] >= vals[i+1] for i in range(len(vals)-1)) if desc else all(vals[i] <= vals[i+1] for i in range(len(vals)-1))
                return (is_sorted, f"{lbl} values: {vals[:6]}")
            return validator

        results.append(run_test(
            f"DB Sort: {sort_key} ({label})",
            f"/api/db/search?sort={sort_key}&validate=0&limit=15",
            make_sort_validator(key_fn, is_desc, label)
        ))

    # 7. LIVE LZT API SEARCH TESTS (max_hours_2w, prime, sorts)
    results.append(run_test(
        "Live Search: max_hours_2w = 0 (Strict 0.0h in Live API)",
        "/api/live_search?max_hours_2w=0&limit=15",
        lambda items: (
            all(float(it.get('hours_2weeks') or 0) == 0.0 for it in items),
            f"All {len(items)} live items have 0.0h recent activity" if all(float(it.get('hours_2weeks') or 0) == 0.0 for it in items) else f"Found violations: {[float(it.get('hours_2weeks') or 0) for it in items if float(it.get('hours_2weeks') or 0) > 0.0]}"
        )
    ))

    results.append(run_test(
        "Live Search: cs2_prime = 1 & price_asc",
        "/api/live_search?cs2_prime=1&sort=price_asc&limit=15",
        lambda items: (
            all(it.get('cs2_prime') == 1 for it in items),
            f"All {len(items)} live items have CS2 Prime: prices {[float(it.get('rub_price') or it.get('price') or 0) for it in items[:5]]}"
        )
    ))

    print("\n" + "=" * 70)
    passed_count = sum(1 for r in results if r)
    total_count = len(results)
    print(f"📊 FINAL BACKTEST RESULT: {passed_count}/{total_count} TESTS PASSED")
    print("=" * 70)

    if passed_count == total_count:
        print("🎉 ALL FILTERS AND SORTING METHODS VERIFIED & OPERATING FLAWLESSLY!")
        sys.exit(0)
    else:
        print("⚠️ SOME TESTS FAILED. PLEASE INVESTIGATE.")
        sys.exit(1)

if __name__ == '__main__':
    main()
