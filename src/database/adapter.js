const { Manager } = require('node-norm');
const manager = new Manager({
    connections: [
        {
            adapter: require('node-norm-mysql'),
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'node-bono',
        },
    ],
})

module.exports = manager