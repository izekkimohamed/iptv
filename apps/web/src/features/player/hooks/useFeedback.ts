import { useCallback, useRef, useState } from 'react';

import { PLAYER_CONSTANTS } from '@/constants/player';

export type FeedbackAction = 'play' | 'pause' | 'forward' | 'backward' | null;

interface UseFeedbackOptions {
  togglePlay: () => void;
  forward: (secs: number) => void;
  backward: (secs: number) => void;
}

export function useFeedback({ togglePlay, forward, backward }: UseFeedbackOptions) {
  const [feedbackAction, setFeedbackAction] = useState<FeedbackAction>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((action: FeedbackAction) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackAction(action);
    feedbackTimerRef.current = setTimeout(
      () => setFeedbackAction(null),
      PLAYER_CONSTANTS.FEEDBACK_DURATION,
    );
  }, []);

  const togglePlayWithFeedback = useCallback(() => {
    showFeedback('play');
    togglePlay();
  }, [togglePlay, showFeedback]);

  const forwardWithFeedback = useCallback(
    (secs: number) => {
      showFeedback('forward');
      forward(secs);
    },
    [forward, showFeedback],
  );

  const backwardWithFeedback = useCallback(
    (secs: number) => {
      showFeedback('backward');
      backward(secs);
    },
    [backward, showFeedback],
  );

  return {
    feedbackAction,
    togglePlayWithFeedback,
    forwardWithFeedback,
    backwardWithFeedback,
  };
}
