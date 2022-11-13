const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

//CONNECT DATABASE
mongoose.connect((process.env.MONGODB_URL),{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  //  useCreateIndex: true,
});
mongoose.connection.on('connected',()=>{
    console.log("Ket noi thanh cong voi mongodb")
})
mongoose.connection.on('err',(err)=>{
    console.log("Khong the ket noi thanh cong",err)
})