package com.example.colorimage.shapes

import android.graphics.*
import com.example.colorimage.Point

class PathShape(
    override var drawingShape: Path,
    override var paint: Paint,
    override var boundingBox: RectF,
    override var selected: Boolean,
    )
: Shape() {

    private var translateMatrix: Matrix = Matrix()

    fun create(point: Point) {
        //shapeInfo.plus("M$newPoint.x${newPoint.y}")
        drawingShape.moveTo(point.x, point.y)
    }

    fun setBoundingBox() {
        drawingShape.computeBounds(boundingBox, true)
    }

    override fun draw(canvas: Canvas) {
        canvas.drawPath(drawingShape, paint)
        drawBoundingBox(canvas)
    }

    override fun update(point: Point) {
        //shapeInfo.plus("L$newPoint.x${newPoint.y}")
        drawingShape.lineTo(point.x, point.y)
    }

    override fun translate(dx: Float, dy: Float) {
        drawingShape.offset(dx,dy)
    }

    override fun drawBoundingBox(canvas: Canvas) {
        if(selected){
            var newPaint = Paint()
            newPaint.style = Paint.Style.STROKE
            newPaint.strokeWidth = 1f
            newPaint.isAntiAlias = true
            newPaint.color = Color.RED
            canvas.drawRect(boundingBox,newPaint)
        }

    }

    override fun finishTranslation() {
        setBoundingBox()
    }
}