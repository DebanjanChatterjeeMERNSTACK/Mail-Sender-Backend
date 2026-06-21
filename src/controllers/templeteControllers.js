const Templete = require("../models/templeteModels");
const Register = require("../models/registerModels");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const { Resend } =require("resend");


dotenv.config({ quiet: true });

 const resend = new Resend(process.env.RESEND_API_KEY);

const templeteCreate = async (req, res) => {
  try {
    const id = req.user.id;
    const { subjectMail, bodyMail } = req.body;
    const cvLink = req.file;

    if (!cvLink || !bodyMail || !subjectMail) {
      return res
        .status(400)
        .send({ message: "Information Uncomplete", success: false });
    }

    const data = new Templete({
      userId: id,
      subjectMail,
      bodyMail,
      cvLink: `${process.env.URL}/upload/${cvLink.filename}`,
    });
    await data.save();
    res
      .status(200)
      .send({ message: "Templete Create Successful", success: true });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
};

const templeteGet = async (req, res) => {
  try {
    const id = req.user.id;

    if (!id) {
      return res.status(400).send({ message: "Please Login", success: false });
    }

    const data = await Templete.find({ useId: id });

    res.status(200).send({ message: "Fetch Successful", success: true, data });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
};

const templeteUpdate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const userId = req.user.id;

    const template = await Templete.findOne({
      _id: templateId,
      userId,
    });

    if (!template) {
      return res.status(404).send({
        message: "Template Not Found",
        success: false,
      });
    }

    if (req.body.subjectMail) {
      template.subjectMail = req.body.subjectMail;
    }

    if (req.body.bodyMail) {
      template.bodyMail = req.body.bodyMail;
    }

    // New file uploaded
    if (req.file) {
      // Delete old file
      if (template.cvLink) {
        const oldFileName = template.cvLink.split("/upload/")[1];

        if (oldFileName) {
          const oldFilePath = path.join(__dirname, "src/pdf", oldFileName);

          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      // Save new file path
      template.cvLink = `${process.env.URL}/upload/${req.file.filename}`;
    }

    await template.save();

    res.status(200).send({
      message: "Template Updated Successfully",
      success: true,
      data: template,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
};

const templeteDelete = async (req, res) => {
  try {
    const templateId = req.params.id;
    const userId = req.user.id;

    const template = await Templete.findOne({
      _id: templateId,
      userId,
    });

    if (!template) {
      return res.status(404).send({
        message: "Template Not Found",
        success: false,
      });
    }

    // Delete file from upload folder
    if (template.cvLink) {
      const oldFileName = template.cvLink.split("/upload/")[1];

      if (oldFileName) {
        const filePath = path.join(__dirname, "src/pdf", oldFileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    // Delete template document
    await Templete.findByIdAndDelete(templateId);

    res.status(200).send({
      message: "Template Deleted Successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
      success: false,
    });
  }
};

const sendMail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId, email } = req.body;

    const registerData = await Register.findOne({ _id: userId });

    if (!registerData) {
      return res.status(400).send({
        success: false,
        message: "Please Register Now",
      });
    }

    if (!templateId || !email) {
      return res.status(400).send({
        success: false,
        message: "Template ID and Email are required",
      });
    }

    const template = await Templete.findOne({
      _id: templateId,
      userId,
    });

    if (!template) {
      return res.status(404).send({
        success: false,
        message: "Template not found",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: registerData.email,
        pass: registerData.appPasword,
      },
    });

    await transporter.sendMail({
      from: registerData.email,
      to: email,
      subject: template.subjectMail,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
       <p>Respected Sir/Madam </p>
        <p>${template.bodyMail}</p>

        <div style="margin-top: 20px;">
            <a
                href="${template.cvLink}"
                target="_blank"
                style="
                    display: inline-block;
                    background-color: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 14px;
                "
            >
                Download CV
            </a>
        </div>
    </div>
`,
    });

    res.status(200).send({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const sendMailEvent = async (req, res) => {
  try {
    const { name, email, date, occasion, phoneNumber, location, message } =
      req.body;

    // const transporter = nodemailer.createTransport({
    //   host: "smtp.gnail.com",
    //   port: 587,
    //   secure: false,
    //   service: "gmail",
    //   auth: {
    //     user: "debanjanthechatterjee@gmail.com",
    //     pass: "giqo qelp wzwg dtpf",
    //   },
    // });
   

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.EVENT_EMAIL,
      subject: "🎉 Event Booking Confirmation",
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
    
    <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0;">Event Management</h1>
      <p style="margin-top: 10px;">Your Event Request Has Been Received</p>
    </div>

    <div style="padding: 30px;">
      <h2 style="color: #333;">Hello ${name},</h2>

      <p style="font-size: 16px; color: #555;">
        Thank you for choosing our Event Management service. We have successfully received your event request and our team will contact you shortly.
      </p>

      <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #4f46e5; margin-top: 0;">📋 Event Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px;"><strong>Name:</strong></td>
            <td style="padding: 8px;">${name}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 8px;"><strong>Email:</strong></td>
            <td style="padding: 8px;">${email}</td>
          </tr>
            <tr style="background: #f1f5f9;">
            <td style="padding: 8px;"><strong>Phone:</strong></td>
            <td style="padding: 8px;">${phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Occasion:</strong></td>
            <td style="padding: 8px;">${occasion}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 8px;"><strong>Date:</strong></td>
            <td style="padding: 8px;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Location:</strong></td>
            <td style="padding: 8px;">${location}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 8px;"><strong>Message:</strong></td>
            <td style="padding: 8px;">${message || "N/A"}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 15px; color: #555;">
        Our event specialists will review your requirements and get back to you as soon as possible.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://egeventsplanner.in/"
           style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Visit Our Website
        </a>
      </div>

      <p style="color: #666;">
        Best Regards,<br>
        <strong>Event Management Team</strong>
      </p>
    </div>

    <div style="background: #111827; color: #d1d5db; text-align: center; padding: 15px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} Event Management. All Rights Reserved.</p>
    </div>

  </div>
  `,
    });

    res.status(200).send({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  templeteCreate,
  templeteGet,
  templeteUpdate,
  templeteDelete,
  sendMail,
  sendMailEvent,
};
