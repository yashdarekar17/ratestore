const jwt = require("jsonwebtoken");
const jwtauthentication = async (res , req , next) =>{
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ message: "Token not found" });
    }

    const token = authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({message:"Token not found"});
    }
    try{
       const decode = jwt.verify(token , process.env.JWT_SECRET);
       req.user = decode;
       next();
    }catch(err){
        return res.status(401).json({ message: "Invalid token" });
    }
}

const generatetoken = (user) =>{
    return jwt.sign(user , process.env.JWT_SECRET , {expiresIn:"1h"});
}

module.exports = {jwtauthentication , generatetoken};

