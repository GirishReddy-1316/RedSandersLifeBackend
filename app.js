const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const bodyParser = require("body-parser")
const cors = require('cors');
const usersRouter = require('./routes/users');
const { connectDB } = require('./config/db');
const contactRouter = require('./routes/contact');
const productRouter = require('./routes/product');
const User = require('./models/user');
const orderRouter = require('./routes/order');
const { generateToken } = require('./utils/generateOTP');
const adminRouter = require('./routes/admin');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

const corsOptions = {
    origin: '*',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
const clientURL = process.env.CLIENT_URL;
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const { id, emails, photos, displayName } = req.user;
            const googleEmail = emails[0].value;
            const profilePicture = photos && photos.length > 0 ? photos[0].value : null;

            let user = await User.findOne({ email: googleEmail });

            if (!user) {
                user = new User({
                    email: googleEmail,
                    googleId: id,
                    profilePicture,
                    username: displayName
                });
            } else {
                user.displayName = displayName;
                user.googleId = user.googleId || id;
                user.googleEmail = user.googleEmail || googleEmail;
                user.profilePicture = user.profilePicture || profilePicture;
            }
            const token = generateToken(user._id, googleEmail);
            user.accessToken = token;

            await user.save();
            res.redirect(`${clientURL}?userName=${displayName}&&accessToken=${token}`);
        } catch (error) {
            console.log('Error saving user data:', error);
            return res.status(500).send('Failed to save user data');
        }
    }
);



app.use('/api/user', usersRouter);
app.use('/api', contactRouter);
app.use('/api', productRouter);
app.use('/api/order', orderRouter)
app.use('/api/admin', adminRouter)

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on http://localhost:${PORT}`);
});
