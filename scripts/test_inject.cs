using System;
using System.IO;
using SharpBuy_Launcher;

class Program
{
    static void Main()
    {
        var sm = new SteamManager();
        Console.WriteLine($"SteamPath: {sm.SteamPath}");
        string token = "76561198450120427----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5ODQ1MDEyMDQyNyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3OTkxMzAwNjAsICJuYmYiOiAxNzcyMzI2OTA4LCAiaWF0IjogMTc4MDk2NjkwOCwgImp0aSI6ICIwMDExXzI4NDhGQzE3XzY0MDU5IiwgIm9hdCI6IDE3ODA5NjY5MDgsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICI3NC43My4zNy40OSIsICJpcF9jb25maXJtZXIiOiAiNzQuNzMuMzcuNDkiIH0.YP_fW-3SqGwFdSOhDcmge3mpN05IeoXwHwBN24C0cTbixzEFMEf9Uj6JggfNQQe6CyQ5C4W6RcFFQpLRNjz0DQ";
        var parsed = sm.ParseToken(token);
        Console.WriteLine($"Parsed: SteamId={parsed.SteamId}, AccountName={parsed.AccountName}, Valid={parsed.Valid}");
        string crc = sm.ComputeCrc32(parsed.AccountName) + "1";
        Console.WriteLine($"CRC key: {crc}");
        string encrypted = sm.SteamEncrypt(parsed.Eya, parsed.AccountName);
        Console.WriteLine($"Encrypted hex length: {encrypted.Length}");
    }
}
