$ErrorActionPreference = 'SilentlyContinue'

$masterSave = 'C:\Users\iliyk\Desktop\phasmo_master_save.bin'
$saveDir = Join-Path $env:USERPROFILE 'AppData\LocalLow\Kinetic Games\Phasmophobia'
$targets = @('SaveFile.txt', 'SaveFile.txt.tmp', 'SaveFile.txt.tmp.bak')
$masterHash = $null
$deadline = (Get-Date).AddMinutes(8)

function Ensure-Patched {
    if (-not (Test-Path $masterSave)) { return }
    if (-not $script:masterHash) {
        $script:masterHash = (Get-FileHash $masterSave -Algorithm SHA256).Hash
    }

    foreach ($name in $targets) {
        $path = Join-Path $saveDir $name
        if (-not (Test-Path $path)) { continue }
        $hash = (Get-FileHash $path -Algorithm SHA256).Hash
        if ($hash -ne $script:masterHash) {
            $item = Get-Item $path -Force
            $item.IsReadOnly = $false
            Copy-Item $masterSave $path -Force
        }
    }
}

while ((Get-Date) -lt $deadline) {
    Ensure-Patched
    if (Get-Process Phasmophobia) {
        $deadline = (Get-Date).AddSeconds(45)
    }
    Start-Sleep -Milliseconds 200
}
