param(
    [switch]$ReadOnly,
    [switch]$SkipPatch
)

$ErrorActionPreference = 'Stop'

$steamRoot = 'E:\games'
$steamId = '1245683218'
$appId = '739630'
$patcher = 'C:\Users\iliyk\Desktop\SharpBuy\scripts\PhasmoSavePatch'
$masterSave = 'C:\Users\iliyk\Desktop\phasmo_master_save.bin'

$localSaveDir = Join-Path $env:USERPROFILE 'AppData\LocalLow\Kinetic Games\Phasmophobia'
$localSave = Join-Path $localSaveDir 'SaveFile.txt'
$sharedConfig = Join-Path $steamRoot "userdata\$steamId\7\remote\sharedconfig.vdf"
$cloudRoot = Join-Path $steamRoot "userdata\$steamId\$appId"

function Stop-GameAndSteam {
    Get-Process Phasmophobia -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process steam -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    if (Get-Process steam, Phasmophobia -ErrorAction SilentlyContinue) {
        throw 'Close Steam and Phasmophobia manually, then run again.'
    }
}

function Clear-ReadOnly([string]$Path) {
    if (-not (Test-Path $Path)) { return }
    $item = Get-Item $Path -Force
    if ($item.IsReadOnly) {
        $item.IsReadOnly = $false
    }
}

function Set-ReadOnlyFlag([string]$Path, [bool]$Enabled) {
    if (-not (Test-Path $Path)) { return }
    $item = Get-Item $Path -Force
    $item.IsReadOnly = $Enabled
}

function Inject-MasterSave {
    param([string]$Master, [string]$Dir)
    if (-not (Test-Path $Master)) { throw "Master save missing: $Master" }

    $targets = @(
        'SaveFile.txt',
        'SaveFile.txt.tmp',
        'SaveFile.txt.tmp.bak'
    )

    foreach ($name in $targets) {
        $path = Join-Path $Dir $name
        Clear-ReadOnly $path
        Copy-Item $Master $path -Force
        if ($ReadOnly) {
            Set-ReadOnlyFlag $path $true
        }
    }
}

Stop-GameAndSteam
New-Item -ItemType Directory -Force -Path $localSaveDir | Out-Null

foreach ($name in @('SaveFile.txt', 'SaveFile.txt.tmp', 'SaveFile.txt.tmp.bak')) {
    Clear-ReadOnly (Join-Path $localSaveDir $name)
}

if (-not $SkipPatch) {
    Write-Host 'Patching save...'
    dotnet build $patcher -c Release -v q | Out-Null
    dotnet run --project $patcher -c Release --no-build | Out-Host
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (-not (Test-Path $localSave)) {
    throw 'SaveFile.txt not found.'
}

Copy-Item $localSave $masterSave -Force
Write-Host "Master save: $masterSave"

Inject-MasterSave -Master $masterSave -Dir $localSaveDir

Write-Host 'Wiping Steam cloud cache for Phasmophobia...'
if (Test-Path $cloudRoot) {
    Remove-Item $cloudRoot -Recurse -Force
}

Write-Host 'Disabling Steam Cloud for Phasmophobia...'
$cfgDir = Split-Path $sharedConfig -Parent
New-Item -ItemType Directory -Force -Path $cfgDir | Out-Null
if (Test-Path $sharedConfig) {
    $cfg = Get-Content $sharedConfig -Raw
    if ($cfg -match '"739630"') {
        $cfg = $cfg -replace '("739630"[\s\S]*?"cloudenabled"\s*")(\d+)(")', '${1}0${3}'
    } else {
        $cfg = $cfg -replace '("Apps"\s*\{)', '${1}
					"739630"
					{
						"cloudenabled"		"0"
					}'
    }
    if ($cfg -match '"Steam"[\s\S]*?"cloudenabled"') {
        $cfg = $cfg -replace '("Steam"[\s\S]*?"cloudenabled"\s*")(\d+)(")', '${1}0${3}'
    } elseif ($cfg -match '"Steam"\s*\{') {
        $cfg = $cfg -replace '("Steam"\s*\{)', '${1}
				"cloudenabled"		"0"'
    }
    Set-Content -Path $sharedConfig -Value $cfg -Encoding UTF8 -NoNewline
} else {
    @"
"UserRoamingConfigStore"
{
	"Software"
	{
		"Valve"
		{
			"Steam"
			{
				"cloudenabled"		"0"
				"Apps"
				{
					"739630"
					{
						"cloudenabled"		"0"
					}
				}
			}
		}
	}
}
"@ | Set-Content -Path $sharedConfig -Encoding UTF8
}

Write-Host ''
Write-Host 'Done! Max save copied to SaveFile.txt + SaveFile.txt.tmp' -ForegroundColor Green
Write-Host 'Use PHASMOPHOBIA_PLAY.bat to launch.'
