import Page from "../models/Page.js";
import { slugify } from "../utils/slugify.js";
import { logActivity } from "../utils/auditLogger.js";

// @desc    Get all pages/banners (with pagination, filter & search options)
// @route   GET /api/pages
// @access  Private
export const getPages = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;
    
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;

    // Create query object
    let query = {};

    // Filter by type ('page' | 'banner')
    if (type) {
      query.type = type;
    }

    // Filter by status ('Draft', 'Published', 'Scheduled', 'Pending Approval')
    if (status) {
      query.status = status;
    }

    // Search query on title or slug
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }

    // Count total documents matching query
    const totalCount = await Page.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const pages = await Page.find(query)
      .populate("author", "name email role")
      .sort({ updatedAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: pages.length,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      },
      data: pages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single page/banner details by ID
// @route   GET /api/pages/:id
// @access  Private
export const getPageById = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id).populate(
      "author",
      "name email role"
    );

    if (!page) {
      res.status(404);
      return next(new Error("Content item not found"));
    }

    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new page/banner
// @route   POST /api/pages
// @access  Private
export const createPage = async (req, res, next) => {
  try {
    const { title, slug, content, status, type, featuredImage, seo } = req.body;

    // Auto-generate slug if not provided, or clean slug if it is
    const finalSlug = slug ? slugify(slug) : slugify(title);

    // Verify slug uniqueness
    const slugExists = await Page.findOne({ slug: finalSlug });
    if (slugExists) {
      res.status(400);
      return next(new Error(`A content item with slug "/${finalSlug}" already exists`));
    }

    const page = await Page.create({
      title,
      slug: finalSlug,
      content,
      status: status || "Draft",
      type: type || "page",
      featuredImage: featuredImage || "",
      seo: seo || { metaTitle: "", metaDescription: "" },
      author: req.user._id // reference current logged-in user
    });

    // Write Audit Activity Log
    await logActivity(`${page.type.toUpperCase()}_CREATE`, req.user._id, page._id, {
      title: page.title,
      slug: page.slug,
      status: page.status
    });

    res.status(201).json({
      success: true,
      data: page
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update page/banner content
// @route   PUT /api/pages/:id
// @access  Private
export const updatePage = async (req, res, next) => {
  try {
    const { title, slug, status, seo } = req.body;

    let page = await Page.findById(req.params.id);

    if (!page) {
      res.status(404);
      return next(new Error("Content item not found"));
    }

    // Verify unique slug if slug or title is updated
    if (slug || title) {
      const targetSlug = slug ? slugify(slug) : slugify(title);
      const slugExists = await Page.findOne({ slug: targetSlug, _id: { $ne: req.params.id } });
      if (slugExists) {
        res.status(400);
        return next(new Error(`A content item with slug "/${targetSlug}" already exists`));
      }
      req.body.slug = targetSlug;
    }

    // Merge SEO objects
    if (seo) {
      req.body.seo = {
        metaTitle: seo.metaTitle ?? page.seo.metaTitle,
        metaDescription: seo.metaDescription ?? page.seo.metaDescription
      };
    }

    // If active user is Editor, verify they are not bypassing approval flow
    if (req.user.role === "Editor" && status === "Published") {
      req.body.status = "Pending Approval";
    }

    const updatedPage = await Page.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("author", "name email role");

    // Write Audit Activity Log
    await logActivity(`${updatedPage.type.toUpperCase()}_UPDATE`, req.user._id, updatedPage._id, {
      title: updatedPage.title,
      slug: updatedPage.slug,
      status: updatedPage.status
    });

    res.status(200).json({
      success: true,
      data: updatedPage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete page/banner template
// @route   DELETE /api/pages/:id
// @access  Private/Admin (RBAC Protected)
export const deletePage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      res.status(404);
      return next(new Error("Content item not found"));
    }

    const pageId = page._id;
    const pageTitle = page.title;
    const pageType = page.type;

    await page.deleteOne();

    // Write Audit Activity Log
    await logActivity(`${pageType.toUpperCase()}_DELETE`, req.user._id, pageId, {
      title: pageTitle
    });

    res.status(200).json({
      success: true,
      message: "Content item deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
