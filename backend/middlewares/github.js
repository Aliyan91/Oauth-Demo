import express from 'express';
import passport from 'passport';
import {PrismaClient} from '@prisma/client';
import { Strategy as GitHubStrategy } from 'passport-github2';

const router = express.Router();
const prisma = new PrismaClient();

passport.use(
  new GitHubStrategy(
    {
      clientID: "Ov23lio1ILWXtBrqbajg",
      clientSecret: "0a0b107741d1d034c74b020138e258b3ffb1736a",
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check if user exists
        let user = await prisma.User.findUnique({
          where: { githubId: profile.id },
        });

        // if not, create new user
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


// GitHub OAuth routes
router.get('/github', async (req, res) => {
  res.send('GitHub OAuth Home');
});


export default router;