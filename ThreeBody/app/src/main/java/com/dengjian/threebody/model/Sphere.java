package com.dengjian.threebody.model;

import android.content.Context;
import android.opengl.GLES20;

import com.dengjian.threebody.util.MatrixState;
import com.dengjian.threebody.util.ShaderUtil;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by admin on 2018/3/28.
 */

public class Sphere extends BasicDrawModel {
    public static final String TAG = Sphere.class.getSimpleName();
    private Context mContext;
    private float mBallSpan = 1.0f;

    public Sphere(Context context) {
        mContext = context;
        initVertex(1.0f);
        initShader();
    }

    public Sphere(Context context, float fRadius) {
        mContext = context;
        initVertex(fRadius);
        initShader();
    }

    public Sphere(Context context, float fRadius, float fBallSpan) {
        mContext = context;
        mBallSpan = fBallSpan;
        initVertex(fRadius);
        initShader();
    }

    @Override
    public void initVertex(float fRadius) {
        // 顶点坐标数据的初始化
        List<Float> vertexes=new ArrayList<>();//存放顶点坐标的ArrayList
        for (float vAngle = 90; vAngle > -90; vAngle = vAngle - mBallSpan) {
            for (float hAngle=360; hAngle>0; hAngle = hAngle - mBallSpan) { // 水平方向angleSpan度一份
                // 纵向横向各到一个角度后计算对应的此点在球面上的四边形顶点坐标
                // 并构建两个组成四边形的三角形
                double xozLength = fRadius * Math.cos(Math.toRadians(vAngle));
                float x1=(float)(xozLength*Math.cos(Math.toRadians(hAngle)));
                float z1=(float)(xozLength*Math.sin(Math.toRadians(hAngle)));
                float y1=(float)(fRadius* Math.sin(Math.toRadians(vAngle)));

                xozLength=fRadius* Math.cos(Math.toRadians(vAngle-mBallSpan));
                float x2=(float)(xozLength*Math.cos(Math.toRadians(hAngle)));
                float z2=(float)(xozLength*Math.sin(Math.toRadians(hAngle)));
                float y2=(float)(fRadius* Math.sin(Math.toRadians(vAngle-mBallSpan)));

                xozLength=fRadius* Math.cos(Math.toRadians(vAngle-mBallSpan));
                float x3=(float)(xozLength*Math.cos(Math.toRadians(hAngle-mBallSpan)));
                float z3=(float)(xozLength*Math.sin(Math.toRadians(hAngle-mBallSpan)));
                float y3=(float)(fRadius* Math.sin(Math.toRadians(vAngle-mBallSpan)));

                xozLength=fRadius* Math.cos(Math.toRadians(vAngle));
                float x4=(float)(xozLength*Math.cos(Math.toRadians(hAngle-mBallSpan)));
                float z4=(float)(xozLength*Math.sin(Math.toRadians(hAngle-mBallSpan)));
                float y4=(float)(fRadius* Math.sin(Math.toRadians(vAngle)));

                // 构建第一三角形
                vertexes.add(x1);vertexes.add(y1);vertexes.add(z1);
                vertexes.add(x2);vertexes.add(y2);vertexes.add(z2);
                vertexes.add(x4);vertexes.add(y4);vertexes.add(z4);
                // 构建第二三角形
                vertexes.add(x4);vertexes.add(y4);vertexes.add(z4);
                vertexes.add(x2);vertexes.add(y2);vertexes.add(z2);
                vertexes.add(x3);vertexes.add(y3);vertexes.add(z3);
            }
        }
        mVertexCount = vertexes.size() / 3;
        //将alVertix中的坐标值转存到一个float数组中
        float vertices[] = new float[mVertexCount*3];
        for (int i=0; i < vertexes.size(); i++) {
            vertices[i] = vertexes.get(i);
        }

        // 创建顶点坐标数据缓冲
        ByteBuffer vbb = ByteBuffer.allocateDirect(vertices.length * FLOAT_SIZE_BYTES);
        vbb.order(ByteOrder.nativeOrder());//设置字节顺序为本地操作系统顺序
        mVertexBuffer = vbb.asFloatBuffer();//转换为Float型缓冲
        mVertexBuffer.put(vertices);//向缓冲区中放入顶点坐标数据
        mVertexBuffer.position(0);//设置缓冲区起始位置

        // 创建绘制顶点法向量缓冲
        ByteBuffer nbb = ByteBuffer.allocateDirect(vertices.length * FLOAT_SIZE_BYTES);
        nbb.order(ByteOrder.nativeOrder());//设置字节顺序
        mNormalBuffer = nbb.asFloatBuffer();//转换为int型缓冲
        mNormalBuffer.put(vertices);//向缓冲区中放入顶点坐标数据
        mNormalBuffer.position(0);//设置缓冲区起始位置

        // mColorBuffer必须为每个顶点指定颜色，不然传入绘制会有问题，要么直接在shader指定颜色
//        float colors[] = new float[] { // 顶点颜色数组
//                // r, g, b, a
//                1, 0, 0, 0.5f};
//        ByteBuffer colorByteBuffer = ByteBuffer.allocateDirect(colors.length * FLOAT_SIZE_BYTES);
//        colorByteBuffer.order(ByteOrder.nativeOrder());
//        mColorBuffer = colorByteBuffer.asFloatBuffer();
//        mColorBuffer.put(colors);
//        mColorBuffer.position(0);

        // 顶点纹理坐标数据的初始化================begin============================
        float texCoor[] = generateTexCoor (
                (int) (360 / mBallSpan), //纹理图切分的列数
                (int) (180 / mBallSpan)  //纹理图切分的行数
        );
        // 创建顶点纹理坐标数据缓冲
        ByteBuffer cbb = ByteBuffer.allocateDirect(texCoor.length * 4);
        cbb.order(ByteOrder.nativeOrder());//设置字节顺序为本地操作系统顺序
        mTexCoorBuffer = cbb.asFloatBuffer();//转换为Float型缓冲
        mTexCoorBuffer.put(texCoor);//向缓冲区中放入顶点着色数据
        mTexCoorBuffer.position(0);//设置缓冲区起始位置
    }

    // 自动切分纹理产生纹理数组的方法
    private float[] generateTexCoor(int bw, int bh) {
        float[] result=new float[bw*bh*6*2];
        float sizew=1.0f/bw;//列数
        float sizeh=1.0f/bh;//行数
        int c=0;
        for (int i=0;i<bh;i++) {
            for (int j=0;j<bw;j++) {
                // 每行列一个矩形，由两个三角形构成，共六个点，12个纹理坐标
                float s=j*sizew;
                float t=i*sizeh;

                result[c++]=s;
                result[c++]=t;

                result[c++]=s;
                result[c++]=t+sizeh;

                result[c++]=s+sizew;
                result[c++]=t;

                result[c++]=s+sizew;
                result[c++]=t;

                result[c++]=s;
                result[c++]=t+sizeh;

                result[c++]=s+sizew;
                result[c++]=t+sizeh;
            }
        }
        return result;
    }

    @Override
    public void initShader() {
        mVertexShader = ShaderUtil.loadFromAssetsFile("basic_vertex.sh.c", mContext);
        mFragmentShader = ShaderUtil.loadFromAssetsFile("basic_frag.sh.c", mContext);

        mProgram = ShaderUtil.createProgram(mVertexShader, mFragmentShader);
        mPositionHandle = GLES20.glGetAttribLocation(mProgram, "aPosition");
        //获取程序中顶点纹理坐标属性引用id
        mTexCoorHandle = GLES20.glGetAttribLocation(mProgram, "aTexCoords");
        mTexHandle = GLES20.glGetUniformLocation(mProgram, "uTexture");

        // 光
        mNormalHandle = GLES20.glGetAttribLocation(mProgram, "aNormal");
        mLightLocHandle = GLES20.glGetUniformLocation(mProgram, "uLightLocation");
        mLightDirectionHandle = GLES20.glGetUniformLocation(mProgram, "uLightDirection");
        mCameraHandle = GLES20.glGetUniformLocation(mProgram, "uCamera");

        mMatrixHandle = GLES20.glGetUniformLocation(mProgram, "mMatrix");
        mCurrMatrixHandle = GLES20.glGetUniformLocation(mProgram, "mCurrMatrix");
        mNeedShadow = GLES20.glGetUniformLocation(mProgram, "needShadow");
        mViewProjMatrixHandle = GLES20.glGetUniformLocation(mProgram, "mViewProjMatrix");
    }

    @Override
    public void draw(int texId, int needShadow) {
        while (needShadow-- >= 0) {
            GLES20.glUseProgram(mProgram);
            // 通过一致变量（Uniform）的引用将一致变量传入渲染管线 （这部分要和shader对应上）
            GLES20.glUniformMatrix4fv(mMatrixHandle, 1, false, // vertex.sh mMatrix
                    MatrixState.getFinalMatrix(), 0);
            GLES20.glUniformMatrix4fv(mCurrMatrixHandle, 1, false,
                    MatrixState.getCurrMatrix(), 0);
            if (-1 != mLightLocHandle) {
                GLES20.glUniform3fv(mLightLocHandle, 1, MatrixState.lightPositionFB);
            }
            if (-1 != mLightDirectionHandle) {
                GLES20.glUniform3fv(mLightDirectionHandle, 1, MatrixState.lightDirectionFB);
            }
            GLES20.glUniform3fv(mCameraHandle, 1, MatrixState.cameraFB);
            GLES20.glUniform1i(mNeedShadow, needShadow);
            GLES20.glUniformMatrix4fv(mViewProjMatrixHandle, 1, false,
                    MatrixState.getViewProjMatrix(), 0);

            // 将顶点位置数据传入渲染管线
            GLES20.glVertexAttribPointer(mPositionHandle, 3, GLES20.GL_FLOAT,    // vertex.sh aPosition
                    false, 3 * FLOAT_SIZE_BYTES, mVertexBuffer);
            //传入顶点纹理坐标数据
            GLES20.glVertexAttribPointer(mTexCoorHandle, 2, GLES20.GL_FLOAT, false,
                    2 * FLOAT_SIZE_BYTES, mTexCoorBuffer);
            // 传顶点法向量
            GLES20.glVertexAttribPointer(mNormalHandle, 3,    // vertex.sh aNormal
                    GLES20.GL_FLOAT, false, 3 * FLOAT_SIZE_BYTES, mNormalBuffer);

            GLES20.glEnableVertexAttribArray(mPositionHandle); // 启用顶点位置数据
            GLES20.glEnableVertexAttribArray(mTexCoorHandle);
            GLES20.glEnableVertexAttribArray(mNormalHandle);

            //绑定纹理
            GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, texId);
            GLES20.glUniform1i(mTexHandle, 0);

            GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, mVertexCount); // 执行绘制
        }
    }
}
