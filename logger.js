function log(req, res, next){
    console.log('Logging...');
    next(); // Le indica a express que llame a la siguiente funcion middleware
            // o la peticion correspondiente
};

module.exports = log;