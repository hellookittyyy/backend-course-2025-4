import { program } from 'commander';
import http from 'http'; 
import fs from 'fs'; 

program
  .requiredOption('-i, --input <path>', 'path to the input JSON file')
  .requiredOption('-h, --host <string>', 'server host')
  .requiredOption('-p, --port <number>', 'server port', parseInt)
  .parse(process.argv);

const options = program.opts();
const inputFile = options.input;
const host = options.host;
const port = options.port; 

if (!fs.existsSync(inputFile)) {
  console.error('Cannot find input file'); //
  process.exit(1); 
}

const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Server is running');
});

server.listen(port, host, () => {
  console.log(`Server started on http://${host}:${port}`);
  console.log(`Using input file: ${inputFile}`);
});