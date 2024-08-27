import express from 'express';
import { chromium } from 'playwright'

const app = express();
const port = 4000;

import cors from 'cors';
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/Cotizaciones', async (req, res) => {

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    
    //DOLAR BLUE
    await page.goto('https://dolarhoy.com/i/cotizaciones/dolar-blue')
    let dataBlue = await page.$$eval('p', (elements) => (
        elements.map((element, indice) => {
            const dolar = "BLU"
            const operacion = indice == 0 ? "C" : "V"
            const valor = element.textContent.replace(/[^\d.-]/g, '')
            return { dolar, operacion, valor }
        })
    ))
    
    //DOLAR BLUE ALTERNATIVA
  /*  await page.goto('https://dolarhoy.com/i/cotizaciones/dolar-blue');    
    const dataBlue2 = await page.evaluate(() => 
                {  let tipo         = document.querySelector("h2").innerText;         
                   const valores    = document.querySelectorAll("p") //Todos los p
                   const cotizacion = [...valores].map( (x,indice) => (  { tcambio : indice == 0 ? "C" : "V" , 
                                                                           valor   : x.innerText.replace(/[^\d.-]/g, '') }) )
                   return { tipo ,cotizacion };});
    //console.log(dataBlue2);
    */
    //DOLAR OFICIAL
    await page.goto('https://dolarhoy.com/i/cotizaciones/dolar-bancos-y-casas-de-cambio')
    let dataOficial = await page.$$eval('p', (elements) => (
        elements.map((element, indice) => {
            const dolar = "OFI"
            const operacion = indice == 0 ? "C" : "V"
            const valor = element.textContent.replace(/[^\d.-]/g, '')
            return { dolar, operacion, valor }
        })
    ))
    
    //DOLAR MEP
    await page.goto('https://dolarhoy.com/i/cotizaciones/dolar-mep')
    let dataMep = await page.$$eval('p', (elements) => (
        elements.map((element, indice) => {
            const dolar = "MEP"
            const operacion = indice == 0 ? "C" : "V"
            const valor = element.textContent.replace(/[^\d.-]/g, '')
            return { dolar, operacion, valor }
        })
    ))
    
    //DOLAR CONTADO CON LIQUIDACION
    await page.goto('https://dolarhoy.com/i/cotizaciones/dolar-contado-con-liquidacion')
    let dataCcl = await page.$$eval('p', (elements) => (
        elements.map((element, indice) => {
            const dolar = "CCL"
            const operacion = indice == 0 ? "C" : "V"
            const valor = element.textContent.replace(/[^\d.-]/g, '')
            return { dolar, operacion, valor }
        })
    ))

    /*
    //DOLAR BITCOIN
    await page.goto('https://dolarhoy.com/i/cotizaciones/bitcoin-usd')
    let dataBitcoin = await page.$$eval('p', (elements) => (
        elements.map((element, indice) => {
            const dolar = "BIT"
            const operacion = "X"
            const valor = element.textContent.replace(/[^\d.-]/g, '')
            return { dolar, operacion, valor }
        })
    ))
    */

    //DOLAR BANCO NACION (Solidario)
    await page.goto('https://dolarhoy.com/i/cotizaciones/banco-nacion')
    let dataBancoNacion = await page.$$eval('p', (elements) => (
        elements.map((element, indice) => {
            const dolar = "NAC"
            const operacion = indice == 0 ? "C" : "V"
            const valor = element.textContent.replace(/[^\d.-]/g, '')
            return { dolar, operacion, valor }
        })
    ))
    
    let salida = [...dataBlue,
                  ...dataOficial,
                  ...dataMep,
                  ...dataCcl,
               //   ...dataBitcoin,
                  ...dataBancoNacion,
    ]
     


    const pivotData = salida.reduce((acc, { dolar, operacion, valor }) => {
        if (!acc[dolar]) {
          acc[dolar] = { dolar };
        }
        acc[dolar][operacion] = valor;
        return acc;
    }, {});
      
    const result = Object.values(pivotData);
    
    console.log(salida)   
    console.log(result);

    await browser.close()
    res.send(result);

});


app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});