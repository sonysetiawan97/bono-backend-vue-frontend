const Bundle = require('bono')
const jwt = require('jsonwebtoken')
const manager = require('../database/adapter')
const bcrypt = require('bcrypt');

class User extends Bundle {
    constructor() {
        super()

        this.post('/register', async (ctx) => {
            let user = await ctx.parse()
            let validUser = true

            await ctx.assert(user.email, 400, 'email required!')
            await ctx.assert(user.password, 400, 'password required!')

            let session = manager.openSession();
            let userRegister = await session.factory('users').find({ email: user.email }).single()
            await session.close();
            await session.dispose()

            if (!userRegister) validUser = false
            await ctx.assert(!validUser, 400, 'email has registered!')

            user.password = await new Promise((resolve, reject) => {
                bcrypt.hash(user.password, 10, function (err, hash) {
                    if (err) reject(err)
                    resolve(hash)
                });
            })

            try {
                let session = manager.openSession();
                await session.factory('users').insert(user).save()
                await session.close();
                await session.dispose()
            } catch (err) {
                return err
            }

            return 'user saved!'
        })

        this.post('/login', async (ctx) => {
            let { email, password } = await ctx.parse()

            let session = manager.openSession()
            let user = await session.factory('users').find({ email: email }).single()
            await session.close()
            await session.dispose()
            ctx.assert(user, 401, 'invalid email or password!')

            const match = await bcrypt.compare(password, user.password)
            ctx.assert(match, 401, 'invalid email or password!')

            const token = jwt.sign({
                data: {
                    'user': user.email
                }
            }, 'secretKey', { expiresIn: '1h' })

            return { token: token }
        })
    }
}

module.exports = User