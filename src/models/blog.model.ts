import mongoose, { Schema } from "mongoose"
import slugify from "slugify"
import { Blog } from "../types/Types"


const BlogSchema = new Schema<Blog>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, "Please provide an excerpt"],
      maxlength: [200, "Excerpt cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Please provide an author"],
    },
    tags: {
      type: [String],
      required: [true, "Please provide at least one tag"],
    },
    image: {
      type: String,
      required: [true, "Please provide an image"],
    },
    institution:{type:Schema.Types.ObjectId},
    gallery: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          required: true,
        },
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Create slug from title before saving
BlogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }

  if (this.isModified("published") && this.published && !this.publishedAt) {
    this.publishedAt = new Date()
  }

  next()
})

const Blog =  mongoose.model<Blog>("Blog", BlogSchema)
export default Blog
