async function main() {
  const url = 'https://csstats.gg/match/494697132';
  const watchUrl = 'https://csstats.gg/match/494697132/watch/b2add6d69be903ca3546ba509e794c102e55ba6aed718ee62d259c2fb5595386';
  
  console.log('Fetching match page...');
  const res1 = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html1 = await res1.text();
  console.log('Status 1:', res1.status, 'Length:', html1.length);
  
  // Search for valve replay link or csgo_download_match
  const matchCode = html1.match(/CSGO-[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+/);
  if (matchCode) {
    console.log('Match Sharing Code:', matchCode[0]);
  }

  const replayLink = html1.match(/https?:\/\/[^\s"']*replay[^\s"']*\.dem[^\s"']*/i);
  if (replayLink) {
    console.log('Replay Link:', replayLink[0]);
  }

  const steamWatch = html1.match(/steam:\/\/rungame\/730\/[^\s"']+/i);
  if (steamWatch) {
    console.log('Steam Watch Link:', steamWatch[0]);
  }

  console.log('Fetching watch URL redirect...');
  const res2 = await fetch(watchUrl, {
    redirect: 'manual',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  console.log('Status 2:', res2.status);
  console.log('Location 2:', res2.headers.get('location'));
  const html2 = await res2.text();
  console.log('Watch body excerpt:', html2.slice(0, 500));
}

main().catch(console.error);
