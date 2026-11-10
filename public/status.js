// トップページに「今、営業中か」を出す(ハンズオン②)
// 判断するのはサーバーの Worker(src/index.js の /api/status)

async function showStatus() {
  const el = document.getElementById('open-status');
  try {
    const res = await fetch('/api/status');
    const body = await res.json();
    el.textContent = `${body.message}(${body.time} 現在)`;
    el.className = body.open ? 'open' : 'closed';
  } catch {
    // Pages の URL など、プログラムがないところでは何も出さない
    el.textContent = '';
  }
}

showStatus();
