// src/hooks/useTTS.js - Clean version using external phonetics config
import { useState, useCallback } from "react";
import filipinoPhonetics from "../config/filipinoPhoenetics";

const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Text preprocessing for better Filipino pronunciation
  const preprocessTaglishText = useCallback((text) => {
    let processedText = text || '';
    
    // Replace Filipino words with phonetic equivalents
    Object.entries(filipinoPhonetics).forEach(([filipino, phonetic]) => {
      const regex = new RegExp(`\\b${filipino}\\b`, 'gi');
      processedText = processedText.replace(regex, phonetic);
    });

    return processedText;
  }, []);

  // Main speak function - simplified version of your working code
  const speak = useCallback((textToSpeak) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in your browser.');
      return;
    }

    // Stop any currently playing speech
    window.speechSynthesis.cancel();
    
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    // Preprocess text for better pronunciation
    const processedText = preprocessTaglishText(textToSpeak);
    
    if (!processedText.trim()) {
      console.warn('No text to speak');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(processedText);

    // Get available voices
    const voices = window.speechSynthesis.getVoices();

    // Try to find the best available voice (same logic as your working code)
    const filipinoVoice = voices.find(voice => 
      voice.lang.includes('tl') || 
      voice.lang.includes('fil') || 
      voice.name.toLowerCase().includes('filipino') || 
      voice.name.toLowerCase().includes('tagalog')
    );

    const englishVoice = voices.find(voice => 
      voice.lang.includes('en-') || voice.lang === 'en'
    );

    // Set voice with fallback chain (exactly like your working code)
    if (filipinoVoice) {
      utterance.voice = filipinoVoice;
      utterance.lang = filipinoVoice.lang;
      utterance.rate = 0.8;
      utterance.pitch = 1;
    } else if (englishVoice) {
      utterance.voice = englishVoice;
      utterance.lang = englishVoice.lang;
      // Adjust for mixed language content
      utterance.rate = 0.7; // Slower for Filipino words
      utterance.pitch = 0.9; // Slightly lower pitch helps with pronunciation
    } else {
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 0.9;
    }

    utterance.volume = 1;

    // Event listeners (same as your working code)
    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      console.error('Speech synthesis error');
    };

    // Speak the processed text
    window.speechSynthesis.speak(utterance);
  }, [isPlaying, preprocessTaglishText]);

  // Stop function
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  // Toggle function (for convenience)
  const toggle = useCallback((text) => {
    speak(text);
  }, [speak]);

  return {
    isPlaying,
    speak,
    stop,
    toggle,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window
  };
};

export default useTTS;