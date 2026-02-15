import { clerkClient } from "@clerk/express";

//Middleware to check userId and hasPremiumPlan


export const auth = async (req, res, next) => {
    try {
       const {userId, has} = await req.auth();

       // Check if user is authenticated
       if (!userId) {
           return res.status(401).json({
               success: false,
               message: "Unauthorized: user not logged in"
           });
       }

       const hasPremiumPlan = await has({plan: 'premium'});

       const user = await clerkClient.users.getUser(userId);
       if(!hasPremiumPlan && user.privateMetadata.free_usage){
        req.free_usage = user.privateMetadata.free_usage
       } else{
        await clerkClient.users.updateUserMetadata(userId, {privateMetadata: {free_usage: 0}
        })
        req.free_usage = 0;
       }

       // Expose userId on the request for downstream handlers
       req.userId = userId;

       req.plan = hasPremiumPlan ? 'premium' : 'free';
       next()
    }catch (error) {
         res.status(500).json({success: false, message: error.message })

    }
}


