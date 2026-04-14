import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cv",
    resource_type: "raw" 
  }
});

const upload = multer({ storage });

export default upload;