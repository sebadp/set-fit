import { useEffect, useMemo, useRef, useState } from 'react';

import { audioManager } from '@/services/audio';
import { hapticsManager } from '@/services/haptics';
import { Routine, RoutineBlock, RoutineGroup } from '@/types/routine';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type ExpandedBlock = RoutineBlock & {
  sequenceIndex: number;
  totalIterations: number;
  iteration: number;
};

export type IntervalSnapshot = {
  status: TimerStatus;
  isMuted: boolean;
  hapticsEnabled: boolean;
  currentBlock: ExpandedBlock | null;
  nextBlock: ExpandedBlock | null;
  currentIndex: number;
  totalBlocks: number;
  currentElapsedSec: number;
  currentRemainingSec: number;
  totalElapsedSec: number;
  totalDurationSec: number;
};

export type IntervalControls = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  toggleMute: () => void;
  toggleHaptics: () => void;
};

const expandRoutineBlocks = (routine: Routine | null | undefined): ExpandedBlock[] => {
  if (!routine) {
    return [];
  }
  const sortedBlocks = [...routine.blocks].sort((a, b) => a.order - b.order);
  const groupsById = new Map<string, RoutineGroup>();
  routine.groups.forEach((group) => {
    groupsById.set(group.id, group);
  });
  const expanded: ExpandedBlock[] = [];
  let sequenceIndex = 0;
  let i = 0;
  while (i < sortedBlocks.length) {
    const block = sortedBlocks[i];
    if (!block.groupId) {
      expanded.push({
        ...block,
        sequenceIndex,
        totalIterations: 1,
        iteration: 1,
      });
      sequenceIndex += 1;
      i += 1;
      continue;
    }

    const groupId = block.groupId;
    const group = groupsById.get(groupId);
    const repetitions = Math.max(1, group?.repetitions ?? 1);

    const groupedBlocks: RoutineBlock[] = [];
    let j = i;
    while (j < sortedBlocks.length && sortedBlocks[j].groupId === groupId) {
      groupedBlocks.push(sortedBlocks[j]);
      j += 1;
    }

    for (let rep = 0; rep < repetitions; rep += 1) {
      for (const groupedBlock of groupedBlocks) {
        expanded.push({
          ...groupedBlock,
          sequenceIndex,
          totalIterations: repetitions,
          iteration: rep + 1,
        });
        sequenceIndex += 1;
      }
    }

    i = j;
  }

  return expanded;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const createSnapshot = (
  status: TimerStatus,
  expandedBlocks: ExpandedBlock[],
  audioEnabled: boolean,
  hapticsEnabled: boolean,
  currentIndex: number,
  currentRemaining: number,
  totalElapsed: number,
): IntervalSnapshot => {
  const currentBlock = expandedBlocks[currentIndex] ?? null;
  const nextBlock = expandedBlocks[currentIndex + 1] ?? null;
  const currentDuration = currentBlock?.durationSec ?? 0;
  const currentElapsed = clamp(currentDuration - currentRemaining, 0, currentDuration);
  const totalDuration = expandedBlocks.reduce((sum, block) => sum + block.durationSec, 0);

  return {
    status,
    isMuted: !audioEnabled,
    hapticsEnabled,
    currentBlock,
    nextBlock,
    currentIndex,
    totalBlocks: expandedBlocks.length,
    currentElapsedSec: currentElapsed,
    currentRemainingSec: clamp(currentRemaining, 0, currentDuration),
    totalElapsedSec: clamp(totalElapsed, 0, totalDuration),
    totalDurationSec: totalDuration,
  };
};

export const useIntervalEngine = (routine: Routine | null | undefined): [IntervalSnapshot, IntervalControls] => {
  const expandedBlocks = useMemo(() => expandRoutineBlocks(routine), [routine]);

  const statusRef = useRef<TimerStatus>('idle');
  const currentIndexRef = useRef(0);
  const remainingRef = useRef(0);
  const totalElapsedRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const lastCueSecondRef = useRef<number | null>(null);
  const audioEnabledRef = useRef(true);
  const hapticsEnabledRef = useRef(true);

  const [snapshot, setSnapshot] = useState<IntervalSnapshot>(() =>
    createSnapshot('idle', expandedBlocks, audioEnabledRef.current, hapticsEnabledRef.current, 0, expandedBlocks[0]?.durationSec ?? 0, 0),
  );

  useEffect(() => {
    audioManager.enableAudio(audioEnabledRef.current);
    hapticsManager.enableHaptics(hapticsEnabledRef.current);
    return () => {
      audioManager.unloadAll().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (routine) {
      statusRef.current = 'idle';
      currentIndexRef.current = 0;
      remainingRef.current = expandedBlocks[0]?.durationSec ?? 0;
      totalElapsedRef.current = 0;
      lastTickRef.current = null;
      lastCueSecondRef.current = null;
      clearInterval(intervalIdRef.current as NodeJS.Timeout);
      setSnapshot(createSnapshot('idle', expandedBlocks, audioEnabledRef.current, hapticsEnabledRef.current, 0, remainingRef.current, 0));
    } else {
      setSnapshot(createSnapshot('idle', [], audioEnabledRef.current, hapticsEnabledRef.current, 0, 0, 0));
    }
  }, [routine, expandedBlocks]);

  const stopTicker = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    lastTickRef.current = null;
  };

  const emitSnapshot = () => {
    setSnapshot(
      createSnapshot(
        statusRef.current,
        expandedBlocks,
        audioEnabledRef.current,
        hapticsEnabledRef.current,
        currentIndexRef.current,
        remainingRef.current,
        totalElapsedRef.current,
      ),
    );
  };

  const playCountdownCue = (secondsLeft: number) => {
    if (secondsLeft <= 0) {
      return;
    }
    if (!audioEnabledRef.current && !hapticsEnabledRef.current) {
      return;
    }
    void audioManager.play(secondsLeft === 1 ? 'countdownLong' : 'countdownShort').catch(() => undefined);
    if (hapticsEnabledRef.current) {
      void hapticsManager.pulse(secondsLeft === 1 ? 'success' : 'warning');
    }
  };

  const playTransitionCue = () => {
    if (audioEnabledRef.current) {
      void audioManager.play('transition').catch(() => undefined);
    }
    if (hapticsEnabledRef.current) {
      void hapticsManager.pulse('success');
    }
  };

  const advanceToNextBlock = (overflowSeconds: number) => {
    while (overflowSeconds >= 0 && currentIndexRef.current < expandedBlocks.length) {
      const isLastBlock = currentIndexRef.current === expandedBlocks.length - 1;
      if (isLastBlock) {
        playTransitionCue();
        statusRef.current = 'completed';
        remainingRef.current = 0;
        stopTicker();
        emitSnapshot();
        return;
      }

      currentIndexRef.current += 1;
      const nextBlock = expandedBlocks[currentIndexRef.current];
      remainingRef.current = nextBlock.durationSec;
      lastCueSecondRef.current = null;
      playTransitionCue();

      overflowSeconds -= nextBlock.durationSec;
      if (overflowSeconds < 0) {
        remainingRef.current = nextBlock.durationSec + overflowSeconds;
        break;
      }
    }
  };

  const tick = () => {
    if (statusRef.current !== 'running') {
      return;
    }
    const now = Date.now();
    if (lastTickRef.current == null) {
      lastTickRef.current = now;
      return;
    }

    const delta = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    remainingRef.current -= delta;
    totalElapsedRef.current += delta;

    const secondsLeft = Math.ceil(remainingRef.current);
    if (secondsLeft <= 3 && secondsLeft > 0 && secondsLeft !== lastCueSecondRef.current) {
      lastCueSecondRef.current = secondsLeft;
      playCountdownCue(secondsLeft);
    }

    if (remainingRef.current <= 0) {
      const overflow = Math.abs(remainingRef.current);
      advanceToNextBlock(overflow);
    }

    emitSnapshot();
  };

  const startTicker = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    intervalIdRef.current = setInterval(tick, 120);
  };

  const start = () => {
    if (!expandedBlocks.length) {
      return;
    }
    statusRef.current = 'running';
    currentIndexRef.current = 0;
    remainingRef.current = expandedBlocks[0].durationSec;
    totalElapsedRef.current = 0;
    lastCueSecondRef.current = null;
    lastTickRef.current = null;
    startTicker();
    emitSnapshot();
  };

  const pause = () => {
    if (statusRef.current !== 'running') {
      return;
    }
    statusRef.current = 'paused';
    stopTicker();
    emitSnapshot();
  };

  const resume = () => {
    if (statusRef.current !== 'paused') {
      return;
    }
    statusRef.current = 'running';
    startTicker();
    emitSnapshot();
  };

  const reset = () => {
    statusRef.current = 'idle';
    stopTicker();
    currentIndexRef.current = 0;
    remainingRef.current = expandedBlocks[0]?.durationSec ?? 0;
    totalElapsedRef.current = 0;
    lastCueSecondRef.current = null;
    emitSnapshot();
  };

  const skip = () => {
    if (!expandedBlocks.length) {
      return;
    }
    if (statusRef.current === 'completed') {
      reset();
      return;
    }
    currentIndexRef.current = Math.min(currentIndexRef.current + 1, expandedBlocks.length - 1);
    remainingRef.current = expandedBlocks[currentIndexRef.current].durationSec;
    lastCueSecondRef.current = null;
    emitSnapshot();
  };

  const toggleMute = () => {
    audioEnabledRef.current = !audioEnabledRef.current;
    audioManager.enableAudio(audioEnabledRef.current);
    emitSnapshot();
  };

  const toggleHaptics = () => {
    hapticsEnabledRef.current = !hapticsEnabledRef.current;
    hapticsManager.enableHaptics(hapticsEnabledRef.current);
    emitSnapshot();
  };

  useEffect(() => () => stopTicker(), []);

  useEffect(() => {
    emitSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedBlocks.length]);

  const controls: IntervalControls = {
    start,
    pause,
    resume,
    reset,
    skip,
    toggleMute,
    toggleHaptics,
  };

  return [snapshot, controls];
};
