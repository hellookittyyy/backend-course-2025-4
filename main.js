import { program } from 'commander';
import http from 'http';       
import fs from 'fs';          
import fsp from 'fs/promises';   
import url from 'url';            
import { XMLBuilder } from 'fast-xml-parser'; 
import { error } from 'console';


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
  console.error('Cannot find input file');
  process.exit(1);
}

const builder = new XMLBuilder({
  format: true, 
});

const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);

  const parsedUrl = url.parse(req.url, true);
//   console.log('Parsed URL:', parsedUrl);
  if (parsedUrl.pathname !== '/') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('\nNot Found');
    return;
  }
  const query = parsedUrl.query;
//   console.log('Query:', query);
  const showVariety = query.variety === 'true';
  const minPetalLength = parseFloat(query.min_petal_length); 
//   console.log('Query parameters:', { showVariety, minPetalLength });
//   console.log('min_petal_length:',query.min_petal_length)

  try {
    const fileData = await fsp.readFile(inputFile, 'utf8');
    let jsonData = JSON.parse(fileData);

    
    if (!isNaN(minPetalLength)) {
      jsonData = jsonData.filter(
        (flower) => flower['petal.length'] > minPetalLength
      );
    }
    else {
      return error('min_petal_length is not a number');
    }

    const flowersForXml = jsonData.map((flower) => {
      const flowerRecord = {
        petal_length: flower['petal.length'], //
        petal_width: flower['petal.width'],   //
      };

      if (showVariety) {
        flowerRecord.variety = flower.variety; //
      }

      return flowerRecord;
    });

    const xmlObject = {
      irises: {
        flower: flowersForXml,
      },
    };

    const xmlOutput = builder.build(xmlObject);

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xmlOutput);

  } catch (error) {
    console.error('Error processing request:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`Server started on http://${host}:${port}`);
  console.log(`Using input file: ${inputFile}`);
});