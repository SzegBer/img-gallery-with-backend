const express = require("express");
const fileUpload = require('express-fileupload')
const fs = require("fs");
const app = express();
const path = require("path");
const port = 9000;

app.use(fileUpload());

app.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});
app.get("/images", (req, res) => {
  res.sendFile(path.join(`${__dirname}/data/data.json`));
});

app.use("/public", express.static(`${__dirname}/../frontend/public`));

app.post('/upload', (req, res) => {
  let uploadedFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  uploadedFile = req.files.image;

  let imgTitleFormatted = req.body.title.replace(/\s/g, "-")

  const newData = {
    "id": 0,
    "url": `/${imgTitleFormatted}.jpg`,
    "title": req.body.title,
    "uploadDate": req.body.date,
    "photographer": req.body.photographer
  }

  uploadPath = `${__dirname}/../frontend/public/imgs/${imgTitleFormatted}.jpg`

  uploadedFile.mv(uploadPath, (err) => {
    if (err)
      return res.status(500).send(err);

    fs.readFile('data/data.json', (err, data) => {
      if(err)
        return res.status(500).send(err);

      let imagesData = JSON.parse(data)
      newData.id = imagesData[imagesData.length-1].id+1
      imagesData.push(newData)
  
      fs.writeFile('data/data.json', JSON.stringify(imagesData, null, 2), (err) => {
        if(err)
          return res.status(500).send(err);
  
        res.json(newData);
      })    
      
    })
  });
});

app.delete('/delete', (req, res) => {
  id = parseInt(req.body.id)

  fs.readFile('data/data.json', (err, data) => {
    if(err)
      return res.status(500).send(err);

    let imagesData = JSON.parse(data)
    
    let urlOfDeletedPic = ""
    for(i=0;i<imagesData.length;i++){
      if(imagesData[i].id === id){
        urlOfDeletedPic = imagesData[i].url
      }
    }

    fs.unlinkSync(`${__dirname}/../frontend/public/imgs${urlOfDeletedPic}`)

    let filteredData = imagesData.filter(imageData => imageData.id !== id)
    fs.writeFile('data/data.json', JSON.stringify(filteredData, null, 2), (err) => {
      if(err)
        return res.status(500).send(err);
      
      res.json(filteredData);
    })
  })
})

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});