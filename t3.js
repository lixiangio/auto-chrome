const childProcess = require('child_process');
const exec = childProcess.exec

let cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux'

exec(cmd, function (err, stdout, stderr) {

  if (err) {
    return console.error(err)
  }

  //   console.log(stdout)
  stdout.split('\n').filter((line) => {

    let processMessage = line.trim().split(/\s+/)
    let processName = processMessage[0] //processMessage[0]进程名称 ， processMessage[1]进程id

    if (processName === 'node.exe') {
      exec('taskkill /im node.exe -f');
      console.log(processName);
    }

  })
  
})