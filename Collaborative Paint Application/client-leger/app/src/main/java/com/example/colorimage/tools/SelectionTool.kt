package com.example.colorimage.tools

import android.graphics.Color
import com.example.colorimage.Point
import com.example.colorimage.shapes.Shape
import com.example.colorimage.shapes.ShapeStack
import java.util.*

class SelectionTool: Tool {

    private var selectedShapes: Stack<Shape> = Stack()
    private var previousClick: Point = Point(0f,0f)
    private var dx: Float = 0f
    private var dy: Float = 0f

    override fun touchDown(point: Point) {
        setSelectedShapeColor(Color.BLACK)
        getSelectedShape(point)
        setSelectedShapeColor(Color.RED)
        previousClick = point
    }

    override fun touchMove(point: Point) {
        dx = point.x - previousClick.x
        dy = point.y - previousClick.y
        ShapeStack.selectedShape?.translate(dx, dy)
        previousClick = point
    }

    override fun touchUp(point: Point) {
        ShapeStack.selectedShape?.finishTranslation()
    }

    private fun getSelectedShape (point: Point) {
        // Find all shapes at point
        // TODO : reverse search the array so we stop at first shape found
        selectedShapes.clear()
        for (shape in ShapeStack.shapes) {
            if (shape.boundingBox.contains(point.x, point.y))
                selectedShapes.push(shape)
        }

        // Get shape at top of stack or null shape
        ShapeStack.selectedShape = if(!selectedShapes.isEmpty()) selectedShapes.pop() else null
    }

    private fun setSelectedShapeColor(color: Int) {
        // Null safety when no shape is selected
        ShapeStack.selectedShape?.paint?.color = color
    }

}