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

aplication.use('/imagesuser', express.static(path.join(__dirname, 'imagesuser')));
const funct = require('./service/functions');
const valid = require('./service/validations');

aplication.get('/user', async (req, res) => {
  const emailUser = req.query.emailUser;
  const passwordUser = req.query.passwordUser;

  const checkUserLogin = await valid.CheckUserLogin(emailUser, passwordUser);

  if (checkUserLogin.status) {
    const user = await funct.SelectUser(checkUserLogin.idUser);
    return res.status(checkUserLogin.cod).json(user).end();
  } else {
    return res.status(checkUserLogin.cod).json({ message: checkUserLogin.message, status: checkUserLogin.status });
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

  const checkValues = await valid.CheckValues(nameUser, dayDateUser, monthDateUser, yearDateUser, emailUser, phoneUser, passwordUser);

  if (checkValues.status) {
    const user = await funct.InsertUser(nameUser, dayDateUser, monthDateUser, yearDateUser, emailUser, phoneUser, passwordUser, fileUserName);
    res.status(user.cod).json(user).end();
  } else {
    res.status(checkValues.cod).json({ message: checkValues.message });
  }
});

aplication.post('/userchangepassword', async (req, res) => {
  const emailUser = req.body.emailUser;
  const checkEmailUser = await valid.ValidEmail(emailUser);
  if (!checkEmailUser.status) {
    const id = await funct.SelectUserEmail(emailUser);
    const idUser = id.message[0].iduser;
    const inserCode = await funct.InsertCode(idUser, emailUser);
    res.status(inserCode.cod).json(inserCode).end();
  } else {
    res.status(400).json({ status: false, message: 'There is no user with this email' });
  }
});

aplication.post('/userchangepassword-newcodice', async (req, res) => {
  const emailUser = req.body.emailUser;
  const checkEnabledUser = await valid.CheckEmailCodeUser(emailUser);
  if (checkEnabledUser.cod == 200) {
    const user = await funct.SelectUserEmail(emailUser);
    const userCodeId = user.message[0].idcode;
    const userId = user.message[0].iduser;
    await funct.DeleteCode(userCodeId);
    const newCode = await funct.InsertCode(userId, emailUser);
    console.log(user, userCodeId, userId, newCode)
    res.status(newCode.cod).json(newCode).end;
  } else if (checkEnabledUser.cod == 400) {
    const user = await funct.SelectUserEmail(emailUser);
    const userId = user.message[0].iduser;
    const newCode = await funct.InsertCode(userId, emailUser)
    console.log(user, userId, newCode)
    res.status(newCode.cod).json(newCode).end;
  } else {
    res.status(checkEnabledUser.cod).json({ status: false, message: checkEnabledUser.message });
  }
});

aplication.patch('/verifycode', async (req, res) => {
  const codeUser = req.body.codeUser;
  const emailUser = req.body.emailUser;
  const checkEmail = await valid.CheckEmailCodeUser(emailUser);
  if (checkEmail.status) {
    const checkUserCode = await valid.CheckUserCode(codeUser, emailUser);
    if (checkUserCode.cod == 200) {
      const code = await funct.ChangeVerifyed(checkUserCode.code);
      res.status(code.cod).json(code).end();
    } else {
      return res.status(checkUserCode.cod).json({ message: checkUserCode.message });
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
        const checkOldPassword = await valid.NewXOldPassword(newpassword, emailUser);
        if (checkOldPassword.status) {
          const userId = checkAuthorizedUser.userCode;
          const idCode = checkAuthorizedUser.idCode;
          const newUserPassword = await funct.ChangePassword(newpassword, userId, idCode, emailUser)
          res.status(newUserPassword.cod).json(newUserPassword).end();
        } else {
          res.status(checkOldPassword.cod).json({ message: checkOldPassword.message });
        }
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
  const checkUserId = await valid.CheckUserID(idUser);
  if (checkUserId.status) {
    const rows = await funct.SelectUser(idUser);
    const paramE = rows.message[0].email;
    const paramN = rows.message[0].name;
    const user = await funct.DeleteUser(idUser, paramE, paramN);
    return res.status(checkUserId.cod).json(user).end();
  } else {
    return res.status(checkUserId.cod).json({ message: checkUserId.message });
  }
});

aplication.listen(PORT, async () => {
  const date = new Date();
  console.log(`SERVER STARTED | ${date} | LOCALHOST: ${PORT}`);
});