package com.dengjian.threebody;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.opengl.GLES20;
import android.opengl.GLSurfaceView;
import android.opengl.GLUtils;
import android.view.MotionEvent;

import com.dengjian.threebody.model.Sphere;
import com.dengjian.threebody.util.MatrixState;

import java.io.IOException;
import java.io.InputStream;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

/**
 * Created by dengjian697 on 18/3/16.
 */
public class MyGLSurfaceView extends GLSurfaceView {
    private static final float TOUCH_SCALE_FACTOR = 180.0f / 320;// 角度缩放比例

    private SceneRenderer mRenderer;
    private Context mContext;

    // 绘制实体对象
    private Sphere mSphere;

    // 纹理
    private Bitmap mBmSphereTex;
    private int mSphereTexId;

    // 摄影机等坐标
    private float mPreviousY; // 上次的触控位置Y坐标
    private float mPreviousX; // 上次的触控位置X坐标
    // 关于摄像机的变量
    float cx=0;//摄像机x位置
    float cy=4;//摄像机y位置
    float cz=3;//摄像机z位置

    float tx=0;//目标点x位置
    float ty=0;//目标点y位置
    float tz=0;//目标点z位置
    public float currSightDis = 5; // 摄像机和目标的距离
    public float mOverlook = 30; // 仰角
    public float mRotationXY = 180; // 方位角

    private MoveThread mMoveThread;

    public MyGLSurfaceView(Context context) {
        super(context);
        mContext = context;

        this.setEGLContextClientVersion(2); //设置使用OPENGL ES2.0
        mRenderer = new SceneRenderer();	//创建场景渲染器
        setRenderer(mRenderer);				//设置渲染器
        setRenderMode(GLSurfaceView.RENDERMODE_CONTINUOUSLY);//设置渲染模式为主动渲染
    }

    public void onDestroy() {
        if (null != mMoveThread) {
            // 使用stop方法是很危险的，就象突然关闭计算机电源，而不是按正常程序关机一样，可能会产生不可预料的结果，
            // 因此，并不推荐使用stop方法来终止线程
//            mRotateThread.stop();
            mMoveThread.roopFlag = false; // 当run方法执行完后，线程就会退出
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        float y = event.getY();
        float x = event.getX();
        switch (event.getAction()) {
            case MotionEvent.ACTION_MOVE:
                float dy = y - mPreviousY;//计算触控d笔Y位移
                float dx = x - mPreviousX;//计算触控笔X位移
                mRotationXY -= dx * TOUCH_SCALE_FACTOR; // 设置沿x轴旋转角度
                mOverlook += dy * TOUCH_SCALE_FACTOR; // 设置沿z轴旋转角度
                //将仰角限制在5～90度范围内
                mOverlook = Math.max(mOverlook, 5);
                mOverlook = Math.min(mOverlook, 90);
                //设置摄像机的位置
                setCameraPostion();
        }
        mPreviousY = y;//记录触控笔位置
        mPreviousX = x;//记录触控笔位置
        return true;
    }

    // 设置摄像机位置的方法
    public void setCameraPostion() {
        //计算摄像机的位置
        double overlook = Math.toRadians(mOverlook);  // 仰角（弧度）
        double rotateXY = Math.toRadians(mRotationXY);// 方位角
        cx = (float) (tx - currSightDis * Math.cos(overlook) * Math.sin(rotateXY));
        cy = (float) (ty + currSightDis * Math.sin(overlook));
        cz = (float) (tz - currSightDis * Math.cos(overlook) * Math.cos(rotateXY));
    }

    /**
     * 内部类线程，用于OpenGL旋转动画
     *
     * @author dengjian01
     *
     */
    public class MoveThread extends Thread {
        public boolean roopFlag = true;

        @Override
        public void run() {
            while (roopFlag && (mRenderer != null)) {
                mRenderer.xAngle += 0.375;
                mRenderer.yAngle += 0.375;
                try {
                    Thread.sleep(20);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private class SceneRenderer implements GLSurfaceView.Renderer {
        float yAngle;// 绕Y轴旋转的角度
        float xAngle; // 绕Z轴旋转的角度

        public void onDrawFrame(GL10 gl) {
            GLES20.glClear(GLES20.GL_DEPTH_BUFFER_BIT | GLES20.GL_COLOR_BUFFER_BIT);

            MatrixState.setLightLocation(10.0f, 10.0f, -10.0f);
//            MatrixState.setLightDirection((float)(Math.random() - 0.5), (float)(Math.random() - 0.5), (float)(Math.random() - 0.5));
//            MatrixState.setLightDirection(0.0f, -100.0f, -100.0f);
            MatrixState.setCamera(cx, cy, cz, tx, ty, tz, 0, 1.0f, 0);

            MatrixState.pushMatrix();
            MatrixState.translate(0.0f, 2.0f, 0.0f);
            MatrixState.rotate(xAngle, 1.0f, 0.0f, 0.0f);
            MatrixState.rotate(yAngle, 0.0f, 1.0f, 0.0f);
            if (null != mSphere) {
                mSphere.draw(mSphereTexId, 1);
            }
            MatrixState.popMatrix();
        }

        public void onSurfaceChanged(GL10 gl, int width, int height) {
            GLES20.glViewport(0, 0, width, height); // 设置视口
            float ratio = (float) width / height;
            // gluPerspective(gl, 45.0f, ratio, 1, 1000);
            // 初始化三大矩阵
            MatrixState.setProjectFrustum(-ratio, ratio, -1, 1, 1, 1000);
//            MatrixState.setCamera(-1.0f, 4.0f, 4.0f, 0, 0, 0, 0, 1.0f, 0);
            MatrixState.setInitStack();
        }

        public void onSurfaceCreated(GL10 gl, EGLConfig config) {
            GLES20.glClearColor(0.0f, 0.0f, 1.0f, 1.0f);

//            GLES20.glEnable(GLES20.GL_CULL_FACE);
            GLES20.glEnable(GLES20.GL_DEPTH_TEST);

//            if (null == mSphere) {
            // 后台前台切换时，会重新触发onSurfaceCreated，需要重新初始化shader，不然会绘制不出
            mSphere = new Sphere(mContext, 1.5f, 5.0f);

            // 纹理初始化
            mBmSphereTex = loadTexture(R.mipmap.earth);
            mSphereTexId = initTexture(mBmSphereTex, true);

            if (null == mMoveThread) {
                mMoveThread = new MoveThread();
                mMoveThread.start();
            }
            mMoveThread.roopFlag = true;
        }
    }

    // 通过IO加载图片
    public Bitmap loadTexture(int drawableId) {
        InputStream is = this.getResources().openRawResource(drawableId);
        Bitmap bitmapTmp = null;
        try {
            bitmapTmp = BitmapFactory.decodeStream(is);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                is.close();
            }
            catch(IOException e) {
                e.printStackTrace();
            }
        }
        return bitmapTmp;
    }
    public int initTexture(Bitmap bitmapTmp, boolean needRelease) {
        if (null == bitmapTmp) {
            return 0;
        }
        //生成纹理ID
        int[] textures = new int[1];
        GLES20.glGenTextures(
                1,       // 产生的纹理id的数量
                textures,   // 纹理id的数组
                0    // 偏移量
        );
        int textureId=textures[0];
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
        GLUtils.texImage2D(
                GLES20.GL_TEXTURE_2D, // 纹理类型
                0,
                GLUtils.getInternalFormat(bitmapTmp),
                bitmapTmp, //纹理图像
                GLUtils.getType(bitmapTmp),
                0 //纹理边框尺寸
        );

        if (needRelease) {
            bitmapTmp.recycle(); //纹理加载成功后释放图片
        }
        return textureId;
    }
}
