import React, { useEffect, useMemo, useRef, useState } from 'react';

export type TextTypeProps = {
  text: string;
  speed?: number; // ms per char
  startDelay?: number; // ms
  cursor?: string;
  cursorBlink?: boolean;
  hideCursorWhenDone?: boolean;
  className?: string;
};

/**
 * ReactBits Text Type (local implementation)
 * Reference: https://reactbits.dev/text-animations/text-type
 */
export default function TextType({
  text,
  speed = 12,
  startDelay = 0,
  cursor = '|',
  cursorBlink = true,
  hideCursorWhenDone = false,
  className,
}: TextTypeProps) {
  const fullText = useMemo(() => text ?? '', [text]);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const startTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setI(0);
    setDone(false);
  }, [fullText]);

  useEffect(() => {
    if (startTimeoutRef.current != null) window.clearTimeout(startTimeoutRef.current);
    if (intervalRef.current != null) window.clearInterval(intervalRef.current);

    startTimeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        setI((prev) => {
          const next = prev + 1;
          if (next >= fullText.length) {
            if (intervalRef.current != null) window.clearInterval(intervalRef.current);
            setDone(true);
            return fullText.length;
          }
          return next;
        });
      }, Math.max(1, speed));
    }, Math.max(0, startDelay));

    return () => {
      if (startTimeoutRef.current != null) window.clearTimeout(startTimeoutRef.current);
      if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    };
  }, [fullText, speed, startDelay]);

  const typed = fullText.slice(0, i);
  const showCursor = cursor && (!hideCursorWhenDone || !done);

  return (
    <span className={className}>
      <span className="rb-texttype-text">{typed}</span>
      {showCursor ? (
        <span className={`rb-texttype-cursor ${cursorBlink ? 'rb-texttype-cursor--blink' : ''}`}>{cursor}</span>
      ) : null}
    </span>
  );
}
