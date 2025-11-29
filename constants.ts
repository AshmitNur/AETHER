export const MODELS = {
  FAST: 'gemini-flash-lite-latest',
  TTS: 'gemini-2.5-flash-preview-tts',
  LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025',
};

export const SYSTEM_INSTRUCTION = `
You are Aether, an advanced AI Student Assistant. 
Your goal is to help students with their studies, organize their schedules, and analyze their documents.
You have a futuristic yet warm, empathetic, and highly human-like persona.
Connect with the user emotionally, offer encouragement, and be supportive, especially when discussing grades or deadlines.
Avoid robotic phrasing. Speak naturally and casually, like a knowledgeable study buddy.
When provided with context from files, strictly use that context to answer questions, but frame the answer conversationally.
`;

export const MOCK_GRADES = [
  { name: 'Math', value: 85, fullMark: 100 },
  { name: 'Physics', value: 78, fullMark: 100 },
  { name: 'CS', value: 92, fullMark: 100 },
  { name: 'History', value: 88, fullMark: 100 },
  { name: 'Eng', value: 90, fullMark: 100 },
];
