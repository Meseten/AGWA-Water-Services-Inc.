// src/services/geminiService.js
const GEMINI_API_KEY = "AIzaSyCg7r9RRiCbvUP5BSHdpm3_OPj20vP-VhM";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const callGeminiAPI = async (promptText) => {
    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
    };

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Gemini API request failed: ${errorBody.error?.message || response.statusText}`);
        }

        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Failed to extract text from Gemini API response.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

/**
 * Generates a complete announcement template using structured data.
 * @param {object} details - The details for the announcement.
 * @param {string} details.title - The desired title of the announcement.
 * @param {string} details.reason - The primary reason for the announcement (e.g., "mainline repair").
 * @param {string} [details.area] - The affected area(s).
 * @param {string} [details.time] - The date and time of the event.
 * @returns {Promise<string>} A promise that resolves with the generated announcement content in markdown.
 */
export const generateAnnouncement = async ({ title, reason, area, time }) => {
    const prompt = `
        You are a professional communications officer for AGWA Water Services.
        Generate a formal, clear, and customer-friendly public service announcement based on the following details.
        Use markdown for formatting, especially **bolding** for key information.
        
        **Announcement Details:**
        - **Primary Title/Reason:** ${title || reason}
        - **Event Description:** ${reason}
        - **Affected Area(s):** ${area || "All service areas"}
        - **Date and Time:** ${time || "Effective immediately until further notice"}

        **Instructions:**
        1.  Start with a clear headline. Use the provided Title/Reason.
        2.  Write a main paragraph explaining the situation clearly.
        3.  List the key details (Affected Areas, Date/Time) using bolded headers.
        4.  If it's a service interruption, advise customers to store an adequate amount of water for their needs during this period.
        5.  Apologize for the inconvenience.
        6.  End with contact information: "For inquiries, please call our 24/7 hotline at 1627-AGWA."
        7.  Ensure the tone is professional, empathetic, and reassuring.

        Generate the full announcement content now.
    `;
    
    return callGeminiAPI(prompt);
};