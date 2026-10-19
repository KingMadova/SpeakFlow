import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioLevels: number[];
  error: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  cancelRecording: () => void;
  clearRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([12, 24, 38, 20, 16, 28, 42, 18]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const cleanupAudioContext = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setError(null);
  }, [audioUrl]);

  // Release the currently displayed recording URL when it is replaced or the
  // component unmounts, so repeated attempts do not leak browser memory.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Cancellation discards this take; it must not later be published by onstop.
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    cleanupAudioContext();
    setIsRecording(false);
    setRecordingDuration(0);
    chunksRef.current = [];
  }, [cleanupAudioContext]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    cleanupAudioContext();
    setIsRecording(false);
  }, [cleanupAudioContext]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);
    chunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("L'enregistrement audio n'est pas pris en charge par votre navigateur.");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Setup Web Audio Analyser for realistic waveform visualization
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const updateWaveform = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          // Sample 16 discrete vertical bar heights
          const bars: number[] = [];
          const step = Math.floor(dataArray.length / 16) || 1;
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            // Map 0-255 to min 8% - max 100% height
            bars.push(Math.max(12, Math.round((val / 255) * 88)));
          }
          setAudioLevels(bars);
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();
      } catch (err) {
        console.warn('Analyser setup fallback', err);
      }

      // Determine supported mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        '',
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (!mime || MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];

        if (blob.size === 0) {
          setAudioBlob(null);
          setError("Aucun son n'a été enregistré. Vérifiez le microphone puis recommencez.");
          setIsRecording(false);
          return;
        }

        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);
      }, 200);

      return true;
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? "Accès au microphone refusé. Veuillez autoriser le micro dans les paramètres du navigateur."
          : "Impossible d'accéder au microphone. Vérifiez les autorisations de votre appareil.";
      setError(message);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, [cancelRecording]);

  return {
    isRecording,
    recordingDuration,
    audioBlob,
    audioUrl,
    audioLevels,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
  };
}
