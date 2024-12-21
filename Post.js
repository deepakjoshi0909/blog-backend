const mongoose = require('mongoose');

// Define the schema for comments
const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming comments are also tied to users
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
    },
    category: {
      type: String,
      enum: ['Tech', 'Lifestyle', 'Health', 'Travel'],
      default: 'Tech',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: {
      type: Number,
      default: 0, // Tracks the number of likes
    },
    comments: [commentSchema], // Embed the comments as a subdocument array
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
