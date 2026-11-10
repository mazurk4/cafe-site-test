// cafe-site のプログラム(ハンズオン①)
// Cloudflare のサーバーの上で動く JavaScript
//
// public にあるファイル(index.html など)は、このプログラムを通らずに、そのまま配られる
// public にない URL に来たときだけ、ここが動く

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // /api/hello に来たら、サーバーで今の時刻を作って返す
    if (url.pathname === '/api/hello') {
      return Response.json({
        message: 'こんにちは、Workers',
        time: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        // 答えたエッジの場所(第10回の cdn-cgi/trace の colo と同じ)
        colo: request.cf?.colo,
      });
    }

    // それ以外は「見つからない」と返す
    return new Response('ページが見つかりません', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};
