package com.dengjian.threebody;

import android.opengl.Matrix;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.Stack;

/**
 * Created by dengjian697 on 18/3/16.
 */

public class MatrixState {
    private static float[] mProjMatrix = new float[16];//4x4矩阵 投影用
    private static float[] mViewMatrix = new float[16];//摄像机位置朝向9参数矩阵
    private static float[] mCurrMatrix;//当前变换矩阵
    public static float[] lightLocation=new float[]{0,0,0};//定位光光源位置
    public static FloatBuffer cameraFB;
    public static FloatBuffer lightPositionFB;

    public static Stack<float[]> mStack=new Stack<float[]>();//保护变换矩阵的栈

    public static void setInitStack() {//获取不变换初始矩阵
        mCurrMatrix=new float[16];
        Matrix.setRotateM(mCurrMatrix, 0, 0, 1, 0, 0);
    }

    public static void pushMatrix() {//保护变换矩阵
        mStack.push(mCurrMatrix.clone());
    }

    public static void popMatrix() {//恢复变换矩阵
        mCurrMatrix=mStack.pop();
    }

    public static void translate(float x,float y,float z) {//设置沿xyz轴移动
        Matrix.translateM(mCurrMatrix, 0, x, y, z);
    }

    public static void rotate(float angle,float x,float y,float z) {//设置绕xyz轴移动
        Matrix.rotateM(mCurrMatrix,0,angle,x,y,z);
    }

    // 插入自带矩阵
    public static void matrix(float[] self) {
        float[] result=new float[16];
        Matrix.multiplyMM(result,0,mCurrMatrix,0,self,0);
        mCurrMatrix=result;
    }

    //设置摄像机
    public static void setCamera (
            float cx,	//摄像机位置x
            float cy,   //摄像机位置y
            float cz,   //摄像机位置z
            float tx,   //摄像机目标点x
            float ty,   //摄像机目标点y
            float tz,   //摄像机目标点z
            float upx,  //摄像机UP向量X分量
            float upy,  //摄像机UP向量Y分量
            float upz   //摄像机UP向量Z分量
    ) {
        Matrix.setLookAtM(
                mViewMatrix,
                0,
                cx,
                cy,
                cz,
                tx,
                ty,
                tz,
                upx,
                upy,
                upz
        );

        float[] cameraLocation=new float[3];//摄像机位置
        cameraLocation[0]=cx;
        cameraLocation[1]=cy;
        cameraLocation[2]=cz;

        ByteBuffer llbb = ByteBuffer.allocateDirect(3*4);
        llbb.order(ByteOrder.nativeOrder());//设置字节顺序
        cameraFB=llbb.asFloatBuffer();
        cameraFB.put(cameraLocation);
        cameraFB.position(0);
    }

    //设置透视投影参数
    public static void setProjectFrustum (
            float left,		//near面的left
            float right,    //near面的right
            float bottom,   //near面的bottom
            float top,      //near面的top
            float near,		//near面距离
            float far       //far面距离
    ) {
        Matrix.frustumM(mProjMatrix, 0, left, right, bottom, top, near, far);
    }

    //设置正交投影参数
    public static void setProjectOrtho (
            float left,		//near面的left
            float right,    //near面的right
            float bottom,   //near面的bottom
            float top,      //near面的top
            float near,		//near面距离
            float far       //far面距离
    ) {
        Matrix.orthoM(mProjMatrix, 0, left, right, bottom, top, near, far);
    }

    // 获取具体物体的总变换矩阵
    public static float[] getFinalMatrix() {
        float[] matrix = new float[16];
        Matrix.multiplyMM(matrix, 0, mViewMatrix, 0, mCurrMatrix, 0);
        Matrix.multiplyMM(matrix, 0, mProjMatrix, 0, matrix, 0);
        return matrix;
    }

    // 获取具体物体的变换矩阵
    public static float[] getCurrMatrix() {
        return mCurrMatrix;
    }

    public static float[] getViewMatrix() {
        return mViewMatrix;
    }

    public static float[] getProjMatrix() {
        return mProjMatrix;
    }

    // 设置灯光位置的方法
    public static void setLightLocation(float x,float y,float z) {
        lightLocation[0]=x;
        lightLocation[1]=y;
        lightLocation[2]=z;
        ByteBuffer llbb = ByteBuffer.allocateDirect(3*4);
        llbb.order(ByteOrder.nativeOrder());//设置字节顺序
        lightPositionFB=llbb.asFloatBuffer();
        lightPositionFB.put(lightLocation);
        lightPositionFB.position(0);
    }
}
