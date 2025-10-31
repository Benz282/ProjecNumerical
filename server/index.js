const express = require('express');
const cors = require('cors');
const moongoose = require('moongoose');
const bi = require('./data');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

moongoose.connect("mongodb://localhost:27017/");

app.get('/bi/history', async(req,res)=>{
    try{
        const getdata = await bi.find();
         return res.status(200).json({status:'ok', getdata:getdata});
    }catch(e){
        console.loge(e)
        return res.status(400).json({error:'can not save'});
    }
    

})

app.post('/bi/save/',async(req,res)=>{
    const{eq,a,b,epsilon} = req.body;

    try{
        const savedata = await TrapezoidalMethod.create({
            equation: eq,
            a = Number(a),
            b: Number(b),
            epsilon: Number(epsilon)
        })

    }catch(e){
        console.log(e)
        return res.status(400).json({error:'can not save'});
    }

    return res.status(200).json({status:'data saved!'});
        })

app.listen(PORT,()=>{
    console.log("Server running at http://localhost:${PORT}");
})

moongoose.connect("mongodb://localhost:27017/");

