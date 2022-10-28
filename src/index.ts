import child_process from 'child_process';
import express from 'express';
import {renderEpub, HttpError}  from './render';

const fileUpload = require("express-fileupload");
const app = express()

const opsys = process.platform
const PORT:any = (opsys == "win32") ? 3000 : 8080;
const HOST:any = (opsys == "win32") ? 'localhost': '0.0.0.0';


function exitHandler(options:any, exitCode:any) {
  //child_process.execSync('rmdir /s uploads');
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));



app.use(fileUpload({
  createParentPath: true,
  useTempFiles: true,
}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})


// app.get('/download', function (req, res) {

//   var file = __dirname + '/tmp/epub.epub';

//   var filename = path.basename(file);
//   var mimetype = mime.getType(file);

//   res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//   res.setHeader('Content-type', mimetype);

//   var filestream = fs.createReadStream(file);
//   filestream.pipe(res);
// });

app.post('/upload', async (req: any, res: any) => {
  try{
    let file:string = renderEpub(req,res);
    res.sendFile(file);
  }
  catch(e:any){
    if(e.type == "HttpError"){
      res.status(e.status).send(e.message);
    }
    else{
      console.log(e)
      res.status(500).send(e.message);
    }
  }

});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});

