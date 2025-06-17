import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    content: string;
    excerpt: string;
    author: string;
    institutionId: mongoose.Types.ObjectId;
    slug: string;
    featuredImage?: string;
    tags: string[];
    category: string;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date;
    readTime: number;
    views: number;
    likes: number;
    isFeatured: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema: Schema = new Schema<IBlog>({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required'],
        minlength: [50, 'Content must be at least 50 characters long']
    },
    excerpt: {
        type: String,
        required: [true, 'Blog excerpt is required'],
        maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    institutionId: {
        type: Schema.Types.ObjectId,
        ref: 'Institution',
        required: [true, 'Institution ID is required']
    },
    slug: {
        type: String,
        required: [true, 'Blog slug is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    featuredImage: {
        type: String,
        default: null
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    category: {
        type: String,
        required: [true, 'Blog category is required'],
        enum: {
            values: ['education', 'technology', 'business', 'lifestyle', 'news', 'tutorial', 'other'],
            message: 'Category must be one of: education, technology, business, lifestyle, news, tutorial, other'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['draft', 'published', 'archived'],
            message: 'Status must be one of: draft, published, archived'
        },
        default: 'draft'
    },
    publishedAt: {
        type: Date,
        default: null
    },
    readTime: {
        type: Number,
        default: 0,
        min: [0, 'Read time cannot be negative']
    },
    views: {
        type: Number,
        default: 0,
        min: [0, 'Views cannot be negative']
    },
    likes: {
        type: Number,
        default: 0,
        min: [0, 'Likes cannot be negative']
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    seoTitle: {
        type: String,
        maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    seoDescription: {
        type: String,
        maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    seoKeywords: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
BlogSchema.index({ institutionId: 1, status: 1 });
BlogSchema.index({ slug: 1 });
BlogSchema.index({ category: 1, status: 1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ isFeatured: 1, status: 1 });

// Virtual for formatted date
BlogSchema.virtual('formattedPublishedAt').get(function () {
    if (this.publishedAt) {
        //@ts-expect-error erro
        return this.publishedAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    return null;
});

// Virtual for reading time calculation
BlogSchema.virtual('calculatedReadTime').get(function () {
    if (this.content) {
        const wordsPerMinute = 200;
        //@ts-expect-error erro
        const wordCount = this.content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
    return 0;
});

// Pre-save middleware to calculate read time and generate SEO fields if not provided
BlogSchema.pre('save', function (next) {
    // Calculate read time
    if (this.content) {
        const wordsPerMinute = 200;
        //@ts-expect-error erro
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }

    // Generate SEO title if not provided
    if (!this.seoTitle) {
        this.seoTitle = this.title;
    }

    // Generate SEO description if not provided
    if (!this.seoDescription) {
        this.seoDescription = this.excerpt;
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    next();
});

// Static method to find published blogs
BlogSchema.statics.findPublished = function () {
    return this.find({ status: 'published' });
};

// Static method to find blogs by institution
BlogSchema.statics.findByInstitution = function (institutionId: string) {
    return this.find({ institutionId, status: 'published' });
};

// Instance method to increment views
BlogSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};

// Instance method to increment likes
BlogSchema.methods.incrementLikes = function () {
    this.likes += 1;
    return this.save();
};

// Instance method to decrement likes
BlogSchema.methods.decrementLikes = function () {
    if (this.likes > 0) {
        this.likes -= 1;
    }
    return this.save();
};

export default mongoose.model<IBlog>('Blog', BlogSchema); 