const express = require('express');

//Constant
const PORT = 5000;

//App
const app = express();
const productRoutes = require('./routes/routes');
const mongoose = require('mongoose');

mongoose.connect('mongodb://root:root@127.0.0.1:27017', { useNewUrlParser: true })
    .then(() => console.log('mongodb connected'))
    .catch(err => console.log(err));
//express build in Middleware
app.use(express.json());
//Set route
app.use('/api/products', productRoutes);
//Error handler
app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message })
})

//Start server
app.listen(PORT);
console.log(`Running on port ${PORT}`);

module.exports = app;