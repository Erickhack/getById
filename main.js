'use strict';

const http = require('http');

const port = 9999;
const statusBadReq = 400;
const statusNotFaund = 404;
const statusOk = 200;

let nextId = 1;
const posts = [];

function sendResponse(res, {status = statusOk, headers = {}, body = null}) {
    Object.entries(headers).forEach(([kay, value]) => {
        res.setHeader(kay, value);
    });
    res.writeHead(status);
    res.end(body);
}

function sendJSON(res, body) {
    sendResponse(res, {
        headers: {
            'Content-Type': 'application/sjon',
        },
        body: JSON.stringify(body),
    });
}

const methods = new Map();

methods.set('/posts.get', ({res}) => {
    sendJSON(res, posts);
});
methods.set('/posts.getById', ({}) => {
});
methods.set('/posts.post', ({res, searchParams}) => {
    if (!searchParams.has('content')) {
        sendResponse(res, {status: statusBadReq});
        return;
    }

    const content = searchParams.get('content');
    console.log(content);

    const post = {
        if: nextId++,
        content: content,
        created: Date.now(),
    }

    posts.unshift(post);
    sendJSON(res, post)
});
methods.set('/posts.edit', ({}) => {});
methods.set('/posts.delete', ({}) => {});

http.createServer((req, res) => {
    const {pathname, searchParams}  = new URL(req.url, `http://${req.headers.host}`);
    const method = methods.get(pathname);

    if (method === undefined) {
        sendResponse(res, {status: statusNotFaund});
        return;
    }

    const params = {
        req,
        res,
        pathname,
        searchParams,
    }

    method(params);
}).listen(port);