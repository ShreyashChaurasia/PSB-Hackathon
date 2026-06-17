import { useRef, useCallback } from 'react';

export default function useKeystrokeDynamics() {
  const keydownTimesRef = useRef({});
  const eventsRef = useRef([]);
  const startTimeRef = useRef(null);
  const charCountRef = useRef(0);

  const reset = useCallback(() => {
    keydownTimesRef.current = {};
    eventsRef.current = [];
    startTimeRef.current = null;
    charCountRef.current = 0;
  }, []);

  const handleKeyDown = useCallback((e) => {
    const now = performance.now();
    if (!startTimeRef.current) {
      startTimeRef.current = now;
    }
    if (!keydownTimesRef.current[e.key]) {
      keydownTimesRef.current[e.key] = now;
      eventsRef.current.push({ type: 'keydown', key: e.key, time: now });
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    const now = performance.now();
    const downTime = keydownTimesRef.current[e.key];
    if (downTime) {
      eventsRef.current.push({
        type: 'keyup',
        key: e.key,
        time: now,
        dwellTime: now - downTime,
      });
      delete keydownTimesRef.current[e.key];
      charCountRef.current += 1;
    }
  }, []);

  const attachListeners = useCallback(() => {
    return {
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
    };
  }, [handleKeyDown, handleKeyUp]);

  const getKeystrokeProfile = useCallback(() => {
    const events = eventsRef.current;
    const dwellTimes = [];
    const flightTimes = [];

    // Extract dwell times from keyup events
    const keyupEvents = events.filter((e) => e.type === 'keyup');
    for (const event of keyupEvents) {
      if (event.dwellTime !== undefined) {
        dwellTimes.push(Math.round(event.dwellTime * 100) / 100);
      }
    }

    // Calculate flight times (next keydown time - previous keyup time)
    const keydowns = events.filter((e) => e.type === 'keydown');
    const keyups = events.filter((e) => e.type === 'keyup');

    for (let i = 0; i < keyups.length - 1; i++) {
      const currentKeyup = keyups[i];
      // Find the next keydown that happens after this keyup
      const nextKeydown = keydowns.find(
        (kd) => kd.time > currentKeyup.time
      );
      if (nextKeydown) {
        const flight = nextKeydown.time - currentKeyup.time;
        flightTimes.push(Math.round(flight * 100) / 100);
      }
    }

    // Calculate typing speed
    const totalTime = events.length > 1
      ? (events[events.length - 1].time - events[0].time) / 1000
      : 0;
    const typingSpeed = totalTime > 0
      ? Math.round((charCountRef.current / totalTime) * 100) / 100
      : 0;

    return {
      dwell_times: dwellTimes,
      flight_times: flightTimes,
      typing_speed: typingSpeed,
    };
  }, []);

  return {
    attachListeners,
    getKeystrokeProfile,
    reset,
  };
}
