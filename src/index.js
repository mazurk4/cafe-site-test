// cafe-site のプログラム(ハンズオン②)
// 「今、営業中か」と「予約の内容が正しいか」を、サーバーで確かめる
// データベースは使わないので、予約は保存しない(練習用のサイト)

const CLOSED_DAY = 3; // 定休日: 水曜日(日曜日が 0)
const OPEN_HOUR = 8; // 8:00 に開店
const CLOSE_HOUR = 18; // 18:00 に閉店
const TIMES = ['10:00', '13:00', '16:00']; // 予約できる時間
const MAX_PEOPLE = 6; // 1回の予約で6名さままで
const MAX_DAYS_AHEAD = 30; // 30日先まで予約できる
const WEEK = ['日', '月', '火', '水', '木', '金', '土'];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/hello') {
      return Response.json({
        message: 'こんにちは、Workers',
        time: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        colo: request.cf?.colo,
      });
    }

    // 今、営業中かを返す
    if (url.pathname === '/api/status' && request.method === 'GET') {
      return getStatus();
    }

    // 予約の内容を確かめる
    if (url.pathname === '/api/reserve' && request.method === 'POST') {
      return checkReservation(request);
    }

    return new Response('ページが見つかりません', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
};

// 日本時間の「今」
// サーバーの時計は世界共通の時刻(UTC)なので、9時間足して getUTC〜 で読む
function nowInJapan() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

function getStatus() {
  const now = nowInJapan();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  const time = now.toISOString().slice(11, 16); // 例: 14:05

  let open = false;
  let message;
  if (day === CLOSED_DAY) {
    message = '本日は定休日です';
  } else if (hour < OPEN_HOUR) {
    message = `準備中です(${OPEN_HOUR}:00 から)`;
  } else if (hour >= CLOSE_HOUR) {
    message = '本日の営業は終わりました';
  } else {
    open = true;
    message = `営業中です(${CLOSE_HOUR}:00 まで)`;
  }
  return Response.json({ open, message, time });
}

async function checkReservation(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return error('送られてきたデータの形が正しくありません');
  }
  if (typeof data !== 'object' || data === null) {
    return error('送られてきたデータの形が正しくありません');
  }

  const nickname = String(data.nickname ?? '').trim();
  const date = String(data.date ?? '');
  const time = data.time;
  const people = Number(data.people);

  // ブラウザの選択肢は、見る人が書き換えられる
  // だから、サーバーでもう一度確かめる。決まった値だけを通す
  if (nickname === '' || nickname.length > 20) {
    return error('ニックネームは1〜20文字で入れてください');
  }
  if (!TIMES.includes(time)) {
    return error('その時間は予約できません');
  }
  if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) {
    return error(`人数は1〜${MAX_PEOPLE}名で選んでください`);
  }

  // 日付は「YYYY-MM-DD」の形で、本当にある日か
  const target = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(target.getTime())
    || target.toISOString().slice(0, 10) !== date) {
    return error('日付が正しくありません');
  }

  // 「今日」は、ブラウザではなくサーバーの時計で決める
  const now = nowInJapan();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysAhead = (target.getTime() - today) / (24 * 60 * 60 * 1000);

  if (daysAhead < 0) {
    return error('過ぎた日は予約できません');
  }
  if (daysAhead > MAX_DAYS_AHEAD) {
    return error(`予約は${MAX_DAYS_AHEAD}日先までです`);
  }
  if (target.getUTCDay() === CLOSED_DAY) {
    return error('水曜日は定休日です');
  }
  if (daysAhead === 0 && Number(time.slice(0, 2)) <= now.getUTCHours()) {
    return error('その時間は、もう過ぎています');
  }

  const month = target.getUTCMonth() + 1;
  const day = target.getUTCDate();
  const week = WEEK[target.getUTCDay()];
  return Response.json({
    ok: true,
    message: `${month}月${day}日(${week}) ${time}、${people}名さま。この内容で予約できます(練習用のサイトなので、保存はしません)`,
  });
}

function error(message) {
  return Response.json({ ok: false, message }, { status: 400 });
}
