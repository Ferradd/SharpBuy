using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

const string SaveSecret = "t36gref9u84y7f43g";
const int Money = 999_999;
const int Xp = 999_999;
const int ItemCount = 999;
const int MaxTier = 2;

string saveDir = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
    "AppData", "LocalLow", "Kinetic Games", "Phasmophobia");
Directory.CreateDirectory(saveDir);

string savePath = Path.Combine(saveDir, "SaveFile.txt");
string backupPath = Path.Combine(saveDir, $"SaveFile.backup_{DateTime.Now:yyyyMMdd_HHmmss}.txt");

if (!File.Exists(savePath))
{
    Console.Error.WriteLine("SaveFile.txt not found. Launch Phasmophobia once and log in first.");
    return 1;
}

File.Copy(savePath, backupPath, true);
Console.WriteLine($"Backup: {backupPath}");

byte[] encrypted = File.ReadAllBytes(savePath);
string json = Decrypt(encrypted);
if (string.IsNullOrWhiteSpace(json) || !json.TrimStart().StartsWith('{'))
{
    Console.Error.WriteLine("Decrypt failed: save file is not valid JSON.");
    return 1;
}

string patched = ApplyPatches(json);

byte[] output = Encrypt(patched);
File.WriteAllBytes(savePath, output);

Console.WriteLine("Done!");
Console.WriteLine($"  Money: {Money}");
Console.WriteLine($"  XP: {Xp}");
Console.WriteLine($"  Inventory: {ItemCount} per item");
Console.WriteLine($"  All unlocks + tier {MaxTier + 1}");
Console.WriteLine($"  Save: {savePath}");
return 0;

static string Decrypt(byte[] data)
{
    var iv = new byte[16];
    Array.Copy(data, iv, 16);

    using var dbytes = new Rfc2898DeriveBytes(SaveSecret, iv, 100, HashAlgorithmName.SHA1);
    var key = dbytes.GetBytes(16);

    using var aes = Aes.Create();
    aes.Mode = CipherMode.CBC;
    aes.Padding = PaddingMode.PKCS7;
    aes.Key = key;
    aes.IV = iv;

    using var ms = new MemoryStream(data, 16, data.Length - 16);
    using var cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read);
    using var reader = new StreamReader(cs, Encoding.UTF8);
    return reader.ReadToEnd();
}

static byte[] Encrypt(string data)
{
    byte[] iv = new byte[16];
    RandomNumberGenerator.Fill(iv);

    var key = new Rfc2898DeriveBytes(SaveSecret, iv, 100, HashAlgorithmName.SHA1).GetBytes(16);

    using var aes = Aes.Create();
    aes.Mode = CipherMode.CBC;
    aes.Padding = PaddingMode.PKCS7;
    aes.Key = key;
    aes.IV = iv;

    using var ms = new MemoryStream();
    using (var enc = aes.CreateEncryptor())
    using (var cs = new CryptoStream(ms, enc, CryptoStreamMode.Write))
    using (var writer = new StreamWriter(cs, Encoding.UTF8))
    {
        writer.Write(data);
    }

    byte[] edata = ms.ToArray();
    byte[] res = new byte[iv.Length + edata.Length];
    Buffer.BlockCopy(iv, 0, res, 0, iv.Length);
    Buffer.BlockCopy(edata, 0, res, iv.Length, edata.Length);
    return res;
}

static string ApplyPatches(string data)
{
    data = Regex.Replace(data,
        @"(""PlayersMoney""\s*:\s*\{\s*""__type""\s*:\s*""int""\s*,\s*""value""\s*:\s*)-?\d+",
        m => m.Groups[1].Value + Money);

    data = Regex.Replace(data,
        @"(""Experience""\s*:\s*\{\s*""__type""\s*:\s*""int""\s*,\s*""value""\s*:\s*)-?\d+",
        m => m.Groups[1].Value + Xp);

    data = Regex.Replace(data,
        @"(""(\w+Inventory)""\s*:\s*\{\s*""__type""\s*:\s*""int""\s*,\s*""value""\s*:\s*)-?\d+",
        m => m.Groups[1].Value + ItemCount);

    data = Regex.Replace(data,
        @"(""(\w*UnlockOwned)""\s*:\s*\{\s*""__type""\s*:\s*""bool""\s*,\s*""value""\s*:\s*)false",
        m => m.Groups[1].Value + "true",
        RegexOptions.IgnoreCase);

    data = Regex.Replace(data,
        @"(""(\w+-1Tier)""\s*:\s*\{\s*""__type""\s*:\s*""int""\s*,\s*""value""\s*:\s*)-?\d+",
        m => m.Groups[1].Value + MaxTier);

    data = Regex.Replace(data,
        @"(""(\w+Tier)""\s*:\s*\{\s*""__type""\s*:\s*""int""\s*,\s*""value""\s*:\s*)-?\d+",
        m => m.Groups[1].Value.Contains("Unlock", StringComparison.OrdinalIgnoreCase)
            ? m.Value
            : m.Groups[1].Value + MaxTier);

    return data;
}
