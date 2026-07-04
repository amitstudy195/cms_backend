import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { slugify } from "../utils/slugify.js";
import { registerSchema } from "../validators/authValidator.js";
import { createPageSchema } from "../validators/pageValidator.js";

async function runTests() {
  console.log("=== CMS Backend Advanced Verification Tests ===");

  // Test 1: Slugify Sanitizer Check
  console.log("\n[Test 1] Slugify Sanitizer:");
  const testTitle = "Modern MERN CMS: Analytics & Zod Validation 101!";
  const expectedSlug = "modern-mern-cms-analytics-zod-validation-101";
  const actualSlug = slugify(testTitle);
  console.log(`- Input: "${testTitle}"`);
  console.log(`- Output: "${actualSlug}"`);
  if (actualSlug === expectedSlug) {
    console.log("SUCCESS: Slug generated correctly.");
  } else {
    console.log(`FAILED: Expected "${expectedSlug}", got "${actualSlug}"`);
  }

  // Test 2: Password Encryption Check
  console.log("\n[Test 2] Password Encryption (Bcrypt):");
  const rawPassword = "complexPassword2026";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);
  console.log("- Salt and hash created successfully.");
  
  const matchSuccess = await bcrypt.compare(rawPassword, hash);
  const matchFailure = await bcrypt.compare("wrongPassword", hash);
  console.log(`- Valid password comparison: ${matchSuccess}`);
  console.log(`- Invalid password comparison: ${matchFailure}`);
  if (matchSuccess && !matchFailure) {
    console.log("SUCCESS: Bcrypt encryption operates correctly.");
  } else {
    console.log("FAILED: Bcrypt comparisons failed.");
  }

  // Test 3: JWT Payload Check
  console.log("\n[Test 3] JWT Signing & Payload Parsing:");
  const mockPayload = { id: "usr-456", role: "Editor" };
  const mockSecret = "temporarySecretKey2026";
  const token = jwt.sign(mockPayload, mockSecret, { expiresIn: "1h" });
  const decoded = jwt.verify(token, mockSecret);
  console.log(`- Decoded User ID: ${decoded.id}`);
  console.log(`- Decoded User Role: ${decoded.role}`);
  if (decoded.id === mockPayload.id && decoded.role === mockPayload.role) {
    console.log("SUCCESS: JWT payload decoding validates successfully.");
  } else {
    console.log("FAILED: JWT decodes mismatched.");
  }

  // Test 4: Zod Schema Payload Validation Checks
  console.log("\n[Test 4] Zod Payload Input Validations:");
  
  // 4a. Valid Registration Check
  const validRegisterPayload = {
    name: "Alex Rivera",
    email: "alex.rivera@cms.com",
    password: "securePassword123",
    role: "Editor"
  };
  const registerResult = registerSchema.safeParse(validRegisterPayload);
  console.log(`- Valid Registration SafeParse: ${registerResult.success}`);
  
  // 4b. Invalid Registration Check (password too short, bad email)
  const invalidRegisterPayload = {
    name: "A",
    email: "bad-email-format",
    password: "123",
    role: "Guest"
  };
  const badRegisterResult = registerSchema.safeParse(invalidRegisterPayload);
  console.log(`- Invalid Registration SafeParse: ${badRegisterResult.success} (Expected: false)`);
  if (!badRegisterResult.success && badRegisterResult.error) {
    const errorFields = badRegisterResult.error.issues.map(err => `${err.path.join(".")}: ${err.message}`);
    console.log("  Rejection Errors details:");
    errorFields.forEach(err => console.log(`  * ${err}`));
  }

  // 4c. Valid Page Check
  const validPagePayload = {
    title: "Services Summary",
    slug: "services-summary",
    content: "This is a detailed content description block of at least ten characters.",
    status: "Published",
    type: "page",
    featuredImage: "https://images.unsplash.com/photo-1542744094-3a31f103e35f",
    seo: {
      metaTitle: "Our Services | Enterprise Core",
      metaDescription: "Detailed services breakdown of our cloud platforms features."
    }
  };
  const pageResult = createPageSchema.safeParse(validPagePayload);
  console.log(`- Valid Page Create SafeParse: ${pageResult.success}`);

  // 4d. Invalid Page Check (bad slug casing, missing content)
  const invalidPagePayload = {
    title: "Bad Page",
    slug: "bad_slug_casing_underscore",
    status: "Active"
  };
  const badPageResult = createPageSchema.safeParse(invalidPagePayload);
  console.log(`- Invalid Page Create SafeParse: ${badPageResult.success} (Expected: false)`);
  if (!badPageResult.success && badPageResult.error) {
    const errorFields = badPageResult.error.issues.map(err => `${err.path.join(".")}: ${err.message}`);
    console.log("  Rejection Errors details:");
    errorFields.forEach(err => console.log(`  * ${err}`));
  }

  if (registerResult.success && !badRegisterResult.success && pageResult.success && !badPageResult.success) {
    console.log("SUCCESS: Zod validation schemas passed checks.");
  } else {
    console.log("FAILED: Zod validation schemas failed checks.");
  }

  // Test 5: Pagination Boundary Calculations
  console.log("\n[Test 5] Pagination Calculations:");
  const testPagination = (totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    return { startIndex, totalPages };
  };

  const p1 = testPagination(23, 1, 5);
  console.log(`- 23 items, Page 1, Limit 5 -> Start index: ${p1.startIndex}, Total pages: ${p1.totalPages}`);
  const p2 = testPagination(23, 3, 5);
  console.log(`- 23 items, Page 3, Limit 5 -> Start index: ${p2.startIndex}, Total pages: ${p2.totalPages}`);
  
  if (p1.startIndex === 0 && p1.totalPages === 5 && p2.startIndex === 10 && p2.totalPages === 5) {
    console.log("SUCCESS: Pagination algorithms verified.");
  } else {
    console.log("FAILED: Pagination calculations mismatched.");
  }
}

runTests().catch((err) => console.error("Validation script error:", err));
