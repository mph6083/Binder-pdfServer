
import glob from 'glob';
import { v4 as uuidv4 } from 'uuid';
import child_process from 'child_process';



export async function renderEpub(req: any, res: any): Promise<string> {

    let uid: string = fileVerification(req);
    if (uid == "") {
        throw new HttpError(500, "shit idk man");
    }

    unzip(uid);
    const htmlPath: string = findHTML(uid);
    const epubPath = './uploads/' + uid;
    const options = getOptions(req.rawHeaders);
    if (options) {
        console.log(options);
        await generatePdf(htmlPath, epubPath, options);
    }
    else {
        await generatePdf(htmlPath, epubPath);
    }

    return process.cwd() + "\\uploads\\" + uid + ".pdf";
}

/**
 * takes the uid and returns the first HTML file in the unzipped directory
 * @param uid uid of the current session
 * @returns path to html file to render
 */
function findHTML(uid: string): string {
    let htmlPaths = glob.sync('./uploads/' + uid + "/**/*.html");
    if (htmlPaths.length == 0) {
        htmlPaths = glob.sync('./uploads/' + uid + "/**/*.xhtml");
    }
    console.log("HTML PATH UP NEDXT");
    console.log(htmlPaths[0]);
    return htmlPaths[0];
}

function fileVerification(req: any): string {
    // If file is not found
    if (!req.files) {
        throw new HttpError(400, "no files found");
    }

    //file is not zip type
    if (!req.files.ebook) {
        throw new HttpError(400, "ebook file not found");
    }
    let ebook = req.files.ebook;
    console.log(ebook.mimetype);
    if (!(ebook.mimetype == "application/zip" || ebook.mimetype == "application/epub+zip")) {
        throw new HttpError(415, "ebook not of zip or epub type");
    }
    let uid: string = uuidv4();
    let epubpath = './uploads/' + uid;
    ebook.mv(epubpath + ".zip");
    return uid;

}


/**
 * 
 * @param uid uid of the current session
 */
function unzip(uid: string) {
    var opsys = process.platform;
    if (opsys == "win32") {
        let mkdirCommand = `mkdir uploads\\${uid}`;
        child_process.execSync(mkdirCommand);
        let tarCommand = `tar -xf ./uploads/${uid}.zip -C ./uploads/${uid}`;
        console.log(tarCommand);
        try {
            child_process.execSync(tarCommand);
        }
        catch (e: any) {
            child_process.execSync(tarCommand);
        }
    }
    else {
        child_process.execSync(`unzip ./uploads/${uid}.zip `);
    }
}

async function generatePdf(htmlPath: string, epubPath: string, options: any = undefined) {
    let paged_command = "";
    if (options) {
        console.log("with pagedjs")
        paged_command = `npx pagedjs-cli -r -w ${options.width} -h ${options.height} ${htmlPath} -o ${epubPath}.pdf`;
    }
    else {
        paged_command = `npx pagedjs-cli -r ${htmlPath} -o ${epubPath}.pdf`;
    }
    console.log(paged_command);
    child_process.execSync(paged_command);
    // child_process.execSync(paged_command,{"timeout":(1000*60*10)});

}

export class HttpError extends Error {
    status: number;
    message: string;
    type = "HttpError";
    constructor(status: number, message: string) {
        super("error");
        this.status = status;
        this.message = message;
    }
}
