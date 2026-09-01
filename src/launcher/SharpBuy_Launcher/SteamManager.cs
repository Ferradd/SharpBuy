using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Win32;

namespace SharpBuy_Launcher
{
    public class SteamManager
    {
        public string SteamPath { get; set; }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        internal struct DATA_BLOB
        {
            public int cbData;
            public IntPtr pbData;
        }

        [DllImport("Crypt32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        private static extern bool CryptProtectData(
            ref DATA_BLOB pDataIn,
            string szDataDescr,
            ref DATA_BLOB pOptionalEntropy,
            IntPtr pvReserved,
            IntPtr pPromptStruct,
            int dwFlags,
            ref DATA_BLOB pDataOut);

        [DllImport("Kernel32.dll", EntryPoint = "LocalFree", SetLastError = true)]
        private static extern IntPtr LocalFree(IntPtr hMem);

        public SteamManager()
        {
            SteamPath = DetectSteamPath();
        }

        public string DetectSteamPath()
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(@"Software\Valve\Steam");
                if (key != null)
                {
                    var path = key.GetValue("SteamPath") as string;
                    if (!string.IsNullOrEmpty(path) && Directory.Exists(path))
                    {
                        return path.Replace("/", "\\");
                    }
                }
            }
            catch { }

            try
            {
                using var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\WOW6432Node\Valve\Steam");
                if (key != null)
                {
                    var path = key.GetValue("InstallPath") as string;
                    if (!string.IsNullOrEmpty(path) && Directory.Exists(path))
                    {
                        return path.Replace("/", "\\");
                    }
                }
            }
            catch { }

            string[] defaultPaths =
            {
                @"C:\Program Files (x86)\Steam",
                @"C:\Program Files\Steam",
                @"D:\Steam",
                @"D:\Games\Steam",
                @"E:\Steam",
                @"E:\Games"
            };

            foreach (var p in defaultPaths)
            {
                if (Directory.Exists(p))
                    return p;
            }

            return @"C:\Program Files (x86)\Steam";
        }

        public string GetLocalVdfPath()
        {
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return Path.Combine(localAppData, "Steam", "local.vdf");
        }

        public void KillSteamProcesses()
        {
            string[] procNames = { "steam", "steamwebhelper", "gameoverlayui", "steamservice" };
            foreach (var name in procNames)
            {
                try
                {
                    foreach (var proc in Process.GetProcessesByName(name))
                    {
                        try
                        {
                            proc.Kill();
                            proc.WaitForExit(1000);
                        }
                        catch { }
                    }
                }
                catch { }
            }
        }

        public void EmergencyKillGameAndSteam()
        {
            string[] gamesAndSteamProcs =
            {
                "cs2", "csgo", "dota2", "rust", "rustclient", "gta5", "gtav", "rdr2",
                "apex", "r5apex", "pubg", "tslgame", "deadlock", "cyberpunk2077",
                "hl2", "tf2", "left4dead2", "portal2", "dayz", "steam", "steamwebhelper",
                "gameoverlayui", "steamservice"
            };

            foreach (var procName in gamesAndSteamProcs)
            {
                try
                {
                    foreach (var p in Process.GetProcessesByName(procName))
                    {
                        try
                        {
                            p.Kill();
                        }
                        catch { }
                    }
                }
                catch { }
            }

            try
            {
                using var key = Registry.CurrentUser.CreateSubKey(@"Software\Valve\Steam");
                if (key != null)
                {
                    key.SetValue("AutoLoginUser", "", RegistryValueKind.String);
                    key.SetValue("RememberPassword", 0, RegistryValueKind.DWord);
                }
            }
            catch { }
        }

        public string SteamEncrypt(string dataToEncrypt, string accountName)
        {
            byte[] plainBytes = Encoding.UTF8.GetBytes(dataToEncrypt);
            byte[] entropyBytes = Encoding.UTF8.GetBytes(accountName);
            string description = "B\0O\0b\0f\0u\0s\0c\0a\0t\0e\0B\0u\0f\0f\0e\0r\0\0\0";

            DATA_BLOB inBlob = new DATA_BLOB();
            DATA_BLOB entropyBlob = new DATA_BLOB();
            DATA_BLOB outBlob = new DATA_BLOB();

            IntPtr pIn = Marshal.AllocHGlobal(plainBytes.Length);
            IntPtr pEntropy = Marshal.AllocHGlobal(entropyBytes.Length);

            try
            {
                Marshal.Copy(plainBytes, 0, pIn, plainBytes.Length);
                inBlob.cbData = plainBytes.Length;
                inBlob.pbData = pIn;

                Marshal.Copy(entropyBytes, 0, pEntropy, entropyBytes.Length);
                entropyBlob.cbData = entropyBytes.Length;
                entropyBlob.pbData = pEntropy;

                bool success = CryptProtectData(
                    ref inBlob,
                    description,
                    ref entropyBlob,
                    IntPtr.Zero,
                    IntPtr.Zero,
                    17,
                    ref outBlob);

                if (!success)
                {
                    int err = Marshal.GetLastWin32Error();
                    throw new Exception($"CryptProtectData failed with code {err}");
                }

                byte[] cipherBytes = new byte[outBlob.cbData];
                Marshal.Copy(outBlob.pbData, cipherBytes, 0, outBlob.cbData);
                return Convert.ToHexString(cipherBytes).ToLower();
            }
            finally
            {
                Marshal.FreeHGlobal(pIn);
                Marshal.FreeHGlobal(pEntropy);
                if (outBlob.pbData != IntPtr.Zero)
                {
                    LocalFree(outBlob.pbData);
                }
            }
        }

        public static uint CalculateCrc32(byte[] bytes)
        {
            uint[] table = new uint[256];
            for (uint i = 0; i < 256; i++)
            {
                uint temp = i;
                for (int j = 0; j < 8; j++)
                {
                    if ((temp & 1) == 1)
                        temp = (temp >> 1) ^ 0xedb88320;
                    else
                        temp >>= 1;
                }
                table[i] = temp;
            }

            uint crc = 0xffffffff;
            foreach (byte b in bytes)
            {
                byte index = (byte)((crc & 0xff) ^ b);
                crc = (crc >> 8) ^ table[index];
            }
            return ~crc;
        }

        public string ComputeCrc32(string input)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(input);
            uint crc = CalculateCrc32(bytes);
            return crc.ToString("x").TrimStart('0');
        }

        public (bool Valid, long SecondsRemaining, string SteamId, string AccountName, string Eya) ParseToken(string rawToken)
        {
            if (string.IsNullOrWhiteSpace(rawToken))
                return (false, 0, "", "", "");

            rawToken = rawToken.Trim().Replace(" ", "").Replace("\n", "").Replace("\r", "");
            string[] parts = rawToken.Split("----");
            string eya = "";
            string accountName = "";

            foreach (var part in parts)
            {
                if (part.Contains("eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.") || part.StartsWith("ey"))
                {
                    eya = part;
                    if (parts.Length > 1 && part != parts[0])
                    {
                        accountName = parts[0].ToLower();
                    }
                    break;
                }
            }

            if (string.IsNullOrEmpty(eya))
                return (false, 0, "", "", "");

            string steamId = "";
            long expSeconds = 0;

            try
            {
                var jwtParts = eya.Split('.');
                if (jwtParts.Length >= 2)
                {
                    byte[] payloadBytes = ConvertFromBase64Url(jwtParts[1]);
                    string payloadJson = Encoding.UTF8.GetString(payloadBytes);
                    using var doc = JsonDocument.Parse(payloadJson);
                    var root = doc.RootElement;

                    if (root.TryGetProperty("sub", out var subEl))
                    {
                        steamId = subEl.GetString() ?? "";
                    }

                    if (root.TryGetProperty("exp", out var expEl))
                    {
                        long exp = expEl.GetInt64();
                        long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                        expSeconds = exp - now;
                    }
                }
            }
            catch
            {
                return (false, 0, "", "", "");
            }

            if (string.IsNullOrEmpty(accountName) || accountName.Length > 50)
            {
                accountName = !string.IsNullOrEmpty(steamId) ? steamId : "account";
            }

            if (accountName.Contains("@"))
            {
                accountName = accountName.Split('@')[0];
            }

            if (string.IsNullOrEmpty(steamId) || expSeconds <= 0)
            {
                return (false, 0, steamId, accountName, eya);
            }

            return (true, expSeconds, steamId, accountName, eya);
        }

        public (bool Success, string Message, long DaysRemaining, string SteamId, string AccountName) InjectTokenAndLaunch(string rawToken, bool offlineMode = false)
        {
            var parsed = ParseToken(rawToken);
            if (!parsed.Valid)
            {
                if (!string.IsNullOrEmpty(parsed.SteamId) && parsed.SecondsRemaining <= 0)
                {
                    return (false, "Session Token expired. Please use a fresh token.", 0, parsed.SteamId, parsed.AccountName);
                }
                return (false, "Invalid token format. Expected: SteamID----ey...", 0, "", "");
            }

            long totalSeconds = parsed.SecondsRemaining;
            long daysRemaining = totalSeconds / 86400;
            long hoursRemaining = (totalSeconds % 86400) / 3600;
            long minutesRemaining = (totalSeconds % 3600) / 60;

            // 1. Kill existing Steam
            KillSteamProcesses();
            for (int i = 0; i < 20; i++)
            {
                if (Process.GetProcessesByName("steam").Length == 0 &&
                    Process.GetProcessesByName("steamwebhelper").Length == 0)
                {
                    break;
                }
                System.Threading.Thread.Sleep(200);
            }
            System.Threading.Thread.Sleep(400);

            // 2. Encrypt Token with DPAPI
            string encryptedJwtHex;
            try
            {
                encryptedJwtHex = SteamEncrypt(parsed.Eya, parsed.AccountName);
            }
            catch (Exception ex)
            {
                return (false, $"DPAPI Encryption failed: {ex.Message}", 0, parsed.SteamId, parsed.AccountName);
            }

            // 3. Write Registry AutoLoginUser
            try
            {
                using var key = Registry.CurrentUser.CreateSubKey(@"Software\Valve\Steam");
                if (key != null)
                {
                    key.SetValue("AutoLoginUser", parsed.AccountName, RegistryValueKind.String);
                    key.SetValue("RememberPassword", 1, RegistryValueKind.DWord);
                }
            }
            catch { }

            // 4. Update config.vdf
            string configDir = Path.Combine(SteamPath, "config");
            Directory.CreateDirectory(configDir);

            string configVdfPath = Path.Combine(configDir, "config.vdf");
            UpdateConfigVdf(configVdfPath, parsed.AccountName, parsed.SteamId);

            // 5. Update loginusers.vdf
            string loginUsersPath = Path.Combine(configDir, "loginusers.vdf");
            long nowSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            UpdateLoginUsersVdf(loginUsersPath, parsed.SteamId, parsed.AccountName, nowSeconds, offlineMode);

            // 6. Update local.vdf in %localappdata%\Steam\local.vdf
            string localVdfPath = GetLocalVdfPath();
            string crc32Acc = ComputeCrc32(parsed.AccountName) + "1";
            UpdateLocalVdf(localVdfPath, crc32Acc, encryptedJwtHex);

            if (!File.Exists(localVdfPath))
            {
                return (false, "Failed to write local.vdf ConnectCache.", daysRemaining, parsed.SteamId, parsed.AccountName);
            }

            try
            {
                string localContent = File.ReadAllText(localVdfPath);
                if (!localContent.Contains($"\"{crc32Acc}\""))
                {
                    return (false, $"ConnectCache key missing after write ({crc32Acc}).", daysRemaining, parsed.SteamId, parsed.AccountName);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Could not verify local.vdf: {ex.Message}", daysRemaining, parsed.SteamId, parsed.AccountName);
            }

            // 7. Launch Steam
            string steamExe = Path.Combine(SteamPath, "steam.exe");
            if (File.Exists(steamExe))
            {
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = steamExe,
                        WorkingDirectory = SteamPath,
                        UseShellExecute = true
                    });
                }
                catch (Exception ex)
                {
                    return (false, $"Failed to launch Steam: {ex.Message}", daysRemaining, parsed.SteamId, parsed.AccountName);
                }
            }
            else
            {
                return (false, $"steam.exe not found at: {SteamPath}", daysRemaining, parsed.SteamId, parsed.AccountName);
            }

            string expiryMsg = $"Token valid for {daysRemaining} days, {hoursRemaining} hrs, {minutesRemaining} mins.";
            return (true, expiryMsg, daysRemaining, parsed.SteamId, parsed.AccountName);
        }

        private void UpdateConfigVdf(string filePath, string accountName, string steamId)
        {
            string content = "";
            if (File.Exists(filePath))
            {
                try { content = File.ReadAllText(filePath); } catch { }
            }

            if (string.IsNullOrWhiteSpace(content))
            {
                content = $@"""InstallConfigStore""
{{
	""Software""
	{{
		""Valve""
		{{
			""Steam""
			{{
				""Accounts""
				{{
					""{accountName}""
					{{
						""SteamID""		""{steamId}""
					}}
				}}
			}}
		}}
	}}
}}";
            }
            else
            {
                if (!content.Contains($"\"{accountName}\""))
                {
                    int accIdx = content.IndexOf("\"Accounts\"");
                    if (accIdx != -1)
                    {
                        int openBrace = content.IndexOf("{", accIdx);
                        if (openBrace != -1)
                        {
                            string accBlock = $@"
					""{accountName}""
					{{
						""SteamID""		""{steamId}""
					}}";
                            content = content.Insert(openBrace + 1, accBlock);
                        }
                    }
                    else
                    {
                        int steamIdx = content.IndexOf("\"Steam\"");
                        int steamBrace = content.IndexOf("{", steamIdx);
                        if (steamBrace != -1)
                        {
                            string accountsBlock = $@"
				""Accounts""
				{{
					""{accountName}""
					{{
						""SteamID""		""{steamId}""
					}}
				}}";
                            content = content.Insert(steamBrace + 1, accountsBlock);
                        }
                    }
                }
            }

            try
            {
                File.WriteAllText(filePath, content, Encoding.UTF8);
            }
            catch { }
        }

        private static string UpsertLoginUsersField(string block, string key, string value)
        {
            string pattern = $@"(""{Regex.Escape(key)}""\s+"")[^""]*("")";
            if (Regex.IsMatch(block, pattern))
                return Regex.Replace(block, pattern, $"${{1}}{value}${{2}}");

            return $"\n\t\t\"{key}\"\t\t\"{value}\"" + block;
        }

        private static string BuildLoginUserBlock(string steamId, string accountName, long timestamp, bool offlineMode)
        {
            string offlineFlag = offlineMode ? "1" : "0";
            string skipOffline = offlineMode ? "1" : "0";
            return $@"
	""{steamId}""
	{{
		""AccountName""		""{accountName}""
		""PersonaName""		""{accountName}""
		""RememberPassword""		""1""
		""WantsOfflineMode""		""{offlineFlag}""
		""SkipOfflineModeWarning""		""{skipOffline}""
		""AutoLogin""		""1""
		""AllowAutoLogin""		""1""
		""MostRecent""		""1""
		""Timestamp""		""{timestamp}""
	}}";
        }

        private static string ApplyTargetLoginUserFlags(string block, string accountName, long timestamp, bool offlineMode)
        {
            string offlineFlag = offlineMode ? "1" : "0";
            string skipOffline = offlineMode ? "1" : "0";
            block = UpsertLoginUsersField(block, "AccountName", accountName);
            block = UpsertLoginUsersField(block, "PersonaName", accountName);
            block = UpsertLoginUsersField(block, "RememberPassword", "1");
            block = UpsertLoginUsersField(block, "AutoLogin", "1");
            block = UpsertLoginUsersField(block, "AllowAutoLogin", "1");
            block = UpsertLoginUsersField(block, "MostRecent", "1");
            block = UpsertLoginUsersField(block, "WantsOfflineMode", offlineFlag);
            block = UpsertLoginUsersField(block, "SkipOfflineModeWarning", skipOffline);
            block = UpsertLoginUsersField(block, "Timestamp", timestamp.ToString());
            return block;
        }

        private void UpdateLoginUsersVdf(string filePath, string steamId, string accountName, long timestamp, bool offlineMode = false)
        {
            string content = "";
            if (File.Exists(filePath))
            {
                try { content = File.ReadAllText(filePath); } catch { }
            }

            if (!string.IsNullOrEmpty(content))
            {
                content = Regex.Replace(content, @"""MostRecent""\s+""1""", "\"MostRecent\"\t\t\"0\"");
                content = Regex.Replace(content, @"""AutoLogin""\s+""1""", "\"AutoLogin\"\t\t\"0\"");
                content = Regex.Replace(content, @"""AllowAutoLogin""\s+""1""", "\"AllowAutoLogin\"\t\t\"0\"");
            }

            if (string.IsNullOrWhiteSpace(content) || !content.Contains("\"users\""))
            {
                content = $@"""users""
{{{BuildLoginUserBlock(steamId, accountName, timestamp, offlineMode)}
}}";
            }
            else if (content.Contains($"\"{steamId}\""))
            {
                string blockPattern = $@"(""{Regex.Escape(steamId)}""\s*\{{)([\s\S]*?)(\n\t\}})";
                content = Regex.Replace(content, blockPattern, match =>
                {
                    string inner = ApplyTargetLoginUserFlags(match.Groups[2].Value, accountName, timestamp, offlineMode);
                    return match.Groups[1].Value + inner + match.Groups[3].Value;
                });
            }
            else
            {
                int usersIdx = content.IndexOf("\"users\"");
                int openBrace = content.IndexOf("{", usersIdx);
                if (openBrace != -1)
                {
                    content = content.Insert(openBrace + 1, BuildLoginUserBlock(steamId, accountName, timestamp, offlineMode));
                }
            }

            File.WriteAllText(filePath, content, Encoding.UTF8);
        }

        private void UpdateLocalVdf(string filePath, string crc32Key, string encryptedJwtHex)
        {
            string dir = Path.GetDirectoryName(filePath)!;
            Directory.CreateDirectory(dir);

            string content = "";
            if (File.Exists(filePath))
            {
                try { content = File.ReadAllText(filePath); } catch { }
            }

            if (string.IsNullOrWhiteSpace(content) || !content.Contains("\"ConnectCache\""))
            {
                content = $@"""MachineUserConfigStore""
{{
	""Software""
	{{
		""Valve""
		{{
			""Steam""
			{{
				""ConnectCache""
				{{
					""{crc32Key}""		""{encryptedJwtHex}""
				}}
			}}
		}}
	}}
}}";
            }
            else
            {
                int cacheIdx = content.IndexOf("\"ConnectCache\"");
                int openBrace = content.IndexOf("{", cacheIdx);
                if (openBrace != -1)
                {
                    if (content.Contains($"\"{crc32Key}\""))
                    {
                        string pattern = $@"(""{crc32Key}""\s+"")[^""]+("")";
                        content = Regex.Replace(content, pattern, $"${{1}}{encryptedJwtHex}${{2}}");
                    }
                    else
                    {
                        string entry = $@"
					""{crc32Key}""		""{encryptedJwtHex}""";
                        content = content.Insert(openBrace + 1, entry);
                    }
                }
            }

            File.WriteAllText(filePath, content, Encoding.UTF8);
        }

        public bool ResetSteamData()
        {
            try
            {
                KillSteamProcesses();
                System.Threading.Thread.Sleep(400);

                using (var key = Registry.CurrentUser.CreateSubKey(@"Software\Valve\Steam"))
                {
                    if (key != null)
                    {
                        key.SetValue("AutoLoginUser", "", RegistryValueKind.String);
                        key.SetValue("RememberPassword", 0, RegistryValueKind.DWord);
                    }
                }

                string localVdf = GetLocalVdfPath();
                if (File.Exists(localVdf))
                {
                    try { File.Delete(localVdf); } catch { }
                }

                string userData = Path.Combine(SteamPath, "userdata");
                if (Directory.Exists(userData))
                {
                    try { Directory.Delete(userData, true); } catch { }
                }

                string steamExe = Path.Combine(SteamPath, "steam.exe");
                if (File.Exists(steamExe))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = steamExe,
                        WorkingDirectory = SteamPath,
                        UseShellExecute = true
                    });
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool ClearAllSteamSessions()
        {
            try
            {
                KillSteamProcesses();
                System.Threading.Thread.Sleep(400);

                using (var key = Registry.CurrentUser.CreateSubKey(@"Software\Valve\Steam"))
                {
                    if (key != null)
                    {
                        key.SetValue("AutoLoginUser", "", RegistryValueKind.String);
                        key.SetValue("RememberPassword", 0, RegistryValueKind.DWord);
                        try { key.DeleteValue("AutoLoginUser", false); } catch { }
                    }
                }

                string localVdf = GetLocalVdfPath();
                if (File.Exists(localVdf))
                {
                    try { File.Delete(localVdf); } catch { }
                }

                string configDir = Path.Combine(SteamPath, "config");
                string loginUsersPath = Path.Combine(configDir, "loginusers.vdf");
                if (File.Exists(loginUsersPath))
                {
                    try { File.Delete(loginUsersPath); } catch { }
                }

                ClearConfigVdfAccounts(Path.Combine(configDir, "config.vdf"));

                if (Directory.Exists(configDir))
                {
                    foreach (var ssfn in Directory.GetFiles(configDir, "ssfn*"))
                    {
                        try { File.Delete(ssfn); } catch { }
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        private void ClearConfigVdfAccounts(string filePath)
        {
            if (!File.Exists(filePath)) return;

            try
            {
                string content = File.ReadAllText(filePath);
                int accIdx = content.IndexOf("\"Accounts\"");
                if (accIdx == -1) return;

                int openBrace = content.IndexOf("{", accIdx);
                if (openBrace == -1) return;

                int depth = 0;
                int closeBrace = -1;
                for (int i = openBrace; i < content.Length; i++)
                {
                    if (content[i] == '{') depth++;
                    else if (content[i] == '}')
                    {
                        depth--;
                        if (depth == 0)
                        {
                            closeBrace = i;
                            break;
                        }
                    }
                }

                if (closeBrace == -1) return;

                content = content.Substring(0, openBrace + 1) + content.Substring(closeBrace);
                File.WriteAllText(filePath, content, Encoding.UTF8);
            }
            catch { }
        }

        private byte[] ConvertFromBase64Url(string input)
        {
            string output = input.Replace('-', '+').Replace('_', '/');
            switch (output.Length % 4)
            {
                case 0: break;
                case 2: output += "=="; break;
                case 3: output += "="; break;
                default: throw new FormatException("Illegal base64url string!");
            }
            return Convert.FromBase64String(output);
        }
    }
}
