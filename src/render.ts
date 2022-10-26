
import glob from 'glob';
import QueryString from 'qs';
import { ParsedQs } from 'qs';
import mime from 'mime';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import child_process from 'child_process';


export function renderEpub(req: any, res: any):string {

    let uid: string = fileVerification(req);
    if (uid == ""){
        throw new HttpError(500, "shit idk man");
    }

    unzip(uid);
    const htmlPath: string = findHTML(uid);
    const epubPath = './uploads/' + uid;
    generatePdf(htmlPath,epubPath);
    return  process.cwd() + "\\uploads\\" + uid + ".pdf"
}



/**
 * takes the uid and returns the first HTML file in the unzipped directory
 * @param uid uid of the current session
 * @returns path to html file to render
 */
function findHTML(uid:string):string {
    const htmlPaths = glob.sync('./uploads/' + uid + "/**/*.html");
    return htmlPaths[0];
}

function fileVerification(req:any):string {
    // If file is not found
    if (!req.files) {
        throw new HttpError(400, "no files found");
    }

    //file is not zip type
    if (!req.files.ebook) {
        throw new HttpError(400, "ebook file not found");
    }
    let ebook = req.files.ebook;
    if (!(ebook.mimetype == "application/zip" || ebook.mimetype == "application/epub+zip")) {
        throw new HttpError(415, "ebook not of zip or epub type");
    }
    let uid:string = uuidv4();
    let epubpath = './uploads/' + uid;
    ebook.mv(epubpath + ".zip");
    return uid;

}


/**
 * 
 * @param uid uid of the current session
 */
function unzip(uid:string) {
    var opsys = process.platform;
    if (opsys == "win32") {
        let mkdirCommand = `mkdir uploads\\${uid}`;
        child_process.execSync(mkdirCommand);
        child_process.execSync(`tar -xf ./uploads/${uid}.zip -C ./uploads/${uid}`);
    }
    else {
        child_process.execSync(`unzip ./uploads/${uid}.zip `);
    }
}

function generatePdf(htmlPath:string, epubPath:string, options:object = undefined) {
    child_process.execSync(`npx pagedjs-cli ${htmlPath} -o ${epubPath}.pdf`);
}

export class HttpError extends Error {
    status:number;
    message:string;
    type = "HttpError";
    constructor(status:number,message:string) {
        super("error");
        this.status = status;
        this.message = message;
    }
}
