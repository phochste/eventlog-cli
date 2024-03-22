#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

const host = 'localhost';
const port = 8000;
const public_dir = './public';

const requestListener = function (req, res) {
    const pathItem = req.url.substring(1);

    try {
        if (fs.lstatSync(`${public_dir}/${pathItem}`).isFile()) {
            const content = fs.readFileSync(`${public_dir}/${pathItem}`, { encoding: 'utf-8'});
            if (fs.existsSync(`${public_dir}/${pathItem}.meta`)) {
                const headers = JSON.parse(fs.readFileSync(`${public_dir}/${pathItem}.meta`, { encoding : 'utf-8'}));
                Object.keys(headers).forEach( (key) => {
                    res.setHeader(key, headers[key]);
                });
            }
            res.writeHead(200);
            res.end(content);
        }
        else if (fs.lstatSync(`${public_dir}/${pathItem}`).isDirectory()) {
            const lsDir = fs.readdirSync(`${public_dir}/${pathItem}`);

            if (fs.existsSync(`${public_dir}/${pathItem}.meta`)) {
                const headers = JSON.parse(fs.readFileSync(`${public_dir}/${pathItem}.meta`, { encoding : 'utf-8'}));
                Object.keys(headers).forEach( (key) => {
                    res.setHeader(key, headers[key]);
                });
            }
            else {
                res.setHeader('Content-Type','text/html');
            }

            let content = '<html><body>';
            lsDir.forEach( (entry) => {
                content += `<a href="http://${host}:${port}/${pathItem}/${entry}">${entry}</a><br>`
            });
            content += '</body></html>';
            res.writeHead(200);
            res.end(content); 
        }
        else {
            res.writeHead(404);
            res.end(`No such path: ${pathItem}`);
        }
    }
    catch(e) {
        res.writeHead(500)
        res.end(e.message);
    }
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port} for ${public_dir}`);
});