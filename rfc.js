
var webdriver = require('selenium-webdriver');
By = webdriver.By,
until = webdriver.until;
var request = require('request');
 

var driver =  new webdriver.Builder()
.forBrowser('firefox')
.build();
driver.get('https://agsc.siat.sat.gob.mx/PTSC/ValidaRFC/index.jsf?ispublic=1');
img = driver.findElement(By.id('captchaSession')).getAttribute('src');

img.then(function(text){

    var image = text.split("data:image/png;base64,");


    resolve_image(image[1] ,function(idResolv){

        
                   resolve_captcha(idResolv,function(result){
        
                                                console.log(result);
                            driver.findElement(By.id("formMain:captchaInput")).sendKeys(result);
                            clearTimeout(resolucion);
                            driver.findElement(By.id("formMain:j_idt57")).click();
        
                            driver.wait(until.elementLocated(By.id('formMain:valRFC')), 2000).then(function(elm) {
                                
                               
                             driver.findElement(By.id("formMain:valRFC")).sendKeys('CAVJ911003QY1');
                             driver.findElement(By.id('formMain:consulta')).click();


                                    driver.wait(until.elementLocated(By.id('formMain:terminar')), 2000).then(function(elm) {


                                       msg = driver.findElement(By.className('ui-messages-info ui-corner-all')).getText();

                                       msg.then(function(text){


                                         console.log(text);

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


