const express=require('express')
const bodyParser=require('body-parser')
const multer=require('multer')
const path=require('path')
const mongodb=require('mongodb')
const fs=require('fs')

const app=express();

//use of bodyparser
app.use(bodyParser.urlencoded({extended:true}))

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads')
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname))
    }
})

const upload=multer({
    storage:storage
})

//configure mongodb
const MongoClient=mongodb.MongoClient
const url='mongodb://localhost:27017'
MongoClient.connect(url,{
    useUnifiedTopology:true,useNewUrlParser:true
},(err,client)=>{
    if(err) return console.log(err)
    db=client.db('Images')
    app.listen(3000,()=>{
        console.log("Mongodb server listening at 3000")
    })
})

//configuring home route
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

//configuring upload file route
app.post('/uploadFile',upload.single('myFile'),(req,res,next)=>{
    const file=req.file;
    if(!file){
        const error=new Error("Please upload a file");
        error.httpStatusCode=400;
        return next(error)
    }
    res.send(file);
})

//configure multiple file route
app.post('/uploadMultiple',upload.array('myFiles',12),(req,res,next)=>{
    const files=req.files
    if(!files){
        const err=new Error("Please choose files")
        error.httpStatusCode=400;
        return next(error)

    }
    res.send(files)
})

//configuring the image upload to the database

app.post('/uploadPhoto',upload.single('myImage'),(req,res)=>{
    const img=fs.readFileSync(req.file.path);
    const encode_image=img.toString('base64')
    //json obj for image

    const finalImg={
        contentType:req.file.mimetype,
        path:req.file.path,
        image:new Buffer(encode_image,'base64')
    }

    // insert img to database
    db.collection('image').insertOne(finalImg,(err,result)=>{
        console.log(result)
        if(err) return console.log(err);
        console.log("saved to database")

        res.contentType(finalImg.contentType)
        res.send(finalImg.image)
    })

})

app.listen(5000,()=>{
    console.log("Server is running at 5000")
})