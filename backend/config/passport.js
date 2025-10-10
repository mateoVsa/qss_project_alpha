const {Strategy: LocalStrategy, Strategy} = require("passport-local")
const {Strategy: JwtStrategy, Extract, ExtractJwt} = require("passport-jwt")
const bcrypt = require("bcrypt")
const pool = require("../db")

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

module.exports = function (passport){
    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) return done(null, false, { message: "Usuario no encontrado" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: "Contraseña incorrecta" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
    passport.use(
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: JWT_SECRET,
            },
            async (jwt_payload,done)=>{
                try{
                    const result = await pool.query("SELECT * FROM users WHERE id = $1", [jwt_payload.id]);
                    const user = result.rows[0];
                    if(user){
                      const userData = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role   ? "admin" : "user",
                      }
                      return done(null, userData)
                    }else{
                      return done(null, false)
                    }
                }catch(err){
                    return done(err)
                }
            }
        )
    )
}