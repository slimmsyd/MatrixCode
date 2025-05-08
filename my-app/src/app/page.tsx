'use client';

import Image from "next/image";
import { MatrixRainingLetters } from 'react-mdr';
import { useState, useEffect, useRef } from 'react';

const BLUE_PILL_QUESTIONS = [
  "If feelings had a frequency, what song would you say we sound like?",
  "Do you think people meet by chance… or design?",
  "If we're both playing a game, what's the name of it?",
  "Do you see me as a mirror, a mystery, or a magnet?",
  "What scares you more: being seen fully, or being missed completely?",

];

const RED_PILL_QUESTIONS = [
  "If feelings had a frequency, what song would you say we sound like?",
  "If we're both playing a game, what's the name of it?",
  "What scares you more: being seen fully, or being missed completely?",
  "  Do you think people meet by chance… or design",
  "If your feelings were a language with no words… have I heard them anyway?"
];

const QUESTION_LABELS = {
  blue: '[Curiosity]',
  red: '[Truth]'
};

const ARTEMIS_MESSAGE = '[Artemis]: Welcome, seeker. Every choice is a myth in the making...';

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setShowCursor(true);
    const typeInterval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(typeInterval);
    }, 28);
    const cursorInterval = setInterval(() => setShowCursor(c => !c), 500);
    return () => {
      clearInterval(typeInterval);
      clearInterval(cursorInterval);
    };
  }, [text]);
  return (
    <span className="inline-block min-h-[2.5em]">{displayed}<span className={showCursor ? 'inline-block animate-pulse' : 'opacity-0'}>|</span></span>
  );
}

async function submitAnswers(pill: 'red' | 'blue', answers: string[]) {
  try {
    const answerFields = answers.reduce((acc, val, idx) => {
      acc[`answer${idx + 1}`] = val;
      return acc;
    }, {} as Record<string, string>);
    await fetch('https://hook.us1.make.com/l9nbkxb8xxglg7af267tdna8rb3d9bnw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pill,
        ...answerFields,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    // Optionally handle error (e.g., log or ignore)
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ image: string; ascii: string } | null>(null);
  const [choice, setChoice] = useState<'red' | 'blue' | null>(null);
  const [blueStep, setBlueStep] = useState<number>(0); // 0: not started, 1-5: questions, 6: final screen, 7: show result
  const [blueAnswers, setBlueAnswers] = useState<string[]>([]);
  const [redStep, setRedStep] = useState<number>(0); // 0: not started, 1-5: questions, 6: show result
  const [redAnswers, setRedAnswers] = useState<string[]>([]);
  const [typedArtemis, setTypedArtemis] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let i = 0;
    setTypedArtemis('');
    setShowCursor(true);
    const typeInterval = setInterval(() => {
      setTypedArtemis(ARTEMIS_MESSAGE.slice(0, i + 1));
      i++;
      if (i === ARTEMIS_MESSAGE.length) clearInterval(typeInterval);
    }, 28);
    const cursorInterval = setInterval(() => setShowCursor(c => !c), 500);
    return () => {
      clearInterval(typeInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  function playSound() {
    if (soundEnabled && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  }

  function handlePillChoice(pillType: 'red' | 'blue') {
    setChoice(pillType);
    setResult(null);
    setLoading(false);
    setError(null);
    setBlueStep(0);
    setRedStep(0);
    if (pillType === 'blue') setBlueStep(1);
    if (pillType === 'red') setRedStep(1);
  }

  async function handleBlueContinue(answer: string) {
    setBlueAnswers(prev => [...prev, answer]);
    if (blueStep < BLUE_PILL_QUESTIONS.length) {
      setBlueStep(blueStep + 1);
    } else {
      setBlueStep(6); // final screen
    }
    playSound();
  }

  function handleBlueFinalContinue() {
    submitAnswers('blue', blueAnswers);
    setShowPopup(true);
  }

  function handleRedContinue(answer: string) {
    setRedAnswers(prev => [...prev, answer]);
    if (redStep < RED_PILL_QUESTIONS.length) {
      setRedStep(redStep + 1);
    } else {
      setRedStep(RED_PILL_QUESTIONS.length + 1); // Show final screen, do not load image yet
    }
    playSound();
  }

  function handleRedFinalContinue() {
    submitAnswers('red', redAnswers);
    setShowPopup(true);
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-green-400 font-[family-name:var(--font-geist-mono)]">
      {/* Audio element for sound effect */}
      <audio ref={audioRef} src="/success.mp3" preload="auto" />
      {/* Sound toggle button */}
      <button
        className={`fixed top-4 right-4 z-30 px-4 py-2 font-mono rounded border-2 border-green-700 bg-black text-green-300 hover:bg-green-900 transition-colors`}
        onClick={() => {
          setSoundEnabled(e => {
            const next = !e;
            if (!next && audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            return next;
          });
        }}
      >
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </button>
      {/* Artemis HUD/Avatar - 1980s game style */}
      <div className="fixed top-4 left-4 z-20 w-56 max-w-[90vw] md:w-56 md:max-w-xs bg-black border-2 border-green-700 shadow-lg flex flex-col items-center p-3
        md:top-4 md:left-4
        sm:top-0 sm:left-0 sm:w-full sm:border-l-0 sm:border-r-0 sm:border-t-0">
        <Image
          src="/Artemis.png"
          alt="Artemis, mythic guide"
          width={120}
          height={120}
          className="border border-green-700 shadow mb-2 bg-black"
          priority
        />
        <div className="bg-black border border-green-700 text-green-300 font-mono px-2 py-1 text-xs w-full text-center mt-1 min-h-[3.5em]">
          {typedArtemis}
          <span className={showCursor ? 'inline-block animate-pulse' : 'opacity-0'}>|</span>
        </div>
      </div>

      {/* Main content, with top padding to avoid Artemis box on mobile */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-400 font-[family-name:var(--font-geist-mono)] pt-40 md:pt-0">
        <MatrixRainingLetters 
          key="matrix-bg" 
          custom_class="absolute inset-0 w-full h-full object-cover z-0" 
        />
        
        {/* Only show pill selection if no choice has been made */}
        {choice === null && !result && (
          <main className="relative z-10 flex flex-col items-center justify-center gap-16 p-8 text-center">
            <h1 className="text-5xl font-bold tracking-wider text-green-400 mb-8 animate-pulse">CHOOSE WISELY</h1>
            <p className="text-green-300 text-lg mb-6">Choose wisely. One path leads to truth… the other, to deeper truth.</p>
            <div className="flex flex-wrap gap-12 justify-center">
              {/* Matrix-styled Red Pill Button */}
              <div className="flex flex-col items-center space-y-3">
                <button 
                  onClick={() => handlePillChoice('red')}
                  disabled={loading}
                  className="group relative px-10 py-6 text-2xl font-bold tracking-widest text-white rounded-full bg-red-900/80 border border-red-500/50 backdrop-blur-sm transition-all duration-300 overflow-hidden
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-900/50 before:to-red-700/50 before:z-[-1]
                    hover:bg-red-700/90 hover:border-red-400 hover:scale-105 hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] hover:text-red-100
                    active:scale-95 active:shadow-[0_0_15px_rgba(239,68,68,0.9)]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 inline-block">RED PILL</span>
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                </button>
                <p className="text-xs font-light tracking-wide text-red-300/80 max-w-[180px] opacity-70 transition-opacity duration-300 hover:opacity-100">
                  🔴 truth you want but might surprise you
                </p>
              </div>
              
              {/* Matrix-styled Blue Pill Button */}
              <div className="flex flex-col items-center space-y-3">
                <button 
                  onClick={() => handlePillChoice('blue')}
                  disabled={loading}
                  className="group relative px-10 py-6 text-2xl font-bold tracking-widest text-white rounded-full bg-blue-900/80 border border-blue-500/50 backdrop-blur-sm transition-all duration-300 overflow-hidden
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-900/50 before:to-blue-700/50 before:z-[-1]
                    hover:bg-blue-700/90 hover:border-blue-400 hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] hover:text-blue-100
                    active:scale-95 active:shadow-[0_0_15px_rgba(59,130,246,0.9)]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 inline-block">BLUE PILL</span>
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
                </button>
                <p className="text-xs font-light tracking-wide text-blue-300/80 max-w-[180px] opacity-70 transition-opacity duration-300 hover:opacity-100">
                  🟦 sweet mystery and soft secrets
                </p>
              </div>
            </div>
            
            {loading && (
              <div className="mt-8 text-green-400 text-center animate-pulse">
                <p className="text-lg">Generating reality...</p>
              </div>
            )}
            
            {error && (
              <div className="mt-8 p-4 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300">
                <p>Error: {error}</p>
                <p className="mt-2 text-sm">Try again or contact the administrator.</p>
              </div>
            )}
          </main>
        )}
        {choice === 'blue' && !result && blueStep > 0 && blueStep <= BLUE_PILL_QUESTIONS.length && (
          <main className="relative z-10 flex flex-col items-center justify-center gap-8 p-8 text-center bg-black w-full min-h-screen">
            <div className="w-full max-w-lg mx-auto">
              <div className="mb-4 text-green-400 font-mono text-left">{QUESTION_LABELS.blue} [Question {blueStep}/{BLUE_PILL_QUESTIONS.length}]</div>
              <p className="text-green-300 font-mono text-lg mb-6 text-left">
                <TypewriterText text={BLUE_PILL_QUESTIONS[blueStep - 1] || ''} />
              </p>
              <input
                type="text"
                className="w-full max-w-md px-4 py-2 rounded bg-black border border-green-700 text-green-100 font-mono focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                placeholder="Your answer..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleBlueContinue((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                className="px-6 py-2 bg-green-900/80 hover:bg-green-800 text-green-100 font-mono rounded transition-colors"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[type=\"text\"]');
                  if (input && input.value.trim()) {
                    handleBlueContinue(input.value.trim());
                    input.value = '';
                  }
                }}
              >Next</button>
            </div>
          </main>
        )}
        {choice === 'blue' && !result && blueStep === 6 && (
          <main className="relative z-10 flex flex-col items-center justify-center gap-8 p-8 text-center">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">💬 "You followed curiosity. Let me reward you with truth…"</h2>
            <p className="text-blue-200 text-lg mb-6">Yes… I like you. And it's more than just 'if.' It's already assummed.</p>
            <button
              className="px-6 py-2 bg-blue-800/80 hover:bg-blue-700 text-white rounded transition-colors"
              onClick={handleBlueFinalContinue}
            >See Your Reality</button>
          </main>
        )}
        {choice === 'red' && !result && redStep > 0 && redStep <= RED_PILL_QUESTIONS.length && (
          <main className="relative z-10 flex flex-col items-center justify-center gap-8 p-8 text-center bg-black w-full min-h-screen">
            <div className="w-full max-w-lg mx-auto">
              <div className="mb-4 text-green-400 font-mono text-left">{QUESTION_LABELS.red} [Question {redStep}/{RED_PILL_QUESTIONS.length}]</div>
              <p className="text-green-300 font-mono text-lg mb-6 text-left">
                <TypewriterText text={RED_PILL_QUESTIONS[redStep - 1] || ''} />
              </p>
              <input
                type="text"
                className="w-full max-w-md px-4 py-2 rounded bg-black border border-green-700 text-green-100 font-mono focus:outline-none focus:ring-2 focus:ring-green-400 mb-4"
                placeholder="Your answer..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleRedContinue((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                className="px-6 py-2 bg-green-900/80 hover:bg-green-800 text-green-100 font-mono rounded transition-colors"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[type=\"text\"]');
                  if (input && input.value.trim()) {
                    handleRedContinue(input.value.trim());
                    input.value = '';
                  }
                }}
              >Next</button>
            </div>
          </main>
        )}
        {choice === 'red' && !result && redStep === RED_PILL_QUESTIONS.length + 1 && (
          <main className="relative z-10 flex flex-col items-center justify-center gap-8 p-8 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">💬 "Some truths aren't spoken — they unfold."</h2>
            <p className="text-red-200 text-lg mb-6">I do like you. And maybe, just maybe, I was waiting for you to notice.</p>
            <button
              className="px-6 py-2 bg-red-900/80 hover:bg-red-800 text-red-100 font-mono rounded transition-colors"
              onClick={handleRedFinalContinue}
            >Reveal Truth</button>
          </main>
        )}
        {result && (
          <main className="relative z-10 flex flex-col items-center justify-center gap-8 p-4 md:p-8 w-full max-w-4xl">
            <h2 className="text-3xl font-bold tracking-wide text-center">
              {choice === 'red' 
                ? "The Truth Revealed" 
                : "A Beautiful Illusion"}
            </h2>
            
            <div className="w-full bg-black/60 p-6 rounded-lg backdrop-blur-sm border border-green-900/50">
              {result.image && (
                <div className="mb-8 flex flex-col items-center">
                  <img 
                    src={result.image} 
                    alt={`The ${choice} pill reality`}
                    className="max-w-full h-auto rounded-lg shadow-lg border border-green-800/30"
                  />
                  <p className="mt-4 text-center text-sm text-green-400/80">
                    {choice === 'red' 
                      ? "You chose to see what lies beneath the code." 
                      : "You chose the comfort of the familiar."}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => {
                  setResult(null);
                  setChoice(null);
                }}
                className="mt-8 px-6 py-3 bg-green-900/60 hover:bg-green-800/80 text-white font-medium rounded-md transition-colors duration-300 mx-auto block"
              >
                Make Another Choice
              </button>
            </div>
          </main>
        )}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-black border-2 border-green-700 rounded-lg p-8 shadow-lg flex flex-col items-center">
              <p className="text-green-300 font-mono text-xl mb-6">Answer back in Text</p>
              <button
                className="px-6 py-2 bg-green-900/80 hover:bg-green-800 text-green-100 font-mono rounded transition-colors"
                onClick={() => setShowPopup(false)}
              >Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
