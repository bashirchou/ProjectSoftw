package com.example.colorimage
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {

    lateinit var mSocket : Socket
    private var connected: Boolean = false;

    @Synchronized
    fun connection() {
        if (!connected) {
            setSocket()
            establishConnection()
            connected = true;
        }
    }

    @Synchronized
    fun setSocket(){
        try{
            mSocket = IO.socket("http://ec2-35-183-71-73.ca-central-1.compute.amazonaws.com:3000")
        } catch(e: URISyntaxException) {

        }
    }

    @Synchronized
    fun getSocket(): Socket{
        return mSocket
    }

    @Synchronized
    fun establishConnection(){
        mSocket.connect()
    }

    @Synchronized
    fun closeConnection(){
        mSocket.disconnect()
    }

    //@Synchronized
    //fun sendMessage(message: String, user: String, date: String){
    //    mSocket.emit("newMessage", message, user, date);
    //}

    @Synchronized
    fun sendMessage(message: String, user: String) {
        mSocket.emit("newMessage", message, user)
    }

    @Synchronized
    fun validateUser(username: String){
        mSocket.emit("validateUserLight", username)
    }


}
