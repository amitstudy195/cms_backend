import { z } from "zod";

export const createPageSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase alphanumeric characters and dashes only")
    .optional()
    .or(z.literal("")),
  content: z
    .string({ required_error: "Content body is required" })
    .min(10, "Content body must be at least 10 characters"),
  status: z
    .enum(["Draft", "Published", "Scheduled", "Pending Approval"])
    .optional(),
  type: z
    .enum(["page", "banner"])
    .optional(),
  featuredImage: z
    .string()
    .url("Featured image must be a valid URL")
    .optional()
    .or(z.literal("")),
  seo: z
    .object({
      metaTitle: z.string().max(80, "SEO Title cannot exceed 80 characters").optional().or(z.literal("")),
      metaDescription: z.string().max(200, "SEO Description cannot exceed 200 characters").optional().or(z.literal(""))
    })
    .optional()
});

// For update: all fields are optional
export const updatePageSchema = createPageSchema.partial();
