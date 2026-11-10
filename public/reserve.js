// 席の予約のページ(ハンズオン②)
// ブラウザで動く JavaScript。サーバーの Worker(src/index.js)に内容を送って、確かめてもらう

const form = document.getElementById('reserve-form');
const result = document.getElementById('result');

function showResult(message, isError) {
  // innerHTML ではなく textContent で入れる(第8回の XSS)
  result.textContent = message;
  result.className = isError ? 'error' : '';
}

form.addEventListener('submit', async (event) => {
  // フォームの送信でページを移動しないようにする
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form));
  try {
    const res = await fetch('/api/reserve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    showResult(body.message, !body.ok);
  } catch {
    showResult('予約のしくみにつながりませんでした', true);
  }
});
