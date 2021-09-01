'use strict';

const http = require('http');

const port = 9999;
const statusBadReq = 400;
const statusNotFaund = 404;
const statusOk = 200;
const errorHtml = `
<h1>Not Found</h1>
<p>The requested URL was not found on this server.</p>
<hr/>
<i>Apache/2.4.47 (Win64) OpenSSL/1.1.1k PHP/7.4.19 Server at localhost Port 80</i>
`;

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
    const space = 2;
    sendResponse(res, {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body, null, space),
    });
}

const methods = new Map();

methods.set('/posts.get', ({res}) => {
    sendJSON(res, posts);
});
methods.set('/posts.getById', ({res, searchParams}) => {
    if (!searchParams.has('id')) {
        sendResponse(res, {status: statusBadReq, body: errorHtml});
        return;
    }
    
    // const idPost = posts.filter(o => o.id === parseInt(id, 10));
    const id = searchParams.get('id');
    const idPost = posts.find(i => i.id === +id);

    if (idPost === undefined) {
        sendResponse(res, {status: statusNotFaund, body: errorHtml});
        return;
    }
    sendJSON(res, idPost);
});
methods.set('/posts.post', ({res, searchParams}) => {
    if (!searchParams.has('content')) {
        sendResponse(res, {status: statusBadReq, body: errorHtml});
        return;
    }

    const content = searchParams.get('content');

    const post = {
        id: nextId++,
        content: content,
        created: Date.now(),
    };

    posts.unshift(post);
    sendJSON(res, post);
});
methods.set('/posts.edit', ({}) => {});
methods.set('/posts.delete', ({}) => {});

http.createServer((req, res) => {
    const {pathname, searchParams} = new URL(req.url, `http://${req.headers.host}`);
    const method = methods.get(pathname);

    if (method === undefined) {
        sendResponse(res, {status: statusNotFaund, body: errorHtml});
        return;
    }

    const params = {
        req,
        res,
        pathname,
        searchParams,
    };

    method(params);
}).listen(port);