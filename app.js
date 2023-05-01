const inicioDebug = require('debug')('app:inicio');// Importar el paquete debug
                                        // el parametro indica el archivo y el entorno
                                        // de depuracion.
const dbDebug = require('debug')('app:db');                            

const express = require('express'); // Importa el paquete express
const config = require('config');
const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi');
const app = express(); // Crea una instancia de express

// Cuales son los metodos a implementar
// // con su ruta
// app.get(); // Consulta
// app.post(a); // Envio de datos al servidor al servidor (insertar datos en la base)
// app.put(); // Actualizacion
// app.delete(); // Eliminacion

app.use(express.json());  // Le decimos a express que use este
                        //midleware

app.use(express.urlencoded({extended:true}));   // Nuevo middleware
                                                // Define el uso de la libreria qs para
                                                // separar informacion codificada en 
                                                // el url   

app.use(express.static('public'));  //Nombre de carpeta que tendra los archivos 
                                    // (recursos estaticos)

console.log(`Aplicacion: ${config.get('nombre')}`);
console.log(`BD server: ${config.get('configDB.host')}`);

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('morgan habitado...')       
    // Muestra el mensaje de depuracion
    inicioDebug('Morgan esta habilitado')
}

dbDebug('Conectando con la base de datos...');

// app.use(logger);    // logger ya hace referencia a la funcion de loger.js
//                     // debido al exports

// app.use(function(req, res, next){
//     console.log('Autenticando...');
//     next();
// });

// Los tres app.use() son middleware y se llaman antes de
// las funciones de rutaGET, POST, PUT, DELETE
// para que estas puedan trabajar

const usuarios = [
    {id:1, nombre:'Juan'},
    {id:2, nombre:'Karen'},
    {id:3, nombre:'Diego'},
    {id:4, nombre:'Maria'}
];

function existeUsuario(id){
    return (usuarios.find(u => u.id === parseInt(id)));
};

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string()
                .min(3)
                .required()
    });
    return (schema.validate({nombre:nom}));
};

// Consulta en la ruta raiz del sitio
// Toda peticion siempre va a recibir dos parametros 
// req: la informacion lo que recibe el servidor desde el cliente 
// res: la informacion lo que el servidor va a responder al cliente
// Vamos a utilizar el metodo send del objeto res
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express!')
});

app.get('/api/usuarios', (req,res) => {
    res.send(usuarios);
});

//con los : delante del id 
// Express sabe que es un parametro a recibir en la ruta
app.get('/api/usuarios/:id', (req, res) => {
    const id = req.params.id;
    let usuario = existeUsuario(id);
    if(!usuario){
        res.status(404).send(`El usuario ${id} no se encuentra`);
        // Devuelve el estado HTTP 404
        return;
    };
    res.send(usuario);
    return;
});

// Recibiendo varios parametros
// Se pasan dos parametros year y month
// Query string
// localhost:3000/api/usuarios/1990/2/?nombre=xxxx&single=y
app.get('/api/usuarios/:year/:month', (req, res) => {
    // En el cuerpo de req esta la propiedad
    // query, que guarda los parametros Query
    res.send(req.query);
});

// La ruta tiene el mismo nombre que la peticion GET
// Express hace la diferencia dependiendo del tipo
// de peticion
// La peticion POST la vamos a utilizar para insertar
// un nuevo usuario en nuestro arreglo
app.post('/api/usuarios', (req, res) => {
    // El objeto request tiene la propiedad body
    // que va a venir en formato JSON
    // Creacion del Schema con Joi
    const {error, value} = validarUsuario(req.body.nombre);
    if (!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: req.body.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }
    else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});

// Peticion para modificar datos existentes
// Este metodo debe recibir un parametro
// id para saber que ususario modificar
app.put('/api/usuarios/:id', (req, res) => {
    // Encontrar si existe el usuario a modificar
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no se encuentra'); // Devuelve el estado HTTP
        return;
    }
    // Validar si el dato recibido es correcto
    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        // Actualiza el nombre 
        usuario.nombre = value.nombre;
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    return;
});

app.delete('/api/usuarios/:id', (req, res) => {
    const usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no se encuentra'); // Devuelve el estado HTTP
        return;
    };
    // Encontrar el indice del usuario dentro del arreglo
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1); // Elimina el usuaruio en el indice 
    res.send(usuario); // Se responde con el usuario eliminado
    return;
})

app.get('/api/productos', (req, res) => {
    res.send(['mouse', 'teclado', 'bocinas']);
});

// El modulo process, contiene la informacion del sistema
// El objeto env contiene informacion de las variables 
// de entorno.
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`);
});

// --------- Funciones middleware --------
// El middleware es un bloque de codigo que se ejecuta 
// entre las peticiones del usuario (request) y la peticion
// que llega al servidor. Es un enlace entre la peticion 
// del usuario y el servidor, antes de que este pueda 
// dar una respuesta.

// Las funciones de middleware sin funciones que tienen acceso 
// al objeto de la solicitud (req), al objeto de respuesta (res)
// y a la siguiente funcion de middleware en el ciclo de 
// solicitud/respuestas de la aplicacion. La siguiente 
// funcion de middleware se denota normalmente con una
// variable denominada next.

// Las funciones de middleware pueden realizar las siguientes tareas

//  -Ejecutar cualquier codigo.
//  -Realizar cambios en la solicitud y los objetos de respuesta
//  -Finalizar el ciclo de solicitud/respuestas
//  -Invoca la siguiente funcion de middleware en la pila

// Express es un framework de direccionamiento y uso de middleware
// que permite que la aplicacion tenga funcionalidad minima propia 


// Ya hemos utilizado algunos middleware como son express.json()
// que transforma el dody del req a formato JSON

//              ---------------------
// request --- | --> json() --> route() -- | --> response
//              ---------------------

// route() --> Funcion GET, POST, PUT, DELETE

// Una aplicacion Express puede utilizar los siguientes tipos
// de middleware

//          -Middleware de nivel de aplicacion
//          -Middleware de nivel de direccionador 
//          -Middleware de manejo de errores 
//          -Middleware incorporado
//          -Middleware de terceros 


// --------- Recursos estaticos --------
// Los recursos estaticos hacen referencia a archivos,
// imagenes, documentos que se ubican en el servidor.
// Vamos a usar un middleware para poder acceder a esos
// recursos.