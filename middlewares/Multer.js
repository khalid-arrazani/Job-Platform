import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadImages = upload.fields([
  { name: "companyLogo", maxCount: 1 },
  { name: "companyBackground", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
]);