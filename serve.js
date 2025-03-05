import os, { arch } from "node:os"
import path from "node:path"
import fs from "node:fs"
import child_process from "node:child_process"

const uuid = "fc10fc60-3fa5-449c-9e2e-5bcee5cd2f32"
const keyfn = path.join(os.tmpdir(),`${uuid}.key`)
const csrfn = path.join(os.tmpdir(),`${uuid}.csr`)
const crtfn = path.join(os.tmpdir(),`${uuid}.crt`)

export async function serve(a1,a2){
    if(!await isFileExists(keyfn) || !await isFileExists(csrfn) || !await isFileExists(crtfn)){
        child_process.execSync(`openssl genpkey -algorithm ec -pkeyopt ec_paramgen_curve:prime256v1 -out ${keyfn}`);
        child_process.execSync(`openssl req -new -sha256 -subj /CN=localhost -key ${keyfn} -out ${csrfn}`)
        child_process.execSync(`openssl x509 -req -signkey ${keyfn} -in ${csrfn} -out ${crtfn}`)
    }

    const cert = fs.readFileSync(crtfn)
    const key = fs.readFileSync(keyfn)
    if(typeof a1 == "object"){
        a1 = {
            port : 443,
            cert,
            key,
            ...a1
        }
    }else if(typeof a1 == "function"){
        a2 = a1;
        a1 = {
            port : 443,cert,key
        }
    }
    return Deno.serve(a1,a2)

}


async function isFileExists(path){
    try{
        await fs.promises.stat(path)
        return true
    }catch{
        return false
    }
}
