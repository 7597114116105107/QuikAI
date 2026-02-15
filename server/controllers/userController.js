// import sql from "../configs/db.js";

// export const getUserCreations = async (req, res) => {
//     try {
//         const userId = req.userId;
//         const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
//         res.json({success: true, creations});

//     }catch (error) {
//        res.json({success: false, message: error.message});
//     }
// }

// export const getPublishedCreations = async (req, res) => {
//     try {
//         const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
//         res.json({success: true, creations});     

//     }catch (error) {
//        res.json({success: false, message: error.message});
//     }
// }


// export const toggleLikeCreation = async (req, res) => {
//     try {
//         const userId = req.userId;
//         const { id } = req.body;

//         const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

//         if (!creation) {
//             return res.json({ success: false, message: 'Creation not found' });
//         }

//         let currentLikes = creation.likes;
//         if (!currentLikes) currentLikes = [];
//         else if (typeof currentLikes === 'string') {
//             // Postgres text[] may be returned as '{a,b}' string
//             currentLikes = currentLikes.replace(/^{|}$/g, '')
//                 .split(',')
//                 .filter(Boolean);
//         }

//         const userIdStr = String(userId);
//         let updatedLikes;
//         let message;

//         if (Array.isArray(currentLikes) && currentLikes.includes(userIdStr)) {
//             updatedLikes = currentLikes.filter((i) => i !== userIdStr);
//             message = 'Creation unliked';
//         } else {
//             updatedLikes = Array.isArray(currentLikes) ? [...currentLikes, userIdStr] : [userIdStr];
//             message = 'Creation liked';
//         }

//         const formattedArray = `{${updatedLikes.join(',')}}`;

//         await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

//         res.json({ success: true, message });

//     }catch (error) {
//        res.json({success: false, message: error.message});
//     }
// }






import sql from "../configs/db.js";

/* ============================
   GET USER CREATIONS
============================ */
export const getUserCreations = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ============================
   GET PUBLISHED CREATIONS
============================ */
export const getPublishedCreations = async (req, res) => {
  try {
    const creations =
      await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ============================
   TOGGLE LIKE
============================ */
export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const  id  = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [creation] =
      await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    let likes = creation.likes ?? [];

    // Handle Postgres text[] string case
    if (typeof likes === "string") {
      likes = likes
        .replace(/^{|}$/g, "")
        .split(",")
        .filter(Boolean);
    }

    const userIdStr = String(userId);
    let updatedLikes;
    let message;

    if (likes.includes(userIdStr)) {
      updatedLikes = likes.filter((i) => i !== userIdStr);
      message = "Creation unliked";
    } else {
      updatedLikes = [...likes, userIdStr];
      message = "Creation liked";
    }

    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`
      UPDATE creations
      SET likes = ${formattedArray}::text[]
      WHERE id = ${id}
    `;

    res.json({ success: true, message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
