
// using the node.js built in cluster module
let cluster = require('cluster'),
http = require('http'),



// also using the node.js built in os (operating system) module
os = require('os'),

// I can get a list of the systems cpus like this:
cpus = os.cpus(),

// standard start message
startmess = function () {

    let pid = process.pid,
    processType = cluster.isMaster ? 'Master' : 'Worker',
    worker = cluster.worker || {
        id: 0
    };

    console.log(processType + ' started on pid: ' + pid + ' worker.id: ' + worker.id);

};

// if this is the master
if (cluster.isMaster) {

    startmess();

    // fork this script for each cpu
    let i = 0,
    len = cpus.length;
    while (i < len) {

        cluster.fork();

        i += 1;

    }

    // on exit
    cluster.on('exit', function (worker, code, sig) {

        console.log('he\'s dead Jim');
        console.log(worker.id);

    });

} else {

    // else it is a fork
    startmess();

    let c = 0,
    rate = 1000,
    lt = new Date(),
    worker = cluster.worker;

    // end process after 1 sec
    setInterval(function () {

        console.log('worker # : ' + worker.id + ' : ' + c);

        if (c === 10) {

            cluster.worker.kill();

        }

        c += 1;

    }, 100);

}
