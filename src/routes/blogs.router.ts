import express from "express"
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog, 
  deleteBlog,
  uploadBlogImage,
  addGalleryItem,
  removeGalleryItem,
  getBlogsBySlug,
} from "../controllers/blog.controller"
import { isloggedIn } from "../middleware/isLoggedIn"


const router = express.Router()

router.route("/").get(getBlogs).post(isloggedIn, createBlog)
router.route('/slug/:slug').get(getBlogsBySlug)
router
  .route("/:id")
  .get(getBlog)
  .put(isloggedIn, updateBlog)
  .delete(isloggedIn, deleteBlog)

router.route("/:id/image").post(isloggedIn, uploadBlogImage)

router.route("/:id/gallery").post(isloggedIn,  addGalleryItem)

router.route("/:id/gallery/:itemId").delete(isloggedIn, removeGalleryItem)

export default router
