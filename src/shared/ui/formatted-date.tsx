"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: Date | string | number;
  className?: string;
}

export const FormattedDate = ({ date, className }: FormattedDateProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>...</span>;
  }

  return (
    <span className={className}>
      {new Date(date).toLocaleDateString()}
    </span>
  );
};
