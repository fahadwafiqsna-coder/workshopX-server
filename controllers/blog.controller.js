const Blog = require("../models/Blog.model");
const ApiError = require("../utils/ApiError");

const createBlog = async (req, res, next) => {
  try {
    const { title, content, image, author } = req.body;

    const blog = await Blog.create({
      title,
      content,
      image,
      author,
    });

    res.status(201).json(blog);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find().populate("author", "username email");;
    res.json(blogs);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate("author", "username email");;
    res.json(blog);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, image, author } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, content, image, author },
      { new: true }
    );
    res.json({blog, message: "Blog updated successfully"});
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    res.json(blog);
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };
