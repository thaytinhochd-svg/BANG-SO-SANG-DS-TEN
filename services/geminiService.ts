
import { GoogleGenAI, Type } from "@google/genai";
import { SmartSuggestion } from "../types";

export const analyzeMismatches = async (
  missingNames: string[],
  extraNames: string[]
): Promise<SmartSuggestion[]> => {
  if (missingNames.length === 0 || extraNames.length === 0) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Nhiệm vụ: Tìm các cặp tên tương ứng giữa hai danh sách "Thiếu" và "Thừa" mà thực chất là cùng một người nhưng viết khác nhau (do lỗi dấu, viết tắt, hoặc sai chính tả).
    
    Danh sách Thiếu (có trong gốc nhưng vắng ở kiểm tra): [${missingNames.join(', ')}]
    Danh sách Thừa (tên lạ trong bản kiểm tra): [${extraNames.join(', ')}]
    
    Yêu cầu:
    1. Chỉ trả về các cặp mà bạn tin tưởng 90% trở lên là cùng một người.
    2. Ví dụ: "Hoàng Mạc Hoà" và "Hoàng Mạc Hòa" là MỘT người.
    3. Trả về định dạng JSON mảng các đối tượng.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING, description: "Tên trong danh sách Thiếu" },
              suggestedMatch: { type: Type.STRING, description: "Tên tương ứng trong danh sách Thừa" },
              confidence: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["original", "suggestedMatch", "confidence", "reason"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SmartSuggestion[];
  } catch (error) {
    console.error("AI mismatch analysis failed:", error);
    return [];
  }
};
