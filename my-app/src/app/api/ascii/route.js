import axios from 'axios';
import sharp from 'sharp';

/**
 * Handles POST requests to the ASCII art generator API
 */
export async function POST(request) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { prompt, apiKey, asciiWidth = 80, asciiHeight = 40 } = body;
    
    if (!prompt) {
      return Response.json({ error: 'Missing prompt parameter' }, { status: 400 });
    }

    // Get OpenAI API key from environment variable or request body
    const openaiApiKey = process.env.OPENAI_API_KEY || apiKey;
    
    if (!openaiApiKey) {
      return Response.json({ 
        error: 'Missing API key for OpenAI',
        message: 'Please provide an API key in the request or set it as an environment variable'
      }, { status: 400 });
    }

    // 1. Call OpenAI DALL·E API to generate an image
    const openaiPayload = {
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json'
    };

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/images/generations',
      openaiPayload,
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        validateStatus: undefined
      }
    );

    if (openaiResponse.status !== 200) {
      console.error('OpenAI API error:', openaiResponse.data);
      return Response.json({ 
        error: 'Failed to generate image', 
        details: openaiResponse.data
      }, { status: 502 });
    }

    // Get the base64 image from OpenAI response
    const imageBase64 = openaiResponse.data.data[0].b64_json;
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    // 2. Convert the image to ASCII art
    const imageAscii = await convertToAscii(imageBuffer, asciiWidth, asciiHeight);

    // 3. Return both the image and ASCII art
    return Response.json({ 
      success: true,
      ascii: imageAscii,
      image: `data:image/png;base64,${imageBase64}`
    });
    
  } catch (error) {
    console.error('ASCII generation error:', error);
    return Response.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

/**
 * Converts an image buffer to ASCII art using sharp
 * @param {Buffer} imageBuffer - The image data as a buffer
 * @param {number} width - The width of the ASCII art in characters
 * @param {number} height - The height of the ASCII art in characters
 * @returns {Promise<string>} - ASCII art representation of the image
 */
async function convertToAscii(imageBuffer, width, height) {
  // Rich ASCII character set from darkest to lightest
  const asciiChars = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
  try {
    // Aspect ratio correction: ASCII characters are taller than wide, so adjust height
    // The factor 2 is a common approximation for monospace fonts
    const aspectRatioHeight = Math.floor(height * 0.5);
    const sharpImage = sharp(imageBuffer).resize(width, aspectRatioHeight).grayscale();
    const { data, info } = await sharpImage.raw().toBuffer({ resolveWithObject: true });
    let asciiArt = '';
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = y * info.width + x;
        const value = data[idx]; // grayscale, so one channel
        const charIndex = Math.floor(value / 256 * asciiChars.length);
        asciiArt += asciiChars[asciiChars.length - 1 - charIndex];
      }
      asciiArt += '\n';
    }
    return asciiArt;
  } catch (error) {
    console.error('Error converting image to ASCII:', error);
    // Fallback to simple ASCII with a generic message
    return createSimpleAscii('Image conversion failed');
  }
}

/**
 * Creates a simple ASCII art representation of text
 * This is used as a fallback if image conversion fails
 */
function createSimpleAscii(text) {
  const matrix = [
    "01001010101010101",
    "10101010101010101",
    "01010101010101010",
    "10101010101010101",
    "01010101010101010"
  ];
  
  const header = matrix.join('\n');
  const footer = matrix.reverse().join('\n');
  
  const formattedText = `
${header}
--------------------
    ${text.toUpperCase()}
--------------------
${footer}
`;
  
  return formattedText;
} 