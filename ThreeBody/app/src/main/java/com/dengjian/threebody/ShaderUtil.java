package com.dengjian.threebody;

import android.content.Context;
import android.opengl.GLES20;
import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * Created by dengjian697 on 18/3/16.
 */

public class ShaderUtil {
    public static final String TAG = ShaderUtil.class.getSimpleName();

    /**
     * 加载制定shader的方法
     *
     * @param shaderType shader的类型
     *            GLES20.GL_VERTEX_SHADER(顶点)
     *            GLES20.GL_FRAGMENT_SHADER(片元)
     * @param str
     *            shader的脚本字符串
     * @return
     */
    public static int loadShader(int shaderType, String str) {
        // 创建一个新shader
        int shader = GLES20.glCreateShader(shaderType);
        // 若创建成功则加载shader
        if (shader != 0) {
            // 加载shader的源代码
            GLES20.glShaderSource(shader, str);
            // 编译shader
            GLES20.glCompileShader(shader);
            // 存放编译成功shader数量的数组
            int[] compiled = new int[1];
            // 获取Shader的编译情况
            GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compiled, 0);
            if (compiled[0] == 0) {
                // 若编译失败则显示错误日志并删除此shader
                Log.e(TAG, "Could not compile shader " + shaderType + ":");
                Log.e(TAG, GLES20.glGetShaderInfoLog(shader));
                GLES20.glDeleteShader(shader);
                shader = 0;
            }
        }
        return shader;
    }

    /**
     * 创建shader程序的方法
     * @param vertexSource
     * @param fragmentSource
     * @return
     */
    public static int createProgram(String vertexSource, String fragmentSource){
        // 加载顶点着色器
        int vertexShader = loadShader(GLES20.GL_VERTEX_SHADER, vertexSource);
        if (vertexShader == 0) {
            Log.e(TAG, "Could not loadShader, vertexShader == 0");
            return 0;
        }

        // 加载片元着色器
        int fragmentShader = loadShader(GLES20.GL_FRAGMENT_SHADER, fragmentSource);
        if (fragmentShader == 0) {
            Log.e(TAG, "Could not loadShader, fragmentShader == 0");
            return 0;
        }

        // 创建程序
        int program = GLES20.glCreateProgram();
        // 若程序创建成功则向程序中加入顶点着色器与片元着色器
        if (program != 0) {
            // 向程序中加入顶点着色器
            GLES20.glAttachShader(program, vertexShader);
            checkGLError("glAttachShader");
            // 向程序中加入片元着色器
            GLES20.glAttachShader(program, fragmentShader);
            checkGLError("glAttachShader");
            // 链接程序
            GLES20.glLinkProgram(program);
            // 存放链接成功program数量的数组
            int[] linkStatus = new int[1];
            // 获取program的链接情况
            GLES20.glGetProgramiv(program, GLES20.GL_LINK_STATUS, linkStatus, 0);
            // 若链接失败则报错并删除程序
            if (linkStatus[0] != GLES20.GL_TRUE) {
                Log.e(TAG, "Could not link program: ");
                Log.e(TAG, GLES20.glGetProgramInfoLog(program));
                GLES20.glDeleteProgram(program);
                program = 0;
            }
        }
        return program;
    }

    /**
     * 在向GPU加入顶点或片段着色器时检查每一步操作是否异常
     * @param op
     */
    public static void checkGLError(String op){
        int error;
        while ( (error = GLES20.glGetError()) != GLES20.GL_NO_ERROR ){
            Log.e(TAG, op + ": glError " + error);
            throw new RuntimeException(op + ": glError " + error);
        }
    }

    /**
     * 从asset的文件中提取出UTF-8字符串
     * @param fileName
     * @param context
     * @return
     */
    public static String loadFromAssetsFile(String fileName, Context context){
        String result = null;
        try {
            InputStream in = context.getResources().getAssets().open(fileName);	// 从asset文件夹中读取信息
            int ch = 0;
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            while ( (ch = in.read()) != -1 ){
                byteArrayOutputStream.write(ch);	// 将获取的信息写入输出流
            }
            byte[] buffer = byteArrayOutputStream.toByteArray();
            byteArrayOutputStream.close();	// 关闭输出流
            in.close();
            result = new String(buffer, "UTF-8");	// 转换成UTF-8编码(注意Byte转String时需要编码)
            result = result.replaceAll("\\r\\n", "\n");	// TODO 换正则表达式写法

        } catch(Exception e) {
            e.printStackTrace();
        }

        return result;
    }
}
