const express = require('express')

const server = express();
const {createBundleRenderer} = require('vue-server-renderer');
const path = require('path')
const fs = require('fs')
const serverBundle = require(path.resolve(__dirname, '../dist/vue-ssr-server-bundle.json'))
const clientManifest = require(path.resolve(__dirname, '../dist/vue-ssr-client-manifest.json'))

const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.ssr.html'), 'utf-8')
const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: template,
  clientManifest: clientManifest
});

server.use(express.static(path.resolve(__dirname, '../dist/client')))
server.get('*', (req, res)=>{
  const context = {url:req.url};
  console.log(context);
  
  const ssrStream = renderer.renderToStream(context);
  let buffers = [];
  ssrStream.on('error', (err)=>{console.log(err)})
  ssrStream.on('data', (data)=> buffers.push(data))
  ssrStream.on('end', ()=>{res.end(Buffer.concat(buffers))})
})

server.listen(1000)