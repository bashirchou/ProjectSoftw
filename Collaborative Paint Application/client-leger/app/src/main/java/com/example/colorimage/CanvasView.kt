package com.example.colorimage

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import com.example.colorimage.shapes.ShapeStack
import com.example.colorimage.tools.*

open class CanvasView @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var paint: Paint = Paint()
    private lateinit var currentPoint: Point

    // Tools
    private var pathTool : PathTool = PathTool()
    private var rectTool : RectangleTool = RectangleTool()
    private var ellTool : EllipseTool = EllipseTool()
    private var selTool : SelectionTool = SelectionTool()
    private var delTool: DeleteTool = DeleteTool()
    private var tool: Tool = pathTool

    init {
        paint.color = Color.BLACK
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 5f
        paint.isAntiAlias = true
    }

    override fun onDraw(canvas: Canvas) {
        for (shape in ShapeStack.shapes) {
            shape.draw(canvas)
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        currentPoint = Point(event.x, event.y)
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                touchDown()
            }
            MotionEvent.ACTION_MOVE -> {
                touchMove()
            }
            MotionEvent.ACTION_UP -> {
                touchUp()
            }
            else -> {

            }
        }
        return true
    }

    private fun touchDown() {
        tool.touchDown(currentPoint)
        invalidate()
    }

    private fun touchMove() {
        tool.touchMove(currentPoint)
        invalidate()
    }

    private fun touchUp() {
        tool.touchUp(currentPoint)
        invalidate()
    }

    fun selectTool(name: String) {
        when (name) {
            "PENCIL" -> {
                tool = pathTool
            }
            "RECTANGLE" -> {
                tool = rectTool
            }
            "ELLIPSE" ->  {
                tool = ellTool
            }
            "SELECT" ->  {
                tool = selTool
            }
            "DELETE" ->  {
                tool = delTool
                touchDown()
            }
            else -> {
                print("error")
            }
        }
    }

}