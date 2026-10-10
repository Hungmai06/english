// Web Speech API text-to-speech helper
export function speakText(text: string, lang: 'en-US' | 'en-GB' = 'en-US') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clear English learning pronunciation

  // Find native English voices if available
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === lang || v.lang.startsWith('en'));
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}
