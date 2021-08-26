const router = require('express').Router();
const Post = require('../models/Post'); //bigM or smallM? 
const User = require('../Models/User');

//create a post
router.post('/', async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);    
    } catch(err) {
        res.status(500).json(err)
    }
})

//update a post. id is postId
router.put('/:id', async (req, res) => {
    try {
    //verify user and find post id
    const post = await Post.findById(req.params.id)
    //check owner of post
    if(post.userId === req.body.userId){
        await post.updateOne({
            //set body
            $set:req.body    
        })
        //send body
        res.status(200).json('The post updated successfully.')
    } else {
        res.status(403).json('Ain\'t your post buddy.')
    }
    } catch(err) {
        res.status(500).json(err)

    }
})
//delete a post. id is postId
router.delete('/:id', async (req, res) => {
    try {
    //verify user and find post id
    const post = await Post.findById(req.params.id)
    //check owner of post
    if(post.userId === req.body.userId){
        await post.deleteOne()
        //send body
        res.status(200).json('The post deleted successfully.')
    } else {
        res.status(403).json('Ain\'t your post buddy.')
    }
    } catch(err) {
        res.status(500).json(err)
    }
})
//like and dislike a post
router.put('/:id/like', async (req, res) => {
    //find post
    try{ 
        const post = await Post.findById(req.params.id)
        //check if user has already liked a post
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({ $push:{ likes:req.body.userId } })
            res.status(200).json('Post has been liked :)')
        } else {
            await post.updateOne({ $pull: { likes:req.body.userId } })
            res.status(200).json('Post has been disliked :(')
        }
    }catch(err){
        res.status(500).json(err)
    }
});
//get a post
router.get('/:id', async (req, res) => {
    try {
        //try to find the post by looking for the req.params.id (found in url)
        const post = await Post.findById(req.params.id)
        //send the post
        res.status(200).json(post)
    }catch(err){
        res.status(500).json(err)
    }
})
//get timeline posts
router.get('/timeline/all', async (req, res) => {
    // let postArray = [];
    try {    
        const currentUser = await User.findById(req.body.userId)
        const userPosts = await Post.find({userId:currentUser._id})
        //using promise here since we will loop through all the user posts, since await will not fetch all posts
        const friendPosts = await Promise.all(
            currentUser.followings.map(friendId=>{
                return Post.find({userId:friendId})
            })
        );
        res.json(userPosts.concat(...friendPosts))
    }catch(err){
        console.log(err)
    }
})
module.exports = router;