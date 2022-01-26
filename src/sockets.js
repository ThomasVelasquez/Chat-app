const chat = require('./models/Chat')
module.exports = function(io){
  
    let users = {};


    io.on('connection', async socket =>{
        console.log('new user connected')
        
        let messages = await chat.find({}).limit(8);
        socket.emit('load old msgs', messages)

        socket.on('new user', (data, cb) =>{
            console.log(data)
            if(data in users ){
                cb(false)
            }else{
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames();
            }
        });

        socket.on('send message', async(data, cb) => {

            let msg = data.trim();

            if(msg.substr(0,3) === '/w '){
                msg = msg.substr(3);
                const index = msg.indexOf(' ');
                if(index !== -1){
                    let name = msg.substring(0, index);
                    let mss = msg.substring(index + 1);
                    if(name in users){
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    }else{
                        cb('please enter a valid username')
                    };
                }else{
                    cb('please enter your msg')
                };
            }else{

                let newMsg = new chat({
                    msg,
                    nick:socket.nickname
                });

                await newMsg.save();

                io.sockets.emit('new message',{
                    msg:data,
                    nick: socket.nickname
                })
            };
        });
    
        socket.on('disconnect', data =>{
            if(!socket.nickname) return ;
            delete users[socket.nickname];
            updateNicknames();
        })

        function updateNicknames(){
            io.sockets.emit('usernames', Object.keys(users));
        } 

    })



};