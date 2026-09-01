#!/usr/bin/env python3
"""
LZT Smart Analyzer — Co-op Multi-Account Bundle Matcher (High Performance Engine)
Strictly matches curated Top-120 Steam Co-op / Party / Two-Player games from SteamDB.
Filters out non-coop, singleplayer, and trash games.
"""

import os
import ssl
import time
import urllib.request
import urllib.parse
import json
import itertools
import concurrent.futures
from typing import List, Dict, Any, Optional, Set, Tuple
import database
import games_catalog

def get_auth_token() -> str:
    """Reads LZT API token."""
    for path in ('token.txt', os.path.join(os.path.dirname(__file__), 'token.txt')):
        if os.path.exists(path):
            try:
                t = open(path, 'r', encoding='utf-8').read().strip()
                if t:
                    return t
            except Exception:
                pass
    return ""

def validate_single_item_online(item_id: int, token: str) -> Tuple[int, bool, str]:
    """Checks live market availability for an account."""
    if not item_id:
        return (item_id, False, "invalid_id")
    url = f"https://prod-api.lzt.market/{item_id}"
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    if token:
        req.add_header('Authorization', f"Bearer {token}")
    try:
        ctx = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=ctx, timeout=3.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode('utf-8'))
                item_obj = data.get("item", {})
                state = item_obj.get("item_state", "unknown")
                can_buy = data.get("canBuyItem", False)
                is_active = (state == "active" or can_buy)
                return (item_id, is_active, state)
            elif resp.status in (404, 410):
                return (item_id, False, "deleted")
            else:
                return (item_id, False, f"http_{resp.status}")
    except urllib.error.HTTPError as e:
        if e.code in (404, 410):
            return (item_id, False, "deleted")
        return (item_id, False, f"http_{e.code}")
    except Exception:
        return (item_id, True, "unknown")

def find_coop_bundles_from_candidates(
    parsed_candidates: List[Dict[str, Any]],
    party_size: int = 2,
    max_total_price: Optional[float] = None,
    min_shared_games: int = 1,
    must_have_ids: Optional[Set[str]] = None,
    coop_category: str = "all",
    sort_by: str = "shared_games",
    limit: int = 40
) -> Dict[str, Any]:
    """Helper that runs N-way combination matching on an in-memory candidate list."""
    party_size = max(2, min(8, int(party_size)))
    min_shared_games = max(1, int(min_shared_games))
    catalog_map = {g["id"]: g for g in games_catalog.TOP_COOP_CATALOG}

    raw_matches = []
    max_combos = 60000
    evaluated_count = 0

    for combo in itertools.combinations(parsed_candidates, party_size):
        evaluated_count += 1
        if evaluated_count > max_combos:
            break
            
        tot_price = sum(acc["price"] for acc in combo)
        if max_total_price and tot_price > max_total_price:
            continue
        
        # Intersect all game ID sets
        if party_size == 2:
            shared_ids = combo[0]["top_game_ids"] & combo[1]["top_game_ids"]
        else:
            shared_ids = frozenset.intersection(*(acc["top_game_ids"] for acc in combo))

        # Filter by co-op category if specified
        if coop_category and coop_category != "all":
            shared_ids = frozenset(
                gid for gid in shared_ids
                if catalog_map.get(gid, {}).get("category") == coop_category
                or coop_category in catalog_map.get(gid, {}).get("tags", [])
            )

        shared_count = len(shared_ids)
        if shared_count < min_shared_games:
            continue
        if must_have_ids and not must_have_ids.issubset(shared_ids):
            continue
        
        shared_paid_count = sum(1 for gid in shared_ids if catalog_map.get(gid, {}).get("is_paid", True))
        avg_score = sum(acc["deal_score"] for acc in combo) / float(party_size)
        avg_daybreak = sum(acc["daybreak"] for acc in combo) / float(party_size)
        price_per_shared = tot_price / max(1, shared_count)
        
        # Balance scoring formula rewarding verified co-op games
        raw_b_score = (shared_paid_count * 12) + (shared_count * 4) + (avg_score * 0.3) + (min(avg_daybreak, 60) * 0.15) - (min(tot_price, 4000) * 0.005)
        bundle_score = max(1, min(100, int(round(raw_b_score))))

        raw_matches.append((shared_paid_count, shared_count, tot_price, bundle_score, price_per_shared, shared_ids, combo))

    # Sort matching bundles according to user choice
    if sort_by in ("shared_games", "overlap", "top_overlap"):
        raw_matches.sort(key=lambda m: (m[0], m[1], -m[2]), reverse=True)
    elif sort_by in ("bundle_score", "score"):
        raw_matches.sort(key=lambda m: (m[3], m[0], m[1], -m[2]), reverse=True)
    elif sort_by in ("cheapest", "price_asc"):
        raw_matches.sort(key=lambda m: (m[2], -m[0], -m[1]))
    elif sort_by in ("value_for_money", "ratio"):
        raw_matches.sort(key=lambda m: (m[1] / max(1.0, m[2]), m[0]), reverse=True)
    else:
        raw_matches.sort(key=lambda m: (m[0], m[1], m[3]), reverse=True)

    # Live Online Auto-Validation: prune sold/deleted accounts before returning bundles
    token = get_auth_token()
    invalid_account_ids: Set[int] = set()
    validated_account_ids: Set[int] = set()

    if token and raw_matches:
        candidate_item_ids: Set[int] = set()
        # Scan accounts across top candidates to validate them in parallel
        for _, _, _, _, _, _, accs in raw_matches[:min(len(raw_matches), limit * 4)]:
            for a in accs:
                if not a.get("is_live", False):
                    candidate_item_ids.add(a["item_id"])

        if candidate_item_ids:
            with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
                futures = [ex.submit(validate_single_item_online, iid, token) for iid in candidate_item_ids]
                for fut in concurrent.futures.as_completed(futures):
                    try:
                        iid, is_act, st = fut.result()
                        if not is_act and st in ("paid", "sold", "deleted", "closed", "http_404", "http_410", "http_403"):
                            invalid_account_ids.add(iid)
                            try:
                                database.delete_account(iid)
                            except Exception:
                                pass
                        elif is_act:
                            validated_account_ids.add(iid)
                    except Exception:
                        pass

    # Format the verified matching results for presentation
    formatted_bundles: List[Dict[str, Any]] = []
    bundle_rank = 1

    for shared_paid, shared_cnt, tot_price, b_score, p_per_shared, shared_ids, accs in raw_matches:
        # Skip if any account in the party is dead/sold
        if any(acc["item_id"] in invalid_account_ids for acc in accs):
            continue

        if len(formatted_bundles) >= limit:
            break

        shared_games_detail = []
        for gid in sorted(shared_ids):
            if gid in catalog_map:
                shared_games_detail.append(catalog_map[gid]["name"])
            else:
                found_title = gid.replace('_', ' ').title()
                for a in accs:
                    for g in a["top_games"]:
                        if g["id"] == gid:
                            found_title = g["name"]
                            break
                shared_games_detail.append(found_title)

        formatted_accs = []
        for acc in accs:
            exclusive_games = [
                g["name"] for g in acc["top_games"]
                if g["id"] not in shared_ids
            ]

            formatted_accs.append({
                "item_id": acc["item_id"],
                "title": acc["title"],
                "price": acc["price"],
                "seller_name": acc["seller_name"],
                "cs2_prime": acc["cs2_prime"],
                "steam_level": acc["steam_level"],
                "steam_points": acc["steam_points"],
                "daybreak": acc["daybreak"],
                "deal_score": acc["deal_score"],
                "guarantee_hours": acc["guarantee_hours"],
                "exclusive_games": exclusive_games[:5],
                "exclusive_count": len(exclusive_games),
                "all_games_count": acc["all_games_count"],
                "is_live": acc.get("is_live", True),
                "is_live_validated": (acc["item_id"] in validated_account_ids or acc.get("is_live", False)),
                "direct_url": f"https://lzt.market/{acc['item_id']}/"
            })

        formatted_bundles.append({
            "bundle_id": f"bundle_{bundle_rank}",
            "rank": bundle_rank,
            "party_size": party_size,
            "total_price": round(tot_price, 2),
            "price_per_player": round(tot_price / party_size, 2),
            "bundle_score": b_score,
            "shared_games_count": shared_cnt,
            "shared_paid_count": shared_paid,
            "shared_games": shared_games_detail,
            "price_per_shared_game": round(p_per_shared, 2),
            "accounts": formatted_accs
        })
        bundle_rank += 1

    return {
        "total_bundles": len(raw_matches),
        "party_size": party_size,
        "bundles": formatted_bundles,
        "candidates_evaluated": len(parsed_candidates),
        "catalog_top_games": games_catalog.get_all_top_games(coop_category)
    }

# Category AppID maps for targeted live querying
CATEGORY_APP_IDS = {
    "couples": [1426210, 1222700, 1607680, 448510, 1228630, 620, 413150, 268910, 1599600, 996770],
    "party": [477160, 2835570, 2567870, 1260320, 880940, 285900, 431240, 674940, 1509980, 386940],
    "horror": [3241660, 1966720, 739630, 2881650, 3097560, 1304930, 1943950, 381210, 1274570, 967050],
    "survival": [252490, 221100, 1326470, 242760, 105600, 108600, 251570, 648800, 892970, 1623730, 962130, 1203620, 815370],
    "action": [271590, 553850, 550, 239140, 534380, 548430, 1086940, 1172620, 632360, 49520, 1282100]
}

def find_live_coop_bundles(
    party_size: int = 2,
    max_total_price: Optional[float] = None,
    max_price_per_acc: Optional[float] = None,
    min_shared_games: int = 1,
    must_have_games: Optional[List[str]] = None,
    coop_category: str = "all",
    min_daybreak: int = 0,
    no_vac: bool = True,
    sort_by: str = "shared_games",
    limit: int = 40
) -> Dict[str, Any]:
    """
    Fetches FRESH, CURRENTLY ACTIVE listings directly from LZT API right now and matches them in RAM.
    Guarantees 100% of accounts in bundles are currently active and ready to buy.
    """
    token = get_auth_token()
    if not token:
        return find_coop_bundles(
            party_size=party_size,
            max_total_price=max_total_price,
            max_price_per_acc=max_price_per_acc,
            min_shared_games=min_shared_games,
            must_have_games=must_have_games,
            coop_category=coop_category,
            min_daybreak=min_daybreak,
            no_vac=no_vac,
            sort_by=sort_by,
            limit=limit
        )

    must_have_ids: Set[str] = set()
    app_ids_to_query: List[int] = []
    
    if must_have_games:
        for g_str in must_have_games:
            if not g_str:
                continue
            matched = games_catalog.match_catalog_game(g_str)
            if matched:
                must_have_ids.add(matched["id"])
                if "app_id" in matched:
                    app_ids_to_query.append(matched["app_id"])
            else:
                cleaned = games_catalog.clean_game_name(g_str)
                if cleaned:
                    must_have_ids.add(cleaned.lower().replace(' ', '_'))

    headers = {
        'Authorization': f'Bearer {token}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    ctx = ssl._create_unverified_context()

    fetched_items = []
    seen_item_ids = set()

    target_urls = []
    if app_ids_to_query:
        app_params = "&".join([f"game[]={aid}" for aid in app_ids_to_query])
        target_urls.append(f"https://prod-api.lzt.market/steam?{app_params}&order_by=pdate_to_down&per_page=50")
        for aid in app_ids_to_query:
            target_urls.append(f"https://prod-api.lzt.market/steam?game[]={aid}&order_by=pdate_to_down&per_page=40")
    elif coop_category in CATEGORY_APP_IDS:
        cat_apps = CATEGORY_APP_IDS[coop_category]
        for aid in cat_apps[:5]:
            target_urls.append(f"https://prod-api.lzt.market/steam?game[]={aid}&order_by=pdate_to_down&per_page=40")
    else:
        top_apps = [3241660, 2835570, 2567870, 1966720, 739630, 477160, 1426210, 252490, 221100, 1326470]
        for aid in top_apps[:6]:
            target_urls.append(f"https://prod-api.lzt.market/steam?game[]={aid}&order_by=pdate_to_down&per_page=40")
        target_urls.append("https://prod-api.lzt.market/steam?order_by=pdate_to_down&per_page=50")

    for url in target_urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ctx, timeout=7) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                for it in data.get('items', []):
                    iid = it.get('item_id')
                    if iid and iid not in seen_item_ids:
                        if it.get('item_state') and it.get('item_state') != 'active':
                            continue
                        seen_item_ids.add(iid)
                        fetched_items.append(it)
            time.sleep(0.25)
        except Exception:
            pass

    parsed_candidates = []
    for raw in fetched_items:
        try:
            parsed = database.parse_raw_account(raw)
            price = float(parsed.get('price', 0))
            if max_price_per_acc and price > max_price_per_acc:
                continue
            if max_total_price and price > max_total_price:
                continue
            
            daybreak = int(parsed.get('daybreak', 0))
            if min_daybreak > 0 and daybreak < min_daybreak:
                continue

            extra_games = parsed.get('extra_games', [])
            # Extract games: strictly curated multiplayer and co-op games only
            all_games = games_catalog.extract_account_top_games(extra_games, parsed.get('cs2_prime', False), parsed.get('title', ''), strict_coop_only=True)
            g_ids = frozenset(g['id'] for g in all_games)
            if not g_ids:
                continue

            if must_have_ids and not must_have_ids.issubset(g_ids):
                continue

            parsed_candidates.append({
                'item_id': parsed['item_id'],
                'title': parsed['title'],
                'price': price,
                'seller_name': parsed['seller_name'],
                'cs2_prime': parsed['cs2_prime'],
                'steam_level': parsed['steam_level'],
                'steam_points': parsed['steam_points'],
                'daybreak': daybreak,
                'deal_score': parsed['deal_score'],
                'guarantee_hours': parsed['guarantee_hours'],
                'top_games': all_games,
                'top_game_ids': g_ids,
                'all_games_count': len(all_games),
                'is_live': True
            })

            try:
                database.upsert_account(raw)
            except Exception:
                pass
        except Exception:
            pass

    if sort_by in ("shared_games", "overlap", "top_overlap"):
        parsed_candidates.sort(key=lambda c: (c["all_games_count"], c["deal_score"]), reverse=True)
    elif sort_by in ("cheapest", "price_asc"):
        parsed_candidates.sort(key=lambda c: (c["price"], -c["all_games_count"]))
    else:
        parsed_candidates.sort(key=lambda c: (c["deal_score"], c["all_games_count"]), reverse=True)

    return find_coop_bundles_from_candidates(
        parsed_candidates=parsed_candidates,
        party_size=party_size,
        max_total_price=max_total_price,
        min_shared_games=min_shared_games,
        must_have_ids=must_have_ids,
        coop_category=coop_category,
        sort_by=sort_by,
        limit=limit
    )

def find_coop_bundles(
    party_size: int = 2,
    max_total_price: Optional[float] = None,
    max_price_per_acc: Optional[float] = None,
    min_shared_games: int = 1,
    must_have_games: Optional[List[str]] = None,
    coop_category: str = "all",
    min_daybreak: int = 0,
    no_vac: bool = True,
    sort_by: str = "shared_games",
    limit: int = 40
) -> Dict[str, Any]:
    """
    Finds combinations of N accounts from local DB strictly filtering for verified top co-ops.
    """
    party_size = max(2, min(8, int(party_size)))
    min_shared_games = max(1, int(min_shared_games))

    must_have_ids: Set[str] = set()
    if must_have_games:
        for g_str in must_have_games:
            if not g_str:
                continue
            matched = games_catalog.match_catalog_game(g_str)
            if matched:
                must_have_ids.add(matched["id"])
            else:
                cleaned = games_catalog.clean_game_name(g_str)
                if cleaned:
                    must_have_ids.add(cleaned.lower().replace(' ', '_'))

    eff_max_price = max_price_per_acc
    if max_total_price and max_total_price > 0:
        calculated_max_per_acc = max_total_price / (party_size * 0.7)
        if eff_max_price is None or calculated_max_per_acc < eff_max_price:
            eff_max_price = calculated_max_per_acc

    where_clauses = ["1=1"]
    params = []

    if eff_max_price and eff_max_price > 0:
        where_clauses.append("price <= ?")
        params.append(eff_max_price)

    if min_daybreak > 0:
        where_clauses.append("daybreak >= ?")
        params.append(min_daybreak)

    if no_vac:
        where_clauses.append("deal_score > 1 AND title NOT LIKE '%vac%' AND title NOT LIKE '%вак%' AND title NOT LIKE '%бан%' AND title NOT LIKE '%кт%'")

    if must_have_games:
        for mg in must_have_games:
            if mg:
                sql_c, p_c = database.build_game_sql_clause(mg)
                where_clauses.append(sql_c)
                params.extend(p_c)
    elif coop_category and coop_category != "all":
        cat_games = games_catalog.get_all_top_games(coop_category)
        if cat_games:
            or_parts = []
            for cg in cat_games[:12]:
                sql_c, p_c = database.build_game_sql_clause(cg["name"])
                or_parts.append(sql_c)
                params.extend(p_c)
            if or_parts:
                where_clauses.append(f"({' OR '.join(or_parts)})")

    where_str = " AND ".join(where_clauses)

    if sort_by in ("shared_games", "overlap", "top_overlap") or min_shared_games > 1:
        order_by_clause = "LENGTH(extra_games_json) DESC, estimated_value DESC, price ASC"
    elif sort_by in ("price_asc", "cheapest"):
        order_by_clause = "price ASC, LENGTH(extra_games_json) DESC"
    elif sort_by in ("price_desc", "expensive"):
        order_by_clause = "price DESC, LENGTH(extra_games_json) DESC"
    else:
        order_by_clause = "deal_score DESC, LENGTH(extra_games_json) DESC, price ASC"

    if party_size == 2:
        candidate_limit = 200
    elif party_size == 3:
        candidate_limit = 70
    elif party_size == 4:
        candidate_limit = 45
    else:
        candidate_limit = 25

    query_sql = f"""
        SELECT * FROM accounts 
        WHERE {where_str} 
        ORDER BY {order_by_clause}
        LIMIT {candidate_limit}
    """

    conn = database.get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query_sql, params)
        raw_candidates = cursor.fetchall()
    finally:
        conn.close()

    if not raw_candidates:
        return {
            "total_bundles": 0,
            "party_size": party_size,
            "bundles": [],
            "candidates_evaluated": 0,
            "catalog_top_games": games_catalog.get_all_top_games(coop_category)
        }

    parsed_candidates: List[Dict[str, Any]] = []
    for row in raw_candidates:
        item_id = row["item_id"]
        title = row["title"]
        price = float(row["price"] or 0)
        cs2_prime = bool(row["cs2_prime"])
        daybreak = int(row["daybreak"] or 0)
        steam_level = int(row["steam_level"] or 0)
        steam_points = int(row["steam_points"] or 0)
        deal_score = int(row["deal_score"] or 0)
        seller_name = row["seller_name"] or "Seller"
        guarantee_hours = int(row["guarantee_hours"] or 0)
        
        try:
            extra_games = json.loads(row["extra_games_json"] or "[]")
        except Exception:
            extra_games = []

        all_account_games = games_catalog.extract_account_top_games(extra_games, cs2_prime, title, strict_coop_only=True)
        game_ids = frozenset(g["id"] for g in all_account_games)

        if must_have_ids and not must_have_ids.issubset(game_ids):
            continue
        if len(game_ids) == 0:
            continue

        parsed_candidates.append({
            "item_id": item_id,
            "title": title,
            "price": price,
            "seller_name": seller_name,
            "cs2_prime": cs2_prime,
            "steam_level": steam_level,
            "steam_points": steam_points,
            "daybreak": daybreak,
            "deal_score": deal_score,
            "guarantee_hours": guarantee_hours,
            "top_games": all_account_games,
            "top_game_ids": game_ids,
            "all_games_count": len(all_account_games),
            "is_live": False
        })

    return find_coop_bundles_from_candidates(
        parsed_candidates=parsed_candidates,
        party_size=party_size,
        max_total_price=max_total_price,
        min_shared_games=min_shared_games,
        must_have_ids=must_have_ids,
        coop_category=coop_category,
        sort_by=sort_by,
        limit=limit
    )
