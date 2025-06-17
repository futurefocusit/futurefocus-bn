import { Request, Response } from 'express';
import Blog, { IBlog } from '../models/Blog';
import { validateObjectId } from '../utils/validation';

// Helper function to generate slug
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Helper function to generate unique slug
const generateUniqueSlug = async (title: string): Promise<string> => {
    let slug = generateSlug(title);
    let counter = 1;
    let uniqueSlug = slug;

    while (await Blog.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
};

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private (Admin/Institution)
export const createBlog = async (req: any, res: Response) => {
    try {
        const institutionId = req.user?.institution
        const {
            title,
            content,
            excerpt,
            author,
            featuredImage,
            tags,
            category,
            status,
            seoTitle,
            seoDescription,
            seoKeywords,
            isFeatured
        } = req.body;

        // Validate required fields
        if (!title || !content || !excerpt || !author || !category) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, content, excerpt, author, institutionId, category'
            });
        }

        // Validate institutionId
        if (!validateObjectId(institutionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid institution ID'
            });
        }

        // Generate unique slug
        const slug = await generateUniqueSlug(title);

        // Create blog post
        const blog = new Blog({
            title,
            content,
            excerpt,
            author,
            institutionId,
            slug,
            featuredImage,
            tags: tags || [],
            category,
            status: status || 'draft',
            seoTitle,
            seoDescription,
            seoKeywords: seoKeywords || [],
            isFeatured: isFeatured || false
        });

        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: blog
        });
    } catch (error: any) {
        console.error('Error creating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating blog post',
            error: error.message
        });
    }
};

// @desc    Get all blogs with pagination and filtering
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req: Request, res: Response) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            status = 'published',
            institutionId,
            search,
            sortBy = 'publishedAt',
            sortOrder = 'desc',
            featured
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        if (institutionId) {
            if (!validateObjectId(institutionId as string)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid institution ID'
                });
            }
            query.institutionId = institutionId;
        }

        if (featured === 'true') {
            query.isFeatured = true;
        }

        // Text search
        if (search) {
            query.$text = { $search: search as string };
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const blogs = await Blog.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('institutionId', 'name slug logo')
            .lean();

        // Get total count
        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            data: blogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs',
            error: error.message
        });
    }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const blog = await Blog.findOne({ slug, status: 'published' })
            .populate('institutionId', 'name slug logo location')
            .lean();

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Increment views
        await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

        res.json({
            success: true,
            data: blog
        });
    } catch (error: any) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog post',
            error: error.message
        });
    }
};

// @desc    Get blog by ID (for admin/institution)
// @route   GET /api/blogs/id/:id
// @access  Private
export const getBlogById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        const blog = await Blog.findById(id)
            .populate('institutionId', 'name slug logo location')
            .lean();

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            data: blog
        });
    } catch (error: any) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog post',
            error: error.message
        });
    }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        // If title is being updated, generate new slug
        if (updateData.title) {
            updateData.slug = await generateUniqueSlug(updateData.title);
        }

        const blog = await Blog.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('institutionId', 'name slug logo location');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: blog
        });
    } catch (error: any) {
        console.error('Error updating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating blog post',
            error: error.message
        });
    }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog post',
            error: error.message
        });
    }
};

// @desc    Like/Unlike blog post
// @route   POST /api/blogs/:id/like
// @access  Public
export const toggleLike = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'like' or 'unlike'

        if (!validateObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid blog ID'
            });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        if (action === 'like') {

        //@ts-expect-error erro
            await blog.incrementLikes();
        } else if (action === 'unlike') {
        //@ts-expect-error erro
            await blog.decrementLikes();
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "like" or "unlike"'
            });
        }

        res.json({
            success: true,
            message: `Blog ${action}d successfully`,
            data: { likes: blog.likes }
        });
    } catch (error: any) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like',
            error: error.message
        });
    }
};

// @desc    Get blog analytics
// @route   GET /api/blogs/analytics
// @access  Private
export const getBlogAnalytics = async (req: Request, res: Response) => {
    try {
        const { institutionId } = req.query;

        if (!institutionId || !validateObjectId(institutionId as string)) {
            return res.status(400).json({
                success: false,
                message: 'Valid institution ID is required'
            });
        }

        const analytics = await Blog.aggregate([
            { $match: { institutionId: institutionId } },
            {
                $group: {
                    _id: null,
                    totalBlogs: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    publishedBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draftBlogs: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    featuredBlogs: {
                        $sum: { $cond: ['$isFeatured', 1, 0] }
                    },
                    avgReadTime: { $avg: '$readTime' }
                }
            }
        ]);

        // Get top performing blogs
        const topBlogs = await Blog.find({ institutionId, status: 'published' })
            .sort({ views: -1 })
            .limit(5)
            .select('title views likes publishedAt')
            .lean();

        res.json({
            success: true,
            data: {
                overview: analytics[0] || {
                    totalBlogs: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    publishedBlogs: 0,
                    draftBlogs: 0,
                    featuredBlogs: 0,
                    avgReadTime: 0
                },
                topBlogs
            }
        });
    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog analytics',
            error: error.message
        });
    }
};

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public
export const searchBlogs = async (req: Request, res: Response) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const blogs = await Blog.find(
            {
                $text: { $search: q as string },
                status: 'published'
            },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limitNum)
            .populate('institutionId', 'name slug logo')
            .lean();

        const total = await Blog.countDocuments({
            $text: { $search: q as string },
            status: 'published'
        });

        res.json({
            success: true,
            data: blogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error: any) {
        console.error('Error searching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching blogs',
            error: error.message
        });
    }
}; 