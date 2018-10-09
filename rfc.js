
var webdriver = require('selenium-webdriver');
By = webdriver.By,
until = webdriver.until;
var request = require('request');
 

var driver =  new webdriver.Builder()
.forBrowser('firefox')
.build();
// accedemos al pagina que se desea scrapear
driver.get('https://agsc.siat.sat.gob.mx/PTSC/ValidaRFC/index.jsf?ispublic=1');

//buacamos la imagen del captcha
img = driver.findElement(By.id('captchaSession')).getAttribute('src');

img.then(function(text){

    // se obtieene el codigo en base64 de la imagen
    var image = text.split("data:image/png;base64,");


    // se envia la imagen a un tercero para su resolucion en este caso usamos el servicio de anticaptcha
    resolve_image(image[1] ,function(idResolv){

                    //una vez obtenido el captcha resulto arracamos de nuevo el scrapeo 
                   resolve_captcha(idResolv,function(result){
        
                            console.log(result);
                            // se escribe el la resolucion del captcha en el input 
                            driver.findElement(By.id("formMain:captchaInput")).sendKeys(result);
                            clearTimeout(resolucion);
                            driver.findElement(By.id("formMain:j_idt57")).click();
        
                            driver.wait(until.elementLocated(By.id('formMain:valRFC')), 2000).then(function(elm) {
                                
                             /* introducimos el RFC  a validar*/ 
                             driver.findElement(By.id("formMain:valRFC")).sendKeys('CAVJ911003QY1');
                             driver.findElement(By.id('formMain:consulta')).click();

                                     /*  damos clieck en el boton validar*/ 
                                    driver.wait(until.elementLocated(By.id('formMain:terminar')), 2000).then(function(elm) {


                                      /*  recogemos la respuesta de la peticion */
                                       msg = driver.findElement(By.className('ui-messages-info ui-corner-all')).getText();

                                       msg.then(function(text){

                                         console.log(text);

                                         /*  cerramos la conexion */

                                         driver.quit();

                                       });

                                    }).catch(function(ex) {
                                        console.log('ex')
                                        driver.quit();
                                    });
                                    

                            }).catch(function(ex) {
                                console.log('ex')
                                driver.quit();
                            });
 
        
                     });
        
             });

});



// Se hace la peticion al servicio de resolucion de captchas

function resolve_captcha(id ,callback){

//Hacemos un bucle hasta que el servicio termine de resolver el captcha
resolucion =  setInterval(function(){
    
    request({
        url: 'https://api.anti-captcha.com/getTaskResult',
        method: 'POST',
        json: { clientKey:'926e83cb043a9e1df330741c313ff8bc', 
        taskId: id
          }
      }, function(error, response, body){

        //Se hace la validacion de respuesta por parte del servicio

        if(body.status === 'processing')
        {

            console.log('espera');
        
        }else{
             
            //Retorna el resultado del captcha
            callback(body.solution.text);
            
        }

        
        
      });

}, 3000);


}



function resolve_image(image, callback){


     request({
        url: 'https://api.anti-captcha.com/createTask',
        method: 'POST',
        json: { clientKey:'926e83cb043a9e1df330741c313ff8bc', 
        task:{ 
        type: 'ImageToTextTask',
        body: image,
        phrase:null,
        case:true,
        numeric:null,
        math:null,
        minLength:5,
        maxLength:0 } 
        }
      }, function(error, response, body){

            callback(body.taskId);
        
      });

}


