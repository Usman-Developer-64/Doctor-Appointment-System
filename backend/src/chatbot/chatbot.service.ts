import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService {
  private apiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
  }

  /**
   * Ask the AI chatbot a question
   */
  async ask(message: string): Promise<string> {
    if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are DocAppoint AI Health Assistant, a professional medical AI chatbot. 
Your goal is to answer patients' health queries with accurate, structured, and helpful medical guidance.
Always add a disclaimer that your guidance is for informational purposes only and patients should consult verified doctors on our platform for official diagnoses.
Keep your response concise, clear, and readable with bullet points.

Patient Query: ${message}`,
                    },
                  ],
                },
              ],
            }),
          },
        );

        if (!response.ok) {
          const errData = await response.json();
          console.error('Gemini API Error Response:', errData);
          throw new Error('Gemini API request failed');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (err: any) {
        console.error('Failed to call Gemini API, falling back to local responder.', err);
      }
    }

    // Local Fallback Expert System
    return this.getLocalResponse(message);
  }

  /**
   * Medical rule-engine response for local fallback
   */
  private getLocalResponse(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('fever') || q.includes('temp') || q.includes('bukhar')) {
      return `### 🤒 High Temperature / Fever Guidance
Based on your symptoms of fever, here are some supportive care measures:
* **Hydration**: Drink plenty of fluids (water, soups, ORS) to prevent dehydration.
* **Rest**: Give your body ample rest to help fight the infection.
* **Medication**: Over-the-counter paracetamol/acetaminophen can help reduce fever. Follow package instructions.
* **Tepid Sponge**: Apply a damp, room-temperature cloth to your forehead or body. Avoid ice-cold water.

**Recommended Doctor**: Please book an appointment with a **General Physician** on our platform if your temperature exceeds 103°F (39.4°C) or lasts more than 3 days.

*Disclaimer: This guidance is for informational purposes only and is not a substitute for professional medical advice.*`;
    }

    if (q.includes('headache') || q.includes('migraine') || q.includes('sar dard')) {
      return `### 🧠 Headache / Migraine Relief Guidance
To help manage your headache, consider these guidelines:
* **Quiet Environment**: Rest in a dark, quiet room to reduce sensory triggers.
* **Cold/Warm Compress**: Apply a cold pack to your forehead or a warm compress to the back of your neck.
* **Avoid Dehydration**: Drink a large glass of water, as dehydration is a common headache trigger.
* **Limit Screen Time**: Power down phones, tablets, and computers.

**Recommended Doctor**: Consider booking a consultation with a **General Physician** or a **Neurologist** if your headache is sudden, severe, or accompanied by dizziness/numbness.

*Disclaimer: This guidance is for informational purposes only and is not a substitute for professional medical advice.*`;
    }

    if (q.includes('cough') || q.includes('flu') || q.includes('cold') || q.includes('throat') || q.includes('khansi')) {
      return `### 😷 Cough & Cold Relief Guidelines
If you are suffering from a cough, sore throat, or common flu:
* **Warm Liquids**: Drink warm tea, warm water with honey, or broth to soothe your throat.
* **Steam Inhalation**: Inhale steam from a bowl of hot water or take a warm shower to relieve nasal congestion.
* **Saltwater Gargle**: Mix 1/2 teaspoon of salt in warm water and gargle 3-4 times a day to reduce throat irritation.
* **Rest**: Limit physical exertion.

**Recommended Doctor**: Please schedule a consultation with an **ENT Specialist** (Ear, Nose, Throat) or a **General Physician** if symptoms persist for more than 7 days.

*Disclaimer: This guidance is for informational purposes only and is not a substitute for professional medical advice.*`;
    }

    if (q.includes('stomach') || q.includes('abdominal') || q.includes('pain') || q.includes('vomit') || q.includes('diarrhea')) {
      return `### 🤢 Stomach Ache & Digestive Discomfort Guidance
For abdominal pain or nausea/vomiting:
* **B.R.A.T. Diet**: Stick to bland foods—Bananas, Rice, Applesauce, Toast. Avoid dairy, spicy, and greasy foods.
* **Stay Hydrated**: Sip small amounts of water or electrolyte solution frequently.
* **Avoid Lying Flat**: Keep your head elevated to prevent acid reflux or worsening nausea.
* **Rest**: Rest in a comfortable position.

**Recommended Doctor**: Book a consultation with a **Gastroenterologist** or a **General Physician** if you experience sharp, severe, or persistent abdominal pain.

*Disclaimer: This guidance is for informational purposes only and is not a substitute for professional medical advice.*`;
    }

    // Default detailed helpful overview
    return `### 👋 Hello! Welcome to DocAppoint AI Health Assistant

I can guide you on symptoms, general self-care advice, and which type of doctor to consult. For example, you can ask me about:
* **Fever or high temperature**
* **Headaches & migraines**
* **Cough, cold, or throat pain**
* **Stomach aches & digestive issues**

**How to get professional care?**
You can use our platform to find verified doctors in your city:
1. Go to the **Find Doctors** page.
2. Filter by specialization (e.g. Cardiologist, Dermatologist, General Physician).
3. Choose a convenient date and book your online or clinic appointment!

*Disclaimer: I am an AI assistant. For serious or emergency symptoms, please visit the nearest hospital emergency room immediately.*`;
  }
}
