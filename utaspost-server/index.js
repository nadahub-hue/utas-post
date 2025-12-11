import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"

import userModel from "./models/userModel.js"
import postModel from "./models/postModel.js"


const UTAS_Post_App = new express()
UTAS_Post_App.use(express.json())
UTAS_Post_App.use(cors())

dotenv.config()

//Connection to MongoDB
try {
    const UTAS_Post_App_ConnectionString = `mongodb+srv://${process.env.MONGODB_USERID}:${process.env.MONGODB_PASSWORD}@cluster0.uqhgnwr.mongodb.net/${process.env.MONGODB_DATABASE}`
    mongoose.connect(UTAS_Post_App_ConnectionString)
    console.log("Database Connection Success !")
} catch (err) {
    console.log(err)
}


// Listener
UTAS_Post_App.listen(process.env.PORT, () => {
    try {
        console.log(`UTAS Post Server running at port ${process.env.PORT} ...!`)
    } catch (err) {
        console.log(err)
    }
})

//Register a new user with encrypted password
UTAS_Post_App.post("/userRegister", async (req, res) => {
    try {
        const userExist = await userModel.findOne({ userEmail: req.body.email })
        if (userExist) {
            res.send("User already exist !")
            //res.json({serverMsg : "User already exist !", flag : false})
        } else {
            const encrypredPassword = await bcrypt.hash(req.body.pwd, 10)
            const newUser = {
                userName: req.body.fullName,
                userGender: req.body.gender,
                userDoB: req.body.dob,
                userDept: req.body.dept,
                userEmail: req.body.email,
                userPassword: encrypredPassword,
                userProfilePic: req.body.profilePic
            }
            await userModel.create(newUser)
            res.send("Registration Success !")
            //res.json({serverMsg : "Registration Success !", flag : true})
        }
    } catch (err) {
        console.log(err)
    }
})


//Login verification
UTAS_Post_App.post("/userLogin", async (req, res) => {
    try {
        const user = req.body.userEmail
        const userExist = await userModel.findOne({ userEmail: user })
        console.log(userExist)
        if (!userExist) {
            //res.send("User not found !")
            res.json({ serverMsg: "User not found !", loginStatus: false })
        } else {
            const matchPassword = await bcrypt.compare(req.body.userPassword, userExist.userPassword)
            if (!matchPassword) {
                //res.send("Incorrect Password !")
                res.json({ serverMsg: "Incorrect Password !", loginStatus: false })
            } else {
                //res.send("Welcome")
                //res.send("Welcome : " + userExist.userName)
                res.json({ serverMsg: "Welcome", user: userExist })
            }
        }
    } catch (err) {
        console.log(err)
    }
})



//Insert a new post
UTAS_Post_App.post("/insertPost", async (req, res) => {
    try {
        const newPost = {
            postUserEmail: req.body.postUserEmail,
            postMessageTitle: req.body.postMessageTitle,
            postMessage: req.body.postMessage,
            lat: req.body.lat,
            lon: req.body.lon
        }

        await postModel.create(newPost)
        res.send("Post Insert Success !")
    } catch (err) {
        console.log(err)
    }
})


//Delete a post
UTAS_Post_App.delete("/deletePost/:pid", async (req, res) => {
    try {
        const postId = req.params.pid
        console.log(postId)
        const deletePost = await postModel.findByIdAndDelete(postId)
        res.send("Post Delete Success !")
    } catch (err) {
        console.log(err)
    }
})

//Edit a post
UTAS_Post_App.put("/editPost/:pid", async (req, res) => {
    try {
        const postId = req.params.pid
        console.log(req.body.postMessageTitle)
        console.log(postId)
        const updatePost = await postModel.findByIdAndUpdate(postId, {
            postMessageTitle: req.body.postMessageTitle,
            postMessage: req.body.postMessage,
            lat: req.body.lat,
            lon: req.body.lon
        })

        res.send("Post Update Success !")
        console.log(updatePost)
        //res.send(updatePost)

    } catch (err) {
        console.log(err)
    }
})



//Like Post
UTAS_Post_App.put("/addLike/:postID/:userEmail", async (req, res) => {
    try {
        const postID = req.params.postID
        const userEmail = req.params.userEmail
        const postData = await postModel.findById(postID)
        console.log(postData)
        if (postData == null) {
            res.send("Post does not exist !")
        } else {
            if (!postData.postLikesBy.includes(userEmail)) {
                const newPostLikes = postData.postLikes + 1
                const newPostsLikesBy = [...postData.postLikesBy, userEmail]
                const updatePostData = await postModel.findByIdAndUpdate(postID, { postLikes: newPostLikes, postLikesBy: newPostsLikesBy })
                res.send("Likes updated !")
            } else {
                res.send("Likes already exist !")
            }
        }
    } catch (err) {
        console.log(err)
    }
})



//Show All Posts by latest first
UTAS_Post_App.get("/showPosts", async (req, res) => {
    try {
        const postsWithUser = await postModel.aggregate(
            [
                {
                    $lookup: {
                        from: "utas-post-users",
                        localField: "postUserEmail",
                        foreignField: "userEmail",
                        as: "user"
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $project: {
                        "user.userPassword": 0,
                        "user.userEmail": 0
                    }
                }
            ]
        )
        res.send(postsWithUser)
    }
    catch (err) {
        console.log(err)
    }
})





// {
//     postLikeByUserEmail: req.body.postLikes.postLikesBy.postLikeByUserEmail,
//     postLikeByUserName: req.body.postLikes.postLikesBy.postLikeByUserName,
//     postLikeByUserProfilePic: req.body.postLikes.postLikesBy.postLikeByUserProfilePic
// }




