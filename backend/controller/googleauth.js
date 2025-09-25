import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { PrismaClient } from "@prisma/client";
import passport from "passport";

const prisma = new PrismaClient();

export const googleAuth = () => {
  passport.use(
    new GoogleStrategy(   // ✅ corrected
      {
        clientID: "process.env.GOOGLE_CLIENT_ID",
        clientSecret: "process.env.GOOGLE_SECRET",
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.User.findUnique({
            where: { profileId: profile.id },
          });

          if (!user) {
            user = await prisma.User.create({
              data: {
                profileId: profile.id,
                name: profile.displayName || profile.username,
                email: profile.emails?.[0]?.value || null,
                provider: "google",
                isVerified: true,
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
};
