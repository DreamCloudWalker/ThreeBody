package com.dengjian.threebody.model;

import java.nio.FloatBuffer;

/**
 * Created by admin on 2018/3/28.
 */

public abstract class BasicDrawModel {
    public static final String TAG = BasicDrawModel.class.getSimpleName();
    protected static final int FLOAT_SIZE_BYTES = 4;//一个float数据占四个字节

    // 放到MatrixState中了
//    protected static float[] mMatrix; // 总变换矩阵
//    protected static float[] mProjMatrix = new float[16]; // 4X4 projection matrix
//    protected static float[] mViewMatrix = new float[16]; // 摄影机朝向参数矩阵

    protected int mProgram; // shader id
    protected int mMatrixHandle; // 总变换矩阵的引用
    protected int mCurrMatrixHandle; // 当前位置、旋转变换矩阵引用

    protected int mPositionHandle; // 顶点位置属性引用
    protected int mColorHandle; // 顶点颜色属性引用
    protected int mTexCoorHandle;   // 顶点纹理坐标属性引用
    protected int mTexHandle;   // 纹理属性引用
    protected int mCameraHandle;

    // 神说：要有光
    protected int mNormalHandle; // 顶点法线引用
    protected int mLightLocHandle; // 灯光位置引用
    protected int mLightDirectionHandle;    // 方向光

    // 阴影
    protected int mNeedShadow;  // 是否需要投影
    protected int mViewProjMatrixHandle;  // 投影、摄像机组合矩阵引用

    // Shader
    protected String mVertexShader;
    protected String mFragmentShader;

    protected FloatBuffer mVertexBuffer; // 顶点坐标数据缓存
    protected FloatBuffer mColorBuffer; // 顶点着色数据缓存
    protected FloatBuffer mTexCoorBuffer;
    protected FloatBuffer mNormalBuffer;

    protected int mVertexCount = 0; // 顶点数量

    public abstract void initVertex(float fScale);

    public abstract void initShader();

    /**
     * draw
     * @param texId
     */
    public abstract void draw(int texId, int needShadow);
}
