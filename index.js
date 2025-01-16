const express = require('express');
const cors = require('cors');
const file = require('express-fileupload');
const fs = require('fs').promises;
const path = require('path');
const aplication = express();
const PORT = 1110;
aplication.use(file());
aplication.use(express.json());
aplication.use(cors());

aplication.use('/imagesuser', express.static(path.join(__dirname, 'imagesuser'))); // imagens estáticas
const funct = require('./service/functions'); // funções
const valid = require('./service/validations'); // validações

aplication.get('/user', async (req, res) => {
  const emailUser = req.query.emailUser;
  const passwordUser = req.query.passwordUser;

  const check = await valid.CheckUserLogin(emailUser, passwordUser);

  if (check.status) {
    const user = await funct.SelectUser(check.idUser);
    return res.status(check.cod).json(user).end();
  } else {
    return res.status(check.cod).json({ message: check.message, status: check.status });
  }
});

aplication.post('/user', async (req, res) => {
  const nameUser = req.body.nameUser;
  const dayDateUser = req.body.dayDateUser;
  const monthDateUser = req.body.monthDateUser;
  const yearDateUser = req.body.yearDateUser;
  const emailUser = req.body.emailUser;
  const phoneUser = req.body.phoneUser;
  const passwordUser = req.body.passwordUser;
  if (req.files && req.files.image) {
    const fileUser = req.files.image;
    var fileUserName = fileUser;
    const uploadPath = path.join(__dirname, 'imagesuser', fileUserName);
    await fileUser.mv(uploadPath);
  }

  const check = await valid.CheckValues(nameUser, dayDateUser, monthDateUser, yearDateUser, emailUser, phoneUser, passwordUser);

  if (check.status) {
    const user = await funct.InsertUser(nameUser, dayDateUser, monthDateUser, yearDateUser, emailUser, phoneUser, passwordUser, fileUserName);
    res.status(user.cod).json(user).end();
  } else {
    res.status(check.cod).json({ message: check.message });
  }
});

aplication.post('/userchangepassword', async (req, res) => {
  const emailUser = req.body.emailUser;
  const check = await valid.ValidEmail(emailUser);
  if (!check.status) {
    const id = await funct.SelectUserEmail(emailUser);
    const idUser = id.message[0].iduser;
    const inserCode = await funct.InsertCode(idUser, emailUser);
    res.status(inserCode.cod).json(inserCode).end();
  } else {
    res.status(400).json({ status: false, message: 'There is no user with this email' });
  }
});

aplication.post('/userchangepassword-newcodice', async (req, res) => {
  
});

aplication.patch('/verifycode', async (req, res) => {
  const codeUser = req.body.codeUser;
  const emailUser = req.body.emailUser;
  const checkEmail = await valid.CheckEmailCodeUser(emailUser);
  if (checkEmail.status) {
    const check = await valid.CheckUserCode(codeUser, emailUser);
    if (check.cod == 200) {
      const code = await funct.ChangeVerifyed(check.code);
      res.status(code.cod).json(code).end();
    } else {
      return res.status(check.cod).json({ message: check.message });
    }
  } else {
    return res.status(checkEmail.cod).json({ message: checkEmail.message });
  }
});

aplication.patch('/newpassword', async (req, res) => {
  const newpassword = req.body.newpassword;
  const emailUser = req.body.emailUser;

  const checkEnabledUser = await valid.CheckEmailCodeUser(emailUser);

  if (checkEnabledUser.status) {
    const checkAuthorizedUser = await valid.CheckVerified(emailUser);

    if (checkAuthorizedUser.status) {
      const checkNewPassword = await valid.CheckPassword(newpassword);
      if (checkNewPassword.status) {
        const userId = checkAuthorizedUser.userCode;
        const idCode = checkAuthorizedUser.idCode;
        const newUserPassword = await funct.ChangePassword(newpassword, userId, idCode, emailUser)
        res.status(newUserPassword.cod).json(newUserPassword).end();
      } else {
        res.status(checkNewPassword.cod).json({ message: checkNewPassword.message });
      }
    } else {
      res.status(checkAuthorizedUser.cod).json({ message: checkAuthorizedUser.message })
    }
  } else {
    res.status(checkEnabledUser.cod).json({ message: checkEnabledUser.message });
  }
});

aplication.delete('/user/:id', async (req, res) => {
  const idUser = req.params.id;
  const check = await valid.CheckUserID(idUser);
  if (check.status) {
    const rows = await funct.SelectUser(idUser);
    const paramE = rows.message[0].email;
    const paramN = rows.message[0].name;
    const user = await funct.DeleteUser(idUser, paramE, paramN);
    return res.status(check.cod).json(user).end();
  } else {
    return res.status(check.cod).json({ message: check.message });
  }
});

aplication.listen(PORT, async () => {
  const date = new Date();
  console.log(`SERVER STARTED | ${date} | LOCALHOST: ${PORT}`);
});