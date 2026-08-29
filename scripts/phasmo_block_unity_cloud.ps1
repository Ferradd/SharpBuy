param(
    [ValidateSet('Block','Unblock')]
    [string]$Action = 'Block'
)

$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$markerStart = '# PHASMO_BLOCK_UNITY_CLOUD_START'
$markerEnd = '# PHASMO_BLOCK_UNITY_CLOUD_END'

$domains = @(
    'cloud-save.services.api.unity.com',
    'services.api.unity.com',
    'config.uca.cloud.unity3d.com',
    'cdp.cloud.unity3d.com',
    'cloud.unity3d.com'
)

function Test-Admin {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $p = New-Object Security.Principal.WindowsPrincipal($id)
    return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Host 'Requesting Administrator...' -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Action $Action"
    exit
}

$content = Get-Content $hostsFile -Raw -ErrorAction Stop
$content = [regex]::Replace($content, "(?s)$markerStart.*?$markerEnd\r?\n?", '')

if ($Action -eq 'Block') {
    $block = "`r`n$markerStart`r`n"
    foreach ($d in $domains) { $block += "127.0.0.1 $d`r`n0.0.0.0 $d`r`n" }
    $block += "$markerEnd`r`n"
    $content = $content.TrimEnd() + $block
    Set-Content -Path $hostsFile -Value $content -Encoding ASCII
    ipconfig /flushdns | Out-Null
    Write-Host 'Unity Cloud blocked for Phasmophobia session.' -ForegroundColor Green
} else {
    Set-Content -Path $hostsFile -Value ($content.TrimEnd() + "`r`n") -Encoding ASCII
    ipconfig /flushdns | Out-Null
    Write-Host 'Unity Cloud unblocked.' -ForegroundColor Green
}
