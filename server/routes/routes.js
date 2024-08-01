const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const expressFileUpload = require('express-fileupload');
const { User, Quiz } = require('../models/quiz')
const admin = require("firebase-admin");
const fs = require('fs');
const excel = require('exceljs');
const moment = require('moment-timezone');

const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");

router.use(expressFileUpload());
const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);


router.post('/', async (req, res) => {
    try {
        const data = await Admin.find().exec();
        const { username, password } = req.body;

        const admin = data[0];

        if (username == admin.username && password == admin.password) {
            res.json({message : "done"});
        }
        else {
            res.json({ message: "incorrect" });
        }
    }
    catch (err) {
        res.status(501).json({ error: err.message })
    }
});





router.post('/home', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    const file = req.files.excel;
    const filename = moment().tz('Asia/Kolkata').format('ddd MMM DD YYYY') + ".xlsx";


    let storage = getStorage(firebaseApp);
    let storageRef = ref(storage, '/' + filename);

    let metadata = {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    let uploadTask = uploadBytesResumable(storageRef, file.data, metadata);

    uploadTask.on('state_changed',
        (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        },
        (error) => {
            res.status(500).send(error);
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log('File available at', downloadURL);
                const uniqueID = moment().format('YYYYMMDD'); 
                const quiz = new Quiz({
                    _id : uniqueID,
                    quiz_name: filename
                })

                Quiz.countDocuments({ quiz_name: filename }).then(count => {
                    console.log("count", count);

                    if (count > 0) {
                        
                        res.json({message : 'exists'});
                    }
                    else {
                        quiz.save();
                        res.json({message : 'done'});
                        Quiz.find().exec().then(quizzes => {
                        });

                    }
                });

            });
        })
});

router.post('/getResult', async (req, res) => {
    console.log(req.body);
    const quizId = req.body.quizId;
    try {
        const quiz = await Quiz.findById(quizId);

        const users = quiz.user;

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Quiz Results');

        worksheet.addRow(['Name', 'Email', 'Phone','Institution','ScoreObtained']);

        users.forEach(user => {
            worksheet.addRow([
                user.name,
                user.email,
                user.phone,
                user.institution,
                user.score
            ]);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=quiz_results.xlsx');

        await workbook.xlsx.write(res);
        res.end();
        // res.json({message : "done   "});
    } catch (err) {
        console.error('Error:', err);
        // res.status(500).send('Internal Server Error');
    }
})

router.get('/home', async (req, res) => {
    const quiz = await Quiz.find().exec()
    res.send(quiz.reverse());
})

module.exports = router