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
    ...dataBancoNacion,]

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


app.get('/Cotizaciones2', async (req, res) => {

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    // Leo la pagina de Dolar Hoy
    await page.goto('https://dolarhoy.com')
    const elements = await page.$$('.val'); //busco la clase "val" en toda la pagina (contiene un valor)

    // Creo Array con valores
    let values = [];
    for (const element of elements) {
        const text = await element.textContent(); //Leo el valor  
        values.push({ dolar: '', operacion: "", valor: text });
    }

    // Elimina los dos primeros elementos del array (Dolar Blue duplicado)
    values = values.slice(2);

    // Duplica el último elemento del array (Dolar Tarjeta Unico valor CYV)
    if (values.length > 0) {
        const lastElement = values[values.length - 1];
        values.push({ ...lastElement });
    }

    // Completa el campo operacion con los valores "C" y "V" alternadamente
    const labels = ["C", "V"];
    for (let i = 0; i < values.length; i++) {
        values[i].operacion = labels[i % 2];
    }

    // Agrego Tipo
    values[0].dolar = "BLUE";
    values[1].dolar = "BLUE";
    values[2].dolar = "OFICIAL";
    values[3].dolar = "OFICIAL";
    values[4].dolar = "MEP";
    values[5].dolar = "MEP";
    values[6].dolar = "CCLIQUI";
    values[7].dolar = "CCLIQUI";
    values[8].dolar = "CRIPTO";
    values[9].dolar = "CRIPTO";
    values[10].dolar = "TARJETA";
    values[11].dolar = "TARJETA";

    // Armo Pivot del array (Salida Final) 
    const pivotData = values.reduce((acc, { dolar, operacion, valor }) => {
        if (!acc[dolar]) {
            acc[dolar] = { dolar };
        }
        acc[dolar][operacion] = valor;
        return acc;
    }, {});
    const result = Object.values(pivotData);
    
    await browser.close()
    //console.log(result)
    res.send(result);

});









app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});