
// Server Module
// Creates an HTTP server for a parent process and sends messages upward
// - Layla

const debug = true;

// Task class, for keeping requests organized

const tasks = new Map();

class Task extends require("events") {
    constructor(data) {
        super();
        this.id = Task.genCode(16);
        this.data = data;
        this.then = null;

        setTimeout(() => {
            this.emit("destroy");
        }, 1000 * 60 * 5);
    }

    static genCode(t) {
        const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let str = "";
        while(str.length < t)
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        return str;
    }
}

// Setup Server

const http = require("http");

function listener(req, res) {
    req.on("data", data => {
        data = data.toString();

        if (debug) {
            console.log("received data");
            console.log(data);
        }

        let json = JSON.parse(data);
        json["ip"] = req.remoteAddress.replace(/::ffff:/, ""); //Attach IP to Request obj

        let task = new Task(Date.now(), data, {});
        console.log(`task ${task.id} created`);
        task.then = reply => {
            res.writeHead(200, task.header);
            res.end(JSON.stringify(reply.data));
            console.log(`task ${task.id} destroyed`);
            task.emit("destroy");
        };
        task.on("destroy", () => tasks.delete(task.id));
        tasks.set(task.id, task);
        process.send({id: task.id, data: task.data});
    });
}

process.on("message", (reply) => {
    if (tasks.has(reply.id))
        tasks.get(reply.id).then(reply);
});

function kill(sock) {
    try {
        sock.end();
    } catch (e) {
        console.error("error killing socket");
        console.error(e);
    }
}

const server = http.createServer(listener);

server.on("error", err => throw err);

server.listen(8000);
console.log("HTTP server listening on port 8000");