var io       = require('socket.io').listen(8888);
var mysql    = require('mysql');
var facturas = [];

var dbConnection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'sigmmanet',
});

console.log('Iniciando server con socket.io ...');


dbConnection.connect(function (error) {
    if (!!error) {
        console.log('ERROR : no se pudo conectar con la DB');
    }else{
        console.log('SUCCESS : conectado con la DB');
    }
});

io.sockets.on('connection', function(socket){
    console.log('alguien se conectó con socket.io : '+socket.id);
    socket.on('disconnect', function() {
        console.log('se desconectó : '+socket.client.conn.id);
        // console.log(socket);
        for (var i = 0; i < facturas.length; ++i) {
            if (facturas[i].socketId == socket.client.conn.id) {
                // var i = allClients.indexOf(socket);
                console.log('eliminando factura : '+facturas[i].facturaId);
                facturas.splice(i, 1);
                io.sockets.emit('change-facturas', facturas);
                break;
            }
        }
    });

    socket.on('add-factura', function(data) {
        console.log('factura agregada para seguimiento : ');
        console.log(data);
        // data.socket = socket;
        facturas.push(data);
        // comunicar a todos los sockets
        io.sockets.emit('change-facturas', facturas);
    });
},function (error) {
    console.log(error);
});

function checkFacturasPendientes() {
    if (facturas.length>0) {
        var randonIndex = Math.floor(Math.random() * facturas.length);
        // var procesada   = Math.floor(Math.random() * 10);

        dbConnection.query('select * from facturas_pendientes_cae where id_factura = 362', function (error, rows, fields) {
            if (!!error) {
                console.log('ERROR : no se pudo obtener datos de la DB');
            }else{
                console.log(rows);
                if (rows.length > 0) {
                    console.log('factura procesada : '+randonIndex);
                    facturas[ randonIndex ].data = rows[0];
                    io.sockets.emit('factura-precesada', facturas[ randonIndex ]);
                }
            }
        });
    }
}

setInterval(checkFacturasPendientes, 3000);