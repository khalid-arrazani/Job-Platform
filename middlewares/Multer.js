import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadImage = upload.fields([
  { name: "companyLogo", maxCount: 1 },
  { name: "companyBackground", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
]);