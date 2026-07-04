import Banner from "../models/Banner.js";

// @desc    Get all banners (sorted by displayOrder)
// @route   GET /api/banners
// @access  Private
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ displayOrder: 1 });
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new banner template
// @route   POST /api/banners
// @access  Private
export const createBanner = async (req, res, next) => {
  try {
    const { title, imageURL, targetURL, active, displayOrder } = req.body;

    if (!title || !imageURL) {
      res.status(400);
      return next(new Error("Please include banner title and imageURL"));
    }

    const banner = await Banner.create({
      title,
      imageURL,
      targetURL: targetURL || "",
      active: active !== undefined ? active : true,
      displayOrder: displayOrder || 0
    });

    res.status(201).json({
      success: true,
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update banner template details
// @route   PUT /api/banners/:id
// @access  Private
export const updateBanner = async (req, res, next) => {
  try {
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      res.status(404);
      return next(new Error("Banner not found"));
    }

    banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete banner template
// @route   DELETE /api/banners/:id
// @access  Private/Admin (RBAC Protected)
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      res.status(404);
      return next(new Error("Banner not found"));
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: "Banner template deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder banner displayOrder indexes
// @route   PUT /api/banners/reorder
// @access  Private
export const reorderBanners = async (req, res, next) => {
  try {
    const { orders } = req.body; // Expects array: [{ id: "...", displayOrder: 1 }, ...]

    if (!orders || !Array.isArray(orders)) {
      res.status(400);
      return next(new Error("Please provide an array of banner order items"));
    }

    // Run batch updates
    const updatePromises = orders.map((item) =>
      Banner.findByIdAndUpdate(
        item.id,
        { displayOrder: item.displayOrder },
        { runValidators: true }
      )
    );

    await Promise.all(updatePromises);

    const reorderedBanners = await Banner.find().sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      message: "Banners order updated successfully",
      data: reorderedBanners
    });
  } catch (error) {
    next(error);
  }
};
