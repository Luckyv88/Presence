import swaggerAutogen from 'swagger-autogen';
import fs from 'fs'; 

const doc = {
  info: { title: 'My API', description: 'Description' },
  host: 'localhost:5000'
};

const outputFile = './src/swagger/swagger-output.json';
const routes = ['./server.js']; 


await swaggerAutogen()(outputFile, routes, doc);


const swaggerDocument = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));

export default swaggerDocument;