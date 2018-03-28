package com.dengjian.threebody;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.LinearLayout;

public class MainActivity extends AppCompatActivity {
    private MyGLSurfaceView mGLSurfaceView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 设置为全屏
//        requestWindowFeature(Window.FEATURE_NO_TITLE);
//        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
//                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        // 初始化GLSurfaceView
        mGLSurfaceView = new MyGLSurfaceView(this);
        // 切换到主界面
        setContentView(R.layout.activity_main);
        //将自定义的SurfaceView添加到外层LinearLayout中
        LinearLayout ll=(LinearLayout) findViewById(R.id.ll_gl);
        ll.addView(mGLSurfaceView);
        mGLSurfaceView.requestFocus();// 获取焦点r
        mGLSurfaceView.setFocusableInTouchMode(true); // 设置为可触控
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (null != mGLSurfaceView) {
            mGLSurfaceView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (null != mGLSurfaceView) {
            mGLSurfaceView.onPause();
        }
    }
}
