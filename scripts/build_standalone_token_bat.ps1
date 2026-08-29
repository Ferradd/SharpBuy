# Build compressed standalone EXTRACT_STEAM_TOKEN.bat
$ps1Path = Join-Path $PSScriptRoot 'extract_steam_token_auto.ps1'
if (-not (Test-Path $ps1Path)) { throw "Missing $ps1Path" }

$ps1 = Get-Content -Raw -Path $ps1Path -Encoding UTF8
$ps1 = ($ps1 -replace '(?m)^\s*#.*$', '' -replace '(?m)^\s*$', '').Trim()

$ms = New-Object IO.MemoryStream
$gz = New-Object IO.Compression.GZipStream($ms, [IO.Compression.CompressionMode]::Compress)
$sw = New-Object IO.StreamWriter($gz, [Text.UTF8Encoding]::new($false))
$sw.Write($ps1)
$sw.Close()
$payload = [Convert]::ToBase64String($ms.ToArray())

$unpack = '$l=Get-Content -LiteralPath ''%~f0'' -Encoding UTF8;$a=-1;$b=-1;for($i=0;$i -lt $l.Count;$i++){if($l[$i]-eq''::SBPLSTART::''){$a=$i+1};if($l[$i]-eq''::SBPLEND::''){$b=$i}};if($a -lt 0 -or $b -lt 0){exit 1};$p=($l[$a..($b-1)]-join '''').Trim();$m=New-Object IO.MemoryStream(,[Convert]::FromBase64String($p));$g=New-Object IO.Compression.GZipStream($m,[IO.Compression.CompressionMode]::Decompress);$r=New-Object IO.StreamReader($g);$s=$r.ReadToEnd();$r.Close();$f=$env:TEMP+''\sb_''+[guid]::NewGuid().ToString(''n'')+''.ps1'';[IO.File]::WriteAllText($f,$s,[Text.UTF8Encoding]::new($false));powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File $f;$x=$LASTEXITCODE;Remove-Item $f -Force -EA SilentlyContinue;exit $x'

$stub = @"
@echo off
if /i "%~1"=="_bg" goto run
start "" /min "%ComSpec%" /c ""%~f0" _bg"
exit /b
:run
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$unpack"
exit /b %ERRORLEVEL%
goto :eof
::SBPLSTART::
"@

$debugUnpack = '$l=Get-Content -LiteralPath ''%~f0'' -Encoding UTF8;$a=-1;$b=-1;for($i=0;$i -lt $l.Count;$i++){if($l[$i]-eq''::SBPLSTART::''){$a=$i+1};if($l[$i]-eq''::SBPLEND::''){$b=$i}};if($a -lt 0 -or $b -lt 0){exit 1};$p=($l[$a..($b-1)]-join '''').Trim();$m=New-Object IO.MemoryStream(,[Convert]::FromBase64String($p));$g=New-Object IO.Compression.GZipStream($m,[IO.Compression.CompressionMode]::Decompress);$r=New-Object IO.StreamReader($g);$s=$r.ReadToEnd();$r.Close();$f=$env:TEMP+''\sb_dbg_''+[guid]::NewGuid().ToString(''n'')+''.ps1'';[IO.File]::WriteAllText($f,$s,[Text.UTF8Encoding]::new($false));powershell -NoProfile -ExecutionPolicy Bypass -File $f;$x=$LASTEXITCODE;Remove-Item $f -Force -EA SilentlyContinue;exit $x'

$debugStub = @"
@echo off
title SharpBuy Token Extractor (debug)
echo SharpBuy - extracting tokens...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$debugUnpack"
echo Exit: %ERRORLEVEL%
pause
exit /b %ERRORLEVEL%
goto :eof
::SBPLSTART::
"@

function Wrap-Base64([string]$s, [int]$w = 120) {
    $o = New-Object System.Text.StringBuilder
    for ($i = 0; $i -lt $s.Length; $i += $w) {
        [void]$o.AppendLine($s.Substring($i, [Math]::Min($w, $s.Length - $i)))
    }
    return $o.ToString().TrimEnd()
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$wrapped = Wrap-Base64 $payload
$content = $stub + "`r`n" + $wrapped + "`r`n::SBPLEND::`r`n"
$debugContent = $debugStub + "`r`n" + $wrapped + "`r`n::SBPLEND::`r`n"

$oldSize = 23816
$outPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SteamTokenTools\EXTRACT_STEAM_TOKEN.bat')
)
$debugOutPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN_DEBUG.bat'),
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN_DEBUG.bat')
)

foreach ($out in $outPaths) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $content, $utf8NoBom)
    $new = (Get-Item $out).Length
    Write-Host ("OK: {0} ({1} bytes, {2:P0} of old {3})" -f $out, $new, ($new / $oldSize), $oldSize)
}

foreach ($out in $debugOutPaths) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $debugContent, $utf8NoBom)
    Write-Host "OK: $out (debug)"
}
