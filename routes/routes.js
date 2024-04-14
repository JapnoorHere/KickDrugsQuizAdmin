const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const multer = require('multer');
const { User, Quiz } = require('../models/quiz')
const admin = require("firebase-admin");
const fs = require('fs');
const excel = require('exceljs');
const serviceAccount = require("../kickdrugsquiz-firebase-adminsdk-zf1s8-8b0a1d8a4d.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "kickdrugsquiz.appspot.com"
});


router.get('/', (req, res) => {
    res.render("index", { message: undefined });
})

router.post('/details', async (req, res) => {
    try {
        const data = await Admin.find().exec();
        const { username, password } = req.body;

        const admin = data[0];

        if (username == admin.username && password == admin.password) {
            res.redirect('/home');
        }
        else {
            res.render('index', { message: "Password or username is incorrect" })
        }
    }
    catch (err) {
        res.status(501).json({ error: err.message })
    }
});



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toDateString() + ".xlsx")
    },
});
var upload = multer({
    storage: storage,
}).single('excel');



router.post('/uploadExcel', upload, async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send("No file uploaded.");
    }

    const bucket = admin.storage().bucket();
    var filename = new Date().toDateString() + ".xlsx";
    await bucket.upload(file.path, {
        destination: filename,
    });

    const quiz = new Quiz({
        quiz_name: filename
    })

    Quiz.countDocuments({ quiz_name: filename }).then(count => {
        console.log("count", count);

        if (count > 0) {
            console.log("Exists");
                res.redirect('/home');
        }
        else {
            quiz.save();
            fs.unlinkSync('./uploads' + "/" + filename);
            Quiz.find().exec().then(quizzes => {
                res.redirect('/home');
            });

        }
    });


})

router.post('/getResult', async (req, res) => {
    const quizId = req.body.quizId;
    try {
        const quiz = await Quiz.findById(quizId);

        const users = quiz.user;

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Quiz Results');

        worksheet.addRow(['Name', 'Email', 'Phone', 'ScoreObtained' ,'Institution']);

        users.forEach(user => {
            worksheet.addRow([
                user.name,
                user.email,
                user.phone,
                user.score,
                user.institution
            ]);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=quiz_results.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
})

router.get('/home', async (req, res) => {
    const quiz = await Quiz.find().exec()
    res.render('home', { quizzes: quiz.reverse() });
})

module.exports = router