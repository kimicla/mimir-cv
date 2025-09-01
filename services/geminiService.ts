import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, CompanyExperience, Education, Position } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refineTextWithAI = async (text: string, prompt: string): Promise<string> => {
  try {
    const fullPrompt = `${prompt}:\n\n"${text}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return `Error refining text. Please try again. Details: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Full name of the person." },
        email: { type: Type.STRING, description: "Email address." },
        phone: { type: Type.STRING, description: "Phone number." },
        linkedin: { type: Type.STRING, description: "URL of the LinkedIn profile." },
        website: { type: Type.STRING, description: "URL of a personal website or portfolio." },
        address: { type: Type.STRING, description: "City and State, e.g., 'San Francisco, CA'." },
      },
    },
    summary: { type: Type.STRING, description: "A professional summary or objective statement." },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          positions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                jobTitle: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                description: { type: Type.STRING, description: "A description of responsibilities and achievements, with each bullet point separated by a newline character." },
              }
            }
          }
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING, description: "The degree obtained, e.g., 'B.S. in Computer Science'." },
          school: { type: Type.STRING },
          location: { type: Type.STRING },
          graduationDate: { type: Type.STRING },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      description: "A list of relevant skills.",
      items: { type: Type.STRING },
    },
  },
};


type ParsedResumeData = Omit<ResumeData, 'experience' | 'education' | 'sections'> & {
  experience: (Omit<CompanyExperience, 'id' | 'positions'> & {
    positions: Omit<Position, 'id'>[];
  })[];
  education: Omit<Education, 'id'>[];
};

export const parseResumeWithAI = (file: File): Promise<ParsedResumeData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                if (typeof reader.result !== 'string') {
                    return reject(new Error("File could not be read as a data URL."));
                }
                const base64Data = reader.result.split(',')[1];
                
                const prompt = `Analyze the attached resume image and extract the user's information.
Your response MUST be a single, valid JSON object that strictly follows the schema provided.
- Extract all personal information, professional summary, work experience, education, and skills.
- If a field is not present in the resume, use an empty string or an empty array.
- For descriptions (like in work experience), combine all bullet points into a single string, with each point separated by a '\\n' newline character.
- Do NOT add any explanatory text, comments, or markdown formatting like \`\`\`json. Your entire response must be the raw JSON object itself.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: [{
                      parts: [
                          {
                              inlineData: {
                                  mimeType: file.type,
                                  data: base64Data,
                              },
                          },
                          {
                              text: prompt,
                          },
                      ],
                  }],
                  config: {
                      responseMimeType: "application/json",
                      responseSchema: resumeSchema,
                  },
                });

                const parsedJson = JSON.parse(response.text);

                // Normalize data to ensure all expected properties are present, preventing crashes.
                const normalizedData = {
                    personalInfo: parsedJson.personalInfo || {},
                    summary: parsedJson.summary || '',
                    experience: (parsedJson.experience || []).map((comp: any) => ({
                        ...comp,
                        positions: comp.positions || [], // Ensure nested positions array exists
                    })),
                    education: parsedJson.education || [],
                    skills: parsedJson.skills || [],
                };

                resolve(normalizedData as ParsedResumeData);

            } catch (error) {
                 console.error("Error parsing resume with AI:", error);
                 reject(error instanceof Error ? error : new Error('Unknown parsing error'));
            }
        };

        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
};