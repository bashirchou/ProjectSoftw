package com.example.colorimage.shapes

object ShapeStack {

    var shapes: ArrayList<Shape> = arrayListOf()
    var selectedShape: Shape? = null

    fun add(shape: Shape) {
        shapes.add(shape)
    }

    fun deleteSelectedShape() {
        print("Removing : $selectedShape")
        shapes.remove(selectedShape)
    }

}