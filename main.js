const express = require('express');
const expressWs = require('express-ws');

const config = require('./config')

const app = express()
expressWs(app)

app.use(express.json())

app.use('/node_modules', express.static('node_modules'))
app.use('/api', require('./api'))
app.use(express.static('static'))

app.listen(config.port || 3000, () => {
    console.log(`Server running on port ${config.port || 3000}`);
});
