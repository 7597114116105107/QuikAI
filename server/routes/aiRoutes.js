import express from "express";
import { auth } from "../middlewares/auth.js";
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from "../controllers/aiController.js";
import sql from '../configs/db.js';
import OpenAI from "openai";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

//TEMPORARY TEST ROUTE - Remove after testing
aiRouter.post('/test-generate', async (req, res) => {
    try {
        const { prompt, length } = req.body;
        const testUserId = 'test_user_123'; // Hardcoded test user

        const AI = new OpenAI({
            apiKey: process.env.GEMINI_API_KEY,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
        });

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: [{
                role: "user",
                content: prompt,
            }],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, promt, content, type) VALUES (${testUserId}, ${prompt}, ${content}, 'article')`;

        res.json({ success: true, content, message: 'Test route worked! Database insert successful.' });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
});

// Protected routes (require Clerk auth - use Bearer token in Postman)
aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-title', auth, generateBlogTitle)
aiRouter.post('/generate-image', auth, generateImage)
aiRouter.post('/remove-image-background',upload.single('image'), auth, removeImageBackground)
aiRouter.post('/remove-image-Object',upload.single('image'), auth, removeImageObject)
aiRouter.post('/resume-review',upload.single('resume'), auth, resumeReview)


// DEV-ONLY: Same endpoints without auth for Postman testing (remove in production)
const isDev = process.env.NODE_ENV !== 'production'
if (isDev) {






  aiRouter.get('/dev/get-user-creations', async (req, res) => {
  try {
    const creations = await sql`
      SELECT *
      FROM creations
      WHERE user_id = 'dev_user_postman'
      ORDER BY created_at DESC
    `;

    res.json({ success: true, creations });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
});





  const devAuth = (req, res, next) => {
    req.userId = 'dev_user_postman'
    req.plan = 'free'
    req.free_usage = 0
    next()
  }

  // Mock handlers for dev routes (avoid rate limiting)
  const mockArticleResponse = (req, res) => {
    const { prompt, length } = req.body;
    const mockContent = `# Generated Article\n\nBased on: "${prompt}"\n\nThis is a mock article response for development purposes. Word count: ~${length}.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
    res.json({ success: true, content: mockContent });
  };

  const mockTitleResponse = (req, res) => {
    const { prompt } = req.body;
    const mockTitles = [
      '10 Game-Changing Insights About Technology',
      'The Future of AI: What You Need to Know',
      'Why Innovation Matters More Than Ever',
      'Breaking Down Complex Concepts',
      'The Ultimate Guide to Success'
    ];
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    res.json({ success: true, content: randomTitle });
  };

  aiRouter.post('/dev/generate-article', devAuth, mockArticleResponse)
  aiRouter.post('/dev/generate-blog-title', devAuth, mockTitleResponse)
  aiRouter.post('/dev/generate-image', (req, res, next) => {
    req.userId = 'dev_user_postman'
    req.plan = 'premium' // image requires premium
    next()
  }, generateImage)
  aiRouter.post('/dev/remove-image-background', (req, res, next) => {
    req.userId = 'dev_user_postman'
    req.plan = 'premium'
    next()
  }, upload.single('image'), removeImageBackground)

  aiRouter.post('/dev/remove-image-Object', (req, res, next) => {
    req.userId = 'dev_user_postman'
    req.plan = 'premium'
    next()
  }, upload.single('image'), removeImageObject)

  aiRouter.post('/dev/resume-review', (req, res, next) => {
    req.userId = 'dev_user_postman'
    req.plan = 'premium'
    next()
  }, upload.single('resume'), resumeReview)

  aiRouter.get('/dev/get-published-creations', async (req, res) => {
    try {
      const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
      res.json({ success: true, creations });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  })
}

export default aiRouter