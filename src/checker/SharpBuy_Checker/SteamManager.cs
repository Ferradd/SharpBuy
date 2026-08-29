using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Win32;

namespace SharpBuy_Checker
{
    public static class SteamManager
    {
        public static string GetSteamPath()
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(@"Software\Valve\Steam");
                if (key != null)
                {
                    string path = key.GetValue("SteamPath") as string;
                    if (!string.IsNullOrEmpty(path) && Directory.Exists(path))
                    {
                        return path;
                    }
                }
            }
            catch { }

            string defaultPath = @"C:\Program Files (x86)\Steam";
            if (Directory.Exists(defaultPath)) return defaultPath;
            return string.Empty;
        }

        public static bool InjectTokenAndLaunch(string tokenStr)
        {
            try
            {
                string[] parts = tokenStr.Split(new[] { "----" }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length < 2) return false;

                string steamId64 = parts[0].Trim();
                string jwtToken = parts[1].Trim();

                string steamPath = GetSteamPath();
                if (string.IsNullOrEmpty(steamPath)) return false;

                // Close running Steam instances
                foreach (var proc in Process.GetProcessesByName("steam"))
                {
                    try { proc.Kill(); proc.WaitForExit(3000); } catch { }
                }

                // Update loginusers.vdf
                string vdfPath = Path.Combine(steamPath, "config", "loginusers.vdf");
                string configDir = Path.Combine(steamPath, "config");
                if (!Directory.Exists(configDir)) Directory.CreateDirectory(configDir);

                UpdateLoginUsersVdf(vdfPath, steamId64, jwtToken);

                // Launch Steam
                string steamExe = Path.Combine(steamPath, "steam.exe");
                if (File.Exists(steamExe))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = steamExe,
                        Arguments = "-silent",
                        UseShellExecute = true
                    });
                    return true;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Inject Error: {ex.Message}");
            }
            return false;
        }

        private static void UpdateLoginUsersVdf(string vdfPath, string steamId64, string jwtToken)
        {
            string content = File.Exists(vdfPath) ? File.ReadAllText(vdfPath) : "\"users\"\n{\n}\n";

            // Ensure steamid block exists in loginusers.vdf
            if (!content.Contains(steamId64))
            {
                string newBlock = $"\n\t\"{steamId64}\"\n\t{{\n\t\t\"AccountName\"\t\t\"SharpBuyUser\"\n\t\t\"PersonaName\"\t\t\"SharpBuy User\"\n\t\t\"RememberPassword\"\t\t\"1\"\n\t\t\"MostRecent\"\t\t\"1\"\n\t\t\"WantsOfflineMode\"\t\t\"0\"\n\t\t\"SkipOfflineModeWarning\"\t\t\"0\"\n\t}}\n";
                int lastBrace = content.LastIndexOf('}');
                if (lastBrace >= 0)
                {
                    content = content.Insert(lastBrace, newBlock);
                }
            }

            // Set MostRecent=1 for this user, MostRecent=0 for others
            content = Regex.Replace(content, @"(""\d{17}""\s*\{[^}]*?""MostRecent""\s*"")\d("")[^}]*?\}", m =>
            {
                bool isTarget = m.Value.Contains(steamId64);
                return Regex.Replace(m.Value, @"(""MostRecent""\s*"")\d("")", $"${{1}}{(isTarget ? "1" : "0")}${{2}}");
            }, RegexOptions.Singleline);

            File.WriteAllText(vdfPath, content, Encoding.UTF8);
        }
    }
}
