import express from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import UserModel from './model/users.js';
import PostModel from './model/post.js';
import { authenUser } from './middleware/checkApiKey.js';

mongoose.connect('mongodb+srv://web85_mindx:web85_mindx_password@cluster0.r1fmx.mongodb.net/WEB85')

const app = express();
app.use(express.json());

// API register
app.post("/users/register", async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const newUser = new UserModel({ userName, email, password, apiKey: null });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
});

// API login
app.post("/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Data missing" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Wrong email or password" });

    if (user.password !== password) {
      return res.status(400).json({ message: "Wrong email or password" });
    }

    const randomString = uuidv4();
    const apiKey = `mern-${user._id}-${email}-${randomString}`;

    user.apiKey = apiKey;
    await user.save();

    res.status(201).send({
      message: "Login successfully!",
      apiKey,
    });
  } catch (error) {
    res.status(403).send({
      message: error.message,
      data: null,
      success: false,
    });
  }
});

// API post
app.post("/posts", authenUser, async (req, res) => {
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const post = new PostModel({
      userId: req.user._id, 
      content,
    });

    await post.save();
    res.status(201).json({ message: "Post created successfully.", post });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
});

// API cap nhat pót
app.put("/posts/:id", authenUser, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required." });
  }

  try {
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.userId !== req.user._id) {
      return res.status(403).json({ message: "You are not authorized to update this post." });
    }

    post.content = content;
    post.updatedAt = new Date();

    await post.save();
    res.status(201).json({ message: "Post updated successfully.", post });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
});

app.use("/posts", authenUser);  

app.listen(8080, () => {
  console.log('Server is running');
});
