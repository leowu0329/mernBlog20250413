import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import User from './Schema/User.js';

dotenv.config();

const server = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY,
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split('@')[0];

  // 檢查是否有重複 username
  let isUsernameNotUnique = await User.exists({
    'personal_info.username': username,
  }).then((result) => {
    return result;
  });

  // 若重複則加上隨機碼
  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : '';

  return username;
};

server.post('/signup', (req, res) => {
  let { fullname, email, password } = req.body;

  // Validate fullname
  if (!fullname || fullname.length < 3) {
    return res
      .status(403)
      .json({ error: 'Fullname must be at least 3 letters long' });
  }

  // Validate email
  if (!email || !email.length) {
    return res.status(403).json({ error: 'Enter Email' });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        'Password should be 6 to 20 characters long with a number, one lowercase, and one uppercase letter',
    });
  }

  bcrypt.hash(password, 10, async (err, hashed_assword) => {
    let username = await generateUsername(email);

    let user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatatoSend(u));
      })
      .catch((err) => {
        if (err.code === 11000) {
          return res.status(500).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      });
  });

  // 如果通過驗證
  return res.status(200).json({ status: 'okay' });
});

server.post('/signin', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ 'personal_info.email': email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: 'Email not found' });
      }

      // Compare password
      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({ error: 'Error occurred while login, please try again' });
        }

        if (!result) {
          return res.status(403).json({ error: 'Incorrect password' });
        } else {
          return res.status(200).json(formatDatatoSend(user));
        }
        // Login success
      });
      return res.json({ status: 'got user document', user });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.app.listen(PORT, () => {
  console.log('listiening on port' + PORT);
});
