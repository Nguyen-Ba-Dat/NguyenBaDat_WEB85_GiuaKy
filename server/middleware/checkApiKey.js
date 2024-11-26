import userModel from "../model/users.js";

export const authenUser = async (req, res, next) => {
    try {
        const {apiKey} = req.query

        if (!apiKey) return res.status(400).json({ message : "Missing apiKey"})

        const user = await userModel.findOne({apiKey})

        if (!user) {
            return res.status(400).json({message : "Invalid Api"})
        }

        req.user = user

        next()
    } catch (error) {
        res.status(403).send({
            message : error.message,
            data : null,
            success : false,
        })
    }
}