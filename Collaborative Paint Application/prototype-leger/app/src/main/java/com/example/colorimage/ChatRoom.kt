package com.example.colorimage
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.widget.TextView
import android.widget.Button
import android.widget.ScrollView

class ChatRoom : AppCompatActivity() {

    private var text: String = ""
    private lateinit var chatRoom: TextView
    private lateinit var scrollView: ScrollView
    private lateinit var textInput: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat_room)
        textInput = findViewById(R.id.textInput)
        chatRoom = findViewById(R.id.chatBox)
        val logoutButton: Button = findViewById(R.id.logout_button)
        scrollView = findViewById(R.id.scrollView3);

        val username=intent.getStringExtra("Username")

        SocketHandler.mSocket.on("messageToClient")  { args ->

            val message = args[0] as String
            val user = args[1] as String
            val date = args[2] as String
            runOnUiThread {
                printMessageFromServer(user,date,message)
            }
        }

        logoutButton.setOnClickListener{
            logOff()
        }
        textInput.setOnKeyListener{ _, keyCode, event ->
            if (event.action == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_ENTER
                && textInput.text.isNotEmpty() && textInput.text.length < 500) {
                sendMessageToServer(username!!, textInput.text.toString())
                textInput.text = ""
                true
            }
            false
        }
    }

    override fun onBackPressed() {
        super.onBackPressed()
        SocketHandler.mSocket.emit("removeUsername")
        finish()
    }

    private fun printMessageFromServer(user: String, date: String, message: String) {
        text += "[$user], $date: $message\n"
        chatRoom.text = text
        // Force scroll down
        scrollView.fullScroll(View.FOCUS_DOWN)
        textInput.requestFocus()
    }

    private fun sendMessageToServer(user: String, message: String) {
        SocketHandler.sendMessage(message, user);
    }

    private fun logOff() {
        SocketHandler.mSocket.emit("removeUsername")
        finish()
    }

}
