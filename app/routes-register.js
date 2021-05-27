const path = require("path");
const express = require("express");
const url = require("url");
const router = express.Router();
const NotifyClient = require("notifications-node-client").NotifyClient;
const notify = new NotifyClient(process.env.NOTIFYAPIKEY);
const csv = require("fast-csv");
const data = require(path.join(
  __dirname,
  "/data",
  "/session-data-defaults.js"
));
const staff = data.staff.flat();

router.get("/register/care/start", function (req, res) {
  req.session.data = {};
  const hideHints = req.query.hideHints;
  const email = req.query.email ?? "name@email.com";
  let path = "register/care/start";
  res.render(path, { hideHints, email, shortHeader: true });
});

router.post("/register/care/start", function (req, res) {
  res.redirect("/register/care/add-your-details");
});

router.post("/register/care/add-your-details", function (req, res) {
  res.redirect("/register/care/how-to-contact-you");
});

router.post("/register/care/how-to-contact-you", function (req, res) {
  res.redirect("/register/care/another-way-to-contact-you");
});

router.post("/register/care/another-way-to-contact-you", function (req, res) {
  res.redirect("/register/care/username-password");
});

router.post("/register/care/username-password", function (req, res) {
  res.redirect("/register/care/confirm-your-details");
});

router.post("/register/care/confirm-your-details", function (req, res) {
  res.redirect("/register/care/thank-you");
});

router.get("/register/employee/start", function (req, res) {
  req.session.data = {};
  const version = req.query.version;
  const figma = req.query.figma;
  const email = req.query.email ?? "name@email.com";
  let path = "register/employee/start";
  if (version === "a") {
    path += "-version-a";
  }
  res.render(path, { version, figma, email });
});

router.get("/register/employee/how-to-contact-you", function (req, res) {
  let path = "register/employee/how-to-contact-you";
  if (req.session.data.version === "b") {
    path += "-version-b";
  }
  res.render(path);
});

router.post("/register/employee/start", function (req, res) {
  res.redirect("/register/employee/add-your-details");
});

router.post("/register/employee/add-your-details", function (req, res) {
  res.redirect("/register/employee/how-to-contact-you");
});

router.post("/register/employee/how-to-contact-you", function (req, res) {
  if (req.body.version === "a") {
    res.redirect("/register/employee/your-employer-details");
  } else {
    res.redirect("/register/employee/confirm-your-details");
  }
});

router.post("/register/employee/your-employer-details", function (req, res) {
  res.redirect("/register/employee/confirm-your-details");
});

router.post("/register/employee/confirm-your-details", function (req, res) {
  res.redirect("/register/employee/thank-you");
});

router.post("/register/gov/start", function (req, res) {
  redirect(req, res, "register/gov");
});

router.post("/register/sfc/how-to-add-staff", function (req, res) {
  redirect(req, res, "register/sfc");
});

function redirect(req, res, path) {
  const choice = req.body["how-to-enter-staff-details"];
  if (choice === "manually") {
    res.redirect(
      url.format({
        pathname: `/${path}/enter-staff-details`,
        query: req.query,
      })
    );
  } else if (choice === "bulk-upload") {
    res.redirect(`/${path}/bulk-upload?back=/${path}/start`);
  } else {
    res.status(400).send();
  }
}

router.get("/register/sfc/sign-in", function (req, res) {
  const option = req.query.option;
  res.render("register/sfc/sign-in", { option });
});

router.post("/register/sfc/sign-in", function (req, res) {
  res.redirect("/register/sfc/consent-to-share-data");
});

router.get("/register/gov/:page", function (req, res) {
  const showB = req.query.version === "b";
  res.render(`register/gov/${req.params.page}`, {
    page: req.query.page,
    showBulkUpload: req.query.showBulkUpload && true,
    query: req.query,
    showB,
    back: req.query.back,
  });
});

router.get("/register/sfc/:page", function (req, res) {
  const showB = req.query.version === "b";
  res.render(`register/sfc/${req.params.page}`, {
    page: req.query.page,
    showBulkUpload: req.query.showBulkUpload && true,
    query: req.query,
    showB,
    back: req.query.back,
  });
});

router.get("/register/download/staff-contact-details", function (req, res) {
  var csvStream = csv.format();

  res.setHeader(
    "Content-disposition",
    "attachment; filename=staff-contact-details.csv"
  );
  res.setHeader("Content-type", "text/csv");

  csvStream.pipe(res);

  csvStream.write(["Name", "Job role", "Email address or mobile phone number"]);
  staff.forEach((s) => csvStream.write([s.name, s.title, ""]));

  csvStream.end();
});

router.post("/register/email/invite", async function (req, res) {
  try {
    const sfc = req.body.sfc == "true";
    await notify.sendEmail(
      "a111f463-05fb-4e1f-aec1-9532eff41cc4",
      req.body.email,
      {
        personalisation: {
          name: req.body.name,
          sfc: sfc ? "yes" : "no",
          gov: sfc ? "no" : "yes",
        },
      }
    );
  } catch (ex) {
  } finally {
    res.send();
  }
});

module.exports = router;
