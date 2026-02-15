import OpenAI from "openai";
import sql from '../configs/db.js';
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
// pdf-parse lazy-loaded in resumeReview to avoid native deps at cold start on Vercel



const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res)=>{
    try {
        // userId is set by auth middleware
        const userId  = req.userId;
        const {prompt, length} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: 'Limit reached. Upgrad to continue.'});
        }

        const response = await AI.chat.completions.create({
          model: "gemini-3-flash-preview",
           messages: [ {
             role: "user",
             content: prompt,
            },
            ],
           temperature: 0.7,
           max_tokens: length,
        });

   const content = response.choices[0].message.content

   await sql` INSERT INTO creations (user_id, promt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

   if(plan !== 'premium' && userId !== 'dev_user_postman'){
    await clerkClient.users.updateUserMetadata(userId, {privateMetadata: {free_usage: free_usage + 1}
    });
   }

   res.json({success: true, content})

    }catch (error) {
     console.log(error.message)
     const isRateLimit = error.status === 429 || error.message?.includes('429');
     const message = isRateLimit 
       ? 'Rate limit exceeded. Please wait a minute before trying again.'
       : error.message;
     res.json({success: false, message })
    }
}


export const generateBlogTitle = async (req, res)=>{
    try {
        const userId  = req.userId;
        const {prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: 'Limit reached. Upgrad to continue.'});
        }

        const response = await AI.chat.completions.create({   //this code from clipdrop
          model: "gemini-3-flash-preview",
           messages: [ {
             role: "user",
             content: prompt,
            }
            ],
           temperature: 0.7,
           max_tokens: 100,
        });

   const content = response.choices[0].message.content //this the respose from the AI

   await sql` INSERT INTO creations (user_id, promt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

   if(plan !== 'premium' && userId !== 'dev_user_postman'){
    await clerkClient.users.updateUserMetadata(userId, {privateMetadata: {free_usage: free_usage + 1}
    });
   }

   res.json({success: true, content})

    }catch (error) {
     console.log(error.message)
     const isRateLimit = error.status === 429 || error.message?.includes('429');
     const message = isRateLimit 
       ? 'Rate limit exceeded. Please wait a minute before trying again.'
       : error.message;
     res.json({success: false, message })
    }
}


export const generateImage = async (req, res)=>{
    try {
        const userId  = req.userId;
        const {prompt, publish} = req.body;
        const plan = req.plan;

        if(plan !== 'premium' ){
            return res.json({success: false, message: 'This feature is only available for premium subscriptions'});
        }
        
        const form = new FormData();
        form.append('prompt', prompt);
        let response;
        try {
            response = await axios.post("https://clipdrop-api.co/text-to-image/v1", form, {
                headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
                responseType: 'arraybuffer',
            });
        } catch (clipdropError) {
            const status = clipdropError.response?.status;
            const msg = status === 402
                ? 'Image generation quota exceeded or payment required. Check your ClipDrop account at clipdrop.co.'
                : (clipdropError.response?.data ? String(clipdropError.response.data).slice(0, 200) : clipdropError.message);
            console.log('ClipDrop error:', status, msg);
            return res.status(status && status >= 400 && status < 600 ? status : 502).json({
                success: false,
                message: msg,
            });
        }

        const data = response.data;
        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const {secure_url} = await cloudinary.uploader.upload(base64Image);

        await sql`INSERT INTO creations (user_id, promt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export const removeImageBackground = async (req, res)=>{
    try {
        // userId is set by auth middleware
        const userId  = req.userId;
        const image = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: 'This fearture is only available for premium subscriptions.'});
        }


        if(!image) return res.status(400).json({success: false, message: 'No image uploaded'});

        const imageSource = image.buffer
          ? `data:${image.mimetype || 'image/png'};base64,${image.buffer.toString('base64')}`
          : image.path;
        const {secure_url} = await cloudinary.uploader.upload(imageSource, {transformation: {
            effect: 'background_removal',
            background_removal: 'remove_the_background'
        }})


    await sql` INSERT INTO creations (user_id, promt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

   if(plan !== 'premium' && userId !== 'dev_user_postman'){
    await clerkClient.users.updateUserMetadata(userId, {privateMetadata: {free_usage: free_usage + 1}
    });
   }

   res.json({success: true, content: secure_url})

    }catch (error) {
     console.log(error.message)
     res.json({success: false, message: error.message })
    }
}


export const removeImageObject = async (req, res)=>{
    try {
        // userId is set by auth middleware
        const userId = req.userId;
        const object = req.body.object;
        const image = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: 'This fearture is only available for premium subscriptions.'});
        }


        if(!image) return res.status(400).json({success: false, message: 'No image uploaded'});
        if(!object) return res.status(400).json({success: false, message: 'No object specified'});

        const imageSource = image.buffer
          ? `data:${image.mimetype || 'image/png'};base64,${image.buffer.toString('base64')}`
          : image.path;
     const {public_id} = await cloudinary.uploader.upload(imageSource)

    const imageUrl = cloudinary.url(public_id, {
        transformation: [{effect: `gen_remove:${object}`}],
        resource_type: 'image'
    })


   await sql` INSERT INTO creations (user_id, promt, content, type) VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')`;

   if(plan !== 'premium' && userId !== 'dev_user_postman'){
    await clerkClient.users.updateUserMetadata(userId, {privateMetadata: {free_usage: free_usage + 1}
    });
   }

   res.json({success: true, content: imageUrl})

    }catch (error) {
     console.log(error.message)
     res.json({success: false, message: error.message })
    }
}



export const resumeReview = async (req, res)=>{
    try {
        // userId is set by auth middleware
        const userId = req.userId;
        const resume  = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: 'This fearture is only available for premium subscriptions.'});
        }


    if(resume.size > 5 * 1024 * 1024){
        return res.json({success: false, message: 'File size must be less than 5MB.'});
    }

    const dataBuffer = resume.buffer || (await import('fs')).default.readFileSync(resume.path);
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: dataBuffer });
    const pdfData = await parser.getText();

        const promptText = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`

        const response = await AI.chat.completions.create({
            model: "gemini-3-flash-preview",
             messages: [ {role: "user", content: promptText }],
             temperature: 0.7,
             max_tokens: 1000,
          });

       const content = response.choices[0].message.content;


       await sql` INSERT INTO creations (user_id, promt, content, type) VALUES (${userId}, ${promptText}, ${content}, 'resume-review')`;

       if(plan !== 'premium' && userId !== 'dev_user_postman'){
        await clerkClient.users.updateUserMetadata(userId, {privateMetadata: {free_usage: free_usage + 1}
        });
       }

       res.json({success: true, content})

    }catch (error) {
     console.log(error.message)
     res.json({success: false, message: error.message })
    }
}