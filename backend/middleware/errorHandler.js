export const errorHandler = async(error, req, res, next)=>{
    console.log(error.stack);
    res.status(500).json({error: "Something went wrong."});
};