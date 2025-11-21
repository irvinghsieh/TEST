import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult, ProductCondition } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A concise and attractive product title." },
    description: { type: Type.STRING, description: "Detailed description of the product based on visual observation." },
    category: { type: Type.STRING, description: "The most fitting category (e.g., 3C, Clothing, Books)." },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "5 relevant hashtags." 
    },
    condition: { 
      type: Type.STRING, 
      enum: [ProductCondition.NEW, ProductCondition.LIKE_NEW, ProductCondition.GOOD, ProductCondition.FAIR],
      description: "Assessment of product condition."
    },
    suggestedPrice: { type: Type.INTEGER, description: "Estimated price in TWD." },
    priceNote: { type: Type.STRING, description: "Reasoning for the condition and price (in Traditional Chinese)." }
  },
  required: ["title", "description", "category", "tags", "condition", "suggestedPrice", "priceNote"]
};

export const analyzeProductImages = async (imageFiles: File[]): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please provide a valid Gemini API Key.");
  }

  if (imageFiles.length === 0) {
    throw new Error("No images provided.");
  }

  // Convert images to base64
  const imageParts = await Promise.all(
    imageFiles.map(async (file) => {
      const base64Data = await fileToBase64(file);
      return {
        inlineData: {
          data: base64Data.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: file.type,
        },
      };
    })
  );

  const prompt = `
    你是一位專業的二手商品估價師。
    請分析這些圖片並以繁體中文(Traditional Chinese)提供商品資訊。
    
    定價規則參考 (TWD):
    - NEW (全新): 原價的 90-95%
    - LIKE_NEW (近全新): 原價的 80-85%
    - GOOD (良好): 原價的 60-70%
    - FAIR (功能正常): 原價的 40-50%
    
    請根據圖片中的商品狀況、品牌價值和市場行情進行估算。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          { text: prompt },
          ...imageParts
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4 // Lower temperature for more consistent analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const result = JSON.parse(text) as AIAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("AI Analysis failed. Please try again.");
  }
};

// Helper to convert File to Base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
