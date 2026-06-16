
const express = require("express");
const route = express.Router();
const Templete = require("../controllers/templeteControllers");
const {authenticate,authorize} = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");



const storage = multer.diskStorage({
  destination: "src/pdf",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${uuidv4()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });


route.post("/createtemplete",authenticate,authorize(["user"]),upload.single("cvLink"),Templete.templeteCreate)
route.get("/gettemplete",authenticate,authorize(["user"]),Templete.templeteGet )
route.get("/updatetemplete/:id",authenticate,authorize(["user"]),Templete.templeteUpdate )
route.get("/deletetemplete/:id",authenticate,authorize(["user"]),Templete.templeteDelete )
route.post("/sendmail",authenticate,authorize(["user"]),Templete.sendMail )


module.exports=route


