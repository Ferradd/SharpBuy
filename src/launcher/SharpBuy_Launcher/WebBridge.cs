using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace SharpBuy_Launcher
{
    public class SavedAccount
    {
        public string SteamId { get; set; } = "";
        public string AccountName { get; set; } = "";
        public string PersonaName { get; set; } = "";
        public string AvatarUrl { get; set; } = "";
        public string Token { get; set; } = "";
        public long AddedAt { get; set; } = 0;
        public long WarrantyExpiresAt { get; set; } = 0;
        public long ExpSeconds { get; set; } = 0;
        public long LastCheckedAt { get; set; } = 0;
        public bool IsAlive { get; set; } = true;
        public string StatusMessage { get; set; } = "";
        public string VacBanned { get; set; } = "0";
    }

    [ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]
    public class WebBridge
    {
        private const int MaxSavedAccounts = 500;
        private static readonly Regex TokenRegex = new(@"7656119\d+----ey[A-Za-z0-9_\-.]+", RegexOptions.Compiled);

        private readonly MainForm _form;
        private readonly SteamManager _steam;
        private readonly string _accountsDbPath;
        private const string ProductionApiBase = "https://sharpbuy.org/api";
        private static readonly HttpClient _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };
        private static readonly HttpClient _apiClient = new HttpClient { Timeout = TimeSpan.FromSeconds(50) };

        public WebBridge(MainForm form, SteamManager steam)
        {
            _form = form;
            _steam = steam;
            string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SharpBuy_Launcher");
            Directory.CreateDirectory(dir);
            _accountsDbPath = Path.Combine(dir, "accounts.json");
        }

        public string GetSteamPath()
        {
            return _steam.SteamPath;
        }

        public void ChangePath()
        {
            _form.Invoke(() =>
            {
                using var dialog = new FolderBrowserDialog();
                dialog.Description = "Select your Steam directory";
                dialog.SelectedPath = _steam.SteamPath;
                if (dialog.ShowDialog(_form) == DialogResult.OK)
                {
                    _steam.SteamPath = dialog.SelectedPath;
                    _form.ExecuteScript($"updateSteamPathDisplay('{_steam.SteamPath.Replace("\\", "/")}');");
                }
            });
        }

        public void SetWindowSize(int width, int height)
        {
            _form.SetWindowSize(width, height);
        }

        public Task SetWindowSizeAnimated(int width, int height, int durationMs = 320)
        {
            return _form.SetWindowSizeAnimated(width, height, durationMs);
        }

        public void LaunchSteam(string tokenInput)
        {
            Task.Run(async () =>
            {
                var parsed = _steam.ParseToken(tokenInput);
                if (!parsed.Valid)
                {
                    _form.Invoke(() => _form.ExecuteScript("setStatus('error', 'INVALID TOKEN', 'Please verify the pasted token is correct.');"));
                    return;
                }

                _form.Invoke(() => _form.ExecuteScript("setStatus('loading', 'LOGGING IN TO STEAM...', 'Encrypting session with DPAPI and launching Steam client.');"));

                var result = _steam.InjectTokenAndLaunch(tokenInput);
                if (result.Success)
                {
                    await SaveAccountInternalAsync(result.SteamId, result.AccountName, tokenInput);
                    _form.Invoke(() =>
                    {
                        _form.ExecuteScript($"onLoginSuccess('{result.SteamId}', '{result.AccountName}', '{result.Message}');");
                    });
                }
                else
                {
                    _form.Invoke(() =>
                    {
                        _form.ExecuteScript($"setStatus('error', 'LOGIN FAILED', '{result.Message}');");
                    });
                }
            });
        }

        public string CheckToken(string rawToken)
        {
            var p = _steam.ParseToken(rawToken);
            var res = new
            {
                valid = p.Valid,
                secondsRemaining = p.SecondsRemaining,
                steamId = p.SteamId,
                accountName = p.AccountName
            };
            return JsonSerializer.Serialize(res);
        }

        public async Task<string> CheckAccountLiveAsync(string rawToken, string steamId)
        {
            var p = _steam.ParseToken(rawToken);
            if (!p.Valid || p.SecondsRemaining <= 0)
            {
                UpdateAccountStatus(steamId, false, "Token expired", 0);
                return JsonSerializer.Serialize(new { isAlive = false, reason = "Token expired", secondsRemaining = 0 });
            }

            // Method 1: SharpBuy production API (works on any PC without Node.js)
            var onlineResult = await TryRemoteVerifyAsync(rawToken, p.SecondsRemaining);
            if (onlineResult != null)
            {
                UpdateAccountStatus(steamId, onlineResult.Value.IsAlive, onlineResult.Value.Reason, p.SecondsRemaining);
                return JsonSerializer.Serialize(new
                {
                    isAlive = onlineResult.Value.IsAlive,
                    secondsRemaining = p.SecondsRemaining,
                    reason = onlineResult.Value.Reason,
                    checkUnavailable = onlineResult.Value.CheckUnavailable
                });
            }

            // Method 2: Local dev API (optional)
            try
            {
                var jsonBody = JsonSerializer.Serialize(new { token = rawToken });
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                var resp = await _httpClient.PostAsync("http://localhost:3000/api/steam-verify", content);
                if (resp.IsSuccessStatusCode)
                {
                    string respBody = await resp.Content.ReadAsStringAsync();
                    var parsed = ParseVerifyResponse(respBody, p.SecondsRemaining);
                    if (parsed != null)
                    {
                        UpdateAccountStatus(steamId, parsed.Value.IsAlive, parsed.Value.Reason, p.SecondsRemaining);
                        return JsonSerializer.Serialize(new
                        {
                            isAlive = parsed.Value.IsAlive,
                            secondsRemaining = p.SecondsRemaining,
                            reason = parsed.Value.Reason
                        });
                    }
                }
            }
            catch { }

            // Method 3: Local Node.js script (developer machines only)
            var nodeResult = await TryNodeVerifyAsync(rawToken, p.SecondsRemaining);
            if (nodeResult != null)
            {
                UpdateAccountStatus(steamId, nodeResult.Value.IsAlive, nodeResult.Value.Reason, p.SecondsRemaining);
                return JsonSerializer.Serialize(new
                {
                    isAlive = nodeResult.Value.IsAlive,
                    secondsRemaining = p.SecondsRemaining,
                    reason = nodeResult.Value.Reason
                });
            }

            // JWT still valid — do NOT mark session as dead when check infra is unavailable
            const string fallbackReason = "Token valid (online check temporarily unavailable)";
            UpdateAccountStatus(steamId, true, fallbackReason, p.SecondsRemaining);
            return JsonSerializer.Serialize(new
            {
                isAlive = true,
                secondsRemaining = p.SecondsRemaining,
                reason = fallbackReason,
                checkUnavailable = true
            });
        }

        public async Task<string> GetAccountLibraryAsync(string rawToken)
        {
            try
            {
                var parsed = _steam.ParseToken(rawToken);
                if (!parsed.Valid)
                {
                    return JsonSerializer.Serialize(new { success = false, error = "Invalid token format" });
                }

                // Method 1: SharpBuy production API (works on any PC without Node.js)
                try
                {
                    var jsonBody = JsonSerializer.Serialize(new { token = rawToken });
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                    var resp = await _apiClient.PostAsync($"{ProductionApiBase}/account-library", content);
                    if (resp.IsSuccessStatusCode)
                    {
                        string respBody = await resp.Content.ReadAsStringAsync();
                        if (!string.IsNullOrWhiteSpace(respBody))
                            return respBody.Trim();
                    }
                }
                catch { }

                // Method 2: Local Node.js script (developer machines only)
                string scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts", "get_account_games.js");
                if (!File.Exists(scriptPath))
                {
                    scriptPath = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                        "Desktop", "SharpBuy", "scripts", "get_account_games.js");
                }

                if (File.Exists(scriptPath) && !string.IsNullOrEmpty(ResolveNodeExecutable()))
                {
                    string safeToken = rawToken.Replace("\"", "\\\"");
                    var psi = new ProcessStartInfo
                    {
                        FileName = ResolveNodeExecutable(),
                        Arguments = $"\"{scriptPath}\" \"{safeToken}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };

                    using var proc = Process.Start(psi);
                    if (proc != null)
                    {
                        string output = await proc.StandardOutput.ReadToEndAsync();
                        await proc.WaitForExitAsync();
                        if (!string.IsNullOrWhiteSpace(output))
                            return output.Trim();
                    }
                }

                return JsonSerializer.Serialize(new
                {
                    success = false,
                    error = "Failed to load games. Check your internet connection and try again."
                });
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new { success = false, error = ex.Message });
            }
        }

        private async Task<(bool IsAlive, string Reason, bool CheckUnavailable)?> TryRemoteVerifyAsync(string rawToken, long secondsRemaining)
        {
            try
            {
                var jsonBody = JsonSerializer.Serialize(new { token = rawToken });
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                var resp = await _apiClient.PostAsync($"{ProductionApiBase}/steam-verify", content);
                if (!resp.IsSuccessStatusCode) return null;

                string respBody = await resp.Content.ReadAsStringAsync();
                var parsed = ParseVerifyResponse(respBody, secondsRemaining);
                return parsed;
            }
            catch
            {
                return null;
            }
        }

        private async Task<(bool IsAlive, string Reason, bool CheckUnavailable)?> TryNodeVerifyAsync(string rawToken, long secondsRemaining)
        {
            try
            {
                string nodeExe = ResolveNodeExecutable();
                if (string.IsNullOrEmpty(nodeExe)) return null;

                string scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts", "cm_check.js");
                if (!File.Exists(scriptPath))
                {
                    scriptPath = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                        "Desktop", "SharpBuy", "scripts", "cm_check.js");
                }

                if (!File.Exists(scriptPath)) return null;

                var psi = new ProcessStartInfo
                {
                    FileName = nodeExe,
                    Arguments = $"\"{scriptPath}\" \"{rawToken}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var proc = Process.Start(psi);
                if (proc == null) return null;

                string output = await proc.StandardOutput.ReadToEndAsync();
                await proc.WaitForExitAsync();
                if (string.IsNullOrWhiteSpace(output)) return null;

                return ParseVerifyResponse(output.Trim(), secondsRemaining);
            }
            catch
            {
                return null;
            }
        }

        private static (bool IsAlive, string Reason, bool CheckUnavailable)? ParseVerifyResponse(string json, long secondsRemaining)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                if (!root.TryGetProperty("isAlive", out var aliveEl)) return null;

                bool isAlive = aliveEl.GetBoolean();
                string reason = root.TryGetProperty("reason", out var reasonEl)
                    ? reasonEl.GetString() ?? (isAlive ? "Active" : "Session revoked")
                    : (isAlive ? "Active" : "Session revoked");

                return (isAlive, reason, false);
            }
            catch
            {
                return null;
            }
        }

        private static string ResolveNodeExecutable()
        {
            string? fromPath = FindOnPath("node.exe") ?? FindOnPath("node");
            if (!string.IsNullOrEmpty(fromPath)) return fromPath;

            string[] commonPaths =
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "nodejs", "node.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "nodejs", "node.exe")
            };

            foreach (var path in commonPaths)
            {
                if (File.Exists(path)) return path;
            }

            return "";
        }

        private static string? FindOnPath(string exeName)
        {
            var pathEnv = Environment.GetEnvironmentVariable("PATH");
            if (string.IsNullOrWhiteSpace(pathEnv)) return null;

            foreach (var dir in pathEnv.Split(';', StringSplitOptions.RemoveEmptyEntries))
            {
                try
                {
                    string candidate = Path.Combine(dir.Trim(), exeName);
                    if (File.Exists(candidate)) return candidate;
                }
                catch { }
            }

            return null;
        }

        private void UpdateAccountStatus(string steamId, bool isAlive, string reason, long secondsRemaining = 0)
        {
            try
            {
                var list = LoadAccountsList();
                var target = list.Find(a => a.SteamId == steamId);
                if (target != null)
                {
                    target.IsAlive = isAlive;
                    target.StatusMessage = reason;
                    target.LastCheckedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                    if (secondsRemaining > 0)
                        target.ExpSeconds = secondsRemaining;
                    File.WriteAllText(_accountsDbPath, JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true }));
                }
            }
            catch { }
        }

        public string GetSavedAccounts()
        {
            try
            {
                if (File.Exists(_accountsDbPath))
                {
                    return File.ReadAllText(_accountsDbPath);
                }
            }
            catch { }
            return "[]";
        }

        public void SaveAccount(string steamId, string accountName, string token)
        {
            Task.Run(async () => await SaveAccountInternalAsync(steamId, accountName, token));
        }

        private async Task SaveAccountInternalAsync(string steamId, string accountName, string token)
        {
            try
            {
                var list = LoadAccountsList();
                var parsed = _steam.ParseToken(token);
                long exp = parsed.SecondsRemaining;
                var existing = list.Find(a => a.SteamId == steamId);

                list.RemoveAll(a => a.SteamId == steamId || a.AccountName == accountName);

                var (persona, avatar, vacBanned, _) = await FetchSteamProfileDetailedAsync(steamId);
                var warranty = await FetchWarrantyFromServerAsync(token);

                long warrantyExpiresAt = warranty.ExpiresAtUnix;
                if (warrantyExpiresAt <= 0 && existing != null && existing.WarrantyExpiresAt > 0)
                    warrantyExpiresAt = existing.WarrantyExpiresAt;

                list.Insert(0, new SavedAccount
                {
                    SteamId = steamId,
                    AccountName = accountName,
                    PersonaName = persona,
                    AvatarUrl = avatar,
                    Token = token,
                    AddedAt = existing?.AddedAt ?? DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    WarrantyExpiresAt = warrantyExpiresAt,
                    ExpSeconds = exp,
                    IsAlive = true,
                    LastCheckedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    StatusMessage = warranty.Eligible ? "Warranty active" : "Active",
                    VacBanned = vacBanned
                });

                SaveAccountsList(list);
            }
            catch { }
        }

        public async Task RefreshAllWarrantiesAsync()
        {
            try
            {
                var list = LoadAccountsList();
                if (list.Count == 0) return;

                bool changed = false;
                foreach (var acc in list)
                {
                    if (string.IsNullOrWhiteSpace(acc.Token)) continue;
                    var warranty = await FetchWarrantyFromServerAsync(acc.Token);
                    if (warranty.ExpiresAtUnix > 0 && acc.WarrantyExpiresAt != warranty.ExpiresAtUnix)
                    {
                        acc.WarrantyExpiresAt = warranty.ExpiresAtUnix;
                        changed = true;
                    }
                }

                if (changed)
                    SaveAccountsList(list);
            }
            catch { }
        }

        private async Task<(long ExpiresAtUnix, int SecondsRemaining, bool Eligible)> FetchWarrantyFromServerAsync(string token)
        {
            try
            {
                var jsonBody = JsonSerializer.Serialize(new { token, checkOnly = true });
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                var resp = await _apiClient.PostAsync($"{ProductionApiBase}/warranty-check", content);
                if (!resp.IsSuccessStatusCode)
                    return (0, 0, false);

                string body = await resp.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;

                bool eligible = root.TryGetProperty("eligible", out var eligibleEl) && eligibleEl.GetBoolean();
                int secondsRemaining = root.TryGetProperty("secondsRemaining", out var secsEl)
                    ? secsEl.GetInt32()
                    : 0;

                long expiresUnix = 0;
                if (root.TryGetProperty("warrantyExpiresAt", out var expEl) && expEl.ValueKind == JsonValueKind.String)
                {
                    var expStr = expEl.GetString();
                    if (!string.IsNullOrWhiteSpace(expStr) &&
                        DateTimeOffset.TryParse(expStr, out var expiresAt))
                    {
                        expiresUnix = expiresAt.ToUnixTimeSeconds();
                    }
                }

                if (expiresUnix <= 0 && secondsRemaining > 0)
                    expiresUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + secondsRemaining;

                return (expiresUnix, secondsRemaining, eligible);
            }
            catch
            {
                return (0, 0, false);
            }
        }

        public async Task RefreshAllProfilesAsync()
        {
            try
            {
                if (!File.Exists(_accountsDbPath)) return;
                string existing = File.ReadAllText(_accountsDbPath);
                var list = JsonSerializer.Deserialize<List<SavedAccount>>(existing) ?? new List<SavedAccount>();

                bool changed = false;
                foreach (var acc in list)
                {
                    if (string.IsNullOrEmpty(acc.AvatarUrl) || acc.PersonaName == acc.SteamId || acc.AvatarUrl.Contains("fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb"))
                    {
                        var (persona, avatar, vacBanned, isPrivate) = await FetchSteamProfileDetailedAsync(acc.SteamId);
                        if (!string.IsNullOrEmpty(persona) && persona != acc.SteamId)
                        {
                            acc.PersonaName = persona;
                            acc.AvatarUrl = avatar;
                            acc.VacBanned = vacBanned;
                            changed = true;
                        }
                    }
                }

                if (changed)
                {
                    File.WriteAllText(_accountsDbPath, JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true }));
                    _form.Invoke(() => _form.ExecuteScript("loadAccountHistory();"));
                }
            }
            catch { }
        }

        private async Task<(string PersonaName, string AvatarUrl, string VacBanned, bool IsPrivate)> FetchSteamProfileDetailedAsync(string steamId)
        {
            string defaultAvatar = "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg";
            if (string.IsNullOrEmpty(steamId) || steamId.Length < 10)
                return (steamId, defaultAvatar, "0", false);

            try
            {
                string xml = await _httpClient.GetStringAsync($"https://steamcommunity.com/profiles/{steamId}?xml=1");
                var nameMatch = Regex.Match(xml, @"<steamID><!\[CDATA\[(.*?)\]\]></steamID>");
                var avatarMatch = Regex.Match(xml, @"<avatarMedium><!\[CDATA\[(.*?)\]\]></avatarMedium>");
                var vacMatch = Regex.Match(xml, @"<vacBanned>(\d+)</vacBanned>");
                var privacyMatch = Regex.Match(xml, @"<privacyState>(.*?)</privacyState>");

                string persona = nameMatch.Success ? nameMatch.Groups[1].Value : steamId;
                string avatar = avatarMatch.Success ? avatarMatch.Groups[1].Value : defaultAvatar;
                string vac = vacMatch.Success ? vacMatch.Groups[1].Value : "0";
                bool isPriv = privacyMatch.Success && privacyMatch.Groups[1].Value != "public";

                return (persona, avatar, vac, isPriv);
            }
            catch
            {
                return (steamId, defaultAvatar, "0", false);
            }
        }

        public void DeleteSavedAccount(string steamId)
        {
            try
            {
                var list = LoadAccountsList();
                list.RemoveAll(a => a.SteamId == steamId || a.AccountName == steamId);
                SaveAccountsList(list);
            }
            catch { }
        }

        public void ClearAllSavedAccounts()
        {
            try
            {
                SaveAccountsList(new List<SavedAccount>());
            }
            catch { }
        }

        public async Task<string> ImportTokensFromFileAsync()
        {
            string fileContent = "";
            bool cancelled = true;

            _form.Invoke(() =>
            {
                using var ofd = new OpenFileDialog();
                ofd.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*";
                ofd.Title = "Import Steam tokens (steam.txt or any file)";
                ofd.InitialDirectory = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                if (ofd.ShowDialog(_form) == DialogResult.OK)
                {
                    try
                    {
                        fileContent = File.ReadAllText(ofd.FileName);
                        cancelled = false;
                    }
                    catch (Exception ex)
                    {
                        fileContent = $"ERROR:{ex.Message}";
                        cancelled = false;
                    }
                }
            });

            if (cancelled)
            {
                return JsonSerializer.Serialize(new { success = false, cancelled = true });
            }

            if (fileContent.StartsWith("ERROR:", StringComparison.Ordinal))
            {
                return JsonSerializer.Serialize(new
                {
                    success = false,
                    error = fileContent.Substring(6)
                });
            }

            var tokens = ExtractTokensFromText(fileContent);
            if (tokens.Count == 0)
            {
                return JsonSerializer.Serialize(new
                {
                    success = false,
                    error = "No Steam tokens found. Expected format: 7656119XXXXXXXXX----ey..."
                });
            }

            var list = LoadAccountsList();
            var existingIds = new HashSet<string>(list.Select(a => a.SteamId));
            int imported = 0;
            int skipped = 0;

            foreach (var token in tokens)
            {
                var parsed = _steam.ParseToken(token);
                if (!parsed.Valid)
                {
                    skipped++;
                    continue;
                }

                if (existingIds.Contains(parsed.SteamId))
                {
                    var existingAcc = list.Find(a => a.SteamId == parsed.SteamId);
                    if (existingAcc != null)
                    {
                        var fullExistingToken = existingAcc.Token;
                        var refreshed = await FetchWarrantyFromServerAsync(fullExistingToken);
                        if (refreshed.ExpiresAtUnix > 0)
                            existingAcc.WarrantyExpiresAt = refreshed.ExpiresAtUnix;
                    }
                    skipped++;
                    continue;
                }

                var fullToken = token.Contains("----") ? token : $"{parsed.SteamId}----{token}";
                var (persona, avatar, vacBanned, _) = await FetchSteamProfileDetailedAsync(parsed.SteamId);
                var warranty = await FetchWarrantyFromServerAsync(fullToken);

                list.Insert(0, new SavedAccount
                {
                    SteamId = parsed.SteamId,
                    AccountName = parsed.AccountName,
                    PersonaName = persona,
                    AvatarUrl = avatar,
                    Token = fullToken,
                    AddedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    WarrantyExpiresAt = warranty.ExpiresAtUnix,
                    ExpSeconds = parsed.SecondsRemaining,
                    IsAlive = true,
                    StatusMessage = warranty.Eligible ? "Warranty active" : "Imported",
                    VacBanned = vacBanned
                });

                existingIds.Add(parsed.SteamId);
                imported++;

                if (list.Count >= MaxSavedAccounts)
                    break;
            }

            SaveAccountsList(list);

            return JsonSerializer.Serialize(new
            {
                success = true,
                imported,
                skipped,
                totalFound = tokens.Count,
                inHistory = list.Count
            });
        }

        private static List<string> ExtractTokensFromText(string text)
        {
            var seen = new HashSet<string>();
            var tokens = new List<string>();
            foreach (Match match in TokenRegex.Matches(text))
            {
                if (seen.Add(match.Value))
                    tokens.Add(match.Value);
            }
            return tokens;
        }

        private List<SavedAccount> LoadAccountsList()
        {
            if (!File.Exists(_accountsDbPath))
                return new List<SavedAccount>();

            string existing = File.ReadAllText(_accountsDbPath);
            return JsonSerializer.Deserialize<List<SavedAccount>>(existing) ?? new List<SavedAccount>();
        }

        private void SaveAccountsList(List<SavedAccount> list)
        {
            if (list.Count > MaxSavedAccounts)
                list = list.GetRange(0, MaxSavedAccounts);

            File.WriteAllText(_accountsDbPath, JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true }));
            _form.Invoke(() => _form.ExecuteScript("loadAccountHistory();"));
        }

        public bool ResetSteam()
        {
            return _steam.ResetSteamData();
        }

        public bool ClearAllSteamSessions()
        {
            return _steam.ClearAllSteamSessions();
        }

        public void KillSteam()
        {
            _steam.KillSteamProcesses();
        }

        public void OpenSteamDir()
        {
            try
            {
                if (Directory.Exists(_steam.SteamPath))
                {
                    Process.Start("explorer.exe", _steam.SteamPath);
                }
            }
            catch { }
        }

        public void OpenBrowser(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = url,
                    UseShellExecute = true
                });
            }
            catch { }
        }

        public void Minimize()
        {
            _form.Invoke(() => _form.WindowState = FormWindowState.Minimized);
        }

        public void Close()
        {
            _form.Invoke(() => _form.Close());
        }

        public void OnDragWindow()
        {
            _form.Invoke(() => _form.StartDrag());
        }
    }
}
