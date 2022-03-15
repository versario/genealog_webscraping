const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

app.post('/getInfo', async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  try {
    var { rut } = req.body;
    const formData = new FormData();
    formData.append('s', rut);
    const { data } = await axios.post('https://www.genealog.cl/Geneanexus/search', formData, {
      headers: formData.getHeaders()
    });
    const info = JSON.parse(data.match('result = (.+);')[1]);
    const nombres = findByKey(info.content, 'nombre');
    const apellidoPaterno = findByKey(info.content, 'apellido_paterno');
    const apellidoMaterno = findByKey(info.content, 'apellido_materno');
    var result = {
      nombres: nombres,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno
    };
    res.status(200).send({info: result});
  } catch(err){
    res.status(500).send({error: 'Se ha producido un problema: ' + err});
  }
});

const findByKey = (obj, key) => {
  for(var prop in obj) {
    if(obj[prop] instanceof Object && prop.match('^[0-9]+-[0-9kK]{1}$')){
      return findByKey(obj[prop], key);
    }
    if(prop == key) {
      return obj[prop];
    }
  }
};

module.exports.handler = serverless(app);