package com.example.colorimage

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.fragment.app.Fragment

class DrawingViewFragment : Fragment(R.layout.fragment_drawing_view){

    private lateinit var canvas : CanvasView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {


        val buttons: ArrayList<Button> = ArrayList()
        val v = inflater.inflate(R.layout.fragment_drawing_view, container, false)
        buttons.add(v.findViewById(R.id.pencilButton))
        buttons.add(v.findViewById(R.id.rectangleButton))
        buttons.add(v.findViewById(R.id.ellipseButton))
        buttons.add(v.findViewById(R.id.selectButton))
        buttons.add(v.findViewById(R.id.deleteButton))

        for (button in buttons) {
            button.setOnClickListener {
                toggleTool(it)
            }
        }
        return v
    }

    private fun toggleTool(view: View) {
        val toolButton = view as Button
        canvas = requireView().findViewById(R.id.canvas)
        canvas.selectTool(toolButton.text as String)
    }
}