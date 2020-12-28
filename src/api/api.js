const Bundle = require('bono')
const manager = require('../database/adapter')
const jwt = require('jsonwebtoken')

class Api extends Bundle {
    constructor() {
        super()

        function jwtVerify(token) {
            if (!token) return false
            return jwt.verify(token, 'secretKey')
        }

        this.get('/book', async (ctx) => {
            ctx.assert(jwtVerify(ctx.header.authorization), 401, 'unauthorized')

            let session = manager.openSession();
            let books = await session.factory('books').all()
            await session.close();
            await session.dispose()

            let data = { book: books }

            return data
        })

        this.post('/book', async (ctx) => {
            ctx.assert(jwtVerify(ctx.header.authorization), 401, 'unauthorized')

            let book = await ctx.parse()
            let validBook = true

            await ctx.assert(book.title, 400, 'Book title is required!')
            await ctx.assert(book.description, 400, 'Book descripton is required!')

            let session = manager.openSession();
            let bookRegister = await session.factory('books').find({ title: book.title }).single()
            await session.close();
            await session.dispose()

            if (!bookRegister) validBook = false
            await ctx.assert(!validBook, 400, 'Book title has registered')

            try {
                let session = manager.openSession();
                await session.factory('books').insert(book).save()
                await session.close();
                await session.dispose()
            } catch (err) {
                return err
            }

            return 'book saved!'
        })

        this.get('/book/read/[{id}]', async (ctx) => {
            ctx.assert(jwtVerify(ctx.header.authorization), 401, 'unauthorized')

            let validBook = false

            let session = manager.openSession();
            let book = await session.factory('books').find({ id: ctx.parameters.id }).single()
            await session.close();
            await session.dispose()

            if (book) validBook = true
            ctx.assert(validBook, 404, 'Book has not founded')

            let data = { book: book }

            return data
        })
    }
}

module.exports = Api