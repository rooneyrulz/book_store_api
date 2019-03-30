const jwt = require("jsonwebtoken");
const config = require("config");


module.exports = (req, res, next) => {
  
  //Check for token
  const token = req.header("x-auth-token");

  if (!token) return res.status(401).json({
    msg: `you are not authorized...`
  }); 

  try {
    //Decode token
    const decoded = jwt.verify(token, config.get("JWT_KEY"));
    req.user = decoded;
    next();

  } catch (error) {
    
    return res.status(400).json({
      msg: `invalid token...`
    });
  }
}