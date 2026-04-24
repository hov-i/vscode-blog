import type { AvatarMood } from "./types";

export type Quip = {
  text: string;
  mood?: AvatarMood;
  duration?: number;
};

export type TimeOfDay =
  | "morning"
  | "day"
  | "evening"
  | "night"
  | "lateNight";

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 18) return "day";
  if (h >= 18 && h < 22) return "evening";
  if (h >= 22 || h < 2) return "night";
  return "lateNight";
}

export function getBaselineMood(t: TimeOfDay): AvatarMood {
  switch (t) {
    case "morning":
      return "happy";
    case "day":
      return "idle";
    case "evening":
      return "love";
    case "night":
      return "sleepy";
    case "lateNight":
      return "sleepy";
  }
}

const IDLE_QUIPS: Quip[] = [
  { text: "오늘도 화이팅~!!", mood: "happy" },
  { text: "재밌는 거 없을까요?", mood: "confused" },
  { text: "음~ 뭐 읽을까", mood: "idle" },
  { text: "저 심심해요", mood: "sleepy" },
  { text: "좋은 글 많아요!", mood: "love" },
  { text: "시간 있다면 방명록 어때요?", mood: "wink" },
  { text: "궁금한게 있다면 저를 눌러주세요!", mood: "nod" },
];

const TIME_QUIPS: Record<TimeOfDay, Quip[]> = {
  morning: [
    { text: "좋은 아침이에요!", mood: "happy" },
    { text: "굿모닝~", mood: "happy" },
  ],
  day: [
    { text: "오늘의 점메추는?", mood: "happy" },
    { text: "맛점 하세요~", mood: "love" },
  ],
  evening: [
    { text: "하루 고생 많으셨어요", mood: "love" },
    { text: "저녁 맛있게 드세요", mood: "happy" },
  ],
  night: [
    { text: "아직 안 주무시나요?", mood: "confused" },
    { text: "저도 올빼미족이에요 ㅎ.ㅎ", mood: "nod" },
  ],
  lateNight: [
    { text: "zzz... 오늘은 이만 자요", mood: "sleepy" },
    { text: "이 시간에 깨어계시다니!", mood: "confused" },
  ],
};

const PATH_QUIPS: Array<{ match: RegExp; quips: Quip[] }> = [
  {
    match: /^\/about/,
    quips: [
      { text: "hovi에 대해 궁금하신가요?", mood: "happy" },
    ],
  },
  {
    match: /^\/posts\/\d+/,
    quips: [
      { text: "이 글 어때요?", mood: "nod" },
      { text: "읽어주셔서 감사해요", mood: "love" },
      { text: "궁금한 거 있으면 불러주세요", mood: "wink" },
    ],
  },
  {
    match: /^\/posts/,
    quips: [
      { text: "뭐부터 볼까요?", mood: "confused" },
      { text: "좋아하는 주제 있으세요?", mood: "confused" },
    ],
  },
  {
    match: /^\/projects/,
    quips: [
      { text: "프로젝트 구경해 보세요", mood: "happy" },
      { text: "소스 보러 가도 돼요", mood: "wink" },
      { text: "이거 만드느라 밤샜어요", mood: "love" },
    ],
  },
  {
    match: /^\/guestbook/,
    quips: [
      { text: "한 줄 남겨주세요~", mood: "love" },
      { text: "인사 반가워요!", mood: "happy" },
    ],
  },
  {
    match: /^\/tags/,
    quips: [
      { text: "태그로 찾으면 편해요", mood: "nod" },
    ],
  },
  {
    match: /^\/auth/,
    quips: [
      { text: "환영해요!", mood: "happy" },
    ],
  },
  {
    match: /^\/$/,
    quips: [
      { text: "어서오세요!", mood: "happy" },
      { text: "오, 오셨다!", mood: "nod" },
    ],
  },
];

const EVENT_QUIPS = {
  butterflySpawn: [
    { text: "어! 나비다!", mood: "happy", duration: 2800 },
    { text: "저거 잡아야 돼", mood: "happy", duration: 2800 },
  ] as Quip[],
  butterflyLost: [
    { text: "아... 놓쳤다", mood: "confused", duration: 2400 },
    { text: "다음엔 꼭...", mood: "sleepy", duration: 2400 },
    { text: "어디갔지 ㅠㅠ", mood: "confused", duration: 2400 },
  ] as Quip[],
  codeRead: [
    { text: "자세한 코드 내용은 깃허브를 방문해주세요", mood: "nod", duration: 3200 },
    { text: "코드 피드백도 좋아요", mood: "love", duration: 3200 },
  ] as Quip[],
  linkPeek: [
    { text: "어떤 점이 궁금하신가요?", mood: "confused", duration: 2800 },
  ] as Quip[],
  orbit: [
    { text: "히히 따라갈게요", mood: "wink", duration: 3000 },
    { text: "어디 가세요~", mood: "happy", duration: 3000 },
  ] as Quip[],
  drag: [
    { text: "우왓!", mood: "confused", duration: 2000 },
    { text: "어디가요 어디가요", mood: "happy", duration: 2000 },
    { text: "ㅠㅠ 놔줘요", mood: "confused", duration: 2000 },
    { text: "머리 다뜯긴다!!", mood: "confused", duration: 2000 },
  ] as Quip[],
  openChat: [
    { text: "말 걸러 오셨군요!", mood: "happy", duration: 2400 },
  ] as Quip[],
  picnicStart: [
    { text: "꽃밭이다! 🌸", mood: "love", duration: 3200 },
    { text: "여기서 좀 쉴게요~", mood: "happy", duration: 3200 },
    { text: "피크닉 타임 🧺", mood: "love", duration: 3200 },
  ] as Quip[],
  picnicMid: [
    { text: "날씨 좋다...", mood: "sleepy", duration: 2800 },
    { text: "꽃 향기 좋아요", mood: "love", duration: 2800 },
    { text: "같이 드실래요?", mood: "wink", duration: 2800 },
  ] as Quip[],
  picnicEnd: [
    { text: "잘 쉬었어요~", mood: "happy", duration: 2200 },
    { text: "또 와야지", mood: "love", duration: 2200 },
  ] as Quip[],
};

function pick<T>(arr: readonly T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickPathQuip(pathname: string | null): Quip | undefined {
  if (!pathname) return undefined;
  for (const entry of PATH_QUIPS) {
    if (entry.match.test(pathname)) {
      return pick(entry.quips);
    }
  }
  return undefined;
}

export function pickIdleQuip(pathname: string | null): Quip | undefined {
  const t = getTimeOfDay();
  // 40% time-based, 25% path-based, 35% generic idle
  const roll = Math.random();
  if (roll < 0.4) return pick(TIME_QUIPS[t]);
  if (roll < 0.65) {
    const p = pickPathQuip(pathname);
    if (p) return p;
  }
  return pick(IDLE_QUIPS);
}

export function pickEventQuip(
  event: keyof typeof EVENT_QUIPS,
): Quip | undefined {
  return pick(EVENT_QUIPS[event]);
}
