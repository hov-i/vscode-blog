// 서버 컴포넌트 — 타임존을 Asia/Seoul로 고정해서 서버가 어느 리전에 있든,
// 독자가 어느 타임존에 있든 항상 한국 시간 기준 날짜를 같은 결과로 렌더한다.
// (뷰어 로캘에 의존하지 않으므로 하이드레이션 불일치도 없음)
interface FormattedDateProps {
  date: Date | string | number;
  className?: string;
}

const formatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Seoul",
});

export const FormattedDate = ({ date, className }: FormattedDateProps) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return <span className={className}>-</span>;
  }

  return (
    <time className={className} dateTime={parsed.toISOString()}>
      {formatter.format(parsed)}
    </time>
  );
};
