const router = require('express').Router();
const User = require('../Models/User');
const bcrypt = require('bcrypt')

//REGISTER
router.post('/register', async (req, res)=>{  
    try{
        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt) 

        //create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            });


        // save user and respond   
        const user = await newUser.save();
        res.status(200).json(user)
    } catch(err) {
        console.log(err)
    }
})
 
//LOGIN 
router.post('/login', async (req, res)=>{
    try {
    const user = await User.findOne({
        email:req.body.email,
    })
    !user && res.status(404).send('User not found.')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).json('The password is wrong. Try again.')

    res.status(200).json(user)

    } catch(err){
        console.log(err)
    }
})

module.exports = router