using System;
using System.IO;
using System.Linq;
using SharpBuy_Launcher;
class P {
  static void Main(string[] args) {
    var sm = new SteamManager();
    string token = args[0];
    var p = sm.ParseToken(token);
    string key = sm.ComputeCrc32(p.AccountName) + "1";
    Console.WriteLine("KEY=" + key);
    var r = sm.InjectTokenAndLaunch(token);
    Console.WriteLine("SUCCESS=" + r.Success);
    Console.WriteLine("MSG=" + r.Message);
    Console.WriteLine("ACC=" + r.AccountName);
    string local = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Steam", "local.vdf");
    string txt = File.ReadAllText(local);
    Console.WriteLine("HAS_KEY=" + txt.Contains("\"" + key + "\""));
    var reg = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(@"Software\Valve\Steam");
    Console.WriteLine("REG=" + reg?.GetValue("AutoLoginUser"));
  }
}
