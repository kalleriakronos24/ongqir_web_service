





// server
let activeSocket = []; // lists of active socket


io.on('connection', (socket) => {

    let obj = {
        id : socket.id,
        client_id : null // ???? how to get the client id if there's no listening for event e.g socket.on('something)
    };

    // when there's already a way to get the client_id then
    activeSocket.push(obj); // added to the active socket / user


    // now we listen to the emit from the sender

    socket.on('send-data', (id) => {

        const filteredSocket = activeSocket.filter((v,i) => v.client_id === id)[0]; // get the target sender

        socket.to(filteredSocket.id).emit('receive-data', "hello man"); // send data to the receiver of filteredSocket.id
    })

});

// client 1 as sender

socket.emit('send-data', 123) // example i guess , 123 as the target client_id;



// client 2 as receiver 

socket.on('receive-data', (data) => console.log(data));