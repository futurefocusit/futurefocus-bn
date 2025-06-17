import { Router } from "express";
import { createBlog, deleteBlog, getBlogById, getBlogBySlug, getBlogs, updateBlog } from "../controllers/blog.controller";
import { isloggedIn } from "../middleware/isLoggedIn"
const blogRoute = Router()

blogRoute.post("/",isloggedIn, createBlog)
blogRoute.get("/", getBlogs)
blogRoute.get("/",isloggedIn, getBlogs)
blogRoute.get("/:slug", getBlogBySlug)
blogRoute.get("/id/:id", getBlogById)
blogRoute.put("/:id",isloggedIn,updateBlog)
blogRoute.delete("/:id",isloggedIn,deleteBlog)
blogRoute.delete("/:id",isloggedIn,deleteBlog)
blogRoute.post("/:id/like",isloggedIn,deleteBlog)



export default blogRoute