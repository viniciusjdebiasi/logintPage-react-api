const express = require('express');
const cors = require('cors');
const file = require('express-fileupload');
const fs = require('fs').promises;
const path = require('path');
const aplication = express();
const PORT = 1111;
aplication.use(file());
aplication.use(express.json());
aplication.use(cors());

aplication.use('/images', express.static(path.join(__dirname, 'images'))); // imagens estáticas
const funct = require('./service/functions'); // funções
const valid = require('./service/validations'); // validações

aplication.get('/user', async (req, res) => {
  let emailUser = req.body.emailUser;
  let passwordUser = req.body.passwordUser;

  let check = await valid.CheckUserLogin(emailUser, passwordUser);

  if (check.cod == 200) {
    let user = await funct.SelectUser(check.idUser);
    return res.status(check.cod).json(user).end();
  } else {
    return res.status(check.cod).json({ message: check.message });
  }
});

aplication.post('/user', async (req, res) => {
  let nameUser = req.body.nameUser;
  let dayDateUser = req.body.dayDateUser;
  let monthDateUser = req.body.monthDateUser;
  let yearDateUser = req.body.yearDateUser;
  let emailUser = req.body.emailUser;
  let phoneUser = req.body.phoneUser;
  let passwordUser = req.body.passwordUser;
  if (req.files && req.files.image) {
    let fileUser = req.files.image;
    var fileUserName = fileUser;
    const uploadPath = path.join(__dirname, 'imagesuser', fileUserName);
    await fileUser.mv(uploadPath);
  }

  let check = await valid.CheckValues(nameUser, dayDateUser, monthDateUser, yearDateUser, emailUser, phoneUser, passwordUser);

  if (check.cod == 200) {
    let user = await funct.InsertUser(nameUser, dayDateUser, monthDateUser, yearDateUser, emailUser, phoneUser, passwordUser, fileUserName);
    res.status(check.cod).json(user).end();
  } else {
    res.status(check.cod).json({ message: check.message });
  }
});

aplication.delete('/user:id', async (req, res) => {
  let idUser = req.params.id;
  let check = await valid.CheckUserID(idUser);
  if(check.cod == 200) {
    let user = await funct.DeleteUser(idUser);
    return res.status(check.cod).json(user).end();
  } else {
    return res.status(check.cod).json({ message: check.message });
  }
});

aplication.listen(PORT, async () => {
  let date = new Date();
  console.log(`SERVER STARTED | ${date} | LOCALHOST: ${PORT}`);
});