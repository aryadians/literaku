import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function summarizeBook(title: string, author: string, excerpt: string = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Berikan ringkasan singkat dan menarik untuk buku berjudul "${title}" karya ${author}. 
    ${excerpt ? `Gunakan informasi tambahan berikut sebagai konteks: ${excerpt}` : ""}
    Ringkasan harus dalam Bahasa Indonesia, maksimal 3 paragraf, dan fokus pada inti cerita atau poin utama buku tersebut.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Summary Error:", error);
    return null;
  }
}

export async function getRelatedBooksSuggestions(bookTitle: string, category: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Berdasarkan buku "${bookTitle}" yang masuk dalam kategori "${category}", berikan 3 rekomendasi buku lain yang mirip atau relevan. 
    Berikan dalam format JSON array of objects dengan properti: title, author, reason (alasan kenapa mirip). 
    Gunakan Bahasa Indonesia.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON if Gemini wraps it in code blocks
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Suggestion Error:", error);
    return [];
  }
}
