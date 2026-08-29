using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace SharpBuy_Checker
{
    [ComVisible(true)]
    public class WebBridge
    {
        private static readonly HttpClient _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(8) };

        public async Task<string> CheckSingleToken(string tokenStr)
        {
            tokenStr = tokenStr.Trim();
            string[] parts = tokenStr.Split(new[] { "----" }, StringSplitOptions.RemoveEmptyEntries);
            string steamId = parts.Length > 0 ? parts[0].Trim() : "Unknown";

            // 1. Try local Node API server if running
            try
            {
                var jsonBody = JsonSerializer.Serialize(new { token = tokenStr });
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                var resp = await _httpClient.PostAsync("http://localhost:3000/api/steam-verify", content);
                if (resp.IsSuccessStatusCode)
                {
                    string respBody = await resp.Content.ReadAsStringAsync();
                    return AddTokenField(respBody, tokenStr, steamId);
                }
            }
            catch { }

            // 2. Call node scripts/cm_check.js directly
            try
            {
                string scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts", "cm_check.js");
                if (!File.Exists(scriptPath))
                {
                    scriptPath = @"C:\Users\iliyk\Desktop\SharpBuy\scripts\cm_check.js";
                }

                if (File.Exists(scriptPath))
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = "node",
                        Arguments = $"\"{scriptPath}\" \"{tokenStr}\"",
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
                        {
                            return AddTokenField(output.Trim(), tokenStr, steamId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"cm_check error: {ex.Message}");
            }

            // Fallback response if Node is unavailable
            return JsonSerializer.Serialize(new
            {
                steamId = steamId,
                token = tokenStr,
                isAlive = false,
                reason = "❌ Ошибка вызова службы проверки (Node.js)"
            });
        }

        private string AddTokenField(string jsonString, string tokenStr, string steamId)
        {
            try
            {
                using var doc = JsonDocument.Parse(jsonString);
                var root = doc.RootElement;
                bool isAlive = root.TryGetProperty("isAlive", out var aliveEl) && aliveEl.GetBoolean();
                string reason = root.TryGetProperty("reason", out var reasonEl) ? reasonEl.GetString() ?? "" : "";
                string sId = root.TryGetProperty("steamId", out var sIdEl) ? sIdEl.GetString() ?? steamId : steamId;

                var obj = new
                {
                    steamId = sId,
                    token = tokenStr,
                    isAlive = isAlive,
                    reason = reason,
                    personaName = sId
                };
                return JsonSerializer.Serialize(obj);
            }
            catch
            {
                return jsonString;
            }
        }

        public string OpenFileDialog()
        {
            using var ofd = new OpenFileDialog();
            ofd.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*";
            ofd.Title = "Выберите файл с токенами Steam (steam.txt)";
            if (ofd.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    return File.ReadAllText(ofd.FileName);
                }
                catch (Exception ex)
                {
                    return $"ERROR:{ex.Message}";
                }
            }
            return string.Empty;
        }

        public bool SaveTextFile(string defaultName, string content)
        {
            using var sfd = new SaveFileDialog();
            sfd.Filter = "Text Files (*.txt)|*.txt|All Files (*.*)|*.*";
            sfd.FileName = defaultName;
            sfd.Title = "Сохранить чистый список токенов";
            if (sfd.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    File.WriteAllText(sfd.FileName, content);
                    return true;
                }
                catch { }
            }
            return false;
        }

        public bool OverwriteDesktopSteamTxt(string content)
        {
            try
            {
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string steamTxtPath = Path.Combine(desktopPath, "steam.txt");
                File.WriteAllText(steamTxtPath, content);
                return true;
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Overwrite error: {ex.Message}");
                return false;
            }
        }

        public void CopyToClipboard(string text)
        {
            try
            {
                if (!string.IsNullOrEmpty(text))
                {
                    Clipboard.SetText(text);
                }
            }
            catch { }
        }

        public bool LaunchSteamAccount(string tokenStr)
        {
            return SteamManager.InjectTokenAndLaunch(tokenStr);
        }
    }
}
