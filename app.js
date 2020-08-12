const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const ipfs = new ipfsClient({host: 'localhost', port: '5001', protocol: 'http'});

const app = express();

// added template engine ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload())

// API'S

// root
app.get('/', (req, res) => {
    res.render('home');
});


// Upload a file
app.post('/upload', async (req, res) => {
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;

    // move file to files directory
    file.mv(filePath, async(err) => {
        // error handling
        if(err){
            console.log('Error: Downloading file');
            return res.status(500).send(err);
        }

         // calling addFile function
        const fileHash = await addFile(fileName, filePath);
        // deleting file after upload
        fs.unlink(filePath, (err) => {
            if(err) console.log(err);
        })

        res.render('Upload', {fileName, fileHash});
    })

});


// add file to IPFS

const addFile = async(fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({path: fileName, content: file});
    const fileHash = fileAdded[0]

    return fileHash;
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
