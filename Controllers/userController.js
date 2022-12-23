const jwt =  require('jsonwebtoken');
const User = require("../models/user");
const bcrypt = require('bcrypt');
const userController = {
    //ADD USER
    add_user: async(req,res)=>{
        const {name,email,password} = req.body
        const isNewUser = await User.isThisEmailInUse(email);
        if (!isNewUser){
            return res.json({
                success: false,
                message: 'This email is already in use, try sign-in',
            });}
        else{
            const user = await User({
               name,
               email,
               password,
            });
            await user.save();
            res.json(user);
        }
    },

    //SIGN IN
    userSignIn: async(req,res)=>{
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user){
        return res.json({
          success: false,
          message: 'user not found, with the given email!',
        });
      }    
      const isMatch = await user.comparePassword(password);
      if (!isMatch){
        return res.json({
          success: false,
          message: 'email / password does not match!',
        });
      }
      const token =  jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn:'1y'});      
      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        win: user.win,
        lose: user.lose,
        token: token
      }
      //res.json({success: true,user:userInfo, token})
      res.send(JSON.stringify(userInfo))
    },
    
    increasewin: async(req,res) => {
      const {user} = req;
      let win = user.win + 1;
      try {
        const exp = await User.findByIdAndUpdate(
          user._id,
          {
            win
          },
          { new: true, runValidators: true }
          )
          console.log(exp);
        res.send(JSON.stringify(exp));
      } catch (error) {
        res.send(error)
      }
    },

    increaselose: async(req,res) => {
      const {user} = req;
      let lose = user.lose + 1;
      try {
        const exp = await User.findByIdAndUpdate(
          user._id,
          {
            lose
          },
          { new: true, runValidators: true }
          )
          console.log(exp);
        res.send(JSON.stringify(exp));
      } catch (error) {
        res.send(error)
      }
    },  
    getAll: async(req,res)=>{
      try{
          const authors = await User.find().sort({"win":-1});
          res.send(JSON.stringify(authors));
      }catch(err){
        res.send(err)
      }
   },
}
module.exports = userController;