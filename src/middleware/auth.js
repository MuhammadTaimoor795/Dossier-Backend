const jwt = require('jsonwebtoken')

module.exports =async (req, res, next) => {
    const authHeader = req.headers.authorization;
    try {
        if(authHeader){
            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({
                  data: null,
                  error: "Please provide token",
                });
            }
           
            console.log("token::",token)
            console.log("process :::::::::",process.env.SECRET)
            const decoded = await jwt.verify(token, process.env.SECRET)
            
            req.user = decoded.id;
            req.isAdmin = decoded.isAdmin
            next();
    
        }else{
            return res.status(401).json({
                data: null,
                error: "Please provide token in header",
            });
        }
    } catch (error) {
        return res.status(500).json({
            data: null,
            error: "Invalid token provided",
        });
    }
       
    
};