const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();

// Create Post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    
    // Ensure user is authenticated and data is valid
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create a new post with the title, content, tags, category, and author
    const newPost = new Post({
      title,
      content,
      tags,
      category,
      author: req.user.userId,  // Assuming req.user.id is the correct field after decoding the token
    });



    // Save the new post to the database
    await newPost.save();

    // Send a success response
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    // Handle errors such as validation issues or database connection problems
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Posts
// Backend (Node.js/Express)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});




router.get('/:id', async (req, res) => {
  const { id: postId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).send('Invalid post ID');
  }

  try {
    const post = await Post.findById(postId).populate('author', 'name email');
    console.log(post);  

    if (!post) {
      return res.status(404).send('Post not found');
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


// Edit Post
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).send('Post not found');
  }

  if (post.author.toString() !== req.user.userId) {
    return res.status(403).send('Not authorized');
  }

  post.title = title || post.title;
  post.content = content || post.content;
  await post.save();
  res.send('Post updated');
});

// Delete Post
router.delete('/:id', authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).send('Post not found');
  }

  if (post.author.toString() !== req.user.userId) {
    return res.status(403).send('Not authorized');
  }

  await post.remove();
  res.send('Post deleted');
});


// Like a post API
router.post('/:postId/like', async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.likes += 1; // Increment the likes count
    await post.save();

    res.status(200).json({ message: 'Post liked successfully', likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: 'Error liking the post' });
  }
});


// Add a comment to a post API
router.post('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { text, author } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({ text, author }); // Add the new comment
    await post.save();

    res.status(201).json({ message: 'Comment added successfully', comments: post.comments });
  } catch (err) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});


module.exports = router;
