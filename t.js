const childProcess = require('child_process');

childProcess.fork("./tm.js", [], {
   detached: true
});