package com.example.colorimage
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.SystemClock
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.core.view.isVisible

class MainActivity : AppCompatActivity() {

    private var lastClickTime: Long = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        SocketHandler.connection();
        //intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

        val loginButton: Button = findViewById(R.id.login_button)

        SocketHandler.mSocket.on("UserValidation")  { args ->
            val validation= args[0] as Boolean
            runOnUiThread {
                val errorMessage: TextView = findViewById(R.id.text_login_error)
                var pseudo = getPseudoInput();
                if(!validation) {
                    errorMessage.text= "The pseudonyme is already taken."
                    errorMessage.isVisible= true
                } else {
                    errorMessage.isVisible= false
                    val chatActivity = Intent(this,ChatRoom::class.java)
                    chatActivity.putExtra("Username",pseudo)
                    startActivity(chatActivity)

                }
            }
        }
        loginButton.setOnClickListener{
            if (SystemClock.elapsedRealtime() - lastClickTime < 1000) {
                return@setOnClickListener
            }
            lastClickTime = SystemClock.elapsedRealtime()
            verifyLogin()
            // Hide keyboard
            val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm.hideSoftInputFromWindow(it.windowToken, 0)

        }
    }

    override fun onBackPressed() {

    }

    private fun getPseudoInput(): String{
        val inputPseudo : EditText= findViewById(R.id.pseudo_input);
        return inputPseudo.text.toString()

    }

    private fun displayErrorMessage( errMess: String){
        val errorMessage: TextView = findViewById(R.id.text_login_error)
        errorMessage.text= errMess
        errorMessage.isVisible= true
    }
    private fun verifyLogin() {
        if (getPseudoInput().isNotBlank() && getPseudoInput().length < 20){
                SocketHandler.validateUser(getPseudoInput())
        } else if(getPseudoInput().length > 20) {
            displayErrorMessage( "Username can't be more than 20 characters")
        } else {
            displayErrorMessage( "Username can't be empty")
        }
    }

}
