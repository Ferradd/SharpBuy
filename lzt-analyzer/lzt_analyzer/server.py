#!/usr/bin/env python3
"""
LZT Market Smart Analyzer — Local Server & API Proxy + DB Search Engine
Serves static web files, proxies requests to prod-api.lzt.market, handles SQLite search,
runs background targeted harvesters, and performs on-demand live LZT searches.
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import ssl
from typing import Tuple, List, Dict, Any, Optional
import database
import indexer
import games_catalog
import bundle_matcher

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# SSL unverified context
SSL_CTX = ssl._create_unverified_context()

# Ensure DB is ready
database.init_db()

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/indexer/start' or parsed.path == '/api/indexer/start_targeted':
            indexer.INDEXER_INSTANCE.start(mode="targeted")
            self._send_json({"status": "started", "indexer": indexer.INDEXER_INSTANCE.get_status_dict()})
        elif parsed.path == '/api/indexer/start_sniper':
            indexer.INDEXER_INSTANCE.start(mode="sniper")
            self._send_json({"status": "started", "indexer": indexer.INDEXER_INSTANCE.get_status_dict()})
        elif parsed.path == '/api/indexer/stop':
            indexer.INDEXER_INSTANCE.stop()
            self._send_json({"status": "stopped", "indexer": indexer.INDEXER_INSTANCE.get_status_dict()})
        elif parsed.path == '/api/token/save':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                payload = json.loads(post_data.decode('utf-8'))
                new_token = payload.get('token', '').strip()
                if new_token:
                    token_path = os.path.join(DIRECTORY, 'token.txt')
                    with open(token_path, 'w', encoding='utf-8') as f:
                        f.write(new_token)
                    self._send_json({"status": "ok", "token": new_token})
                else:
                    self._send_json({"error": "empty token"}, 400)
            except Exception as e:
                self._send_json({"error": str(e)}, 500)
        else:
            self.send_error(404, "Endpoint not found")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/api/proxy/'):
            self.handle_api_proxy(parsed)
        elif parsed.path == '/api/live_search':
            self.handle_live_search(parsed)
        elif parsed.path == '/api/db/search':
            self.handle_db_search(parsed)
        elif parsed.path in ('/api/bundle/search', '/api/bundles'):
            self.handle_bundle_search(parsed)
        elif parsed.path == '/api/top_games':
            self._send_json({"games": games_catalog.get_all_top_games()})
        elif parsed.path == '/api/check_item':
            params = urllib.parse.parse_qs(parsed.query)
            item_id = int(params.get('item_id', [0])[0])
            token_path = os.path.join(DIRECTORY, 'token.txt')
            saved_token = open(token_path, 'r', encoding='utf-8').read().strip() if os.path.exists(token_path) else ""
            is_active, state = self.validate_single_item(item_id, saved_token)
            if not is_active and state in ("paid", "sold", "deleted", "closed"):
                database.delete_account(item_id)
            self._send_json({"item_id": item_id, "is_active": is_active, "state": state})
        elif parsed.path == '/api/indexer/status':
            self._send_json(indexer.INDEXER_INSTANCE.get_status_dict())
        elif parsed.path == '/api/indexer/start':
            indexer.INDEXER_INSTANCE.start("smart_stream")
            self._send_json({"status": "started", "indexer": indexer.INDEXER_INSTANCE.get_status_dict()})
        elif parsed.path == '/api/indexer/stop':
            indexer.INDEXER_INSTANCE.stop()
            self._send_json({"status": "stopped", "indexer": indexer.INDEXER_INSTANCE.get_status_dict()})
        elif parsed.path == '/api/indexer/harvest_target':
            params = urllib.parse.parse_qs(parsed.query)
            raw_games = params.get('game', []) + params.get('game_titles', [])
            games = []
            for g in raw_games:
                if ',' in g:
                    games.extend([x.strip() for x in g.split(',') if x.strip()])
                elif g.strip():
                    games.append(g.strip())

            max_pages = int(params.get('max_pages', [50])[0])
            query_dict = {
                "games": games,
                "cs2_prime": params.get('cs2_prime', ['0'])[0] in ('1', 'true', 'True'),
                "pmin": float(params['min_price'][0]) if 'min_price' in params and params['min_price'][0] else None,
                "pmax": float(params['max_price'][0]) if 'max_price' in params and params['max_price'][0] else None,
                "daybreak": int(params['min_daybreak'][0]) if 'min_daybreak' in params and params['min_daybreak'][0] else None,
                "max_hours_2w": float(params['max_hours_2w'][0]) if 'max_hours_2w' in params and params['max_hours_2w'][0] != '' else None,
                "min_level": int(params['min_level'][0]) if 'min_level' in params and params['min_level'][0] else None,
                "max_level": int(params['max_level'][0]) if 'max_level' in params and params['max_level'][0] else None,
                "min_points": int(params['min_points'][0]) if 'min_points' in params and params['min_points'][0] else None,
                "max_points": int(params['max_points'][0]) if 'max_points' in params and params['max_points'][0] else None,
                "min_potential_level": int(params['min_pot_level'][0]) if 'min_pot_level' in params and params['min_pot_level'][0] else (int(params['min_potential_level'][0]) if 'min_potential_level' in params and params['min_potential_level'][0] else None),
                "max_potential_level": int(params['max_pot_level'][0]) if 'max_pot_level' in params and params['max_pot_level'][0] else (int(params['max_potential_level'][0]) if 'max_potential_level' in params and params['max_potential_level'][0] else None),
                "item_origin": params.get('item_origin', ['any'])[0],
                "email_type": params.get('email_type', ['any'])[0],
                "order_by": params.get('sort', ['price_to_up'])[0]
            }
            indexer.INDEXER_INSTANCE.start_targeted_harvest(query_dict, max_pages=max_pages)
            self._send_json({"status": "harvesting_started", "indexer": indexer.INDEXER_INSTANCE.get_status_dict()})
        elif parsed.path == '/api/db/purge_stale':
            params = urllib.parse.parse_qs(parsed.query)
            days = int(params.get('days', [14])[0])
            deleted = database.purge_stale_accounts(days_old=days)
            self._send_json({"status": "ok", "deleted_count": deleted, "remaining_count": database.get_cached_count()})
        elif parsed.path == '/api/token':
            token_path = os.path.join(DIRECTORY, 'token.txt')
            saved_token = ""
            if os.path.exists(token_path):
                try:
                    saved_token = open(token_path, 'r', encoding='utf-8').read().strip()
                except Exception:
                    pass
            self._send_json({"token": saved_token})
        else:
            super().do_GET()

    def _send_json(self, data, status_code=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def validate_single_item(self, item_id: int, token: str) -> Tuple[bool, str]:
        if not item_id:
            return False, "invalid_id"
        url = f"https://prod-api.lzt.market/{item_id}"
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        if token:
            req.add_header('Authorization', f"Bearer {token}")
        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=4) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    item_obj = data.get("item", {})
                    state = item_obj.get("item_state", "unknown")
                    can_buy = data.get("canBuyItem", False)
                    is_active = (state == "active" or can_buy)
                    return is_active, state
                elif resp.status in (404, 410):
                    return False, "deleted"
                else:
                    return False, f"http_{resp.status}"
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return False, "deleted"
            return False, f"http_{e.code}"
        except Exception:
            return True, "unknown"

    def handle_live_search(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        raw_games = params.get('game', []) + params.get('game_titles', [])
        games = []
        for g in raw_games:
            if ',' in g:
                games.extend([x.strip() for x in g.split(',') if x.strip()])
            elif g.strip():
                games.append(g.strip())

        pmin = float(params['min_price'][0]) if 'min_price' in params and params['min_price'][0] else None
        pmax = float(params['max_price'][0]) if 'max_price' in params and params['max_price'][0] else None
        daybreak = int(params['min_daybreak'][0]) if 'min_daybreak' in params and params['min_daybreak'][0] else None
        max_hours_2w = float(params['max_hours_2w'][0]) if 'max_hours_2w' in params and params['max_hours_2w'][0] != '' else (float(params['hours_2weeks'][0]) if 'hours_2weeks' in params and params['hours_2weeks'][0] != '' else None)
        min_points = int(params['min_points'][0]) if 'min_points' in params and params['min_points'][0] else (int(params['points_min'][0]) if 'points_min' in params and params['points_min'][0] else None)
        max_points = int(params['max_points'][0]) if 'max_points' in params and params['max_points'][0] else (int(params['points_max'][0]) if 'points_max' in params and params['points_max'][0] else None)
        min_level = int(params['min_level'][0]) if 'min_level' in params and params['min_level'][0] else (int(params['level_min'][0]) if 'level_min' in params and params['level_min'][0] else None)
        max_level = int(params['max_level'][0]) if 'max_level' in params and params['max_level'][0] else (int(params['level_max'][0]) if 'level_max' in params and params['level_max'][0] else None)
        min_pot_level = int(params['min_pot_level'][0]) if 'min_pot_level' in params and params['min_pot_level'][0] else (int(params['min_potential_level'][0]) if 'min_potential_level' in params and params['min_potential_level'][0] else None)
        max_pot_level = int(params['max_pot_level'][0]) if 'max_pot_level' in params and params['max_pot_level'][0] else (int(params['max_potential_level'][0]) if 'max_potential_level' in params and params['max_potential_level'][0] else None)
        min_score = int(params['min_score'][0]) if 'min_score' in params and params['min_score'][0] else None
        cs2_prime = params.get('cs2_prime', ['0'])[0] in ('1', 'true', 'True')
        no_vac = params.get('no_vac', ['1'])[0] in ('1', 'true', 'True')
        email_type = params.get('email_type', ['any'])[0]
        item_origin = params.get('item_origin', params.get('origin', ['any']))[0]
        hide_phishing = params.get('hide_phishing', ['0'])[0] in ('1', 'true', 'True')
        guarantee = params.get('guarantee', ['any'])[0]
        query = params.get('q', params.get('title', params.get('query', [''])))[0]
        order_by = params.get('sort', params.get('sort_by', params.get('order_by', ['score'])))[0]
        page = int(params.get('page', [1])[0])

        result = indexer.fetch_live_market_search(
            games=games,
            pmin=pmin,
            pmax=pmax,
            daybreak=daybreak,
            max_hours_2w=max_hours_2w,
            min_points=min_points,
            max_points=max_points,
            min_level=min_level,
            max_level=max_level,
            min_potential_level=min_pot_level,
            max_potential_level=max_pot_level,
            min_score=min_score,
            cs2_prime=cs2_prime,
            no_vac=no_vac,
            email_type=email_type,
            item_origin=item_origin,
            hide_phishing=hide_phishing,
            guarantee=guarantee,
            query=query,
            order_by=order_by,
            page=page
        )
        self._send_json(result)

    def handle_db_search(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        
        sort_by = params.get('sort', params.get('sort_by', ['deal_score']))[0]
        order = params.get('order', ['desc'])[0]
        
        min_price = float(params['min_price'][0]) if 'min_price' in params and params['min_price'][0] else None
        max_price = float(params['max_price'][0]) if 'max_price' in params and params['max_price'][0] else None
        min_daybreak = int(params['min_daybreak'][0]) if 'min_daybreak' in params and params['min_daybreak'][0] else None
        max_hours_2w = float(params['max_hours_2w'][0]) if 'max_hours_2w' in params and params['max_hours_2w'][0] != '' else (float(params['hours_2weeks'][0]) if 'hours_2weeks' in params and params['hours_2weeks'][0] != '' else None)
        min_level = int(params['min_level'][0]) if 'min_level' in params and params['min_level'][0] else (int(params['level_min'][0]) if 'level_min' in params and params['level_min'][0] else None)
        max_level = int(params['max_level'][0]) if 'max_level' in params and params['max_level'][0] else (int(params['level_max'][0]) if 'level_max' in params and params['level_max'][0] else None)
        min_points = int(params['min_points'][0]) if 'min_points' in params and params['min_points'][0] else (int(params['points_min'][0]) if 'points_min' in params and params['points_min'][0] else None)
        max_points = int(params['max_points'][0]) if 'max_points' in params and params['max_points'][0] else (int(params['points_max'][0]) if 'points_max' in params and params['points_max'][0] else None)
        min_pot_level = int(params['min_pot_level'][0]) if 'min_pot_level' in params and params['min_pot_level'][0] else (int(params['min_potential_level'][0]) if 'min_potential_level' in params and params['min_potential_level'][0] else None)
        max_pot_level = int(params['max_pot_level'][0]) if 'max_pot_level' in params and params['max_pot_level'][0] else (int(params['max_potential_level'][0]) if 'max_potential_level' in params and params['max_potential_level'][0] else None)
        min_score = int(params['min_score'][0]) if 'min_score' in params and params['min_score'][0] else None
        cs2_prime = params.get('cs2_prime', ['0'])[0] in ('1', 'true', 'True')
        no_vac = params.get('no_vac', ['0'])[0] in ('1', 'true', 'True') or params.get('vac_ban', [''])[0] == '0'
        auto_validate = params.get('validate', ['1'])[0] in ('1', 'true', 'True')
        email_type = params.get('email_type', ['any'])[0]
        item_origin = params.get('item_origin', params.get('origin', ['any']))[0]
        hide_phishing = params.get('hide_phishing', ['0'])[0] in ('1', 'true', 'True')
        guarantee = params.get('guarantee', ['any'])[0]
        query = params.get('q', params.get('title', params.get('query', [''])))[0]
        
        raw_games = params.get('game', []) + params.get('game_titles', [])
        game_filters = []
        for g in raw_games:
            if ',' in g:
                game_filters.extend([x.strip() for x in g.split(',') if x.strip()])
            elif g.strip():
                game_filters.append(g.strip())

        game_mode = params.get('game_mode', params.get('games_match_mode', ['all']))[0]
        limit = int(params.get('limit', [50])[0])
        offset = int(params.get('offset', [0])[0])

        items, total_count = database.search_cached_accounts(
            sort_by=sort_by,
            order=order,
            min_price=min_price,
            max_price=max_price,
            min_daybreak=min_daybreak,
            max_hours_2w=max_hours_2w,
            min_level=min_level,
            max_level=max_level,
            min_points=min_points,
            max_points=max_points,
            min_potential_level=min_pot_level,
            max_potential_level=max_pot_level,
            min_score=min_score,
            cs2_prime_only=cs2_prime,
            no_vac_only=no_vac,
            game_filter=game_filters,
            game_match_mode=game_mode,
            email_type=email_type,
            item_origin=item_origin,
            hide_phishing=hide_phishing,
            guarantee=guarantee,
            query=query,
            limit=limit,
            offset=offset
        )

        # Smart Live Auto-Validation of top results to purge sold items
        token_path = os.path.join(DIRECTORY, 'token.txt')
        token = open(token_path, 'r', encoding='utf-8').read().strip() if os.path.exists(token_path) else ""

        if auto_validate and token and items:
            import concurrent.futures
            to_check = items[:25]
            
            def check_and_prune(acc):
                item_id = acc["item_id"]
                is_active, state = self.validate_single_item(item_id, token)
                if not is_active:
                    database.delete_account(item_id)
                    return (item_id, (False, state))
                return (item_id, (True, state))

            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
                check_results = dict(ex.map(check_and_prune, to_check))

            validated_items = []
            for acc in items:
                status_info = check_results.get(acc["item_id"])
                if status_info:
                    is_active, state = status_info
                    if not is_active:
                        continue  # Exclude sold account from results!
                    acc["is_active"] = True
                    acc["is_live_validated"] = True
                validated_items.append(acc)
            items = validated_items

        response_payload = {
            "total": len(items),
            "total_matched": total_count,
            "items": items,
            "cached_total": database.get_cached_count(),
            "limit": limit,
            "offset": offset
        }
        self._send_json(response_payload)

    def handle_bundle_search(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        
        party_size = int(params.get('party_size', [2])[0])
        max_total_price = float(params['max_total_price'][0]) if 'max_total_price' in params and params['max_total_price'][0] else None
        max_price_per_acc = float(params['max_price_per_acc'][0]) if 'max_price_per_acc' in params and params['max_price_per_acc'][0] else None
        min_shared_games = int(params.get('min_shared_games', [1])[0])
        min_daybreak = int(params.get('min_daybreak', [0])[0])
        no_vac = params.get('no_vac', ['1'])[0] in ('1', 'true', 'True')
        sort_by = params.get('sort', ['shared_games'])[0]
        must_have_games = params.get('must_have', [])
        source = params.get('source', ['db'])[0]
        coop_category = params.get('category', ['all'])[0]
        if coop_category == 'all':
            coop_category = params.get('coop_category', ['all'])[0]
        limit = int(params.get('limit', [40])[0])

        if source == 'live' or parsed.path.endswith('/live_search'):
            result = bundle_matcher.find_live_coop_bundles(
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
        else:
            result = bundle_matcher.find_coop_bundles(
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

        self._send_json(result)

    def handle_api_proxy(self, parsed):
        endpoint = parsed.path.replace('/api/proxy/', '')
        target_url = f"https://prod-api.lzt.market/{endpoint}"
        if parsed.query:
            target_url += f"?{parsed.query}"

        # Prefer server token.txt first if present
        saved_token = ""
        token_path = os.path.join(DIRECTORY, 'token.txt')
        if os.path.exists(token_path):
            try:
                saved_token = open(token_path, 'r', encoding='utf-8').read().strip()
            except Exception:
                pass

        auth_header = self.headers.get('Authorization', '')
        if saved_token:
            auth_header = f"Bearer {saved_token}"
        elif not auth_header and saved_token:
            auth_header = f"Bearer {saved_token}"

        req = urllib.request.Request(target_url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        if auth_header:
            req.add_header('Authorization', auth_header)

        try:
            with urllib.request.urlopen(req, context=SSL_CTX, timeout=10) as resp:
                data = resp.read()
                
                # Proactively cache live items fetched via API into SQLite
                try:
                    res_json = json.loads(data.decode('utf-8'))
                    items = res_json.get("items", [])
                    if items:
                        database.upsert_accounts_batch(items)
                except Exception:
                    pass

                self.send_response(resp.status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            err_body = e.read()
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(err_body if err_body else json.dumps({"error": f"HTTP {e.code}"}).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

class ReusableTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

if __name__ == "__main__":
    # Start smart stream harvester in background
    indexer.INDEXER_INSTANCE.start("smart_stream")
    
    with ReusableTCPServer(("", PORT), ProxyHandler) as httpd:
        print(f"[*] LZT Analyzer Server running at http://localhost:{PORT}")
        print(f"[*] SQLite Database ready: {database.get_cached_count()} cached accounts.")
        print(f"[*] Smart Harvester active in background collecting live market updates.")
        httpd.serve_forever()
