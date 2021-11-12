const http = require('http');
// для статичних файлів. Для роботи із структуроою проекту
const path = require('path');
// для того щоб прочитати файлики
const fs = require('fs');
// для того щоб прочитати файлик асинхронним підходом
const fsPromises = require("fs").promises;
// const fsPromises = require('fs/promises'); такий спосіб лише в нових нодах

const env = require('dotenv').config();

// так як є різні типи фаликів - робим різні типи контент типів
const CONTENT_TYPES = {
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
};

function processRestApi(req, res) {
    const routes = {
        '/api/result': () => {
            res.writeHead(200, {'Content-Type': CONTENT_TYPES[".json"]})
            res.end(JSON.stringify(['one', 'two', 'three']))
        },
        '/api/42': () => {
            // res.writeHead(200, {'Content-Type': CONTENT_TYPES[".json"]})
            res.end('42')
        }
    }
    routes[req.url]()
}

function processStaticFile(req, res) {
    // метод дозволяє витягнути файлик по його шляху
    // вертає проміси
    fsPromises.stat(path.join(__dirname, req.url))
        .then(data => {
            if (data.isFile()) {
                // витягаєм розширення файлу для того шоб знати який контент тайп прописувати
                const extension = path.extname(req.url);
                res.writeHead(200, {'Content-Type': CONTENT_TYPES[extension]});
                // цей метод, не блокуючи інпут аутпут, дозволяє створити стрім який буде читати файл і
                // одразу користувачу віддавати і показувати якісь дані по мірі прочитання
                //Pipe - это канал, который связывает поток для чтения и поток для записи и позволяет сразу
                // считать из потока чтения в поток записи.
                fs.createReadStream(path.join(__dirname, req.url)).pipe(res);
            } else {
                res.writeHead(200, {'Content-Type': CONTENT_TYPES['.json']});
                res.end(JSON.stringify({
                    status: 200,
                    data: "Directory"
                }));
            }
        })
        .catch(err => {
            res.writeHead(404, {'Content-Type': CONTENT_TYPES['.json']});
            res.end(JSON.stringify({
                status: 404,
                error: err.code
            }));
        })

}

http.createServer((req, res) => {
    // чи робим запит на нашу статику (папка з статичними файлами)
    if (req.url.startsWith('/static/')) {
        // робим функцію яка буде процесети статік
        processStaticFile(req, res)

    } else if (req.url.startsWith('/api')) {
        processRestApi(req, res)
    } else if (req.url === '/') {
        // робим редірект на сторінку викорстовуючи хедер Location
        res.writeHead(302, {'Location': '/static/index.html'});
        res.end();
    } else {
        res.writeHead(404, {'Content-Type': CONTENT_TYPES[".json"]});
        res.end(JSON.stringify({
            status: 404,
            error: 'Not Found'
        }))
    }
}).listen(env.parsed.PORT, () => console.log('Server running at:', env.parsed.PORT))

