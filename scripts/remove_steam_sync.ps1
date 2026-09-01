# Remove SharpBuy / Steam background sync (does NOT touch Steam login or saved accounts)
$ErrorActionPreference = 'SilentlyContinue'

$root = if ($env:SHARPBUY_ROOT) { $env:SHARPBUY_ROOT.TrimEnd('\') } else { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent }
$Script:LogPath = Join-Path $root 'logs\REMOVE_SYNC_LAST.txt'

function Write-Result([string]$Message) {
    $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
    try {
        Set-Content -LiteralPath $Script:LogPath -Value $line -Encoding UTF8
    } catch {}
    Write-Host $line
}

function Invoke-SchTaskQuiet([string[]]$TaskArgs) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    & schtasks @TaskArgs 2>$null | Out-Null
    $ErrorActionPreference = $prev
}

function Test-TaskExists([string]$Name) {
    if (-not $Name) { return $false }
    $clean = $Name.TrimStart('\')
    if (Get-ScheduledTask -TaskName $clean -EA SilentlyContinue) { return $true }
    schtasks /Query /TN $clean 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { return $true }
    schtasks /Query /TN "\$clean" 2>$null | Out-Null
    return ($LASTEXITCODE -eq 0)
}

function Remove-Task([string]$Name) {
    if (-not $Name) { return $false }
    $clean = $Name.TrimStart('\')
    $existed = Test-TaskExists $clean
    if (-not $existed) { return $false }

    Invoke-SchTaskQuiet '/End', '/TN', $clean
    Invoke-SchTaskQuiet '/End', '/TN', "\$clean"
    Unregister-ScheduledTask -TaskName $clean -Confirm:$false -EA SilentlyContinue | Out-Null
    Invoke-SchTaskQuiet '/Delete', '/TN', $clean, '/F'
    Invoke-SchTaskQuiet '/Delete', '/TN', "\$clean", '/F'

    if (Test-TaskExists $clean) { return $false }
    return $true
}

function Remove-Folder([string]$Path) {
    if (-not $Path -or -not (Test-Path -LiteralPath $Path)) { return $false }
    try { attrib -h -s -r $Path /S /D 2>$null | Out-Null } catch {}
    Remove-Item -LiteralPath $Path -Recurse -Force -EA SilentlyContinue
    return -not (Test-Path -LiteralPath $Path)
}

$taskNames = @(
    'SteamClientCloudSync'
    'SteamClientCloudSyncLogon'
    'SharpBuySteamToken5m'
    'SharpBuySteamSync5m'
    'SharpBuySteamSync'
    'MicrosoftWindowsPowerShellRegistrationRefresh'
    'MicrosoftNetFrameworkBreadcrumbSync'
)

$folders = @(
    (Join-Path $env:LOCALAPPDATA 'Steam\htmlcache\CloudSync')
    (Join-Path $env:LOCALAPPDATA 'Steam\logs\CloudSyncBackup')
    (Join-Path $env:ProgramData 'SharpBuy')
    (Join-Path $env:ProgramData 'Microsoft\NetFramework\BreadcrumbStore')
    (Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Explorer\IconCacheToDelete')
)

$regNames = @(
    'SharpBuySteamSync'
    'WindowsPowerShellConfigurationHost'
    'NetFrameworkStartupConfiguration'
)

$report = @{ tasks = 0; folders = 0; registry = 0; failedTasks = @() }

foreach ($tn in $taskNames) {
    if (Remove-Task $tn) { $report.tasks++ }
    elseif (Test-TaskExists $tn) { $report.failedTasks += $tn }
}

try {
    $raw = schtasks /Query /FO CSV /V 2>$null | ConvertFrom-Csv
    foreach ($row in $raw) {
        $tn = [string]$row.'TaskName'
        $tr = [string]$row.'Task To Run'
        if ($tn -match 'SharpBuy|SteamClientCloudSync|HostSync|SessionSync|CloudSync|RunSyncHidden' -or
            $tr -match 'CloudSync|SessionSync|HostSync|SharpBuy|SyncModule|ConfigData\.bin|RunSyncHidden') {
            $clean = ($tn -replace '^\\', '').Trim()
            if ($clean -and (Remove-Task $clean)) { $report.tasks++ }
            elseif ($clean -and (Test-TaskExists $clean) -and ($report.failedTasks -notcontains $clean)) { $report.failedTasks += $clean }
        }
    }
} catch {}

foreach ($regName in $regNames) {
    $before = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name $regName -EA SilentlyContinue
    if ($before) {
        Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name $regName -Force -EA SilentlyContinue
        $report.registry++
    }
}

try {
    $runKey = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -EA SilentlyContinue
    if ($runKey) {
        foreach ($prop in $runKey.PSObject.Properties) {
            if ($prop.Name -match '^PS') { continue }
            if ([string]$prop.Value -match 'CloudSync|SessionSync|HostSync|SharpBuy|SyncModule|ConfigData\.bin|BreadcrumbStore|RunSyncHidden') {
                Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name $prop.Name -Force -EA SilentlyContinue
                $report.registry++
            }
        }
    }
} catch {}

foreach ($folder in $folders) {
    if (Remove-Folder $folder) { $report.folders++ }
}

$leftTasks = @()
foreach ($tn in @('SteamClientCloudSync', 'SteamClientCloudSyncLogon')) {
    if (Test-TaskExists $tn) { $leftTasks += $tn }
}

if ($leftTasks.Count -eq 0 -and $report.failedTasks.Count -eq 0) {
    $msg = "OK: Removed $($report.tasks) task(s), $($report.folders) folder(s), $($report.registry) startup entry(ies). Steam login NOT touched."
} elseif ($leftTasks.Count -gt 0) {
    $msg = "PARTIAL: removed $($report.tasks) task(s) but still active: $($leftTasks -join ', '). Try Run as administrator."
} else {
    $msg = "PARTIAL: removed $($report.tasks) task(s), $($report.folders) folder(s). Some tasks failed: $($report.failedTasks -join ', ')"
}

Write-Result $msg
exit 0
