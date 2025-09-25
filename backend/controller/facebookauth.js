import passport from "passport";
import { Strategy as facebookStrategy } from "passport-facebook";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const facebookAuth = () => {
  passport.use(
    new facebookStrategy( // ✅ corrected
      {
        clientID: "1341968424380948",
        clientSecret: "90c137222a313dc1510e23049bdd1f3b",
        callbackURL: "http://localhost:5000/auth/facebook/callback",
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
                provider: "facebook",
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
