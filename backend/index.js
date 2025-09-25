import express from "express";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import session from "express-session";
import { googleAuth } from "./controller/googleauth.js";
import { Strategy as GitHubStrategy } from "passport-github2";
import { facebookAuth } from "./controller/facebookauth.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import csrf from "csurf";
import cookieParser from "cookie-parser";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware order matters!
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

// ✅ Sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  // skip req.query to avoid crash
  next();
});


// Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// CSRF middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use(passport.initialize());
app.use(passport.session());

// Serialize / Deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.User.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Strategies
facebookAuth();
googleAuth();

passport.use(
  new GitHubStrategy(
    {
      clientID: "Ov23lio1ILWXtBrqbajg",
      clientSecret: "d9199d7eff9cbcdad6fb53e24587abb5bdf0b901",
      callbackURL: "http://localhost:5000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { githubId: profile.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              githubId: profile.id,
              name: profile.displayName || profile.username,
              email: profile.emails?.[0]?.value || null,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the OAuth Backend");
});

// ✅ Route to fetch CSRF token
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Auth routes
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

app.post("/protected", (req, res) => {
  res.json({ message: "This action is CSRF-protected and succeeded!" });
});

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
