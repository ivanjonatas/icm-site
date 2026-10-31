import React, {useEffect, useState} from 'react';
import {Action} from './ui';

const FIRST_LINE = 'MARANATA!';
const SECOND_LINE = 'O SENHOR JESUS';
const LAST_WORD = ' VEM!';
const SUBTITLE = 'Anunciando o Evangelho Eterno.';

const TITLE_LENGTH =
  FIRST_LINE.length +
  SECOND_LINE.length +
  LAST_WORD.length;

const TOTAL_LENGTH = TITLE_LENGTH + SUBTITLE.length;

const styles = `
.hero h1 > .hero-typing-white {
  color: #fff;
  font-weight: 600;
}

.hero h1 > .hero-typing-red {
  color: #ff1f1f;
  font-weight: 500;
}

.hero .hero-typing-char {
  position: relative;
  visibility: hidden;
}

.hero .hero-typing-char.is-visible {
  visibility: visible;
}

.hero .hero-typing-char.is-cursor::after {
  content: '';
  position: absolute;
  left: 100%;
  top: .12em;
  width: 2px;
  height: .85em;
  background: currentColor;
  pointer-events: none;
  animation: hero-cursor-blink .75s step-end infinite;
}

.hero .hero-actions--intro {
  opacity: 0;
  visibility: hidden;
  transform: translateX(-64px);
  pointer-events: none;
}

.hero .hero-actions--intro.is-visible {
  visibility: visible;
  pointer-events: auto;
  animation:
    hero-button-enter .8s
    cubic-bezier(.22, 1, .36, 1)
    both;
}

@keyframes hero-cursor-blink {
  0%, 49% {
    opacity: 1;
  }

  50%, 100% {
    opacity: 0;
  }
}

@keyframes hero-button-enter {
  from {
    opacity: 0;
    transform: translateX(-64px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero .hero-typing-char {
    visibility: visible;
  }

  .hero .hero-typing-char.is-cursor::after {
    display: none;
  }

  .hero .hero-actions--intro {
    opacity: 1;
    visibility: visible;
    transform: none;
    pointer-events: auto;
    animation: none;
  }
}
`;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  );
}

export function HeroIntro() {
  const [typed, setTyped] = useState(() =>
    prefersReducedMotion() ? TOTAL_LENGTH : 0
  );

  const [buttonVisible, setButtonVisible] = useState(
    prefersReducedMotion
  );

  useEffect(() => {
    const preference = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let position = 0;

    function showEverything() {
      stopped = true;
      clearTimeout(timer);

      setTyped(TOTAL_LENGTH);
      setButtonVisible(true);
    }

    function typeNextCharacter() {
      if (stopped) return;

      position += 1;
      setTyped(position);

      if (position < TITLE_LENGTH) {
        timer = setTimeout(typeNextCharacter, 55);
      } else if (position === TITLE_LENGTH) {
        timer = setTimeout(typeNextCharacter, 280);
      } else if (position < TOTAL_LENGTH) {
        timer = setTimeout(typeNextCharacter, 28);
      } else {
        timer = setTimeout(() => {
          if (!stopped) {
            setButtonVisible(true);
          }
        }, 180);
      }
    }

    function onPreferenceChange(
      event: MediaQueryListEvent
    ) {
      if (event.matches) {
        showEverything();
      }
    }

    if (preference.matches) {
      showEverything();
    } else {
      timer = setTimeout(typeNextCharacter, 250);
    }

    preference.addEventListener(
      'change',
      onPreferenceChange
    );

    return () => {
      stopped = true;
      clearTimeout(timer);

      preference.removeEventListener(
        'change',
        onPreferenceChange
      );
    };
  }, []);

  function letters(text: string, offset: number) {
    return Array.from(text).map((character, index) => {
      const number = offset + index + 1;

      const visible = number <= typed;

      const cursor =
        number === typed &&
        typed < TOTAL_LENGTH &&
        !buttonVisible;

      return (
        <span
          key={number}
          className={
            'hero-typing-char' +
            (visible ? ' is-visible' : '') +
            (cursor ? ' is-cursor' : '')
          }
        >
          {character}
        </span>
      );
    });
  }

  return (
    <div className="container hero-content">
      <style>{styles}</style>

      <h1 aria-label="MARANATA! O SENHOR JESUS VEM!">
        <span
          className="hero-typing-white"
          aria-hidden="true"
        >
          {letters(FIRST_LINE, 0)}
        </span>

        <br aria-hidden="true" />

        <span
          className="hero-typing-red"
          aria-hidden="true"
        >
          {letters(SECOND_LINE, FIRST_LINE.length)}

          <br className="mobile-break" />

          {letters(
            LAST_WORD,
            FIRST_LINE.length + SECOND_LINE.length
          )}
        </span>
      </h1>

      <p>
        <span className="sr-only">
          {SUBTITLE}
        </span>

        <span aria-hidden="true">
          {letters(SUBTITLE, TITLE_LENGTH)}
        </span>
      </p>

      <div
        className={
          'hero-actions hero-actions--intro' +
          (buttonVisible ? ' is-visible' : '')
        }
        aria-hidden={!buttonVisible}
        inert={!buttonVisible}
      >
        <Action href="/igrejas">
          Encontre uma igreja mais perto de si
        </Action>
      </div>
    </div>
  );
}