require('dotenv').config();
const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello from final project')
})

app.listen(port, () => {
    console.log(`Final project listening on port ${port}`)
})