#!/usr/bin/env python3
"""
LZT Smart Analyzer — Advanced Multi-Stream Harvester & Real-Time Live Search
Continuously synchronizes active market listings into SQLite and provides live on-demand proxying.
"""

import threading
import time
import urllib.request
import urllib.parse
import json
import ssl
import os
import math
import concurrent.futures
from typing import Dict, Any, List, Optional, Tuple
import database
import games_catalog

SSL_CTX = ssl._create_unverified_context()

class LZTIndexer:
    def __init__(self):
        self.is_running = False
        self.should_stop = False
        self.mode = "smart_stream"  # "smart_stream", "targeted", "sniper"
        self.current_target = ""
        self.current_page = 1
        self.total_pages_scanned = 0
        self.total_items_indexed = 0
        self.status = "idle"
        self.last_error = ""
        self.start_time = None
        self._thread = None
        self._lock = threading.Lock()
        
        database.init_db()

    def get_token(self) -> str:
        token_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "token.txt")
        if os.path.exists(token_path):
            try:
                return open(token_path, "r", encoding="utf-8").read().strip()
            except Exception:
                pass
        return ""

    def start(self, mode: str = "smart_stream"):
        with self._lock:
            if self.is_running:
                return
            self.is_running = True
            self.should_stop = False
            self.mode = mode
            self.status = f"running_{mode}"
            self.start_time = time.time()
            self._thread = threading.Thread(target=self._run_loop, daemon=True)
            self._thread.start()

    def start_targeted_harvest(self, query_params: Dict[str, Any], max_pages: int = 100):
        """Starts a background targeted harvester that scrapes all pages matching the exact user query into SQLite."""
        self.stop()
        time.sleep(0.2)
        with self._lock:
            self.is_running = True
            self.should_stop = False
            self.mode = "targeted_harvest"
            self.status = "running_targeted"
            self.start_time = time.time()
            self.total_pages_scanned = 0
            self.total_items_indexed = 0
            self.current_page = 1
            self.current_target = f"🎯 Глубокий сбор страниц по фильтрам..."
            self._thread = threading.Thread(target=self._run_targeted_harvest_loop, args=(query_params, max_pages), daemon=True)
            self._thread.start()

    def _run_targeted_harvest_loop(self, params_dict: Dict[str, Any], max_pages: int):
        token = self.get_token()
        if not token:
            with self._lock:
                self.last_error = "Нет токена в token.txt"
                self.status = "error"
                self.is_running = False
            return

        base_params = ["per_page=40"]
        games = params_dict.get("games", [])
        if isinstance(games, str):
            games = [g.strip() for g in games.split(',') if g.strip()]

        for g in games:
            if not g:
                continue
            app_id = games_catalog.get_game_app_id(g)
            if app_id:
                base_params.append(f"game[]={app_id}")
            else:
                base_params.append(f"title={urllib.parse.quote(g)}")

        if params_dict.get("cs2_prime"):
            if not any("game[]=730" in p for p in base_params):
                base_params.append("game[]=730")
            base_params.append("cs2_prime=1")

        if params_dict.get("pmin"):
            base_params.append(f"pmin={int(params_dict['pmin'])}")
        if params_dict.get("pmax"):
            base_params.append(f"pmax={int(params_dict['pmax'])}")
        if params_dict.get("daybreak"):
            base_params.append(f"daybreak={int(params_dict['daybreak'])}")
        if params_dict.get("max_hours_2w") is not None and float(params_dict["max_hours_2w"]) < 100:
            base_params.append(f"steam_hours_played_recently_max={float(params_dict['max_hours_2w'])}")
        if params_dict.get("min_level"):
            base_params.append(f"lmin={int(params_dict['min_level'])}")
        if params_dict.get("max_level"):
            base_params.append(f"lmax={int(params_dict['max_level'])}")
        if params_dict.get("min_points"):
            base_params.append(f"points_min={int(params_dict['min_points'])}")
        if params_dict.get("max_points"):
            base_params.append(f"points_max={int(params_dict['max_points'])}")
        if params_dict.get("item_origin") and params_dict["item_origin"] != "any":
            base_params.append(f"item_origin[]={params_dict['item_origin']}")
        if params_dict.get("email_type") and params_dict["email_type"] != "any":
            et = params_dict["email_type"]
            if et in ("temp", "market", "temporary"):
                base_params.append("email_type[]=market")
                base_params.append("email_type[]=temp")
            elif et == "native":
                base_params.append("email_type[]=native")

        order_by = params_dict.get("order_by", "price_to_up")
        base_params.append(f"order_by={order_by}")

        # Step 1: Fetch Page 1 synchronously to retrieve exact total accounts count
        query_str_p1 = "&".join(["page=1"] + base_params)
        url_p1 = f"https://prod-api.lzt.market/steam?{query_str_p1}"
        items_p1, code_p1, err_p1, total_reported = self._fetch_lzt_api(url_p1, token)

        if code_p1 == 200 and items_p1:
            database.upsert_accounts_batch(items_p1, category="steam")
            with self._lock:
                self.total_items_indexed += len(items_p1)
                self.total_pages_scanned += 1
                self.current_page = 1
                self.current_target = f"⚡ Параллельный сбор: {self.total_items_indexed} / ~{total_reported or len(items_p1)} аккаунтов (Стр. 1)"
        elif code_p1 != 200 and not items_p1:
            with self._lock:
                self.last_error = f"Ошибка API: {err_p1 or code_p1}"
                self.is_running = False
                self.status = "error"
            return

        if total_reported > 0:
            target_pages = min(max_pages, max(1, math.ceil(total_reported / 40)))
        else:
            target_pages = max_pages

        # Step 2: Multi-threaded Parallel Fetching (6 parallel worker threads)
        if target_pages > 1 and not self.should_stop:
            pages_to_fetch = list(range(2, target_pages + 1))
            
            def fetch_worker(page_num: int):
                if self.should_stop:
                    return
                q_str = "&".join([f"page={page_num}"] + base_params)
                page_url = f"https://prod-api.lzt.market/steam?{q_str}"
                
                for attempt in range(3):
                    if self.should_stop:
                        return
                    items, code, err, _ = self._fetch_lzt_api(page_url, token)
                    if code == 200:
                        if items:
                            database.upsert_accounts_batch(items, category="steam")
                            with self._lock:
                                self.total_items_indexed += len(items)
                                self.total_pages_scanned += 1
                                self.current_page = page_num
                                self.current_target = f"⚡ Параллельный сбор (x6 потоков): {self.total_items_indexed} / ~{total_reported or '...'} акк ({self.total_pages_scanned}/{target_pages} стр)"
                        break
                    elif code == 429:
                        time.sleep(2.5 + (attempt * 1.5))
                    else:
                        time.sleep(0.5)
                        break

            with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
                futures = [executor.submit(fetch_worker, p) for p in pages_to_fetch]
                concurrent.futures.wait(futures)

        with self._lock:
            self.is_running = False
            self.status = "completed"
            self.current_target = f"✅ Выгружено {self.total_items_indexed} аккаунтов в базу ({self.total_pages_scanned} стр)"

    def stop(self):
        with self._lock:
            self.should_stop = True
            self.status = "paused"

    def get_status_dict(self) -> Dict[str, Any]:
        with self._lock:
            db_count = database.get_cached_count()
            elapsed = (time.time() - self.start_time) if (self.start_time and self.is_running) else 0
            speed = round(self.total_items_indexed / elapsed, 1) if elapsed > 0 else 0
            return {
                "is_running": self.is_running,
                "status": self.status,
                "mode": self.mode,
                "current_target": self.current_target,
                "current_page": self.current_page,
                "total_pages_scanned": self.total_pages_scanned,
                "total_items_indexed": self.total_items_indexed,
                "total_in_db": db_count,
                "speed_items_sec": speed,
                "last_error": self.last_error
            }

    def _fetch_lzt_api(self, url: str, token: str) -> Tuple[List[Dict[str, Any]], int, str, int]:
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        if token:
            req.add_header('Authorization', f"Bearer {token}")

        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=12) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    items = data.get("items", [])
                    total = data.get("totalItems", len(items))
                    return (items, 200, "", total)
                else:
                    return ([], resp.status, f"HTTP {resp.status}", 0)
        except urllib.error.HTTPError as e:
            return ([], e.code, str(e.reason), 0)
        except Exception as e:
            return ([], 500, str(e), 0)

    def _run_loop(self):
        print(f"[*] Smart LZT Harvester started in '{self.mode}' mode...")
        
        top_games_to_harvest = [
            g for g in games_catalog.TOP_COOP_CATALOG 
            if g.get("is_paid", True) and g.get("app_id")
        ]
        # Tiered harvesting lists
        points_thresholds = [1000000, 500000, 200000, 100000, 50000, 20000, 10000, 5000]
        level_thresholds = [100, 50, 30, 20, 10]

        while not self.should_stop:
            token = self.get_token()
            if not token:
                with self._lock:
                    self.last_error = "Token is missing in token.txt"
                    self.status = "error"
                    self.is_running = False
                print("[!] No token found in token.txt. Pausing harvester.")
                break

            # STREAM 1: Fresh Sniper Stream (Newest Listings)
            if not self.should_stop:
                with self._lock:
                    self.current_target = "⏱ Снайпер новинок маркета"
                for p in range(1, 4):
                    if self.should_stop:
                        break
                    with self._lock:
                        self.current_page = p
                    url = f"https://prod-api.lzt.market/steam?order_by=pdate_to_down&page={p}&per_page=40"
                    items, code, err, _ = self._fetch_lzt_api(url, token)
                    if code == 200 and items:
                        database.upsert_accounts_batch(items, category="steam")
                        with self._lock:
                            self.total_items_indexed += len(items)
                            self.total_pages_scanned += 1
                    elif code == 429:
                        time.sleep(4.0)
                    time.sleep(0.35)

            # STREAM 2: Tiered Steam Points Hunter (1M -> 500k -> 200k -> 100k -> 50k -> 20k -> 10k -> 5k)
            if not self.should_stop:
                for pts in points_thresholds:
                    if self.should_stop:
                        break
                    with self._lock:
                        self.current_target = f"✨ Топ очков Steam (>= {pts:,} pts)"
                        self.current_page = 1
                    url = f"https://prod-api.lzt.market/steam?points_min={pts}&order_by=price_to_up&per_page=40"
                    items, code, err, _ = self._fetch_lzt_api(url, token)
                    if code == 200 and items:
                        database.upsert_accounts_batch(items, category="steam")
                        with self._lock:
                            self.total_items_indexed += len(items)
                            self.total_pages_scanned += 1
                    elif code == 429:
                        time.sleep(4.0)
                    time.sleep(0.35)

            # STREAM 3: Tiered Steam Level Hunter (100 -> 50 -> 30 -> 20 -> 10 lvl)
            if not self.should_stop:
                for lvl in level_thresholds:
                    if self.should_stop:
                        break
                    with self._lock:
                        self.current_target = f"⭐ Топ уровней Steam (>= {lvl} lvl)"
                        self.current_page = 1
                    url = f"https://prod-api.lzt.market/steam?lmin={lvl}&order_by=price_to_up&per_page=40"
                    items, code, err, _ = self._fetch_lzt_api(url, token)
                    if code == 200 and items:
                        database.upsert_accounts_batch(items, category="steam")
                        with self._lock:
                            self.total_items_indexed += len(items)
                            self.total_pages_scanned += 1
                    elif code == 429:
                        time.sleep(4.0)
                    time.sleep(0.35)

            # STREAM 4: Targeted Top Co-op Games
            for game_entry in top_games_to_harvest[:25]:
                if self.should_stop:
                    break

                app_id = game_entry["app_id"]
                game_name = game_entry["name"]
                
                with self._lock:
                    self.current_target = f"🎮 {game_name} (AppID {app_id})"

                for page in range(1, 3):
                    if self.should_stop:
                        break
                    with self._lock:
                        self.current_page = page

                    url = f"https://prod-api.lzt.market/steam?game[]={app_id}&order_by=price_to_up&page={page}&per_page=40"
                    items, code, err, _ = self._fetch_lzt_api(url, token)

                    if code == 200 and items:
                        database.upsert_accounts_batch(items, category="steam")
                        with self._lock:
                            self.total_items_indexed += len(items)
                            self.total_pages_scanned += 1
                        time.sleep(0.35)
                    elif code == 429:
                        time.sleep(4.0)
                    else:
                        time.sleep(0.5)

            # STREAM 5: Cheap CS2 Prime & Bargain Deals
            if not self.should_stop:
                with self._lock:
                    self.current_target = "🔫 CS2 Prime дешевые лоты"
                    self.current_page = 1
                url = "https://prod-api.lzt.market/steam?game[]=730&order_by=price_to_up&page=1&per_page=40"
                items, code, err, _ = self._fetch_lzt_api(url, token)
                if code == 200 and items:
                    database.upsert_accounts_batch(items, category="steam")
                    with self._lock:
                        self.total_items_indexed += len(items)
                        self.total_pages_scanned += 1
                time.sleep(1.0)

        with self._lock:
            self.is_running = False
            self.status = "idle"
            print("[*] Smart LZT Harvester stopped.")


# Global instance
INDEXER_INSTANCE = LZTIndexer()

def fetch_live_market_search(
    game: Optional[str] = None,
    games: Optional[List[str]] = None,
    pmin: Optional[float] = None,
    pmax: Optional[float] = None,
    daybreak: Optional[int] = None,
    max_hours_2w: Optional[float] = None,
    min_points: Optional[int] = None,
    max_points: Optional[int] = None,
    min_level: Optional[int] = None,
    max_level: Optional[int] = None,
    min_potential_level: Optional[int] = None,
    max_potential_level: Optional[int] = None,
    min_score: Optional[int] = None,
    cs2_prime: bool = False,
    no_vac: bool = True,
    email_type: Optional[str] = None,
    item_origin: Optional[str] = None,
    hide_phishing: bool = False,
    guarantee: Optional[str] = None,
    query: Optional[str] = None,
    order_by: str = "pdate_to_down",
    page: int = 1
) -> Dict[str, Any]:
    """
    Direct on-demand search against prod-api.lzt.market.
    Returns live matching listings directly from LZT with guaranteed active availability.
    """
    token_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'token.txt')
    token = ""
    if os.path.exists(token_path):
        try:
            token = open(token_path, 'r', encoding='utf-8').read().strip()
        except Exception:
            pass

    params = [f"page={page}", "per_page=40"]
    
    target_games = []
    if games:
        target_games.extend(games)
    elif game:
        target_games.append(game)

    for g_str in target_games:
        if not g_str:
            continue
        app_id = games_catalog.get_game_app_id(g_str)
        if app_id:
            params.append(f"game[]={app_id}")
        else:
            params.append(f"title={urllib.parse.quote(g_str)}")

    if query and query.strip():
        params.append(f"title={urllib.parse.quote(query.strip())}")

    if cs2_prime:
        if not any('730' in p for p in params):
            params.append("game[]=730")
        params.append("cs2_prime=1")

    if min_points and min_points > 0:
        params.append(f"points_min={int(min_points)}")
    if max_points and max_points > 0:
        params.append(f"points_max={int(max_points)}")

    if min_level and min_level > 0:
        params.append(f"lmin={int(min_level)}")
    if max_level and max_level > 0:
        params.append(f"lmax={int(max_level)}")

    if pmin and pmin > 0:
        params.append(f"pmin={int(pmin)}")
    if pmax and pmax > 0:
        params.append(f"pmax={int(pmax)}")
    if daybreak and daybreak > 0:
        params.append(f"daybreak={int(daybreak)}")

    if max_hours_2w is not None and float(max_hours_2w) < 100:
        params.append(f"steam_hours_played_recently_max={float(max_hours_2w)}")

    if item_origin and item_origin.lower() not in ("any", "all", "", "none"):
        io_lower = item_origin.lower().strip()
        params.append(f"item_origin[]={io_lower}")

    if email_type and email_type.lower() not in ("any", "all", "", "none"):
        et_lower = email_type.lower().strip()
        if et_lower in ("temp", "market", "temporary"):
            params.append("email_type[]=market")
            params.append("email_type[]=temp")
        elif et_lower == "native":
            params.append("email_type[]=native")
        elif et_lower == "autoreg":
            params.append("email_type[]=autoreg")
        elif et_lower == "no":
            params.append("email_type[]=no")

    if guarantee and guarantee.lower() not in ("any", "all", "", "none"):
        g_low = guarantee.lower().strip()
        if g_low in ("24", "12", "72"):
            params.append(f"guarantee={g_low}")

    # Smart ordering mappings for LZT API
    if order_by in ("price_to_up", "price_asc", "cheapest"):
        params.append("order_by=price_to_up")
    elif order_by in ("price_to_down", "price_desc", "expensive"):
        params.append("order_by=price_to_down")
    elif order_by in ("points_desc", "points_value_desc"):
        if not min_points:
            params.append("points_min=5000")
        params.append("order_by=price_to_up")
    elif order_by in ("potential_level_desc", "pot_level_desc", "potential_level_value_desc", "pot_level_ratio"):
        if not min_points:
            params.append("points_min=1000")
        params.append("order_by=price_to_up")
    elif order_by in ("level_desc", "level_value_desc"):
        if not min_level:
            params.append("lmin=20")
        params.append("order_by=price_to_up")
    elif order_by in ("value_ratio_desc", "ratio_desc", "estimated_value_desc"):
        params.append("order_by=price_to_up")
    elif order_by in ("pdate_to_down", "newest", "recent"):
        params.append("order_by=pdate_to_down")
    else:
        params.append("order_by=pdate_to_down")

    base_params = [p for p in params if not p.startswith("page=")]
    target_page = page
    formatted_items = []
    total_items = 0

    # Auto multi-page harvester for filtered queries (e.g. 0.0h activity, aging, high score, hide phishing)
    needs_multi_page = (max_hours_2w is not None and float(max_hours_2w) < 100) or (min_score and min_score > 50) or (daybreak and daybreak > 0) or (email_type and email_type != "any") or hide_phishing
    max_pages_to_scan = 4 if needs_multi_page else 1

    for p_idx in range(max_pages_to_scan):
        curr_page = target_page + p_idx
        cur_params = [f"page={curr_page}"] + base_params
        query_str = "&".join(cur_params)
        url = f"https://prod-api.lzt.market/steam?{query_str}"

        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        if token:
            req.add_header('Authorization', f"Bearer {token}")

        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=12) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    raw_items = data.get("items", [])
                    if total_items == 0:
                        total_items = data.get("totalItems", len(raw_items))

                    if raw_items:
                        database.upsert_accounts_batch(raw_items, category="steam")

                    for item in raw_items:
                        # Verify state is active
                        if item.get("item_state") and item.get("item_state") != "active":
                            continue
                        parsed = database.parse_raw_account(item, category="steam")
                        if no_vac and parsed["deal_score"] <= 1:
                            continue
                        if cs2_prime and not parsed.get("cs2_prime"):
                            continue
                        if min_score and parsed.get("deal_score", 0) < min_score:
                            continue
                        if max_hours_2w is not None and float(max_hours_2w) < 100:
                            h2w = float(parsed.get("hours_2weeks") or 0)
                            if h2w > float(max_hours_2w):
                                continue
                        if daybreak and daybreak > 0:
                            if (parsed.get("daybreak") or 0) < daybreak:
                                continue
                        if min_level and min_level > 0:
                            if (parsed.get("steam_level") or 0) < min_level:
                                continue
                        if max_level and max_level > 0:
                            if (parsed.get("steam_level") or 0) > max_level:
                                continue
                        if min_points and min_points > 0:
                            if (parsed.get("steam_points") or 0) < min_points:
                                continue
                        if max_points and max_points > 0:
                            if (parsed.get("steam_points") or 0) > max_points:
                                continue
                        if min_potential_level and min_potential_level > 0:
                            if (parsed.get("potential_level") or 0) < min_potential_level:
                                continue
                        if max_potential_level and max_potential_level > 0:
                            if (parsed.get("potential_level") or 0) > max_potential_level:
                                continue

                        # Phishing filter
                        if hide_phishing:
                            p_orig = str(parsed.get("item_origin", "")).lower()
                            r_orig = str(parsed.get("resale_item_origin", "")).lower()
                            p_phrase = str(parsed.get("item_origin_phrase", "")).lower()
                            p_title = str(parsed.get("title", "")).lower()
                            if p_orig == "fishing" or r_orig == "fishing" or "phishing" in p_phrase or "fishing" in p_phrase or "фишинг" in p_title:
                                continue

                        # Origin filter
                        if item_origin and item_origin.lower() not in ("any", "all", "", "none"):
                            req_orig = item_origin.lower().strip()
                            p_orig = str(parsed.get("item_origin", "")).lower()
                            r_orig = str(parsed.get("resale_item_origin", "")).lower()
                            p_phrase = str(parsed.get("item_origin_phrase", "")).lower()
                            p_title = str(parsed.get("title", "")).lower()
                            if req_orig == "personal" and not (p_orig == "personal" or parsed.get("is_personal_account") or "personal" in p_phrase or "личн" in p_title):
                                continue
                            elif req_orig == "stealer" and not (p_orig == "stealer" or r_orig == "stealer" or "stealer" in p_phrase or "стиллер" in p_title):
                                continue
                            elif req_orig == "fishing" and not (p_orig == "fishing" or r_orig == "fishing" or "phishing" in p_phrase or "fishing" in p_phrase or "фишинг" in p_title):
                                continue
                            elif req_orig == "autoreg" and not (p_orig == "autoreg" or "autoreg" in p_phrase or "авторег" in p_title):
                                continue
                            elif req_orig == "resale" and not (p_orig == "resale" or "resale" in p_phrase or "перепродажа" in p_title):
                                continue
                            elif req_orig == "brute" and not (p_orig == "brute" or "brute" in p_phrase or "брут" in p_title):
                                continue

                        if email_type and email_type.lower() not in ("any", "all", "", "none"):
                            et = str(parsed.get("email_type", "")).lower()
                            et_req = email_type.lower().strip()
                            t_low = parsed.get("title", "").lower()
                            if et_req == "native" and et != "native" and "родн" not in t_low and "native" not in t_low:
                                continue
                            elif et_req == "autoreg" and et != "autoreg" and parsed.get("email_provider") not in ("firstmail", "rambler") and "авторег" not in t_low:
                                continue
                            elif et_req in ("temp", "market", "temporary") and et not in ("temp", "market", "temporary") and "времен" not in t_low:
                                continue
                            elif et_req == "no" and et != "no" and "без почты" not in t_low:
                                continue
                        parsed["is_live"] = True
                        formatted_items.append(parsed)

                    # If we found enough items for a full page or reached the end of market listings, break
                    if len(formatted_items) >= 20 or len(raw_items) == 0:
                        break
                else:
                    break
        except Exception as e:
            print(f"[!] Live search page {curr_page} error: {e}")
            break

    # In-memory secondary quant sorting
    if order_by in ("score", "deal_score"):
        formatted_items.sort(key=lambda x: x.get("deal_score", 0), reverse=True)
    elif order_by in ("potential_level_value_desc", "pot_level_ratio", "pot_level_rub_desc"):
        formatted_items.sort(key=lambda x: (x.get("potential_level", 0) / max(x.get("price", 1), 1.0)), reverse=True)
    elif order_by in ("potential_level_desc", "pot_level_desc"):
        formatted_items.sort(key=lambda x: x.get("potential_level", 0), reverse=True)
    elif order_by in ("level_value_desc", "level_rub_desc", "level_per_rub"):
        formatted_items.sort(key=lambda x: (x.get("steam_level", 0) / max(x.get("price", 1), 1.0)), reverse=True)
    elif order_by in ("level_desc", "steam_level_desc"):
        formatted_items.sort(key=lambda x: x.get("steam_level", 0), reverse=True)
    elif order_by in ("level_asc", "steam_level_asc"):
        formatted_items.sort(key=lambda x: x.get("steam_level", 0), reverse=False)
    elif order_by in ("points_value_desc", "points_rub_desc", "points_per_rub"):
        formatted_items.sort(key=lambda x: (x.get("steam_points", 0) / max(x.get("price", 1), 1.0)), reverse=True)
    elif order_by in ("points_desc", "steam_points_desc"):
        formatted_items.sort(key=lambda x: x.get("steam_points", 0), reverse=True)
    elif order_by in ("points_asc", "steam_points_asc"):
        formatted_items.sort(key=lambda x: x.get("steam_points", 0), reverse=False)
    elif order_by in ("value_ratio_desc", "ratio_desc", "ratio"):
        formatted_items.sort(key=lambda x: x.get("value_ratio", 0), reverse=True)
    elif order_by in ("estimated_value_desc", "games_value"):
        formatted_items.sort(key=lambda x: x.get("estimated_value", 0), reverse=True)
    elif order_by in ("daybreak_desc",):
        formatted_items.sort(key=lambda x: x.get("daybreak", 0), reverse=True)
    elif order_by in ("daybreak_asc",):
        formatted_items.sort(key=lambda x: x.get("daybreak", 0), reverse=False)
    elif order_by in ("price_asc", "price_to_up"):
        formatted_items.sort(key=lambda x: x.get("price", 0), reverse=False)
    elif order_by in ("price_desc", "price_to_down"):
        formatted_items.sort(key=lambda x: x.get("price", 0), reverse=True)
    elif order_by in ("recent", "pdate_to_down", "newest", "updated_at"):
        formatted_items.sort(key=lambda x: x.get("updated_at", 0) or x.get("item_id", 0), reverse=True)

    return {
        "success": True,
        "total": total_items,
        "page": page,
        "count": len(formatted_items),
        "items": formatted_items
    }
